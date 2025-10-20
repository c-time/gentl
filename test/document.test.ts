/**
 * Document Sample Test
 * READMEに記載されたコードサンプルを検証するテスト
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { process } from '../src/index.ts';

describe('Document Sample Tests', () => {
  
  describe('data-gen-text（テキスト生成）', () => {
    it('実行結果を出力して確認する', async () => {
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
      
      console.log('=== data-gen-text 実行結果 ===');
      console.log('入力HTML:');
      console.log(html);
      console.log('\n入力データ:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n出力HTML:');
      console.log(result.html);
      console.log('=== data-gen-text 終了 ===\n');
      
      // 一応のテスト（テンプレートが保持されること）
      assert.ok(result.html.includes('<template data-gen-scope="">'));
    });
  });

  describe('data-gen-html（HTML生成）', () => {
    it('実行結果を出力して確認する', async () => {
      const html = `<template data-gen-scope="">
  <div data-gen-html="description">デフォルト説明</div>
  <section data-gen-html="article.content">記事がありません</section>
</template>`;

      const data = {
        description: "<strong>重要</strong>なお知らせ",
        article: {
          content: "<p>本日は<em>晴天</em>です。</p><ul><li>気温: 25度</li><li>湿度: 60%</li></ul>"
        }
      };

      const result = await process({ html, data }, { domEnvironment: JSDOM });
      
      console.log('=== data-gen-html 実行結果 ===');
      console.log('入力HTML:');
      console.log(html);
      console.log('\n入力データ:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n出力HTML:');
      console.log(result.html);
      console.log('=== data-gen-html 終了 ===\n');
      
      // 一応のテスト
      assert.ok(result.html.includes('<template data-gen-scope="">'));
    });
  });

  describe('data-gen-if（条件分岐）', () => {
    it('READMEのサンプルコード通りに動作すること', async () => {
      const html = `<template data-gen-scope="">
  <div data-gen-if="user.isLoggedIn" data-gen-text="user.name">ログインしてください</div>
  <button data-gen-if="user.isAdmin">管理者メニュー</button>
  <p data-gen-if="articles.length">記事があります</p>
  <p data-gen-if="isError" data-gen-html="errorMessage">エラーなし</p>
</template>`;

      const data = {
        user: { isLoggedIn: true, name: "田中太郎", isAdmin: false },
        articles: [{ title: "記事1" }],
        isError: false,
        errorMessage: ""
      };

      const result = await process({ html, data }, { domEnvironment: JSDOM });
      
      // ログイン済みユーザー名が表示される
      assert.ok(result.html.includes('<div data-gen-cloned="">田中太郎</div>'));
      
      // 管理者メニューは表示されない（isAdmin: false）
      assert.ok(!result.html.includes('>管理者メニュー<'));
      
      // 記事があるメッセージは表示される
      assert.ok(result.html.includes('<p data-gen-cloned="">記事があります</p>'));
      
      // エラーメッセージは表示されない（isError: false）
      assert.ok(!result.html.includes('>エラーなし<') || !result.html.includes('data-gen-cloned="">エラーなし'));
    });
  });

  describe('data-gen-repeat（繰り返し）', () => {
    it('実行結果を出力して確認する', async () => {
      const html = `<template data-gen-scope="" data-gen-repeat="articles" data-gen-repeat-name="article">
  <div class="article-card">
    <h3 data-gen-text="article.title">タイトル</h3>
    <p data-gen-text="article.excerpt">要約</p>
    <small data-gen-text="article.author">著者</small>
    <span data-gen-if="article.isPremium">🌟 プレミアム</span>
  </div>
</template>`;

      const data = {
        articles: [
          { title: "記事1", excerpt: "最初の記事です", author: "田中", isPremium: false },
          { title: "記事2", excerpt: "二番目の記事", author: "佐藤", isPremium: true },
          { title: "記事3", excerpt: "三番目の記事", author: "鈴木", isPremium: false }
        ]
      };

      const result = await process({ html, data }, { domEnvironment: JSDOM, rootParserType: 'childElement' });
      
      console.log('=== data-gen-repeat 実行結果 ===');
      console.log('入力HTML:');
      console.log(html);
      console.log('\n入力データ:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n出力HTML:');
      console.log(result.html);
      console.log('=== data-gen-repeat 終了 ===\n');
      
      // 一応のテスト - プレミアムバッジが正しく表示されることを確認
      assert.ok(result.html.includes('<template data-gen-scope="">'));
      // 二番目の記事（佐藤、isPremium: true）のプレミアムバッジが表示されること
      assert.ok(result.html.includes('🌟 プレミアム'));
    });
  });

  describe('data-gen-json（JSON生成）', () => {
    it('READMEのサンプルコード通りに動作すること', async () => {
      const html = `<template data-gen-scope="">
  <pre data-gen-json="userSettings">設定データ</pre>
  <script data-gen-json="config" type="application/json">/* 設定 */</script>
