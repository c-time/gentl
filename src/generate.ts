import { type GenerateConst, getGenerateConst } from "./const.ts";
import { pickData, pickStringData } from "./pickData.ts";
import {
  type GenerateOptions,
  type GentlElement,
  type GentlHTMLElement,
  type GentlJInputData,
  type QueryRoot,
  type QueryRootWrapper,
} from "./types.ts";

type ExpandTemplateTagParams = {
  scopeTemplate: GentlHTMLElement;
  queryRootWrapper: QueryRootWrapper;
  data: GentlJInputData;
  generateOptions: GenerateOptions;
  generateConst: GenerateConst;
};

const expandEditingRootChildren = (
  editingRoot: ParentNode,
  { generateConst, generateOptions, scopeTemplate }: ExpandTemplateTagParams
) => {
  Array.from(editingRoot.childNodes)
    .filter((e) => e.nodeType === 1)
    .reverse()
    .forEach((e) => {
      const element = e as GentlElement;
      const attributes = element.getAttributeNames();
      const entries = attributes.map((a) => [a, element.getAttribute(a)]);
      attributes.forEach((a) => element.removeAttribute(a));
      element.setAttribute(
        generateConst.attributes.cloned,
        generateOptions.scope
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
      scopeTemplate.insertAdjacentElement("afterend", element);
    });
};

const expandTemplateTag = ({
  scopeTemplate,
  queryRootWrapper,
  data: baseData,
  generateOptions,
  generateConst,
}: ExpandTemplateTagParams): void => {
  // data-gen-if at template tag
  if (scopeTemplate.hasAttribute(generateConst.attributes.if)) {
    const ifValue = scopeTemplate.getAttribute(generateConst.attributes.if);
    if (!pickData(ifValue, baseData)) {
      return;
    }
  }

  // data-gen-comment at template tag
  if (scopeTemplate.hasAttribute(generateConst.attributes.comment)) {
    return;
  }

  // data-gen-include
  const includeValue = scopeTemplate.getAttribute(
    generateConst.attributes.include
  );

  if (includeValue) {
    const pickedData = pickData(includeValue, baseData);
    const editingRoot = queryRootWrapper({
      html: pickedData?.toString() || "",
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

    const pickedData = pickData(repeatValue, baseData);
    if (!Array.isArray(pickedData)) {
      throw new Error(
        `"${repeatNameValue}" is not array at ${generateConst.attributes.repeat}`
      );
    }

    return pickedData;
  })();

  dataArray.reverse();

  dataArray.forEach((originData) => {
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
      if (e.hasAttribute(generateConst.attributes.scope)) {
        return;
      }
      e.remove();
    });

    // children of data-gen-scope
    editingRoot
      .querySelectorAll<GentlHTMLElement>(generateConst.queries.scope)
      .forEach((e) => {
        expandTemplateTag({
          scopeTemplate: e,
          queryRootWrapper,
          data,
          generateOptions,
          generateConst,
        });
        e.remove();
      });

    // data-gen-text
    editingRoot.querySelectorAll(generateConst.queries.text).forEach((e) => {
      if (e.hasAttribute(generateConst.attributes.scope)) {
        return;
      }
      e.textContent = pickStringData(
        e.getAttribute(generateConst.attributes.text),
        data
      );
    });

    // data-gen-html
    editingRoot.querySelectorAll(generateConst.queries.html).forEach((e) => {
      if (e.hasAttribute(generateConst.attributes.scope)) {
        return;
      }
      e.innerHTML = pickStringData(
        e.getAttribute(generateConst.attributes.html),
        data
      );
    });

    // data-gen-json
    editingRoot.querySelectorAll(generateConst.queries.json).forEach((e) => {
      if (e.hasAttribute(generateConst.attributes.scope)) {
        return;
      }
      e.innerHTML = JSON.stringify(pickData(
        e.getAttribute(generateConst.attributes.json),
        data
      ));
    });

    // data-gen-attrs
    editingRoot.querySelectorAll(generateConst.queries.attrs).forEach((e) => {
      if (e.hasAttribute(generateConst.attributes.scope)) {
        return;
      }
      const attrs = e.getAttribute(generateConst.attributes.attrs) || "";
      attrs.split(",").forEach((attr) => {
        const [key, value] = attr.split(":").map((s) => s.trim());
        if (!key) return;

        const resolvedValue = pickData(value, data);
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
      if (!pickData(ifValue, baseData)) {
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
  });
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
  options?: Partial<GenerateOptions>;
};

export const generate = ({
  root,
  queryRootWrapper,
  data,
  options,
}: GenerateParams): QueryRoot => {
  const generateOptions: GenerateOptions = {
    ...getDefaultGenerateOptions(),
    ...options,
  };

  const generateConst = getGenerateConst(generateOptions);

  // remove data-gen-cloned at root
  root.querySelectorAll(generateConst.queries.cloned).forEach((e) => {
    if (e.hasAttribute(generateConst.attributes.scope)) {
      return;
    }
    e.remove();
  });

  root
    .querySelectorAll<GentlHTMLElement>(generateConst.queries.scope)
    .forEach((e) =>
      expandTemplateTag({
        scopeTemplate: e,
        queryRootWrapper,
        data,
        generateOptions,
        generateConst,
      })
    );

  return root;
};
