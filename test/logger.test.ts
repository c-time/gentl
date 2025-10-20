import { test } from 'node:test';
import { type GentlJInput, type GentlJOptions, process }  from "../src/index.ts";
import formatHtml from "./formatHtml.ts";
import { createTestOptions, TestLogger } from './test-helper.ts';

const options: Partial<GentlJOptions> = createTestOptions({
  rootParserType: "childElement",
});

test("data reference error with logger", async ({assert})=> {
  const testLogger = new TestLogger();
  
  const result = await process(
    {
      html: `<template data-gen-scope="">
        <div data-gen-text="nonexistent.property">Default</div>
        <div data-gen-text="existing.property">Default</div>
      </template>`,
      data: { 
        existing: { property: "Found!" }
        // nonexistent は存在しない
      }
    },
    { ...options, logger: testLogger.log }
  );

  // ログが記録されていることを確認
  const warnLogs = testLogger.getLogsByLevel('warn');
  assert.equal(warnLogs.length, 1);
  assert.equal(warnLogs[0].message, 'Data reference error');
  assert.equal(warnLogs[0].context?.formula, 'nonexistent.property');

  // 存在しないプロパティは空文字、存在するプロパティは正常に表示
  assert.equal(
    await formatHtml(result.html),
    await formatHtml(`<template data-gen-scope="">
        <div data-gen-text="nonexistent.property">Default</div>
        <div data-gen-text="existing.property">Default</div>
      </template>
      <div data-gen-cloned=""></div>
      <div data-gen-cloned="">Found!</div>`)
  );
});

test("data reference error without logger", async ({assert})=> {
  // コンソール出力をキャプチャ
  const originalWarn = console.warn;
  const warnCalls: string[] = [];
  console.warn = (...args) => {
    warnCalls.push(args.join(' '));
  };

  try {
    const result = await process(
      {
        html: `<template data-gen-scope="">
          <div data-gen-text="missing.value">Default</div>
        </template>`,
        data: {}
      },
      options
    );

    // コンソール警告が出力されることを確認
    assert.equal(warnCalls.length, 1);
    const firstWarn: string = warnCalls[0];
    assert.equal(firstWarn.includes('[Gentl] Data reference warning'), true);
    assert.equal(firstWarn.includes('missing.value'), true);

    // 処理は継続される
    assert.equal(
      await formatHtml(result.html),
      await formatHtml(`<template data-gen-scope="">
          <div data-gen-text="missing.value">Default</div>
        </template>
        <div data-gen-cloned=""></div>`)
    );
  } finally {
    console.warn = originalWarn;
  }
});

test("logger functionality direct test", async ({assert})=> {
  const testLogger = new TestLogger();
  
  // 直接ログ関数をテスト
  testLogger.log({
    level: 'warn',
    message: 'Test message',
    context: { formula: 'test.property' },
    timestamp: new Date()
  });

  assert.equal(testLogger.logs.length, 1);
  assert.equal(testLogger.logs[0].level, 'warn');
  assert.equal(testLogger.logs[0].message, 'Test message');
});

test("includeIo error with logger", async ({assert})=> {
  const testLogger = new TestLogger();
  
  const includeIo = {
    'failing': async () => {
      throw new Error('Network timeout');
    }
  };

  await process(
    {
      html: `<template data-gen-scope="" data-gen-include="failing"></template>`,
      data: {},
      includeIo
    },
    { ...options, logger: testLogger.log }
  );

  // エラーが記録されていることを確認
  const errorLogs = testLogger.getLogsByLevel('error');
  assert.equal(errorLogs.length, 1);
  assert.equal(errorLogs[0].message, 'Failed to load include content');
  assert.equal(errorLogs[0].context?.attribute, 'data-gen-include');
  assert.equal(errorLogs[0].context?.formula, 'failing');
  assert.equal(errorLogs[0].context?.error?.message, 'Network timeout');
});