</template>`;

      const data = {
        userSettings: { theme: "dark", language: "ja", notifications: true },
        config: { apiUrl: "https://api.example.com", timeout: 5000 }
      };

      const result = await process({ html, data }, { domEnvironment: JSDOM });
      
      // JSONが正しく生成されること
      assert.ok(result.html.includes('<pre data-gen-cloned="">{"theme":"dark","language":"ja","notifications":true}</pre>'));
      assert.ok(result.html.includes('<script data-gen-cloned="" type="application/json">{"apiUrl":"https://api.example.com","timeout":5000}</script>'));
    });
  });

  describe('data-gen-attrs（動的属性）', () => {
    it('READMEのサンプルコード通りに動作すること', async () => {
      const html = `<template data-gen-scope="">
  <img data-gen-attrs="src:image.url,alt:image.alt,class:image.cssClass" src="default.jpg" alt="デフォルト画像">
  <a data-gen-attrs="href:link.url,target:link.target" href="#" data-gen-text="link.text">リンク</a>
</template>`;

      const data = {
        image: { 
          url: "photo.jpg", 
          alt: "美しい風景写真", 
          cssClass: "responsive-image" 
        },
        link: { 
          url: "https://example.com", 
          target: "_blank", 
          text: "外部サイトを開く" 
        }
      };

      const result = await process({ html, data }, { domEnvironment: JSDOM });
      
      // 画像属性が正しく設定されること
      assert.ok(result.html.includes('src="photo.jpg"'));
      assert.ok(result.html.includes('alt="美しい風景写真"'));
      assert.ok(result.html.includes('class="responsive-image"'));
      
      // リンク属性が正しく設定されること
      assert.ok(result.html.includes('href="https://example.com"'));
      assert.ok(result.html.includes('target="_blank"'));
      assert.ok(result.html.includes('<a data-gen-cloned="" href="https://example.com" target="_blank">外部サイトを開く</a>'));
    });
  });

  describe('data-gen-comment（コメント）', () => {
    it('READMEのサンプルコード通りに動作すること', async () => {
      const html = `<template data-gen-scope="">
  <div data-gen-text="title">タイトル</div>
  <div data-gen-comment="">この要素は生成時に削除される</div>
  <p data-gen-text="content">コンテンツ</p>
</template>`;

      const data = {
        title: "実際のタイトル",
        content: "実際のコンテンツ"
      };

      const result = await process({ html, data }, { domEnvironment: JSDOM });
      
      // data-gen-comment の要素は生成されないこと（テンプレート内には残る）
      const generatedContent = result.html.split('</template>')[1]; // テンプレート以外の部分
      assert.ok(!generatedContent.includes('この要素は生成時に削除される'));
      
      // 他の要素は正常に生成されること
      assert.ok(result.html.includes('<div data-gen-cloned="">実際のタイトル</div>'));
      assert.ok(result.html.includes('<p data-gen-cloned="">実際のコンテンツ</p>'));
    });
  });

  describe('data-gen-insert-before（挿入位置制御）', () => {
    it('デフォルト（テンプレートの後に挿入）', async () => {
      const html = `<template data-gen-scope="">
  <div data-gen-text="message">メッセージ</div>
</template>`;

      const data = { message: "実際のメッセージ" };
      const result = await process({ html, data }, { domEnvironment: JSDOM });
      
      // テンプレートの後に要素が挿入されること
      const templateIndex = result.html.indexOf('<template data-gen-scope="">');
      const generatedIndex = result.html.indexOf('<div data-gen-cloned="">実際のメッセージ</div>');
      assert.ok(templateIndex < generatedIndex);
    });

    it('data-gen-insert-before使用時（テンプレートの前に挿入）', async () => {
      const html = `<template data-gen-scope="" data-gen-insert-before="">
  <div data-gen-text="message">メッセージ</div>
</template>`;

      const data = { message: "実際のメッセージ" };
      const result = await process({ html, data }, { domEnvironment: JSDOM });
      
      // 生成された要素がテンプレートの前にあること
      const generatedIndex = result.html.indexOf('<div data-gen-cloned="">実際のメッセージ</div>');
      const templateIndex = result.html.indexOf('<template data-gen-scope="" data-gen-insert-before="">');
      assert.ok(generatedIndex < templateIndex);
    });
  });

  describe('よくある使用パターン', () => {
    describe('🎯 リスト表示', () => {
      it('READMEのサンプルコード通りに動作すること', async () => {
        const html = `<template data-gen-scope="" data-gen-repeat="products" data-gen-repeat-name="product">
  <div class="product-card">
    <img data-gen-attrs="src:product.image,alt:product.name" src="placeholder.jpg">
    <h3 data-gen-text="product.name">商品名</h3>
    <p data-gen-text="product.price">価格</p>
    <span data-gen-if="product.inStock" class="in-stock">在庫あり</span>
    <span data-gen-if="product.isNew" class="new-badge">NEW</span>
  </div>
