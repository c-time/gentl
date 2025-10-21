import { type GenerateConst, getGenerateConst } from "./const.ts";
import { pickData, pickStringData } from "./pickData.ts";
import {
  type GenerateOptions,
  type GentlElement,
  type GentlHTMLElement,
  type GentlJInputData,
  type QueryRoot,
  type QueryRootWrapper,
  type Logger,
  type IncludeIo,
} from "./types.ts";

const isScopeMatched = (scopeAttribute: string | null, targetScope: string | undefined): boolean => {
  // targetScopeが未定義または空文字列の場合、すべてのテンプレートを処理
  if (!targetScope || targetScope.trim() === "") {
    return true;
  }
  
  // scopeAttributeが未定義またはnullまたは空文字列の場合、マッチしない
  if (!scopeAttribute || scopeAttribute.trim() === "") {
    return false;
  }
  
  // scopeAttributeをスペースで分割してスコープリストを取得
  const scopeList = scopeAttribute.split(/\s+/).filter(s => s.length > 0);
  
  // targetScopeがスコープリストに含まれているかチェック
  return scopeList.includes(targetScope);
};

type ExpandTemplateTagParams = {
  scopeTemplate: GentlHTMLElement;
  queryRootWrapper: QueryRootWrapper;
  data: GentlJInputData;
  includeIo?: IncludeIo;
  logger?: Logger;
  generateOptions: GenerateOptions;
  generateConst: GenerateConst;
};

const expandEditingRootChildren = (
  editingRoot: ParentNode,
  { generateConst, generateOptions, scopeTemplate }: ExpandTemplateTagParams
) => {
  const children = Array.from(editingRoot.childNodes).filter((e) => e.nodeType === 1);
  
  // Only reverse if inserting after (default behavior)
  if (!scopeTemplate.hasAttribute(generateConst.attributes.insertBefore)) {
    children.reverse();
  }
  
  children.forEach((e) => {
      const element = e as GentlElement;
      const attributes = element.getAttributeNames();
      const entries = attributes.map((a) => [a, element.getAttribute(a)]);
      attributes.forEach((a) => element.removeAttribute(a));
      element.setAttribute(
        generateConst.attributes.cloned,
        scopeTemplate.getAttribute(generateConst.attributes.scope) || ""
      );
      entries.forEach(([name, value]) => {
        if (generateConst.attributeNames.has(name || "")) {
          return;
        }
        element.setAttribute(name || "", value || "");
      });

      generateConst.attributeNames.forEach((attr) => {
        element
          .querySelectorAll(`[${attr}]`)
          .forEach((e) => e.removeAttribute(attr));
      });
      
      // Check if template has insert-before attribute
      const insertPosition = scopeTemplate.hasAttribute(generateConst.attributes.insertBefore) 
        ? "beforebegin" 
        : "afterend";
      scopeTemplate.insertAdjacentElement(insertPosition, element);
    });
};

