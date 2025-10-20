import { JSDOM } from "jsdom";
import { type GentlJOptions } from "../src/index.ts";

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