import { test } from "node:test";
import { JSDOM } from "jsdom";
import { type IncludeIo } from "../src/types.ts";
import { process } from "../src/index.ts";
import { createCountingDOMEnvironment } from "./test-helper.ts";

// issue #4: queryRootWrapper がパース毎に DOM 環境(env)を生成・滞留させていたメモリリークの回帰テスト。
// env は process() 1 回につき 1 つだけ生成・再利用され、完了時に dispose() が 1 回だけ呼ばれることを検証する。

const includeIo: IncludeIo = async (key) =>
  ({
    card: `<div class="card"><h3 data-gen-text="item.title">T</h3><p data-gen-text="item.body">B</p></div>`,
  } as Record<string, string>)[key] ?? "";

test("大きな repeat でも env 生成は 1 回・dispose は 1 回", async ({ assert }) => {
  const { CountingDOMEnvironment, counters } = createCountingDOMEnvironment();

  const items = Array.from({ length: 100 }, (_, i) => ({ name: `n${i}` }));
  const result = await process(
    {
      html: `<ul><template data-gen-scope data-gen-repeat="items" data-gen-repeat-name="item"><li data-gen-text="item.name">x</li></template></ul>`,
      data: { items },
    },
    { rootParserType: "childElement", domEnvironment: CountingDOMEnvironment }
  );

  // 出力は 100 件ぶん生成されている（実際にレンダリングが走っている確認）
  assert.equal((result.html.match(/data-gen-cloned/g) || []).length, 100);
  // env 生成は要素数に依らず 1 回、dispose も 1 回
  assert.equal(counters.constructed, 1);
  assert.equal(counters.disposed, 1);
});

test("include + ネスト repeat を通っても env は 1 回・dispose は 1 回", async ({ assert }) => {
  const { CountingDOMEnvironment, counters } = createCountingDOMEnvironment();

  await process(
    {
      html: `<div><template data-gen-scope data-gen-repeat="items" data-gen-repeat-name="item"><template data-gen-scope data-gen-include="card"></template></template></div>`,
      data: {
        items: [
          { title: "T1", body: "B1" },
          { title: "T2", body: "B2" },
          { title: "T3", body: "B3" },
        ],
      },
      includeIo,
    },
    { rootParserType: "childElement", domEnvironment: CountingDOMEnvironment }
  );

  assert.equal(counters.constructed, 1);
  assert.equal(counters.disposed, 1);
});

test("htmlDocument ページでも env は 1 回・dispose は 1 回", async ({ assert }) => {
  const { CountingDOMEnvironment, counters } = createCountingDOMEnvironment();

  await process(
    {
      html: `<!DOCTYPE html><html><head><title data-gen-text="t">x</title></head><body><ul><template data-gen-scope data-gen-repeat="items" data-gen-repeat-name="item"><li data-gen-text="item.name">x</li></template></ul></body></html>`,
      data: { t: "Page", items: [{ name: "a" }, { name: "b" }] },
    },
    { rootParserType: "htmlDocument", domEnvironment: CountingDOMEnvironment }
  );

  assert.equal(counters.constructed, 1);
  assert.equal(counters.disposed, 1);
});

test("env 再利用しても JSDOM 直接注入と出力が一致する", async ({ assert }) => {
  const { CountingDOMEnvironment } = createCountingDOMEnvironment();
  const input = {
    html: `<ul><template data-gen-scope data-gen-repeat="items" data-gen-repeat-name="item"><li data-gen-text="item.name" data-gen-attrs="data-id:item.id">x</li></template></ul>`,
    data: { items: [{ name: "A", id: 1 }, { name: "B", id: 2 }, { name: "C", id: 3 }] },
  };

  const reused = await process(input, { rootParserType: "childElement", domEnvironment: CountingDOMEnvironment });
  const fresh = await process(input, { rootParserType: "childElement", domEnvironment: JSDOM });

  assert.equal(reused.html, fresh.html);
});

test("dispose 未実装の env(JSDOM 直接)でも例外なく動作する（後方互換）", async ({ assert }) => {
  const result = await process(
    {
      html: `<template data-gen-scope data-gen-repeat="names" data-gen-repeat-name="name"><div data-gen-text="name">x</div></template>`,
      data: { names: ["a", "b"] },
    },
    { rootParserType: "childElement", domEnvironment: JSDOM }
  );

  assert.match(result.html, /a/);
  assert.match(result.html, /b/);
});

test("レンダリング中に例外が出ても dispose は 1 回呼ばれ、元の例外が伝播する", async ({ assert }) => {
  const { CountingDOMEnvironment, counters } = createCountingDOMEnvironment();

  await assert.rejects(
    () =>
      process(
        {
          // repeat の対象が配列でない → generate が throw する
          html: `<template data-gen-scope data-gen-repeat="notArray" data-gen-repeat-name="x"><div data-gen-text="x">y</div></template>`,
          data: { notArray: 123 },
        },
        { rootParserType: "childElement", domEnvironment: CountingDOMEnvironment }
      ),
    /is not array/
  );

  assert.equal(counters.disposed, 1);
});
