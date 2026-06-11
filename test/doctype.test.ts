/**
 * DOCTYPE 保持テスト（issue #1）
 * rootParserType: 'htmlDocument' の出力に DOCTYPE が保持されることを検証する。
 * jsdom と happy-dom の両方で同一ケースを実行し、互換性を確認する。
 */
import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { JSDOM } from "jsdom";
import { process } from "../src/index.ts";
import { HappyDOMEnvironment } from "./test-helper.ts";

const ENVS = [
  { name: "jsdom", env: JSDOM },
  { name: "happy-dom", env: HappyDOMEnvironment },
];

for (const { name, env } of ENVS) {
  describe(`DOCTYPE 保持 (${name})`, () => {
    it("HTML5 doctype が出力先頭に保持される", async () => {
      const html =
        `<!DOCTYPE html><html><head></head><body><div id="m">Hi</div></body></html>`;

      const result = await process(
        { html, data: {} },
        { domEnvironment: env, rootParserType: "htmlDocument" }
      );

      assert.ok(
        result.html.startsWith("<!DOCTYPE html>"),
        `出力が <!DOCTYPE html> で始まること: ${result.html.slice(0, 40)}`
      );
      assert.ok(result.html.includes("<html>"), "<html> が続くこと");
      assert.ok(result.html.includes('<div id="m">Hi</div>'), "本文が保持されること");
    });

    it("doctype 無しの入力では DOCTYPE を付与しない（回帰確認）", async () => {
      const html = `<html><head></head><body><div id="m">Hi</div></body></html>`;

      const result = await process(
        { html, data: {} },
        { domEnvironment: env, rootParserType: "htmlDocument" }
      );

      assert.ok(
        !result.html.includes("<!DOCTYPE"),
        `DOCTYPE を含まないこと: ${result.html.slice(0, 40)}`
      );
      assert.equal(result.html, html);
    });

    it("レガシー doctype の publicId/systemId が完全再現される", async () => {
      const doctype =
        `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">`;
      const html = `${doctype}<html><head></head><body>x</body></html>`;

      const result = await process(
        { html, data: {} },
        { domEnvironment: env, rootParserType: "htmlDocument" }
      );

      assert.ok(result.html.startsWith("<!DOCTYPE html"), "DOCTYPE で始まること");
      assert.ok(
        result.html.includes('PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"'),
        `publicId が再現されること: ${result.html.slice(0, 120)}`
      );
      assert.ok(
        result.html.includes(
          '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"'
        ),
        `systemId が再現されること: ${result.html.slice(0, 120)}`
      );
    });
  });
}
