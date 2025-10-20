import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process }  from "../src/index.ts";
import { format as f } from "prettier";;
import formatHtml from "./formatHtml.ts";
import { createTestOptions } from './test-helper.ts';

const options: Partial<GentlJOptions> = createTestOptions({
  rootParserType: "childElement",
});

test("gen-include basic", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="testHtml"></template>`,
      data: { "testHtml": "<div>Hello! world!!</div>"},
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="testHtml"></template>
    <div data-gen-cloned="">Hello! world!!</div>
`)
  );
});

test("gen-include multiple elements", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="testHtml"></template>`,
      data: { "testHtml": "<div>Hello! world!!</div><div>Hello! second world!!</div>"},
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="testHtml"></template>
    <div data-gen-cloned="">Hello! world!!</div>
    <div data-gen-cloned="">Hello! second world!!</div>    
`)
  );
});

test("gen-include multiple elements and text node", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="testHtml"></template>`,
      data: { "testHtml": "<div>Hello! world!!</div>text node<div>Hello! second world!!</div>"},
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="testHtml"></template>
    <div data-gen-cloned="">Hello! world!!</div>
    <div data-gen-cloned="">Hello! second world!!</div>    
`)
  );
});

test("gen-include malformed html", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="testHtml"></template>`,
      data: { "testHtml": "<div>Hello! world!!</div><p>Hello! second world!!</div>"},
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="testHtml"></template>
    <div data-gen-cloned="">Hello! world!!</div>
    <p data-gen-cloned="">Hello! second world!!</p>    
`)
  );
});




