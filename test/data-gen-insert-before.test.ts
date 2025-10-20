import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process } from "../src/index.ts";
import formatHtml from "./formatHtml.ts";

const options: Partial<GentlJOptions> = {
  rootParserType: "childElement",
};

test("basic insert after (default behavior)", async ({assert}) => {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-text="name">Test</div>
</template>`,
      data: { name: "Hello" },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="">
  <div data-gen-text="name">Test</div>
</template>
<div data-gen-cloned="">Hello</div>`)
  );
});

test("insert before with data-gen-insert-before attribute", async ({assert}) => {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-insert-before="">
  <div data-gen-text="name">Test</div>
</template>`,
      data: { name: "Hello" },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<div data-gen-cloned="">Hello</div>
<template data-gen-scope="" data-gen-insert-before="">
  <div data-gen-text="name">Test</div>
</template>`)
  );
});

test("insert before with repeat", async ({assert}) => {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item" data-gen-insert-before="">
  <div data-gen-text="item.name">Test</div>
</template>`,
      data: { items: [{name: "First"}, {name: "Second"}] },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<div data-gen-cloned="">First</div>
<div data-gen-cloned="">Second</div>
<template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item" data-gen-insert-before="">
  <div data-gen-text="item.name">Test</div>
</template>`)
  );
});

test("insert before with nested templates", async ({assert}) => {
  const result = await process(
    {
      html: `<div>
  <template data-gen-scope="" data-gen-insert-before="">
    <span data-gen-text="message">Test</span>
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <p data-gen-text="item">Item</p>
    </template>
  </template>
</div>`,
      data: { message: "Hello", items: ["A", "B"] },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<div>
  <span data-gen-cloned="">Hello</span>
  <p data-gen-cloned="">A</p>
  <p data-gen-cloned="">B</p>
  <template data-gen-scope="" data-gen-insert-before="">
    <span data-gen-text="message">Test</span>
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <p data-gen-text="item">Item</p>
    </template>
  </template>
</div>`)
  );
});

test("insert before with conditional", async ({assert}) => {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-if="show" data-gen-insert-before="">
  <div data-gen-text="name">Test</div>
</template>`,
      data: { show: true, name: "Visible" },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<div data-gen-cloned="">Visible</div>
<template data-gen-scope="" data-gen-if="show" data-gen-insert-before="">
  <div data-gen-text="name">Test</div>
</template>`)
  );
});

test("insert before with conditional false", async ({assert}) => {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-if="show" data-gen-insert-before="">
  <div data-gen-text="name">Test</div>
</template>`,
      data: { show: false, name: "Hidden" },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-if="show" data-gen-insert-before="">
  <div data-gen-text="name">Test</div>
</template>`)
  );
});