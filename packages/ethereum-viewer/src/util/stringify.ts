export { default as stableStringify } from "fast-json-stable-stringify";

export const prettyStringify = (obj: unknown) => JSON.stringify(obj, null, 2);
