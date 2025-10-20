# Gentl - WEB制作専用HTMLジェネレータ

Gentlは、**WEB制作専用に特化したシンプルなHTMLジェネレータ**です。
HTMLにデータをバインドし、共通ソースをインポートすることで、保守性と安全性を担保したHTML生成を行います。

## コンセプト

### 🎯 ジェネレートに特化

データをHTMLに変換する以外の機能を、あえて排除しています。
Gentlに渡されるデータは、整形済みである必要があります。
これにより、**ビジネスロジックをHTMLに持ち込まない**ことで、デバッグのしやすさとセキュリティを担保します。

### 🛡️ HTMLに破壊的な構造変化をさせない

`<template>`タグから中身を展開するというスタンスでいることで、PHPやその他の言語のように、DOM構造を破壊するコードが書けないようになっています。

また、templateの中身は、成果物として**HTMLに残存**させるため、生成後のHTMLをまたテンプレートとして再利用できます。
担当者や制作会社が変わりやすいウェブ制作の現場において、ジェネレートの定義がブラックボックス化したり、担当者への継承ミスを防ぎます。

### ⚡ ブラウザでのダイナミック使用も可能

コンテンツをローカル開発やサーバーで静的に生成するか、ブラウザでダイナミックに読み込むか、どちらでも使用することができます。

## 特徴

- **🪶 軽量**: 依存関係ゼロのコアシステム
- **🔧 完全環境非依存**: 全ての環境でDOM環境を外部注入
- **🔄 柔軟なDOM環境**: JSDOM、Happy DOM、ブラウザ環境など任意のDOM環境に対応
- **📦 テンプレート再利用性**: 生成後のHTMLも再びテンプレートとして使用可能
- **🛡️ セキュリティ重視**: ビジネスロジック分離でセキュアなHTML生成

## インストール

```bash
npm install @c-time/gentl
```

使用する環境に応じて、DOM環境ライブラリも併せてインストールしてください：

```bash
# JSDOMを使用する場合
npm install --save-dev jsdom

# Happy DOMを使用する場合
npm install --save-dev happy-dom

# ブラウザ環境では追加インストールは不要（グローバルのDOM APIを使用）
```

## 使用方法

Gentlは整形済みデータとHTMLテンプレートを組み合わせてHTML生成を行います。
`<template data-gen-scope="">`内に定義されたテンプレートが展開され、元のテンプレートタグも保持されます。

### ブラウザ環境

```javascript
import { process } from '@c-time/gentl';

// ブラウザ環境用のDOM環境クラス
class BrowserDOMEnvironment {
  constructor() {
    this.window = {
      DOMParser: DOMParser,
      document: window.document,
    };
  }
}

const result = process(
  {
    html: '<template data-gen-scope=""><div data-gen-text="name">Default</div></template>',
    data: { name: 'Hello World' }
  },
  {
    rootParserType: 'childElement',
    domEnvironment: BrowserDOMEnvironment  // ← ブラウザ環境も注入
  }
);

console.log(result.html);
```

### Node.js環境

Node.js環境では、DOM環境ライブラリを明示的に注入する必要があります：

#### JSDOMを使用する場合

```javascript
import { process } from '@c-time/gentl';
import { JSDOM } from 'jsdom';

const result = process(
  {
    html: '<template data-gen-scope=""><div data-gen-text="name">Default</div></template>',
    data: { name: 'Hello World' }
  },
  {
    rootParserType: 'childElement',
    domEnvironment: JSDOM  // ← JSDOM を注入
  }
);

console.log(result.html);
```

#### Happy DOMを使用する場合

```javascript
import { process } from '@c-time/gentl';
import { Window } from 'happy-dom';

// Happy DOM用のラッパークラス
class HappyDOMEnvironment {
  constructor() {
    this.window = new Window();
  }
}

const result = process(
  {
    html: '<template data-gen-scope=""><div data-gen-text="name">Default</div></template>',
    data: { name: 'Hello World' }
  },
  {
    rootParserType: 'childElement',
    domEnvironment: HappyDOMEnvironment  // ← Happy DOM を注入
  }
);

console.log(result.html);
```

