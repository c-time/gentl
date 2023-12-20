import {ScopedHtmlSourceRepository} from "../repositories/scopedHtmlSourceRepository";
import {HtmlElement} from "../../types";
import {SettingUtil} from "../../core/settingUtil";
import {IHtmlSourceRepository} from "../repositories/iHtmlSourceRepository";

export interface IScopedHtmlSourceRepositoryFactory {
  createRepository(params: {
    element: HtmlElement}
  ): IHtmlSourceRepository;
}

export class ScopedHtmlSourceRepositoryFactory implements IScopedHtmlSourceRepositoryFactory{
  private readonly setting: SettingUtil;
  public constructor(params: {setting: SettingUtil}) {
    this.setting = params.setting;
  }
  
  public createRepository(params: {
    element: HtmlElement}): IHtmlSourceRepository {
    return new ScopedHtmlSourceRepository({setting: this.setting, ...params});
  }
}