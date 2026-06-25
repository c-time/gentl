import { test } from 'node:test';
import { type GentlJOptions, process } from "../src/index.ts";
import { createTestOptions } from './test-helper.ts';

const options: Partial<GentlJOptions> = createTestOptions({
  rootParserType: "childElement",
});

// ネストされた <ul><li> の繰り返しは outerHTML で直列化されるため、
// クローン間に改行が入らないと </li><li> のように連結されてしまう。
// 改行＋インデントが挿入されることを生の文字列で検証する。
test("ネストした繰り返し li がクローン間に改行＋インデントを持つ", async ({ assert }) => {
  const result = await process(
    {
      html: `<ul>
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <li data-gen-text="item">Default Item</li>
    </template>
  </ul>`,
      data: { items: ["Item 1", "Item 2", "Item 3"] },
    },
    options
  );

  // (1) </li><li> の改行なし連結が消えていること
  assert.ok(
    !result.html.includes("</li><li>"),
    `連結 </li><li> が残っている: ${result.html}`
  );

  // (2) 項目間に改行が入っていること
  assert.ok(
    result.html.includes("</li>\n"),
    `項目間に改行が入っていない: ${result.html}`
  );

  // (3) 改行に続いてテンプレート行と同じインデント（半角4スペース）が付くこと。
  //     クローンは <template> の兄弟として挿入されるため、インデントはテンプレート行に揃う。
  assert.ok(
    result.html.includes("</li>\n    <li"),
    `改行＋インデントになっていない: ${result.html}`
  );
});
