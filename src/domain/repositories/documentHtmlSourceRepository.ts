import {SettingUtil} from "../../core/settingUtil";
import {Html, HtmlDocument} from "../../types";
import {IHtmlSourceRepository} from "./iHtmlSourceRepository";
import {clearClonedElements, getChildScopeElements} from "./helper/htmlSourceHelper";

export class DocumentHtmlSourceRepository implements IHtmlSourceRepository {
  private readonly document: HtmlDocument;
  private readonly setting: SettingUtil;
  private readonly generateOuterHtml: (document: HtmlDocument) => string;
  public constructor(params: {
    document: HtmlDocument
    setting: SettingUtil,
    generateOuterHtml: (document: HtmlDocument) => string
  }) {
    this.document = params.document;
    this.setting = params.setting;
    this.generateOuterHtml = params.generateOuterHtml;
  }

  public clearClonedElements(): void {
    clearClonedElements({rootElement: this.document, setting: this.setting});
  }

  public getChildScopeElements(): HTMLTemplateElement[] {
    return getChildScopeElements({rootElement: this.document, setting: this.setting});
  }

  public getHtml(): Html {
    return this.generateOuterHtml(this.document);
  }
}
