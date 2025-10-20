import { JSDOM } from "jsdom";
import { type GentlJOptions, type Logger, type LogEntry, type LogLevel } from "../src/index.ts";

/**
 * テスト用のシンプルなLogger実装
 * ログエントリを配列に保存し、コンソール出力も行う
 */
export class TestLogger {
  public logs: LogEntry[] = [];

  log: Logger = (entry: LogEntry) => {
    this.logs.push(entry);
  };

  clear() {
    this.logs = [];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }
}

/**
 * テスト用のGentlJオプションを作成します
 * Node.js環境でDOM環境（JSDOM）を注入します
 */
export function createTestOptions(options?: Partial<GentlJOptions>): Partial<GentlJOptions> {
  return {
    domEnvironment: JSDOM,
    ...options,
  };
}

/**
 * ブラウザ環境用のDOM環境クラス
 * ブラウザのグローバルなwindowとDOMParserを使用
 */
export class BrowserDOMEnvironment {
  public window: {
    DOMParser: new () => DOMParser;
    document: Document;
  };

  constructor() {
    if (typeof window === "undefined" || typeof DOMParser === "undefined") {
      throw new Error("Browser environment required - window or DOMParser is not available");
    }
    
    this.window = {
      DOMParser: DOMParser,
      document: window.document,
    };
  }
}