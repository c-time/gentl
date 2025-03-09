import { type GentlJInputData } from "./types.ts";

const anyDataToString = (value: any): string => {
  if (value === undefined) {
    return "undefined";
  }

  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `[${value.map((e) => `${e}`).join(",")}]`;
  }

  return value.toString();
};

const referData = (
  leftProperties: string[],
  rightProperties: string[],
  data: any
): any => {
  if (rightProperties.length !== 0) {
    const rProps = [...rightProperties];
    const lProps = [...leftProperties];

    if (data === undefined) {
      throw new Error(
        `${lProps.join(".")} is undefined. (${[...lProps, ...rProps].join(
          "."
        )})`
      );
    }

    const prop = rProps.splice(0, 1)[0];
    lProps.push(prop);
    const nextData = data[prop];
    return referData(lProps, rProps, nextData);
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
  data: GentlJInputData
): any => {
  return referData([], splitReferFormula(formula), data);
};

export const pickStringData = (
  formula: string | null,
  data: GentlJInputData
): string => anyDataToString(pickData(formula, data));
