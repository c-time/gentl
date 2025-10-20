import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process }  from "../src/index.ts";
import { format as f } from "prettier";;
import formatHtml from "./formatHtml.ts";
import { createTestOptions } from './test-helper.ts';

const options: Partial<GentlJOptions> = createTestOptions({
  rootParserType: "childElement",
});

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

test("gen-if basic undefined", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="">
  <div data-gen-if="visible.value" data-gen-text="visible.value">Test</div>
</template>`,
      data: { name: "Name", visible: {} },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="">
  <div data-gen-if="visible.value" data-gen-text="visible.value">Test</div>
</template>`)
  );
});


test("gen-if complex with json and repeat", async ({assert})=> {
  const result = await process(
    {
      html: `<template data-gen-scope="" data-gen-if="hasIndexList">
        <div class="table-of-contents"><span class="toc">目次</span>
          <ul>
            <div data-gen-json="indexList"></div>
            <template data-gen-scope="" data-gen-repeat="indexList" data-gen-repeat-name="item">
              <li data-gen-attrs="class: item.type" class="toc-h2"><template data-gen-scope="" data-gen-if="item.h2No"><span class="toc-number" data-gen-text="item.h2No">01</span> </template><a data-gen-attrs="href:item.link" href="#heading-0" data-gen-text="item.title"></a></li>
            </template>
          </ul>
        </div>
      </template>`,
      data: { hasIndexList: true, indexList: [
        {h2No:"01", type: "toc-h2", link: "#heading-01", title: "タイトル1"},
        {h2No: undefined, type: "toc-h3", link: "#heading-01", title: "タイトル2"}
      ] },
    },
    options
  );

  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="" data-gen-if="hasIndexList">
        <div class="table-of-contents"><span class="toc">目次</span>
          <ul>
            <div data-gen-json="indexList"></div>
            <template data-gen-scope="" data-gen-repeat="indexList" data-gen-repeat-name="item">
              <li data-gen-attrs="class: item.type" class="toc-h2"><template data-gen-scope="" data-gen-if="item.h2No"><span class="toc-number" data-gen-text="item.h2No">01</span> </template><a data-gen-attrs="href:item.link" href="#heading-0" data-gen-text="item.title"></a></li>
            </template>
          </ul>
        </div>
      </template>
<div data-gen-cloned="" class="table-of-contents">
  <span class="toc">目次</span>
  <ul>
    <div>[{"type":"toc-h3","link":"#heading-01","title":"タイトル2"},{"h2No":"01","type":"toc-h2","link":"#heading-01","title":"タイトル1"}]</div>
    <li class="toc-h2">
      <span class="toc-number">01</span>
      <a href="#heading-01">タイトル1</a>
    </li>
    <li class="toc-h3"><a href="#heading-01">タイトル2</a></li>
  </ul>
</div>`)
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