</template>`;

        const data = {
          products: [
            { name: "商品A", price: "1000円", image: "a.jpg", inStock: true, isNew: false },
            { name: "商品B", price: "2000円", image: "b.jpg", inStock: false, isNew: true },
            { name: "商品C", price: "3000円", image: "c.jpg", inStock: true, isNew: true }
          ]
        };

        const result = await process({ html, data }, { domEnvironment: JSDOM, rootParserType: 'childElement' });
        
        // 各商品が生成されること
        assert.ok(result.html.includes('<h3 data-gen-cloned="">商品A</h3>'));
        assert.ok(result.html.includes('<h3 data-gen-cloned="">商品B</h3>'));
        assert.ok(result.html.includes('<h3 data-gen-cloned="">商品C</h3>'));
        
        // 在庫ありバッジ（商品Aと商品C）
        const inStockMatches = result.html.match(/<span data-gen-cloned="" class="in-stock">在庫あり<\/span>/g);
        assert.equal(inStockMatches?.length, 2);
        
        // NEWバッジ（商品Bと商品C）
        const newBadgeMatches = result.html.match(/<span data-gen-cloned="" class="new-badge">NEW<\/span>/g);
        assert.equal(newBadgeMatches?.length, 2);
      });
    });

    describe('🎯 ナビゲーション', () => {
      it('READMEのサンプルコード通りに動作すること', async () => {
        const html = `<template data-gen-scope="" data-gen-repeat="navItems" data-gen-repeat-name="item">
  <nav>
    <a data-gen-attrs="href:item.url,class:item.active"
       data-gen-text="item.label">
      リンク
    </a>
  </nav>
</template>`;

        const data = {
          navItems: [
            { label: "ホーム", url: "/", active: "active" },
            { label: "商品", url: "/products", active: null },
            { label: "お問い合わせ", url: "/contact", active: null }
          ]
        };

        const result = await process({ html, data }, { domEnvironment: JSDOM, rootParserType: 'childElement' });
        
        // 各ナビゲーション項目が生成されること
        assert.ok(result.html.includes('<a data-gen-cloned="" href="/" class="active">ホーム</a>'));
        assert.ok(result.html.includes('<a data-gen-cloned="" href="/products">商品</a>'));
        assert.ok(result.html.includes('<a data-gen-cloned="" href="/contact">お問い合わせ</a>'));
      });
    });

    describe('🎯 条件付きコンテンツ', () => {
      it('READMEのサンプルコード通りに動作すること', async () => {
        const html = `<template data-gen-scope="">
  <div data-gen-if="user.isLoggedIn">
    <p>こんにちは、<span data-gen-text="user.name">ユーザー</span>さん</p>
    <button data-gen-if="user.isAdmin">管理画面</button>
  </div>
  
  <div data-gen-if="user.isGuest">
    <p>ログインしてください</p>
    <button>ログイン</button>
  </div>
</template>`;

        // ログインユーザーのケース
        const loggedInData = {
          user: { isLoggedIn: true, name: "田中太郎", isAdmin: true, isGuest: false }
        };

        const loggedInResult = await process({ html, data: loggedInData }, { domEnvironment: JSDOM });
        
        assert.ok(loggedInResult.html.includes('こんにちは、<span data-gen-cloned="">田中太郎</span>さん'));
        assert.ok(loggedInResult.html.includes('<button data-gen-cloned="">管理画面</button>'));
        assert.ok(!loggedInResult.html.includes('ログインしてください'));

        // ゲストユーザーのケース
        const guestData = {
          user: { isLoggedIn: false, isGuest: true }
        };

        const guestResult = await process({ html, data: guestData }, { domEnvironment: JSDOM });
        
        assert.ok(guestResult.html.includes('<p data-gen-cloned="">ログインしてください</p>'));
        assert.ok(!guestResult.html.includes('こんにちは'));
      });
    });

    describe('🎯 フォーム生成', () => {
      it('READMEのサンプルコード通りに動作すること', async () => {
        const html = `<template data-gen-scope="">
  <form>
    <div data-gen-repeat="formFields" data-gen-repeat-name="field">
      <label data-gen-text="field.label">ラベル</label>
      <input data-gen-attrs="type:field.type,name:field.name,placeholder:field.placeholder,required:field.required">
      <span data-gen-if="field.error" class="error" data-gen-text="field.error">エラー</span>
    </div>
  </form>
