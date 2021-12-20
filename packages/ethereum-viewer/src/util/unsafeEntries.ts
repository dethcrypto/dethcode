export const unsafeEntries = <T extends Record<string, unknown>>(obj: T): [keyof T, T[keyof T]][] =>
  Object.entries(obj) as [keyof T, T[keyof T]][];

