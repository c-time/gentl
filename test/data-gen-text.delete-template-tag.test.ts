import { test, type TestContext } from 'node:test';
import { type GentlJInput, type GentlJOptions, process } from "../src/index.ts";
import { format as f } from "prettier";
import { createTestOptions } from './test-helper.ts';

const assertHtml = async ({assert}: TestContext, actual: string, ex: string) => {
  assert.equal(
    await f(ex, {
      parser: "html",
      htmlWhitespaceSensitivity: "ignore",
    }),
    await f(actual, {
      parser: "html",
      htmlWhitespaceSensitivity: "ignore",
    })
  );
};

const options: GentlJOptions = createTestOptions({
  deleteDataAttributes: false,
  deleteTemplateTag: true,
  rootParserType: "childElement",
}) as GentlJOptions;

const processWrapper = (input: GentlJInput) => {
  return process(input, options);
};

test("basic", async ({assert})=> {
  const result = await processWrapper({
    html: `<template data-gen-scope="">
  <div data-gen-text="name">Test</div>
</template>`,
    data: { name: "Name" },
  });

  assert.equal(
    result.html,
    `<template data-gen-scope="">
  <div data-gen-text="name">Test</div>
</template>
<div data-gen-cloned="">Name</div>`
  );
});

test("refer object property", async ({assert})=> {
  const result = await processWrapper({
    html: `<template data-gen-scope="">
  <div data-gen-text="person.name">Test</div>
</template>`,
    data: { person: { name: "Name" } },
  });

  assert.equal(
    result.html,
    `<template data-gen-scope="">
  <div data-gen-text="person.name">Test</div>
</template>
<div data-gen-cloned="">Name</div>`
  );
});


