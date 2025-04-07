import { type GenerateOptions } from "./types.ts";

const getScopeAttribute = (o: GenerateOptions) => `${o.attributePrefix}-scope`;

const getTextAttribute = (o: GenerateOptions) => `${o.attributePrefix}-text`;

const getHtmlAttribute = (o: GenerateOptions) => `${o.attributePrefix}-html`;

const getClonedAttribute = (o: GenerateOptions) =>
  `${o.attributePrefix}-cloned`;

const getRepeatAttribute = (o: GenerateOptions) =>
  `${o.attributePrefix}-repeat`;

const getRepeatNameAttribute = (o: GenerateOptions) =>
  `${o.attributePrefix}-repeat-name`;

const getIfAttribute = (o: GenerateOptions) => `${o.attributePrefix}-if`;

const getAttrsAttribute = (o: GenerateOptions) => `${o.attributePrefix}-attrs`;

const getIncludeAttribute = (o: GenerateOptions) =>
  `${o.attributePrefix}-include`;

const getCommentAttribute = (o: GenerateOptions) =>
  `${o.attributePrefix}-comment`;

export const getGenerateConst = (o: GenerateOptions) => {
  const attributes = {
    scope: getScopeAttribute(o),
    text: getTextAttribute(o),
    attrs: getAttrsAttribute(o),
    html: getHtmlAttribute(o),
    cloned: getClonedAttribute(o),
    repeat: getRepeatAttribute(o),
    repeatName: getRepeatNameAttribute(o),
    if: getIfAttribute(o),
    include: getIncludeAttribute(o),
    comment: getCommentAttribute(o),
  };
  return {
    attributes,
    attributeNames: new Set(Object.values(attributes)),
    queries: {
      scope: `${o.templateTagName}[${getScopeAttribute(o)}="${o.scope}"]`,
      text: `[${getTextAttribute(o)}]`,
      html: `[${getHtmlAttribute(o)}]`,
      attrs: `[${getAttrsAttribute(o)}]`,
      cloned: `[${getClonedAttribute(o)}="${o.scope}"]`,
      if: `[${getIfAttribute(o)}]`,
      comment: `[${getCommentAttribute(o)}]`,
    },
  };
};

export type GenerateConst = ReturnType<typeof getGenerateConst>;
