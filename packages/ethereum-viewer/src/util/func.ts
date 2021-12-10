/**
 * @file function utils
 * @author netcon
 * @source https://github.com/conwnet/github1s/blob/master/extensions/github1s/src/helpers/func.ts
 *
 * @remarks
 * Changes:
 *   - Added non-null assertions and explicit parameter types.
 *   - Changed dependency on `json-stable-stringify` to `fast-json-stable-stringify`.
 *   - Removed dependency on `p-finally` as Promise.finally is now widely supported.
 */

import jsonStableStringify from "fast-json-stable-stringify";

const defaultComputeCacheKey = (...args: any[]) =>
  jsonStableStringify([...args]);

// reuse previous promise when a request call
// and previous request not completed
export const reuseable = <F extends (...args: any[]) => Promise<any>>(
  func: F,
  computeCacheKey: (...args: Parameters<F>) => string = defaultComputeCacheKey
) => {
  const cache = new Map<string, ReturnType<F>>();

  return function f(this: unknown, ...args: Parameters<F>): ReturnType<F> {
    const key = computeCacheKey(...args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const promise = func.call(this, ...args) as ReturnType<F>;
    cache.set(key, promise);

    if (promise instanceof Promise) {
      return promise.finally(() => cache.delete(key)) as ReturnType<F>;
    } else {
      cache.delete(key);
      return promise;
    }
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  interval: number
) => {
  let timer: Timeout | null = null;

  return function f(
    this: unknown,
    ...args: Parameters<T>
  ): ReturnType<T> | undefined {
    if (timer) {
      return;
    }
    func.call(this, ...args);
    timer = setTimeout(() => (timer = null), interval);
  };
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  milliseconds: number
) => {
  let timer: Timeout | undefined;

  return function f(this: unknown, ...args: Parameters<T>): void {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => func.call(this, ...args), milliseconds);
  };
};

// debounce an async func. once an async func canceled, it throws a exception
export const debounceAsyncFunc = <T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
) => {
  let timer: Timeout | undefined;
  let previousReject: ((reason?: any) => void) | undefined;

  return function f(this: unknown, ...args: Parameters<T>): ReturnType<T> {
    return new Promise((resolve, reject) => {
      timer && clearTimeout(timer);
      previousReject && previousReject();
      timer = setTimeout(() => resolve(func.call(this, ...args)), wait);
      previousReject = reject;
    }) as ReturnType<T>;
  };
};

type Timeout = ReturnType<typeof setTimeout>;