## 属性の組み合わせ

### 複数属性の使用

複数の`data-gen-*`属性を同じ要素に指定できます：

```html
<template data-gen-scope="">
  <div data-gen-if="user.isActive" 
       data-gen-text="user.name" 
       data-gen-attrs="class:user.cssClass">
    デフォルト名
  </div>
</template>
```

### 処理順序

属性は以下の順序で処理されます：

1. **data-gen-comment**: 要素を削除（これ以降の処理は実行されない）
2. **data-gen-if**: 条件判定（false の場合、これ以降の処理は実行されない）
3. **data-gen-include**: 外部コンテンツの読み込み
4. **data-gen-repeat**: 繰り返し処理
5. **data-gen-text**: テキストコンテンツの設定
6. **data-gen-html**: HTMLコンテンツの設定
7. **data-gen-json**: JSONコンテンツの設定
8. **data-gen-attrs**: 属性の動的設定

### 属性の継承

`data-gen-repeat`使用時、繰り返し要素内では以下が利用可能：

```html
<template data-gen-scope="">
  <div data-gen-repeat="items" data-gen-repeat-name="item">
    <!-- item.* でアクセス可能 -->
    <span data-gen-text="item.name">名前</span>
    <!-- 外側のデータにもアクセス可能 -->
    <span data-gen-text="globalTitle">タイトル</span>
  </div>
</template>
```

データ:
```javascript
{
  globalTitle: "商品一覧",
  items: [
    { name: "商品A" },
    { name: "商品B" }
  ]
}
```

## 🔍 デバッグ・ログ機能

Gentlは実行時の詳細な情報を提供するログ機能を搭載しています。

### Logger設定

```javascript
import { process } from '@c-time/gentl';

const customLogger = (entry) => {
  console.log(`[${entry.level.toUpperCase()}] ${entry.message}`);
  if (entry.context) {
    console.log('詳細:', entry.context);
  }
};

const result = await process(
  { html, data, includeIo },
  { 
    domEnvironment: JSDOM,
    logger: customLogger 
  }
);
```

### ログエントリの種類

| レベル | 説明 | 発生条件 |
|--------|------|----------|
| `warn` | データ参照エラー | 存在しないプロパティを参照した場合 |
| `error` | I/Oエラー | `includeIo`関数でエラーが発生した場合 |

### エラー処理の動作

- **データ参照エラー**: 処理継続、該当要素は空文字として扱われる
- **I/Oエラー**: 処理継続、該当要素はスキップされる

```javascript
// データ参照エラーの例
const result = await process({
  html: '<template data-gen-scope=""><div data-gen-text="missing.property">Default</div></template>',
  data: {} // missing プロパティが存在しない
}, { logger: console.log });
// ログ: [WARN] Data reference error
// 結果: <div>Default</div> → <div></div> (空文字)
```

## よくある使用パターン

### 🎯 **リスト表示**

```html
<template data-gen-scope="" data-gen-repeat="products" data-gen-repeat-name="product">
  <div class="product-card">
    <img data-gen-attrs="src:product.image,alt:product.name" src="placeholder.jpg">
    <h3 data-gen-text="product.name">商品名</h3>
    <p data-gen-text="product.price">価格</p>
    <span data-gen-if="product.inStock" class="in-stock">在庫あり</span>
    <span data-gen-if="product.isNew" class="new-badge">NEW</span>
  </div>
</template>
```

### 🎯 **ナビゲーション**

```html
<template data-gen-scope="" data-gen-repeat="navItems" data-gen-repeat-name="item">
  <nav>
    <a data-gen-attrs="href:item.url,class:item.active"
       data-gen-text="item.label">
      リンク
    </a>
  </nav>
</template>
```

### 🎯 **条件付きコンテンツ**

```html
<template data-gen-scope="">
  <!-- ログイン状態によって表示を切り替え -->
  <div data-gen-if="user.isLoggedIn">
    <p>こんにちは、<span data-gen-text="user.name">ユーザー</span>さん</p>
    <button data-gen-if="user.isAdmin">管理画面</button>
  </div>
  
  <div data-gen-if="user.isGuest">
    <p>ログインしてください</p>
    <button>ログイン</button>
  </div>
</template>
```

