import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process }  from "../src/index.ts";
import { type IncludeIo } from "../src/types.ts";
import formatHtml from "./formatHtml.ts";
import { createTestOptions } from './test-helper.ts';

const options: Partial<GentlJOptions> = createTestOptions({
  rootParserType: "childElement",
});

test("gen-include with includeIo", async ({assert})=> {
  const includeIo: IncludeIo = {
    'header': async () => '<header><h1>Dynamic Header</h1></header>',
    'footer': async () => '<footer><p>Dynamic Footer</p></footer>'
  };

  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="header"></template>`,
      data: {},
      includeIo
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="header"></template>
    <header data-gen-cloned=""><h1>Dynamic Header</h1></header>
`)
  );
});

test("gen-include with includeIo missing key", async ({assert})=> {
  const includeIo: IncludeIo = {
    'header': async () => '<header><h1>Dynamic Header</h1></header>'
  };

  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="footer"></template>`,
      data: { "footer": "<div>Fallback Footer</div>"},
      includeIo
    },
    options
  );

  // includeIoに存在しないキーの場合、テンプレートのみ残る（コンテンツは生成されない）
  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="footer"></template>`)
  );
});

test("gen-include with includeIo error handling", async ({assert})=> {
  const includeIo: IncludeIo = {
    'failing': async () => {
      throw new Error('Failed to load content');
    }
  };

  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="failing"></template>`,
      data: {},
      includeIo
    },
    options
  );

  // エラーが発生した場合、何も生成されない（テンプレートのみ残る）
  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="failing"></template>`)
  );
});

test("gen-include without includeIo", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="content"></template>`,
      data: { "content": "<div>This should not be used</div>"}
      // includeIoは提供されていない
    },
    options
  );

  // includeIoが提供されていない場合、テンプレートのみ残る
  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="content"></template>`)
  );
});

test("gen-include with includeIo multiple keys", async ({assert})=> {
  const includeIo: IncludeIo = {
    'content1': async () => '<div>Content 1</div>',
    'content2': async () => '<div>Content 2</div>'
  };

  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="content1"></template><template data-gen-scope="" data-gen-include="content2"></template>`,
      data: {},
      includeIo
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="content1"></template>
<div data-gen-cloned="">Content 1</div>
<template data-gen-scope="" data-gen-include="content2"></template>
<div data-gen-cloned="">Content 2</div>`)
  );
});