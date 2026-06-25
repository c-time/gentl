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
  // 任意の破棄フック（後方互換）。process() は env を 1 回だけ生成して使い回し、
  // 完了時にこれを呼んで DOM 環境（happy-dom の Window 等）を解放できる。
  // happy-dom の window.happyDOM.close() 等の実 cleanup は非同期なので Promise も許容する。
  dispose?(): void | Promise<void>;
  [Symbol.asyncDispose]?(): Promise<void>;
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

// includeIo 関数の型定義
export type IncludeIo = (key: string, baseData?: GentlJInputData) => Promise<string>;