### 🎯 **フォーム生成**

```html
<template data-gen-scope="" data-gen-repeat="formFields" data-gen-repeat-name="field">
  <form>
    <div>
      <label data-gen-text="field.label">ラベル</label>
      <input data-gen-attrs="type:field.type,name:field.name,placeholder:field.placeholder,required:field.required">
      <span data-gen-if="field.error" class="error" data-gen-text="field.error">エラー</span>
    </div>
  </form>
</template>
```

### 🎯 **テーブル生成**

```html
<template data-gen-scope="">
  <table>
    <thead>
      <tr>
        <template data-gen-scope="" data-gen-repeat="tableHeaders" data-gen-repeat-name="header">
          <th data-gen-text="header">ヘッダー</th>
        </template>
      </tr>
    </thead>
    <tbody>
      <template data-gen-scope="" data-gen-repeat="tableRows" data-gen-repeat-name="row">
        <tr>
          <template data-gen-scope="" data-gen-repeat="row.cells" data-gen-repeat-name="cell">
            <td data-gen-text="cell">セル</td>
          </template>
        </tr>
      </template>
    </tbody>
  </table>
</template>
```

## API

### `process(input, options?)`

#### 引数

- `input: GentlJInput`
  - `html: string` - テンプレートHTML
  - `data: object` - テンプレートデータ
  - `includeIo?: Record<string, () => Promise<string>>` - `data-gen-include`用のI/O関数群

- `options?: Partial<GentlJOptions>`
  - `rootParserType?: 'htmlDocument' | 'xmlDocument' | 'childElement'` - パーサータイプ（デフォルト: 'htmlDocument'）
    - `'htmlDocument'`: 完全なHTML文書として出力（`<html><head></head><body></body></html>`が自動付与）
    - `'childElement'`: 生成された要素のみを出力
  - `deleteTemplateTag?: boolean` - テンプレートタグを削除するか（デフォルト: false）
  - `deleteDataAttributes?: boolean` - データ属性を削除するか（デフォルト: false）
  - `domEnvironment: DOMEnvironmentConstructor` - DOM環境の注入（必須）
  - `logger?: Logger` - デバッグログ出力関数（オプション）

#### 戻り値

- `GentlJOutput`
  - `html: string` - 生成されたHTML

## テンプレート構文

Gentlの全ての機能は`<template data-gen-scope="">`タグ内で動作し、**元のテンプレートを保持しながら**コンテンツを生成します。

### 基本構造

```html
<template data-gen-scope="">
  <!-- ここにテンプレート内容 -->
</template>
```

生成後：
```html
<template data-gen-scope="">
  <!-- 元のテンプレート内容（保持される） -->
</template>
<!-- 生成されたコンテンツ -->
```

### data-gen-scope（スコープ定義）

**用途**: テンプレートの範囲を定義し、Gentlの処理対象として指定

```html
<template data-gen-scope="">
  <!-- この中だけがGentlの処理対象 -->
</template>
```

**特徴**:
- 必須属性：全ての`data-gen-*`は`data-gen-scope`内でのみ有効
- ネスト可能：テンプレート内に別のテンプレートを配置可能
- 値は通常空文字列（`""`）を指定

### data-gen-text（テキスト生成）

**用途**: 要素のテキストコンテンツをデータで置き換える

```html
<template data-gen-scope="">
  <h1 data-gen-text="title">デフォルトタイトル</h1>
  <p data-gen-text="user.name">ゲストユーザー</p>
  <span data-gen-text="count">0</span>個
</template>
```

データ:
```javascript
{
  title: "新着記事一覧",
  user: { name: "田中太郎" },
  count: 5
}
```

結果:
```html
<html><head><template data-gen-scope="">
  <h1 data-gen-text="title">デフォルトタイトル</h1>
  <p data-gen-text="user.name">ゲストユーザー</p>
  <span data-gen-text="count">0</span>個
</template><h1 data-gen-cloned="">新着記事一覧</h1><p data-gen-cloned="">田中太郎</p><span data-gen-cloned="">5</span></head><body></body></html>
```

