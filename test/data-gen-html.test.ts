import { test, type TestContext } from 'node:test';
import { type GentlJInput, type GentlJOptions, process } from "../src/index.ts";
import { format as f } from "prettier";
import formatHtml from "./formatHtml.ts";

const options: Partial<GentlJOptions> = {
  rootParserType: "childElement",
};

const assertHtml = async ({assert} :TestContext, actual: string, ex: string) => {
  assert.equal(
    await f(actual, {
      parser: "html",
      htmlWhitespaceSensitivity: "ignore",
    }),
    await f(ex, {
      parser: "html",
      htmlWhitespaceSensitivity: "ignore",
    })
  );
};

test("basic", async (context)=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-html="name">Test</div>
</template>`,
      data: { name: "<span>Name</span>" },
    },
    options
  );

  assertHtml(
    context,
    result.html,
    `<template data-gen-scope="">
  <div data-gen-html="name">Test</div>
</template>
<div data-gen-cloned=""><span>Name</span></div>`
  );
});

test("at head", async (context)=> {
  const result = await process(
    {
      html: `<html><head><template data-gen-scope="">
  <title data-gen-html="name">test</title>
</template><title data-gen-cloned="">aaa</title></head><body>Hello world!</body></html>`,
      data: { name: "<span>Name</span>" },
    },
    {
      rootParserType: "htmlDocument",
    }
  );

  assertHtml(
    context,
    result.html,
    `<html><head><template data-gen-scope="">
    <title data-gen-html="name">test</title>
  </template><title data-gen-cloned="">&lt;span&gt;Name&lt;/span&gt;</title></head><body>Hello world!</body></html>`
  );
});

test("refer object property", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-html="person.name">Test</div>
</template>`,
      data: { person: { name: "<span>Name</span>" } },
    },
    options
  );

  assert.equal(
    result.html,
    `<template data-gen-scope="">
  <div data-gen-html="person.name">Test</div>
</template>
<div data-gen-cloned=""><span>Name</span></div>`
  );
});

test("not able to use gen-html at template tag", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-html="person.name">
  Test
</template>`,
      data: { person: { name: "<span>Name</span>" } },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-html="person.name">
    Test
  </template>`)
  );
});
