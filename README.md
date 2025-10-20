# Gentl - JavaScript Template Engine

Gentl は軽量でコアシステムに焦点を当てたJavaScript/TypeScriptテンプレートエンジンです。

## 特徴

- **軽量**: 依存関係ゼロのコアシステム
- **完全環境非依存**: 全ての環境でDOM環境を外部注入
- **柔軟なDOM環境**: JSDOM、Happy DOM、ブラウザ環境など任意のDOM環境に対応

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

## API

### `process(input, options?)`

#### 引数

- `input: GentlJInput`
  - `html: string` - テンプレートHTML
  - `data: object` - テンプレートデータ

- `options?: Partial<GentlJOptions>`
  - `rootParserType?: 'htmlDocument' | 'xmlDocument' | 'childElement'` - パーサータイプ（デフォルト: 'htmlDocument'）
  - `deleteTemplateTag?: boolean` - テンプレートタグを削除するか（デフォルト: false）
  - `deleteDataAttributes?: boolean` - データ属性を削除するか（デフォルト: false）
  - `domEnvironment: DOMEnvironmentConstructor` - DOM環境の注入（必須）

#### 戻り値

- `GentlJOutput`
  - `html: string` - 生成されたHTML

## テンプレート構文

### テキスト生成

```html
<div data-gen-text="name">Default Text</div>
<!-- データ: { name: "Hello World" } -->
<!-- 結果: <div>Hello World</div> -->
```

### HTML生成

```html
<div data-gen-html="content"></div>
<!-- データ: { content: "<span>Bold</span>" } -->
<!-- 結果: <div><span>Bold</span></div> -->
```

### 条件分岐

```html
<div data-gen-if="visible">This is visible</div>
<!-- データ: { visible: true } -->
```

### 繰り返し

```html
<template data-gen-scope="">
  <div data-gen-repeat="items">
    <span data-gen-text="name">Name</span>
  </div>
</template>
<!-- データ: { items: [{name: "Item 1"}, {name: "Item 2"}] } -->
```

## ライセンス

ISC