const expandTemplateTag = async ({
  scopeTemplate,
  queryRootWrapper,
  data: baseData,
  includeIo,
  logger,
  generateOptions,
  generateConst,
}: ExpandTemplateTagParams): Promise<void> => {
  // data-gen-if at template tag
  if (scopeTemplate.hasAttribute(generateConst.attributes.if)) {
    const ifValue = scopeTemplate.getAttribute(generateConst.attributes.if);
    if (!pickData(ifValue, baseData, logger)) {
      return;
    }
  }

  // data-gen-comment at template tag
  if (scopeTemplate.hasAttribute(generateConst.attributes.comment)) {
    return;
  }

  // data-gen-include
  const includeKey = scopeTemplate.getAttribute(
    generateConst.attributes.include
  );

  if (includeKey) {
    // includeIoが存在しない場合はエラーとして取り扱う
    if (!includeIo) {
      const error = new Error(`includeIo function is required when using data-gen-include attribute with key "${includeKey}"`);
      if (logger) {
        logger({
          level: 'error',
          message: 'includeIo function is required',
          context: {
            attribute: 'data-gen-include',
            formula: includeKey,
            error: error
          },
          timestamp: new Date()
        });
      } else {
        console.error(`[Gentl] includeIo function is required for key "${includeKey}":`, error);
      }
      return;
    }

    let htmlContent = "";
    try {
      htmlContent = await includeIo(includeKey, baseData);
    } catch (error) {
      if (logger) {
        logger({
          level: 'error',
          message: 'Failed to load include content',
          context: {
            attribute: 'data-gen-include',
            formula: includeKey,
            error: error instanceof Error ? error : new Error(String(error))
          },
          timestamp: new Date()
        });
      } else {
        console.error(`[Gentl] Failed to load include content for key "${includeKey}":`, error);
      }
      return;
    }

    const editingRoot = queryRootWrapper({
      html: htmlContent,
      rootType: "childElement",
    });

    expandEditingRootChildren(editingRoot, {
      data: baseData,
      generateConst,
      generateOptions,
      queryRootWrapper,
      scopeTemplate,
    });
    return;
  }

  // data-gen-repeat
  const repeatValue = scopeTemplate.getAttribute(
    generateConst.attributes.repeat
  );
  const repeatNameValue = (
    scopeTemplate.getAttribute(generateConst.attributes.repeatName) || ""
  ).trim();

  if (repeatValue && !repeatNameValue) {
    throw new Error(
      `${generateConst.attributes.repeat} depend ${generateConst.attributes.repeatName}`
    );
  }

  const dataArray: GentlJInputData[] = (() => {
    if (!repeatValue) {
      return [baseData];
    }

    const pickedData = pickData(repeatValue, baseData, logger);
    if (!Array.isArray(pickedData)) {
      throw new Error(
        `"${repeatNameValue}" is not array at ${generateConst.attributes.repeat}`
      );
    }

    return pickedData;
  })();

  // Only reverse if inserting after (default behavior)
  // When inserting before, keep original order
  if (!scopeTemplate.hasAttribute(generateConst.attributes.insertBefore)) {
    dataArray.reverse();
  }

  await Promise.all(
    dataArray.map(async (originData) => {
    const editingRoot = queryRootWrapper({
      html: scopeTemplate.innerHTML,
      rootType: "childElement",
    });
    const data = repeatNameValue
      ? { ...baseData, [repeatNameValue]: originData }
      : originData;

    // remove data-gen-comment at scoped template
    editingRoot.querySelectorAll(generateConst.queries.comment).forEach((e) => {
      e.remove();
    });

    // remove data-gen-cloned at scoped template
    editingRoot.querySelectorAll(generateConst.queries.cloned).forEach((e) => {
      if (isScopeMatched(e.getAttribute(generateConst.queries.cloned), generateOptions.scope)) {
        return;
      }
      e.remove();
    });

    // children of data-gen-scope
    const scopeElements = editingRoot.querySelectorAll<GentlHTMLElement>(generateConst.queries.scope);
    await Promise.all(
      Array.from(scopeElements).filter((e) => isScopeMatched(e.getAttribute(generateConst.attributes.scope), generateOptions.scope)).map(async (e) => {
        await expandTemplateTag({
          scopeTemplate: e,
          queryRootWrapper,
          data,
          includeIo,
          logger,
          generateOptions,
          generateConst,
        });
        e.remove();
      })
    );

    // data-gen-text
    editingRoot.querySelectorAll(generateConst.queries.text).forEach((e) => {
      e.textContent = pickStringData(
        e.getAttribute(generateConst.attributes.text),
        data,
        logger
      );
    });

    // data-gen-html
    editingRoot.querySelectorAll(generateConst.queries.html).forEach((e) => {
      e.innerHTML = pickStringData(
        e.getAttribute(generateConst.attributes.html),
        data,
        logger
      );
    });

    // data-gen-json
    editingRoot.querySelectorAll(generateConst.queries.json).forEach((e) => {
      e.innerHTML = JSON.stringify(pickData(
        e.getAttribute(generateConst.attributes.json),
        data,
        logger
      ));
    });

    // data-gen-attrs
    editingRoot.querySelectorAll(generateConst.queries.attrs).forEach((e) => {
      const attrs = e.getAttribute(generateConst.attributes.attrs) || "";
      attrs.split(",").forEach((attr) => {
        const [key, value] = attr.split(":").map((s) => s.trim());
        if (!key) return;

        const resolvedValue = pickData(value, data, logger);
        if (resolvedValue === undefined || resolvedValue === null) {
          e.removeAttribute(key);
        } else {
          e.setAttribute(key, resolvedValue);
        }
      });
    });

    // data-gen-if
    editingRoot.querySelectorAll(generateConst.queries.if).forEach((e) => {
      const ifValue = e.getAttribute(generateConst.attributes.if) || "";
      if (!pickData(ifValue, data, logger)) {
        e.remove();
      }
    });

    expandEditingRootChildren(editingRoot, {
      data,
      generateConst,
      generateOptions,
      queryRootWrapper,
      scopeTemplate,
    });
    })
  );
};

export const getDefaultGenerateOptions = (): GenerateOptions => ({
  scope: "",
  attributePrefix: "data-gen",
  templateTagName: "template",
});

export type GenerateParams = {
  root: QueryRoot;
  queryRootWrapper: QueryRootWrapper;
  data: GentlJInputData;
  includeIo?: IncludeIo;
  logger?: Logger;
  options?: Partial<GenerateOptions>;
};

export const generate = async ({
  root,
  queryRootWrapper,
  data,
  includeIo,
  logger,
  options,
}: GenerateParams): Promise<QueryRoot> => {
  const generateOptions: GenerateOptions = {
    ...getDefaultGenerateOptions(),
    ...options,
  };

  const generateConst = getGenerateConst(generateOptions);

  // remove data-gen-cloned at root
  root.querySelectorAll(generateConst.queries.cloned).forEach((e) => {
    if (!isScopeMatched(e.getAttribute(generateConst.attributes.scope), generateOptions.scope)) {
      return;
    }
    e.remove();
  });

  const rootScopeElements = root.querySelectorAll<GentlHTMLElement>(generateConst.queries.scope);
  await Promise.all(
    Array.from(rootScopeElements).map(async (e) =>
      await expandTemplateTag({
        scopeTemplate: e,
        queryRootWrapper,
        data,
        includeIo,
        logger,
        generateOptions,
        generateConst,
      })
    )
  );

  return root;
};
