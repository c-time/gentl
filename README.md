# Gentl - JavaScript Template Engine

Gentl は軽量でコアシステムに焦点を当てたJavaScript/TypeScriptテンプレートエンジンです。

## 特徴

- **軽量**: 依存関係ゼロのコアシステム
- **環境非依存**: ブラウザとNode.js両方で動作
- **DOM環境注入**: Node.js環境では実行時にDOM環境を注入

## インストール

```bash
npm install @c-time/gentl
```

Node.js環境で使用する場合は、DOM環境ライブラリも開発依存関係としてインストールしてください：

```bash
# JSDOMを使用する場合
npm install --save-dev jsdom

# Happy DOMを使用する場合
npm install --save-dev happy-dom

# その他のDOM環境ライブラリも使用可能
```

## 使用方法

### ブラウザ環境

```javascript
import { process } from '@c-time/gentl';

const result = process(
  {
    html: '<template data-gen-scope=""><div data-gen-text="name">Default</div></template>',
    data: { name: 'Hello World' }
  },
  {
    rootParserType: 'childElement'
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
  - `domEnvironment?: DOMEnvironmentConstructor` - Node.js環境でのDOM環境注入（Node.js使用時は必須）

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