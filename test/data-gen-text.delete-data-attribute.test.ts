import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process } from "../src/index.ts";
import { format as f } from "prettier";;

const options: GentlJOptions = {
  deleteDataAttributes: true,
  deleteTemplateTag: true,
  rootParserType: "childElement",
};

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
