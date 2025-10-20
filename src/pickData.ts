import { type GentlJInputData, type Logger } from "./types.ts";

const anyDataToString = (value: any): string => {
  if (value === undefined) {
    return "";
  }

  if (value === null) {
    return "";
  }

  if (Array.isArray(value)) {
    return `[${value.map((e) => `${e}`).join(",")}]`;
  }

  return value.toString();
};

const referData = (
  leftProperties: string[],
  rightProperties: string[],
  data: any,
  logger?: Logger,
  originalFormula?: string
): any => {
  if (rightProperties.length !== 0) {
    const rProps = [...rightProperties];
    const lProps = [...leftProperties];

    if (data === undefined) {
      // エラーを投げる代わりに、ログを出力して undefined を返す
      const errorMessage = `${lProps.join(".")} is undefined. (${[...lProps, ...rProps].join(".")})`;
      
      if (logger) {
        logger({
          level: 'warn',
          message: 'Data reference error',
          context: {
            formula: originalFormula,
            error: new Error(errorMessage),
            data: { availableProperties: lProps.slice(0, -1) }
          },
          timestamp: new Date()
        });
      } else {
        console.warn(`[Gentl] Data reference warning: ${errorMessage}`);
      }
      
      return undefined;
    }

    const prop = rProps.splice(0, 1)[0];
    lProps.push(prop);
    const nextData = data[prop];
    return referData(lProps, rProps, nextData, logger, originalFormula);
  }

  return data;
};

const splitReferFormula = (formula: string | null): string[] =>
  (formula || "")
    .split(".")
    .map((e) => e.trim())
    .filter((e) => Boolean(e));

export const pickData = (
  formula: string | null,
  data: GentlJInputData,
  logger?: Logger
): any => {
  return referData([], splitReferFormula(formula), data, logger, formula || undefined);
};

export const pickStringData = (
  formula: string | null,
  data: GentlJInputData,
  logger?: Logger
): string => anyDataToString(pickData(formula, data, logger));
