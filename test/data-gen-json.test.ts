import { test, type TestContext } from 'node:test';
import { type GentlJInput, type GentlJOptions, process } from "../src/index.ts";
import { format as f } from "prettier";

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
  <div data-gen-json="name">Test</div>
</template>`,
      data: { name: { key: "value" } },
    },
    options
  );

  assertHtml(
    context,
    result.html,
    `<template data-gen-scope="">
  <div data-gen-json="name">Test</div>
</template>
<div data-gen-cloned="">{"key":"value"}</div>`
  );
});

test("refer object property", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-json="person.name">Test</div>
</template>`,
      data: { person: { name: { key: "value" } } },
    },
    options
  );

  assert.equal(
    result.html,
    `<template data-gen-scope="">
  <div data-gen-json="person.name">Test</div>
</template>
<div data-gen-cloned="">{"key":"value"}</div>`
  );
});
