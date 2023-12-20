import {SettingUtil} from "../../core/settingUtil";
import {Html, HtmlElement} from "../../types";
import {joinLines} from "../../core/textUtil";
import {IHtmlSourceRepository} from "./iHtmlSourceRepository";
import {clearClonedElements, getChildScopeElements} from "./helper/htmlSourceHelper";

export class ScopedHtmlSourceRepository implements IHtmlSourceRepository {
  private readonly rootElement: HtmlElement;
  private readonly setting: SettingUtil;
  public constructor(params: {
    element: HtmlElement,
    setting: SettingUtil
  }) {
    this.rootElement = params.element;
    this.setting = params.setting;
  }

  public clearClonedElements(): void {
    clearClonedElements({rootElement: this.rootElement, setting: this.setting});
  }

  public getChildScopeElements(): HTMLTemplateElement[] {
    return getChildScopeElements({rootElement: this.rootElement, setting: this.setting});
  }

  public getHtml(): Html {
    return this.rootElement.innerHTML;
  }
}
