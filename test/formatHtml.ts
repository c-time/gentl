import * as prettier from "prettier";

export default function formatHtml(html: string): Promise<string> {
  return prettier.format(html, {
    "tabWidth": 2,
    "useTabs": false,
    "semi": false,
    "singleQuote": true,
    "htmlWhitespaceSensitivity": "ignore",
    "parser": "html"
  });
}
