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

// 出力を再度 bake しても結果が変わらないこと（冪等性）。
// クローン直前に挿入する改行＋インデントのテキストノードが、再 bake のクローン除去で
// 取り残されると空白行が毎パス増殖するため、生の文字列で完全一致を検証する。
test("出力を再 bake しても結果が変わらない（空白行が増殖しない）", async ({ assert }) => {
  const data = { items: ["Item 1", "Item 2", "Item 3"] };
  const html = `<ul>
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <li data-gen-text="item">Default Item</li>
    </template>
  </ul>`;

  const bake1 = (await process({ html, data }, options)).html;
  const bake2 = (await process({ html: bake1, data }, options)).html;
  const bake3 = (await process({ html: bake2, data }, options)).html;

  assert.equal(bake2, bake1, `2 回目の bake で差分が出た:\n${bake1}\n---\n${bake2}`);
  assert.equal(bake3, bake2, `3 回目の bake で差分が出た:\n${bake2}\n---\n${bake3}`);
});

// ネストした繰り返しでも再 bake が冪等であること。
test("ネストした繰り返しも再 bake で冪等", async ({ assert }) => {
  const data = {
    people: [
      { name: "Name1", hobbies: ["Book", "Movie", "Music"] },
      { name: "Name2", hobbies: ["Anime", "Sports"] },
    ],
  };
  const html = `<template data-gen-scope="" data-gen-repeat="people" data-gen-repeat-name="person">
  <div>
    <div data-gen-text="person.name">Name</div>
    <template data-gen-scope="" data-gen-repeat="person.hobbies" data-gen-repeat-name="hobby">
      <div>
        <div data-gen-text="hobby">Hobby</div>
      </div>
    </template>
  </div>
</template>`;

  const bake1 = (await process({ html, data }, options)).html;
  const bake2 = (await process({ html: bake1, data }, options)).html;

  assert.equal(bake2, bake1, `ネスト再 bake で差分が出た:\n${bake1}\n---\n${bake2}`);
});
