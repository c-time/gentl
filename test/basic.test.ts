import {Gentl} from "../src";
import {SettingUtil} from "../src/core/settingUtil";
const { JSDOM } = require("jsdom");

const setting: SettingUtil = {
  genAttr(keyword: string): string {
    return `data-gen-${keyword}`
  }
}

test("do nothing at element", () => {
  const gentl = new Gentl(setting);
  
  const origin = `<div id="message">Hello world</div>`;
  
  const jsdom = new JSDOM(origin);
  
  const elementHtml = gentl.generateElement({
    element: jsdom.window.document.body
  });

  expect(elementHtml).toBe(origin);
  
  console.log(elementHtml);
});
