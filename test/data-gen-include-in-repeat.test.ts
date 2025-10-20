import { process } from "../src/Gentl.ts";
import { JSDOM } from "jsdom";
import { test } from "node:test";
import { strict as assert } from "node:assert";
import { type IncludeIo } from "../src/types.ts";

test("data-gen-include in data-gen-repeat with baseData", async () => {
  const includeIo: IncludeIo = {
    'item-template': async (baseData) => {
      const item = (baseData as any)?.item;
      if (!item) {
        return '<div>No item data</div>';
      }
      
      return `
        <div class="item-detail">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <span class="price">¥${item.price}</span>
        </div>
      `;
    },
    'category-header': async (baseData) => {
      const category = (baseData as any)?.category;
      if (!category) {
        return '<div>No category data</div>';
      }
      
      return `
        <header class="category-header">
          <h2>${category.name}</h2>
          <p>${category.description}</p>
        </header>
      `;
    }
  };

  const html = `
    <template data-gen-scope="" data-gen-repeat="categories" data-gen-repeat-name="category">
      <section class="category-section">
        <template data-gen-scope="" data-gen-include="category-header"></template>
        <div class="items">
          <template data-gen-scope="" data-gen-repeat="category.items" data-gen-repeat-name="item">
            <template data-gen-scope="" data-gen-include="item-template"></template>
          </template>
        </div>
      </section>
    </template>
  `;

  const data = {
    categories: [
      {
        name: "Electronics",
        description: "Electronic devices and gadgets",
        items: [
          { name: "Smartphone", description: "Latest model smartphone", price: 80000 },
          { name: "Laptop", description: "High-performance laptop", price: 150000 }
        ]
      },
      {
        name: "Books",
        description: "Various books and literature",
        items: [
          { name: "Programming Guide", description: "Learn programming from scratch", price: 3000 },
          { name: "Design Thinking", description: "Creative design methodology", price: 2500 }
        ]
      }
    ]
  };

  const result = await process(
    { html, data, includeIo },
    { domEnvironment: JSDOM, rootParserType: "childElement" }
  );

  // カテゴリヘッダーが正しく生成されているかチェック
  assert(result.html.includes('<h2>Electronics</h2>'));
  assert(result.html.includes('<h2>Books</h2>'));
  assert(result.html.includes('Electronic devices and gadgets'));
  assert(result.html.includes('Various books and literature'));

  // アイテムの詳細が正しく生成されているかチェック
  assert(result.html.includes('<h3>Smartphone</h3>'));
  assert(result.html.includes('<h3>Laptop</h3>'));
  assert(result.html.includes('<h3>Programming Guide</h3>'));
  assert(result.html.includes('<h3>Design Thinking</h3>'));

  // 価格が正しく表示されているかチェック
  assert(result.html.includes('¥80000'));
  assert(result.html.includes('¥150000'));
  assert(result.html.includes('¥3000'));
  assert(result.html.includes('¥2500'));

  console.log("✅ data-gen-include in data-gen-repeat with baseData test passed");
});

test("data-gen-include in nested repeat without required data", async () => {
  const includeIo: IncludeIo = {
    'item-template': async (baseData) => {
      const item = (baseData as any)?.item;
      if (!item) {
        return '<div class="no-item">No item data available</div>';
      }
      return `<div class="item">${item.name}</div>`;
    }
  };

  const html = `
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <template data-gen-scope="" data-gen-include="item-template"></template>
    </template>
  `;

  const data = {
    items: [
      { name: "Item 1" },
      { name: "Item 2" }
    ]
  };

  const result = await process(
    { html, data, includeIo },
    { domEnvironment: JSDOM, rootParserType: "childElement" }
  );

  // includeIo関数にbaseDataが正しく渡されているかチェック
  assert(result.html.includes('Item 1'));
  assert(result.html.includes('Item 2'));
  assert(!result.html.includes('No item data available'));

  console.log("✅ data-gen-include in nested repeat test passed");
});

test("data-gen-include with missing includeIo function", async () => {
  const includeIo: IncludeIo = {
    'existing-template': async () => '<div>Existing template</div>'
  };

  const html = `
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <template data-gen-scope="" data-gen-include="non-existing-template"></template>
      <div data-gen-text="item.name">Default</div>
    </template>
  `;

  const data = {
    items: [
      { name: "Item 1" },
      { name: "Item 2" }
    ]
  };

  const result = await process(
    { html, data, includeIo },
    { domEnvironment: JSDOM, rootParserType: "childElement" }
  );

  // 存在しないincludeIo関数の場合、その部分は何も生成されない
  // ただし、テンプレート内にinclude属性は残る
  assert(result.html.includes('non-existing-template'));
  
  // 他の部分は正常に生成される
  assert(result.html.includes('Item 1'));
  assert(result.html.includes('Item 2'));

  console.log("✅ data-gen-include with missing includeIo function test passed");
});

test("data-gen-include error handling with baseData", async () => {
  const includeIo: IncludeIo = {
    'error-template': async (baseData) => {
      throw new Error('Template generation failed');
    },
    'success-template': async (baseData) => {
      return `<div>Success: ${(baseData as any)?.item?.name || 'unknown'}</div>`;
    }
  };

  let errorLogged = false;
  const logger = (entry: any) => {
    if (entry.level === 'error' && entry.message === 'Failed to load include content') {
      errorLogged = true;
    }
  };

  const html = `
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <template data-gen-scope="" data-gen-include="error-template"></template>
      <template data-gen-scope="" data-gen-include="success-template"></template>
    </template>
  `;

  const data = {
    items: [
      { name: "Item 1" }
    ]
  };

  const result = await process(
    { html, data, includeIo },
    { domEnvironment: JSDOM, rootParserType: "childElement", logger }
  );

  // エラーが発生したテンプレートは生成されない
  assert(!result.html.includes('Template generation failed'));
  
  // 成功したテンプレートは正常に生成される
  assert(result.html.includes('Success: Item 1'));
  
  // エラーがログに記録される
  assert(errorLogged, 'Error should be logged');

  console.log("✅ data-gen-include error handling with baseData test passed");
});