**注意**: 
- `data-gen-text`は要素内のテキストコンテンツを完全に置き換えるため、「個」のような周辺テキストは削除されます
- HTMLDocument形式で出力されるため、`<html>`、`<head>`、`<body>`タグが自動的に追加されます

周辺テキストを保持したい場合は、別の要素に分けて記述してください：

```html
<template data-gen-scope="">
  <span data-gen-text="count">0</span><span>個</span>
</template>
```

**特徴**:
- ネストしたプロパティにアクセス可能（`user.name`）
- 数値や真偽値も自動で文字列に変換
- 存在しないプロパティは空文字として処理

### data-gen-html（HTML生成）

**用途**: 要素の内部HTMLをデータで置き換える（HTMLタグとして解釈）

```html
<template data-gen-scope="">
  <div data-gen-html="description">デフォルト説明</div>
  <section data-gen-html="article.content">記事がありません</section>
</template>
```

データ:
```javascript
{
  description: "<strong>重要</strong>なお知らせ",
  article: {
    content: "<p>本日は<em>晴天</em>です。</p><ul><li>気温: 25度</li><li>湿度: 60%</li></ul>"
  }
}
```

結果:
```html
<html><head><template data-gen-scope="">
  <div data-gen-html="description">デフォルト説明</div>
  <section data-gen-html="article.content">記事がありません</section>
</template><div data-gen-cloned=""><strong>重要</strong>なお知らせ</div><section data-gen-cloned=""><p>本日は<em>晴天</em>です。</p><ul><li>気温: 25度</li><li>湿度: 60%</li></ul></section></head><body></body></html>
```

**⚠️ 注意事項**:
- HTMLタグが実際に解釈されるため、信頼できるデータのみ使用
- XSS攻撃の可能性があるため、ユーザー入力を直接使用しない
- `data-gen-text`と異なり、HTMLエスケープは行われない

### data-gen-if（条件分岐）

**用途**: 条件に応じて要素の表示/非表示を制御

```html
<template data-gen-scope="">
  <div data-gen-if="user.isLoggedIn" data-gen-text="user.name">ログインしてください</div>
  <button data-gen-if="user.isAdmin">管理者メニュー</button>
  <p data-gen-if="articles.length">記事があります</p>
  <p data-gen-if="isError" data-gen-html="errorMessage">エラーなし</p>
</template>
```

データパターン:
```javascript
// ログイン済みユーザー
{
  user: { isLoggedIn: true, name: "田中太郎", isAdmin: false },
  articles: [{ title: "記事1" }],
  isError: false,
  errorMessage: ""
}
```

結果:
```html
<template data-gen-scope=""><!-- 元のテンプレート --></template>
<div data-gen-cloned="">田中太郎</div>
<!-- 管理者メニューボタンは非表示（isAdmin: false） -->
<p data-gen-cloned="">記事があります</p>
<!-- エラーメッセージは非表示（isError: false） -->
```

**真偽値判定**:
- `true`: 要素を生成
- `false`, `undefined`, `null`, `0`, `""`, `[]`: 要素を生成しない
- 配列の場合: `length > 0` で判定
- オブジェクトの場合: 存在すれば `true`

**テンプレートレベルの条件分岐**:
```html
<template data-gen-scope="" data-gen-if="showSection">
  <h2>条件付きセクション</h2>
  <p>このセクション全体が条件によって表示される</p>
</template>
```

### data-gen-repeat（繰り返し）

**用途**: 配列データの各要素に対して要素を繰り返し生成

**基本構文**: `data-gen-repeat`と`data-gen-repeat-name`をペアで使用

