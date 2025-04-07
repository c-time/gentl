import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process }  from "../src/index.ts";
import { format as f } from "prettier";;
import formatHtml from "./formatHtml.ts";

const options: Partial<GentlJOptions> = {
  rootParserType: "childElement",
};

test("gen-if basic true", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-if="visible" data-gen-text="name">Test</div>
</template>`,
      data: { name: "Name", visible: true },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="">
  <div data-gen-if="visible" data-gen-text="name">Test</div>
</template>
<div data-gen-cloned="">Name</div>
`)
  );
});

test("gen-if basic false", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-if="visible" data-gen-text="name">Test</div>
</template>`,
      data: { name: "Name", visible: false },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="">
  <div data-gen-if="visible" data-gen-text="name">Test</div>
</template>`)
  );
});

test("gen-if at template tag true", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-if="visible">
  <div data-gen-text="name">Test</div>
</template>`,
      data: { name: "Name", visible: true },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-if="visible">
  <div data-gen-text="name">Test</div>
</template>
<div data-gen-cloned="">Name</div>
`)
  );
});

test("gen-if at template tag false", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-if="visible">
  <div data-gen-text="name">Test</div>
</template>`,
      data: { name: "Name", visible: false },
    },
    options
  );
  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-if="visible">
  <div data-gen-text="name">Test</div>
</template>
`)
  );
});
