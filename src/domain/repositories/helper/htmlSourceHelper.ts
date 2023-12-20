import {HtmlDocument, HtmlElement} from "../../../types";
import {SettingUtil} from "../../../core/settingUtil";

export const clearClonedElements = (params: {rootElement: HtmlElement | HtmlDocument, setting: SettingUtil}): void => 
  params.rootElement.querySelectorAll(`[${params.setting.genAttr("cloned")}]`).forEach(e => e.remove());

export const getChildScopeElements = (params: {rootElement: HtmlElement | HtmlDocument, setting: SettingUtil}): HTMLTemplateElement[] => 
   [
    ...Array.from(params.rootElement.querySelectorAll(`template[${params.setting.genAttr("repeat")}]`)) as HTMLTemplateElement[],
    ...Array.from(params.rootElement.querySelectorAll(`template[${params.setting.genAttr("include")}]`)) as HTMLTemplateElement[],
    ...Array.from(params.rootElement.querySelectorAll(`template[${params.setting.genAttr("if")}]`)) as HTMLTemplateElement[],
  ];
