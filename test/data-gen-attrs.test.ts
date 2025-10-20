import { test, type TestContext } from 'node:test';
import { type GentlJInput, type GentlJOptions, process } from "../src/index.ts";
import { format as f } from "prettier";
import formatHtml from "./formatHtml.ts";
import { createTestOptions } from './test-helper.ts';

const options: Partial<GentlJOptions> = createTestOptions({
  rootParserType: "childElement",
});

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
  <div data-gen-attrs="data-name: name, data-value: value">Test</div>
</template>`,
      data: { name: "Name", value: "Value" },
    },
    options
  );

  assertHtml(
    context,
    result.html,
    `<template data-gen-scope="">
  <div data-gen-attrs="data-name: name, data-value: value">Test</div>
</template>
<div data-gen-cloned="" data-name="Name" data-value="Value">Test</div>`
  );
});

test("overload", async (context)=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-attrs="data-name: name, data-value: value" data-name="pre-name" >Test</div>
</template>`,
      data: { name: "Name", value: "Value" },
    },
    options
  );

  assertHtml(
    context,
    result.html,
    `<template data-gen-scope="">
  <div data-gen-attrs="data-name: name, data-value: value" data-name="pre-name" >Test</div>
</template>
<div data-gen-cloned="" data-name="Name" data-value="Value">Test</div>`
  );
});

test("remove by undefined", async (context)=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-attrs="data-name: name, data-value: value" data-name="pre-name" >Test</div>
</template>`,
      data: { name: undefined, value: "Value" },
    },
    options
  );

  assertHtml(
    context,
    result.html,
    `<template data-gen-scope="">
  <div data-gen-attrs="data-name: name, data-value: value" data-name="pre-name" >Test</div>
</template>
<div data-gen-cloned="" data-value="Value">Test</div>`
  );
});

test("remove by null", async (context)=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-attrs="data-name: name, data-value: value" data-name="pre-name" >Test</div>
</template>`,
      data: { name: null, value: "Value" },
    },
    options
  );

  assertHtml(
    context,
    result.html,
    `<template data-gen-scope="">
  <div data-gen-attrs="data-name: name, data-value: value" data-name="pre-name" >Test</div>
</template>
<div data-gen-cloned="" data-value="Value">Test</div>`
  );
});