```html
<template data-gen-scope="" data-gen-repeat="articles" data-gen-repeat-name="article">
  <div class="article-card">
    <h3 data-gen-text="article.title">タイトル</h3>
    <p data-gen-text="article.excerpt">要約</p>
    <small data-gen-text="article.author">著者</small>
    <span data-gen-if="article.isPremium">🌟 プレミアム</span>
  </div>
</template>`
```

データ:
```javascript
{
  articles: [
    { title: "記事1", excerpt: "最初の記事です", author: "田中", isPremium: false },
    { title: "記事2", excerpt: "二番目の記事", author: "佐藤", isPremium: true },
    { title: "記事3", excerpt: "三番目の記事", author: "鈴木", isPremium: false }
  ]
}
```

結果:
```html
<template data-gen-scope="" data-gen-repeat="articles" data-gen-repeat-name="article">
  <div class="article-card">
    <h3 data-gen-text="article.title">タイトル</h3>
    <p data-gen-text="article.excerpt">要約</p>
    <small data-gen-text="article.author">著者</small>
    <span data-gen-if="article.isPremium">🌟 プレミアム</span>
  </div>
</template>
<div data-gen-cloned="" class="article-card">
    <h3>記事1</h3>
    <p>最初の記事です</p>
    <small>田中</small>

  </div>
<div data-gen-cloned="" class="article-card">
    <h3>記事2</h3>
    <p>二番目の記事</p>
    <small>佐藤</small>
    <span>🌟 プレミアム</span>
  </div>
<div data-gen-cloned="" class="article-card">
    <h3>記事3</h3>
    <p>三番目の記事</p>
    <small>鈴木</small>

  </div>
```

**重要**: 
- `data-gen-repeat`は`<template>`タグに設定します
- `data-gen-repeat-name`を使用することで、繰り返しの各要素に `article` という変数名でアクセスできます
- `rootParserType: 'childElement'`を使用した場合、HTML要素のみが出力されます
- `data-gen-text`で置き換えられた要素内では、`data-gen-cloned`属性は付与されません

**ネストした繰り返し**:
```html
<template data-gen-scope="" data-gen-repeat="categories" data-gen-repeat-name="category">
  <div>
    <h2 data-gen-text="category.name">カテゴリ名</h2>
    <template data-gen-scope="" data-gen-repeat="category.posts" data-gen-repeat-name="post">
      <article>
        <h3 data-gen-text="post.title">記事タイトル</h3>
      </article>
    </template>
  </div>
</template>
```

**注意事項**:
- `data-gen-repeat`は`<template>`タグに設定します
- `data-gen-repeat-name`で指定した変数名でアクセス可能
- 配列が空の場合、要素は生成されない
- ネストする場合は内側にも`<template data-gen-scope="">`が必要

### 共通ソースの取り込み（data-gen-include）

####  外部I/Oからの取得（includeIo）
```javascript
const includeIo = {
  'header': async () => {
    // ファイルやAPIから動的に取得
    const response = await fetch('/api/header');
    return await response.text();
  },
  'footer': async () => {
    // ファイルシステムから読み込み
    return await fs.readFile('./templates/footer.html', 'utf-8');
  }
};

const result = await process({
  html: '<template data-gen-scope="" data-gen-include="header"></template>',
  data: {},
  includeIo
});
```

`includeIo`が存在しない、または指定されたキーが存在しない場合は、何も生成されません（テンプレートのみ残ります）。

### data-gen-json（JSON生成）

**用途**: データをJSON文字列として出力（デバッグや確認用途）

```html
<template data-gen-scope="">
  <pre data-gen-json="userSettings">設定データ</pre>
  <script data-gen-json="config" type="application/json">/* 設定 */</script>
</template>
```

データ:
```javascript
{
  userSettings: { theme: "dark", language: "ja", notifications: true },
  config: { apiUrl: "https://api.example.com", timeout: 5000 }
}
```

結果:
```html
<template data-gen-scope=""><!-- 元のテンプレート --></template>
<pre data-gen-cloned="">{"theme":"dark","language":"ja","notifications":true}</pre>
<script data-gen-cloned="" type="application/json">{"apiUrl":"https://api.example.com","timeout":5000}</script>
```

### data-gen-attrs（動的属性）

**用途**: 要素の属性を動的に設定

```html
<template data-gen-scope="">
  <img data-gen-attrs="src:image.url,alt:image.alt,class:image.cssClass" src="default.jpg" alt="デフォルト画像">
  <a data-gen-attrs="href:link.url,target:link.target" href="#" data-gen-text="link.text">リンク</a>
