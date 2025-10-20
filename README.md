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

## API

### `process(input, options?)`

#### 引数

- `input: GentlJInput`
  - `html: string` - テンプレートHTML
  - `data: object` - テンプレートデータ
  - `includeIo?: Record<string, () => Promise<string>>` - `data-gen-include`用のI/O関数群

- `options?: Partial<GentlJOptions>`
  - `rootParserType?: 'htmlDocument' | 'xmlDocument' | 'childElement'` - パーサータイプ（デフォルト: 'htmlDocument'）
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

### テキスト生成（data-gen-text）

```html
<template data-gen-scope="">
  <div data-gen-text="name">Default Text</div>
</template>
```
データ: `{ name: "Hello World" }`

結果:
```html
<template data-gen-scope="">
  <div data-gen-text="name">Default Text</div>
</template>
<div data-gen-cloned="">Hello World</div>
```

### HTML生成（data-gen-html）

```html
<template data-gen-scope="">
  <div data-gen-html="content"></div>
</template>
```
データ: `{ content: "<span>Bold</span>" }`

結果:
```html
<template data-gen-scope="">
  <div data-gen-html="content"></div>
</template>
<div data-gen-cloned=""><span>Bold</span></div>
```

### 条件分岐（data-gen-if）

```html
<template data-gen-scope="">
  <div data-gen-if="visible" data-gen-text="message">Hidden</div>
</template>
```
データ: `{ visible: true, message: "表示されます" }`

### 繰り返し（data-gen-repeat）

```html
<template data-gen-scope="">
  <div data-gen-repeat="items" data-gen-repeat-name="item">
    <span data-gen-text="item.name">Name</span>
  </div>
</template>
```
データ: `{ items: [{name: "Item 1"}, {name: "Item 2"}] }`

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

## 実行例

### 🏗️ 基本的なテンプレート生成

```javascript
import { process } from '@c-time/gentl';

const html = `
<template data-gen-scope="">
  <div data-gen-text="title">Default Title</div>
  <ul>
    <li data-gen-repeat="items" data-gen-text="item">Default Item</li>
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
    <li data-gen-repeat="items" data-gen-text="item">Default Item</li>
  </ul>
</template>
<div data-gen-cloned="">Welcome to Gentl</div>
<ul data-gen-cloned="">
  <li data-gen-cloned="">Item 1</li>
  <li data-gen-cloned="">Item 2</li>
  <li data-gen-cloned="">Item 3</li>
</ul>
```

### 💡 重要なポイント

- 📦 **テンプレート保持**: 元の`<template>`タグは常に保持されます
- 🏷️ **識別属性**: 生成されたコンテンツには`data-gen-cloned`属性が付きます
- 🔧 **再利用可能**: 同じテンプレートで異なるデータを何度でも生成可能

## ライセンス

ISC