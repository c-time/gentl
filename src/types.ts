export type GenerateOptions = {
  scope: string;
  templateTagName: string;
  attributePrefix: string;
  // removeAttributeOfClonedElement: boolean;
  // removeTemplateTag: boolean;
};

export type GentlNode = Node;
export type GentlElement = Element & GentlNode;
export type GentlHTMLElement = HTMLElement & GentlElement;
export const ELEMENT = 1;

export type QueryRootType = "htmlDocument" | "xmlDocument" | "childElement";
export type QueryRoot = ParentNode;
export type QueryRootWrapper = (params: { html: string, rootType: QueryRootType }) => QueryRoot;
export type GentlJInputData = object;

// DOM環境関連のインターフェース
export interface DOMEnvironment {
  window: {
    DOMParser: new () => DOMParser;
    document: Document;
  };
}

export interface DOMEnvironmentConstructor {
  new (html?: string, options?: any): DOMEnvironment;
}
