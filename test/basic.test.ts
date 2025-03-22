import { test } from 'node:test';
import { type GentlJOptions, process } from "../index.ts";
import { assert } from 'console';

test("do nothing at div element", async ({assert}) => {
  const html = `<div id="message">Hello world</div>`;

  const ret = await process(
    { data: {}, html },
    {
      rootParserType: "childElement",
    }
  );

  assert.equal(ret.html, html);
});

test("do nothing at html element", async ({assert}) => {
  const html = `<html><head></head><body><div id="message">Hello world</div></body></html>`;

  const ret = await process(
    { data: {}, html },
    {
      rootParserType: "htmlDocument",
    }
  );

  assert.equal(ret.html, html);
});
