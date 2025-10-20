/**
 * Debug test to check actual output
 */
import { describe, it } from 'node:test';
import { JSDOM } from 'jsdom';
import { process } from '../src/index.ts';

describe('Debug Output', () => {
  
  it('Check actual output for data-gen-text', async () => {
    const html = `<template data-gen-scope="">
  <h1 data-gen-text="title">デフォルトタイトル</h1>
  <p data-gen-text="user.name">ゲストユーザー</p>
  <span data-gen-text="count">0</span>個
</template>`;

    const data = {
      title: "新着記事一覧",
      user: { name: "田中太郎" },
      count: 5
    };

    const result = await process({ html, data }, { domEnvironment: JSDOM });
    console.log('=== ACTUAL OUTPUT ===');
    console.log(result.html);
    console.log('=== END OUTPUT ===');
  });

  it('Check actual output for data-gen-repeat', async () => {
    const html = `<template data-gen-scope="">
  <li data-gen-repeat="items" data-gen-text="item">Default Item</li>
</template>`;

    const data = {
      items: ['Item 1', 'Item 2', 'Item 3']
    };

    const result = await process({ html, data }, { domEnvironment: JSDOM });
    console.log('=== REPEAT OUTPUT ===');
    console.log(result.html);
    console.log('=== END REPEAT OUTPUT ===');
  });

  it('Check data-gen-repeat with repeat-name', async () => {
    const html = `<template data-gen-scope="">
  <li data-gen-repeat="items" data-gen-repeat-name="item" data-gen-text="item">Default Item</li>
</template>`;

    const data = {
      items: ['Item 1', 'Item 2', 'Item 3']
    };

    const result = await process({ html, data }, { domEnvironment: JSDOM });
    console.log('=== REPEAT WITH NAME OUTPUT ===');
    console.log(result.html);
    console.log('=== END REPEAT WITH NAME OUTPUT ===');
  });

  it('Check data-gen-repeat on template tag', async () => {
    const html = `<template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
  <li data-gen-text="item">Default Item</li>
</template>`;

    const data = {
      items: ['Item 1', 'Item 2', 'Item 3']
    };

    const result = await process({ html, data }, { domEnvironment: JSDOM, rootParserType: 'childElement' });
    console.log('=== TEMPLATE REPEAT OUTPUT ===');
    console.log(result.html);
    console.log('=== END TEMPLATE REPEAT OUTPUT ===');
  });
});