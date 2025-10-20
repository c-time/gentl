import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process }  from "../src/index.ts";
import { type IncludeIo } from "../src/types.ts";
import formatHtml from "./formatHtml.ts";
import { createTestOptions } from './test-helper.ts';

const options: Partial<GentlJOptions> = createTestOptions({
  rootParserType: "childElement",
});

test("gen-include with includeIo", async ({assert})=> {
  const includeIo: IncludeIo = async (key: string) => {
    switch (key) {
      case 'header': return '<header><h1>Dynamic Header</h1></header>';
      case 'footer': return '<footer><p>Dynamic Footer</p></footer>';
      default: throw new Error(`Unknown key: ${key}`);
    }
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
  const includeIo: IncludeIo = async (key: string) => {
    if (key === 'header') {
      return '<header><h1>Dynamic Header</h1></header>';
    }
    throw new Error(`Unknown key: ${key}`);
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
  const includeIo: IncludeIo = async (key: string) => {
    if (key === 'failing') {
      throw new Error('Failed to load content');
    }
    throw new Error(`Unknown key: ${key}`);
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
  const includeIo: IncludeIo = async (key: string) => {
    switch (key) {
      case 'content1': return '<div>Content 1</div>';
      case 'content2': return '<div>Content 2</div>';
      default: throw new Error(`Unknown key: ${key}`);
    }
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