import {Html, HtmlElement} from "../../types";

export interface IHtmlSourceRepository {
  clearClonedElements(): void;
  getChildScopeElements(): HtmlElement[];

  getHtml(): Html;
}
