import { generate } from "./generate.ts";
import {
  type GentlJInputData,
  type GentlNode,
  type QueryRoot,
  type QueryRootType,
  type QueryRootWrapper,
  type DOMEnvironmentConstructor,
} from "./types.ts";

export type GentlJInput = {
  html: string;
  data: GentlJInputData;
};

export type GentlJOutput = {
  html: string;
};

export type GentlJOptions = {
  // logger: Logger // <- need to inject logger
  deleteTemplateTag: boolean;
  deleteDataAttributes: boolean;
  rootParserType: QueryRootType;
  domEnvironment?: DOMEnvironmentConstructor;
};

const defaultOptions: GentlJOptions = {
  deleteDataAttributes: false,
  deleteTemplateTag: false,
  rootParserType: "htmlDocument",
  domEnvironment: undefined,
};

const browserQueryRootWrapper: QueryRootWrapper = (params: {
  rootType: QueryRootType;
  html: string;
}) => {
  // ブラウザ環境チェック
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    throw new Error("Browser environment required - DOMParser or window is not available");
  }

  if (params.rootType === "htmlDocument") {
    const domParser = new DOMParser();
    return domParser.parseFromString(params.html, "text/html");
  }

  if (params.rootType === "xmlDocument") {
    const domParser = new DOMParser();
    return domParser.parseFromString(params.html, "text/xml");
  }

  const tmp = window.document.createElement("template");
  tmp.innerHTML = params.html;
  return tmp.content;
};

const createNodeQueryRootWrapper = (domEnvironmentConstructor: DOMEnvironmentConstructor): QueryRootWrapper => {
  return (params: { html: string; rootType: QueryRootType }) => {
    if (!domEnvironmentConstructor) {
      throw new Error("DOM environment constructor is required for Node.js environment");
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

      return node.toString();
    })
    .join("\n");
};

const documentToString = (dom: GentlNode): string => {
  return (dom as Document)?.documentElement?.outerHTML || "";
};

export const process = (
  input: GentlJInput,
  options?: Partial<GentlJOptions>
): Promise<GentlJOutput> | GentlJOutput => {
  const absOptions: GentlJOptions = {
    ...defaultOptions,
    ...options,
  };
  const opt = {
    html: input.html,
    rootType: absOptions.rootParserType,
  };
  
  let dom;
  
  // Node.js環境でDOM環境が提供されている場合
  if (absOptions.domEnvironment) {
    const nodeQueryRootWrapper = createNodeQueryRootWrapper(absOptions.domEnvironment);
    dom = getNodes(opt, nodeQueryRootWrapper);
  }
  
  // ブラウザ環境またはNode.js環境でDOM環境が提供されていない場合
  if (!dom) {
    dom = getNodes(opt, browserQueryRootWrapper);
  }

  if (!dom) {
    throw new Error("couldn't analyze dom");
  }

  const generatedDom = generate({
    root: dom.root,
    queryRootWrapper: dom.queryRootWrapper,
    data: input.data,
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