</template>
```

データ:
```javascript
{
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
}
```

結果:
```html
<template data-gen-scope=""><!-- 元のテンプレート --></template>
<img data-gen-cloned="" src="photo.jpg" alt="美しい風景写真" class="responsive-image">
<a data-gen-cloned="" href="https://example.com" target="_blank">外部サイトを開く</a>
```

**書式**: `属性名:データパス,属性名:データパス,...`
- 複数の属性をカンマで区切って指定
- データが`undefined`または`null`の場合、その属性は削除される

### data-gen-comment（コメント）

**用途**: 生成時に要素を完全に削除（コメントアウト）

```html
<template data-gen-scope="">
  <div data-gen-text="title">タイトル</div>
  <div data-gen-comment="">この要素は生成時に削除される</div>
  <p data-gen-text="content">コンテンツ</p>
</template>
```

結果:
```html
<template data-gen-scope="">
  <div data-gen-text="title">タイトル</div>
  <div data-gen-comment="">この要素は生成時に削除される</div>
  <p data-gen-text="content">コンテンツ</p>
</template>
<div data-gen-cloned="">実際のタイトル</div>
<!-- data-gen-comment の要素は生成されない -->
<p data-gen-cloned="">実際のコンテンツ</p>
```

**用途例**:
- 開発時のメモやプレースホルダー
- 条件に関係なく常に非表示にしたい要素

**注意**: `data-gen-comment`が設定された要素は、生成されたHTMLには含まれませんが、テンプレート内には残ります。

### data-gen-insert-before（挿入位置制御）

**用途**: 生成された要素をテンプレートの前に挿入

```html
<!-- デフォルト（テンプレートの後に挿入） -->
<template data-gen-scope="">
  <div data-gen-text="message">メッセージ</div>
</template>

<!-- テンプレートの前に挿入 -->
<template data-gen-scope="" data-gen-insert-before="">
  <div data-gen-text="message">メッセージ</div>
</template>
```

**デフォルトの挿入順序**:
```html
<!-- 生成前 -->
<template data-gen-scope="">
  <div data-gen-text="message">メッセージ</div>
</template>

<!-- 生成後（デフォルト） -->
<template data-gen-scope="">
  <div data-gen-text="message">メッセージ</div>
</template>
<div data-gen-cloned="">実際のメッセージ</div>
```

**data-gen-insert-before 使用時**:
```html
<!-- 生成後 -->
<div data-gen-cloned="">実際のメッセージ</div>
<template data-gen-scope="" data-gen-insert-before="">
  <div data-gen-text="message">メッセージ</div>
</template>
```

## 実行例

### 🏗️ 基本的なテンプレート生成

```javascript
import { process } from '@c-time/gentl';

const html = `
<template data-gen-scope="">
  <div data-gen-text="title">Default Title</div>
  <ul>
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <li data-gen-text="item">Default Item</li>
    </template>
  </ul>
</template>
`;

const data = {
  title: 'Welcome to Gentl',
  items: ['Item 1', 'Item 2', 'Item 3']
};

// ブラウザ環境
const result = process({ html, data });
console.log(result.html);
```

### 🎯 出力結果

```html
<template data-gen-scope="">
  <div data-gen-text="title">Default Title</div>
  <ul>
    <template data-gen-scope="" data-gen-repeat="items" data-gen-repeat-name="item">
      <li data-gen-text="item">Default Item</li>
    </template>
  </ul>
</template>
<div data-gen-cloned="">Welcome to Gentl</div>
<ul data-gen-cloned="">
    <li>Item 1</li><li>Item 2</li><li>Item 3</li>
  </ul>
```

### 💡 重要なポイント

- 📦 **テンプレート保持**: 元の`<template>`タグは常に保持されます
- 🏷️ **識別属性**: 生成されたコンテンツには`data-gen-cloned`属性が付きます
- 🔧 **再利用可能**: 同じテンプレートで異なるデータを何度でも生成可能

## ライセンス

ISC