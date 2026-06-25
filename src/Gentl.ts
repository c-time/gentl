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



// process() 1 回につき DOM 環境（env）を 1 つだけ生成して全パースで使い回す。
// 以前は queryRootWrapper 呼び出し毎に new していたため、ページの要素数に比例して
// Window が生成・滞留し OOM していた（issue #4）。env は wrapper と dispose の両方に
// クロージャ経由で共有され、dispose() で注入側に明示破棄させられる。
const createQueryRootWrapper = (
  domEnvironmentConstructor: DOMEnvironmentConstructor
): { queryRootWrapper: QueryRootWrapper; dispose: (logger?: Logger) => Promise<void> } => {
  if (!domEnvironmentConstructor) {
    throw new Error("DOM environment constructor is required");
  }

  const domEnv = new domEnvironmentConstructor();

  const queryRootWrapper: QueryRootWrapper = (params: { html: string; rootType: QueryRootType }) => {
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

  // 任意の破棄フック。dispose() / [Symbol.asyncDispose]() のいずれかが実装されていれば
  // await して呼ぶ。未実装（JSDOM 直接注入やブラウザのグローバル window 等）は no-op。
  // 本処理の結果・例外を隠さないため、破棄自体の失敗は握り潰す（logger があれば warn）。
  const dispose = async (logger?: Logger): Promise<void> => {
    const d = domEnv.dispose ?? domEnv[Symbol.asyncDispose];
    if (typeof d !== "function") {
      return;
    }
    try {
      await d.call(domEnv);
    } catch (error) {
      if (logger) {
        logger({
          level: "warn",
          message: "Failed to dispose DOM environment",
          context: {
            error: error instanceof Error ? error : new Error(String(error)),
          },
          timestamp: new Date(),
        });
      }
    }
  };

  return { queryRootWrapper, dispose };
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

// DocumentType ノードを XMLSerializer 相当のフォーマットで直列化する
const serializeDoctype = (doctype: DocumentType): string => {
  let s = `<!DOCTYPE ${doctype.name}`;
  if (doctype.publicId) {
    s += ` PUBLIC "${doctype.publicId}"`;
  } else if (doctype.systemId) {
    s += " SYSTEM";
  }
  if (doctype.systemId) {
    s += ` "${doctype.systemId}"`;
  }
  return s + ">";
};

const documentToString = (dom: GentlNode): string => {
  const doc = dom as Document;
  const html = doc?.documentElement?.outerHTML || "";
  const doctype = doc?.doctype;
  return doctype ? `${serializeDoctype(doctype)}\n${html}` : html;
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

  // env は process() 1 回につき 1 つ。出力文字列を生成し終えてから finally で破棄する。
  const { queryRootWrapper, dispose } = createQueryRootWrapper(absOptions.domEnvironment);
  try {
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
  } finally {
    // 文字列化済みのため Window 破棄は出力に影響しない。generate 再帰の全完了後にのみ呼ぶ。
    await dispose(absOptions.logger);
  }
};
