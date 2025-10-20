/**
 * Scope Filter Test
 * data-gen-scopeのフィルタリング機能をテスト
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { process } from '../src/index.ts';

describe('Scope Filter Tests', () => {
  
  describe('基本的なスコープフィルタリング', () => {
    it('特定のスコープのみ処理されること', async () => {
      const html = `
        <template data-gen-scope="hoge fuga">
          <div data-gen-text="titleHoge">Hoge Title</div>
        </template>
        <template data-gen-scope="piyo">
          <div data-gen-text="titlePiyo">Piyo Title</div>
        </template>
        <template data-gen-scope="">
          <div data-gen-text="title">Default Title</div>
        </template>
      `;

      const data = {
        titleHoge: "Test Title"
      };

      // scope="hoge"を指定して処理
      const result = await process(
        { html, data, scope: "hoge" }, 
        { domEnvironment: JSDOM }
      );
      
      console.log('=== Scope Filter Debug ===');
      console.log('Input scope:', "hoge");
      console.log('Result HTML:', result.html);
      
      // hogeスコープのテンプレートのみ処理される
      assert.ok(result.html.includes('Test Title'));
      // hogeスコープのテンプレートが処理された結果、1つだけTest Titleが生成される
      const titleMatches = result.html.match(/Test Title/g);
      assert.equal(titleMatches?.length, 1);
    });

    it('スコープが指定されていない場合、すべてのテンプレートが処理されること', async () => {
      const html = `
        <template data-gen-scope="hoge">
          <div data-gen-text="title">Hoge</div>
        </template>
        <template data-gen-scope="piyo">
          <div data-gen-text="title">Piyo</div>
        </template>
        <template data-gen-scope="">
          <div data-gen-text="title">Default</div>
        </template>
      `;

      const data = {
        title: "Test"
      };

      // scopeを指定しない
      const result = await process(
        { html, data }, 
        { domEnvironment: JSDOM }
      );
      
      // すべてのテンプレートが処理される
      const testMatches = result.html.match(/Test/g);
      assert.equal(testMatches?.length, 3);
    });

    it('空文字列のスコープが指定された場合、すべてのテンプレートが処理されること', async () => {
      const html = `
        <template data-gen-scope="hoge">
          <div data-gen-text="title">Hoge</div>
        </template>
        <template data-gen-scope="piyo">
          <div data-gen-text="title">Piyo</div>
        </template>
      `;

      const data = {
        title: "Test"
      };

      // scope=""を指定
      const result = await process(
        { html, data, scope: "" }, 
        { domEnvironment: JSDOM }
      );
      
      // すべてのテンプレートが処理される
      const testMatches = result.html.match(/Test/g);
      assert.equal(testMatches?.length, 2);
    });
  });

  describe('複数スコープ対応', () => {
    it('複数のスコープが指定されたテンプレートから特定のスコープを選択できること', async () => {
      const html = `
        <template data-gen-scope="hoge fuga piyo">
          <div data-gen-text="title">Multi Scope</div>
        </template>
        <template data-gen-scope="test">
          <div data-gen-text="title">Test Scope</div>
        </template>
      `;

      const data = {
        title: "Content"
      };

      // scope="fuga"を指定
      const result = await process(
        { html, data, scope: "fuga" }, 
        { domEnvironment: JSDOM }
      );
      
      // fugaスコープを含むテンプレートのみ処理される
      assert.ok(result.html.includes('Content'));
      const contentMatches = result.html.match(/Content/g);
      assert.equal(contentMatches?.length, 1);
    });
  });

  describe('ネストしたテンプレートでのスコープフィルタリング', () => {
    it('ネストしたテンプレートでもスコープフィルタリングが動作すること', async () => {
      const html = `
        <template data-gen-scope="parent child1">
          <div>
            <h1 data-gen-text="title">Parent</h1>
            <template data-gen-scope="parent child1">
              <p data-gen-text="content">Child1</p>
            </template>
            <template data-gen-scope="parent child2">
              <p data-gen-text="content">Child2</p>
            </template>
          </div>
        </template>
      `;

      const data = {
        title: "Parent Title",
        content: "Child Content"
      };

      // scope="child1"を指定
      const result = await process(
        { html, data, scope: "child1" }, 
        { domEnvironment: JSDOM }
      );
      
      // child1スコープのテンプレートのみ処理される
      assert.ok(result.html.includes('Child Content'));
      // parentスコープも処理される
      assert.ok(result.html.includes('Parent Title'));
      // child2は処理されない
      const contentMatches = result.html.match(/Child Content/g);
      assert.equal(contentMatches?.length, 1);
    });
  });
});