import { generate } from "./generate.ts";
import {
  type GentlJInputData,
  type GentlNode,
  type QueryRoot,
  type QueryRootType,
  type QueryRootWrapper,
  type DOMEnvironmentConstructor,
  type Logger,
  type IncludeIo,
} from "./types.ts";

export type GentlJInput = {
  html: string;
  data: GentlJInputData;
  includeIo?: IncludeIo;
  scope?: string;
};

export type GentlJOutput = {
  html: string;
};

export type GentlJOptions = {
  logger?: Logger;
  deleteTemplateTag: boolean;
  deleteDataAttributes: boolean;
  rootParserType: QueryRootType;
  domEnvironment?: DOMEnvironmentConstructor;
};

const defaultOptions: GentlJOptions = {
  logger: undefined,
  deleteDataAttributes: false,
  deleteTemplateTag: false,
  rootParserType: "htmlDocument",
  domEnvironment: undefined,
};



const createQueryRootWrapper = (domEnvironmentConstructor: DOMEnvironmentConstructor): QueryRootWrapper => {
  return (params: { html: string; rootType: QueryRootType }) => {
    if (!domEnvironmentConstructor) {
      throw new Error("DOM environment constructor is required");
    }

    const domEnv = new domEnvironmentConstructor();

    if (params.rootType === "htmlDocument") {
      const domParser = new domEnv.window.DOMParser();
      return domParser.parseFromString(params.html, "text/html");
    }

    if (params.rootType === "xmlDocument") {
      const domParser = new domEnv.window.DOMParser();
      return domParser.parseFromString(params.html, "text/xml");
    }

    const tmp = domEnv.window.document.createElement("template");
    tmp.innerHTML = params.html;
    return tmp.content;
  };
};

const getNodes = (
  params: { html: string; rootType: QueryRootType },
  queryRootWrapper: QueryRootWrapper
): { queryRootWrapper: QueryRootWrapper; root: QueryRoot } | undefined => {
  try {
    const root = queryRootWrapper(params);

    return {
      root,
      queryRootWrapper,
    };
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

const childElementsToString = (dom: GentlNode[]): string => {
  return dom
    .map((node) => {
      if (node.nodeType === 1) {
        return (node as Element).outerHTML;
      }
      // テキストノードの場合、空白のみの場合は除外
      if (node.nodeType === 3) {
        const textContent = node.textContent?.trim() || "";
        return textContent ? textContent : "";
      }
      return "";
    })
    .filter((content) => content !== "")
    .join("\n");
};

const documentToString = (dom: GentlNode): string => {
  return (dom as Document)?.documentElement?.outerHTML || "";
};

export const process = async (
  input: GentlJInput,
  options?: Partial<GentlJOptions>
): Promise<GentlJOutput> => {
  const absOptions: GentlJOptions = {
    ...defaultOptions,
    ...options,
  };
  const opt = {
    html: input.html,
    rootType: absOptions.rootParserType,
  };
  
  // DOM環境が提供されていない場合はエラー
  if (!absOptions.domEnvironment) {
    throw new Error("DOM environment is required. Please provide domEnvironment option.");
  }

  const queryRootWrapper = createQueryRootWrapper(absOptions.domEnvironment);
  const dom = getNodes(opt, queryRootWrapper);

  if (!dom) {
    throw new Error("couldn't analyze dom");
  }

  const generatedDom = await generate({
    root: dom.root,
    queryRootWrapper: dom.queryRootWrapper,
    data: input.data,
    includeIo: input.includeIo,
    logger: absOptions.logger,
    options: {
      scope: input.scope || "",
    },
  });

  if (absOptions.rootParserType === "childElement") {
    return {
      html: childElementsToString(Array.from(generatedDom.childNodes)),
    };
  }

  return {
    html: documentToString(generatedDom),
  };
};
