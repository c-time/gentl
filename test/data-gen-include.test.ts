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
      data: {},
      includeIo: async (key: string) => {
        if (key === 'testHtml') {
          return "<div>Hello! world!!</div>";
        }
        throw new Error(`Unknown key: ${key}`);
      }
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
      data: {},
      includeIo: async (key: string) => {
        if (key === 'testHtml') {
          return "<div>Hello! world!!</div><div>Hello! second world!!</div>";
        }
        throw new Error(`Unknown key: ${key}`);
      }
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
      data: {},
      includeIo: async (key: string) => {
        if (key === 'testHtml') {
          return "<div>Hello! world!!</div>text node<div>Hello! second world!!</div>";
        }
        throw new Error(`Unknown key: ${key}`);
      }
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

test("gen-include with data-gen-text in included html", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="testHtml"></template>`,
      data: { aaa: "Hello from data!" },
      includeIo: async (key: string) => {
        if (key === 'testHtml') {
          return `<h1 data-gen-text="aaa"></h1>`;
        }
        throw new Error(`Unknown key: ${key}`);
      }
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="testHtml"></template>
    <h1 data-gen-cloned="">Hello from data!</h1>
`)
  );
});

test("gen-include with nested data-gen-scope in included html", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="testHtml"></template>`,
      data: { title: "World", items: [{ name: "A" }, { name: "B" }] },
      includeIo: async (key: string) => {
        if (key === 'testHtml') {
          return `<div>
            <h1 data-gen-text="title"></h1>
            <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
              <span data-gen-text="item.name"></span>
            </template>
          </div>`;
        }
        throw new Error(`Unknown key: ${key}`);
      }
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-include="testHtml"></template>
    <div data-gen-cloned="">
      <h1>World</h1>
      <span>A</span>
      <span>B</span>
    </div>
`)
  );
});

test("gen-include malformed html", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-include="testHtml"></template>`,
      data: {},
      includeIo: async (key: string) => {
        if (key === 'testHtml') {
          return "<div>Hello! world!!</div><p>Hello! second world!!</div>";
        }
        throw new Error(`Unknown key: ${key}`);
      }
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




