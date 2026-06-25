import { JSDOM } from "jsdom";
import { Window } from "happy-dom";
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

/**
 * テスト用のHappy DOM環境クラス
 * happy-domの new Window() をDOMEnvironment形状に合わせてラップする。
 * cleanup に必要な happyDOM ハンドルを保持し、dispose() で Window を破棄できるようにする。
 */
export class HappyDOMEnvironment {
  public window: {
    DOMParser: new () => DOMParser;
    document: Document;
  };
  private readonly happyWindow: Window;

  constructor() {
    const w = new Window();
    this.happyWindow = w;
    this.window = {
      DOMParser: w.DOMParser as unknown as new () => DOMParser,
      document: w.document as unknown as Document,
    };
  }

  async dispose(): Promise<void> {
    await this.happyWindow.happyDOM?.close?.();
  }
}

/**
 * ライフサイクル検証用の DOM 環境クラスを生成するファクトリ。
 * JSDOM をラップし、コンストラクタ呼び出し回数と dispose 呼び出し回数を記録する。
 * テスト間でカウンタが汚染されないよう、テストごとに新しいクラスを生成して使う。
 */
export function createCountingDOMEnvironment() {
  const counters = { constructed: 0, disposed: 0 };

  class CountingDOMEnvironment {
    public window: {
      DOMParser: new () => DOMParser;
      document: Document;
    };

    constructor() {
      counters.constructed++;
      const dom = new JSDOM();
      this.window = {
        DOMParser: dom.window.DOMParser,
        document: dom.window.document,
      };
    }

    async dispose(): Promise<void> {
      counters.disposed++;
    }
  }

  return { CountingDOMEnvironment, counters };
}