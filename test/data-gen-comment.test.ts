import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process }  from "../src/index.ts";
import { format as f } from "prettier";;
import formatHtml from "./formatHtml.ts";
import { createTestOptions } from './test-helper.ts';

const options: Partial<GentlJOptions> = createTestOptions({
  rootParserType: "childElement",
});

test("gen-comment basic", async ({assert}) => {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-comment="">
  <div data-gen-text="name">Test</div>
</template>`,
      data: { name: "Name"},
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-comment="">
    <div data-gen-text="name">Test</div>
  </template>`)
  );
});

test("gen-comment child element", async ({assert}) => {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-text="name" data-gen-comment="">Test</div>
</template>`,
      data: { name: "Name"},
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="">
    <div data-gen-text="name" data-gen-comment="">Test</div>
  </template>`)
  );
});

test("gen-comment nested child element", async ({assert}) => {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-text="name" data-gen-comment="">Test</div>
  <div data-gen-text="name">text</div>
  <template data-gen-scope="">
    <div data-gen-text="name" data-gen-comment="">Test2</div>
    <div>shown</div>
  </template>
</template>`,
      data: { name: "Name"},
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="">
    <div data-gen-text="name" data-gen-comment="">Test</div>
    <div data-gen-text="name">text</div>
    <template data-gen-scope="">
      <div data-gen-text="name" data-gen-comment="">Test2</div>
      <div>shown</div>
    </template>
  </template>
  <div data-gen-cloned="">Name</div>
  <div data-gen-cloned="">shown</div>
  `)
  );
});


