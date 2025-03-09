import { test, type TestContext } from 'node:test';
import { type GentlJInput, type GentlJOptions, process } from "../index.ts";
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
  <div data-gen-text="name">Test</div>
</template>`,
      data: { name: "Name" },
    },
    options
  );

  assertHtml(
    context,
    result.html,
    `<template data-gen-scope="">
  <div data-gen-text="name">Test</div>
</template>
<div data-gen-cloned="">Name</div>`
  );
});

test("at head", async (context)=> {
  const result = await process(
    {
      html: `<html><head><template data-gen-scope="">
  <title data-gen-text="name">test</title>
</template><title data-gen-cloned="">aaa</title></head><body>Hello world!</body></html>`,
      data: { name: "Name" },
    },
    {
      rootParserType: "htmlDocument",
    }
  );

  assertHtml(
    context,
    result.html,
    `<html><head><template data-gen-scope="">
    <title data-gen-text="name">test</title>
  </template><title data-gen-cloned="">Name</title></head><body>Hello world!</body></html>`
  );
});

test("refer object property", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-text="person.name">Test</div>
</template>`,
      data: { person: { name: "Name" } },
    },
    options
  );

  assert.equal(
    result.html,
    `<template data-gen-scope="">
  <div data-gen-text="person.name">Test</div>
</template>
<div data-gen-cloned="">Name</div>`
  );
});

test("not able to use gen-text at template tag", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-text="person.name">
  Test
</template>`,
      data: { person: { name: "Name" } },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-text="person.name">
    Test
  </template>`)
  );
});