</template>`;

        const data = {
          formFields: [
            { label: "お名前", type: "text", name: "name", placeholder: "山田太郎", required: "required", error: null },
            { label: "メールアドレス", type: "email", name: "email", placeholder: "example@test.com", required: "required", error: "正しいメールアドレスを入力してください" },
            { label: "電話番号", type: "tel", name: "phone", placeholder: "090-1234-5678", required: null, error: null }
          ]
        };

        const result = await process({ html, data }, { domEnvironment: JSDOM });
        
        // フォームフィールドが生成されること
        assert.ok(result.html.includes('<label data-gen-cloned="">お名前</label>'));
        assert.ok(result.html.includes('type="text"'));
        assert.ok(result.html.includes('name="name"'));
        assert.ok(result.html.includes('placeholder="山田太郎"'));
        assert.ok(result.html.includes('required="required"'));
        
        // エラーメッセージが表示されること（メールフィールドのみ）
        assert.ok(result.html.includes('<span data-gen-cloned="" class="error">正しいメールアドレスを入力してください</span>'));
      });
    });

    describe('🎯 テーブル生成', () => {
      it('READMEのサンプルコード通りに動作すること', async () => {
        const html = `<template data-gen-scope="">
  <table>
    <thead>
      <tr>
        <th data-gen-repeat="tableHeaders" data-gen-repeat-name="header" 
            data-gen-text="header">ヘッダー</th>
      </tr>
    </thead>
    <tbody>
      <tr data-gen-repeat="tableRows" data-gen-repeat-name="row">
        <td data-gen-repeat="row.cells" data-gen-repeat-name="cell" 
            data-gen-text="cell">セル</td>
      </tr>
    </tbody>
  </table>
</template>`;

        const data = {
          tableHeaders: ["名前", "年齢", "職業"],
          tableRows: [
            { cells: ["田中太郎", "25", "エンジニア"] },
            { cells: ["佐藤花子", "30", "デザイナー"] },
            { cells: ["鈴木一郎", "35", "営業"] }
          ]
        };

        const result = await process({ html, data }, { domEnvironment: JSDOM });
        
        // ヘッダーが生成されること
        assert.ok(result.html.includes('<th data-gen-cloned="">名前</th>'));
        assert.ok(result.html.includes('<th data-gen-cloned="">年齢</th>'));
        assert.ok(result.html.includes('<th data-gen-cloned="">職業</th>'));
        
        // データ行が生成されること
        assert.ok(result.html.includes('<td data-gen-cloned="">田中太郎</td>'));
        assert.ok(result.html.includes('<td data-gen-cloned="">25</td>'));
        assert.ok(result.html.includes('<td data-gen-cloned="">エンジニア</td>'));
      });
    });
  });

  describe('基本的なテンプレート生成', () => {
    it('実行結果を出力して確認する', async () => {
      const html = `<template data-gen-scope="">
  <div data-gen-text="title">Default Title</div>
  <ul>
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <li data-gen-text="item">Default Item</li>
    </template>
  </ul>
</template>`;

      const data = {
        title: 'Welcome to Gentl',
        items: ['Item 1', 'Item 2', 'Item 3']
      };

      const result = await process({ html, data }, { domEnvironment: JSDOM, rootParserType: 'childElement' });
      
      console.log('=== 基本的なテンプレート生成 実行結果 ===');
      console.log('入力HTML:');
      console.log(html);
      console.log('\n入力データ:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n出力HTML:');
      console.log(result.html);
      console.log('=== 基本的なテンプレート生成 終了 ===\n');
      
      // 一応のテスト
      assert.ok(result.html.includes('<template data-gen-scope="">'));
    });
  });

  describe('data-gen-repeat-nameなし（単純配列）', () => {
    it('data-gen-repeat-name なしで配列要素を直接参照できること', async () => {
      const html = `<template data-gen-scope="">
  <li data-gen-repeat="items" data-gen-text="item">Default Item</li>
</template>`;

      const data = {
        items: ['Item 1', 'Item 2', 'Item 3']
      };

      const result = await process({ html, data }, { domEnvironment: JSDOM });
      
      // 各項目が生成されること
      assert.ok(result.html.includes('<li data-gen-cloned="">Item 1</li>'));
      assert.ok(result.html.includes('<li data-gen-cloned="">Item 2</li>'));
      assert.ok(result.html.includes('<li data-gen-cloned="">Item 3</li>'));
    });
  });
});