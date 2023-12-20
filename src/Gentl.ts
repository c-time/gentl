import {SettingUtil} from "./core/settingUtil";
import {
  IScopedHtmlSourceRepositoryFactory,
  ScopedHtmlSourceRepositoryFactory
} from "./domain/factories/scopedHtmlSourceRepositoryFactory";
import {Html, HtmlElement} from "./types";

export class Gentl {
  private readonly scopedHtmlSourceRepositoryFactory: IScopedHtmlSourceRepositoryFactory;
  public constructor(setting:SettingUtil) {
    this.scopedHtmlSourceRepositoryFactory = new ScopedHtmlSourceRepositoryFactory({setting});
  }
  
  public generateElement(params: {element: HtmlElement}): Html {
    const scopedHtmlSourceRepository = this.scopedHtmlSourceRepositoryFactory.createRepository(params);
    return scopedHtmlSourceRepository.getHtml();
  }
}
