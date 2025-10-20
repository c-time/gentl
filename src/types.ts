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

// DOM環境のオプション型（拡張可能）
export interface DOMEnvironmentOptions {
  readonly [key: string]: unknown;
}

export interface DOMEnvironmentConstructor<T extends DOMEnvironmentOptions = DOMEnvironmentOptions> {
  new (html?: string, options?: T): DOMEnvironment;
}

// ログ機能
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: {
    element?: string;
    attribute?: string;
    formula?: string;
    data?: any;
    error?: Error;
  };
  timestamp: Date;
}

export type Logger = (entry: LogEntry) => void;
