/**
 * @file adapted fetch API
 * @author netcon
 * @source https://github.com/conwnet/github1s/blob/master/extensions/github1s/src/helpers/fetch.ts
 *
 * @remarks
 * Changes:
 *   - Removed GitHub1s specific code (mentions of token, changed error names).
 *   - Imported noop from ts-essentials.
 */

import { noop } from "ts-essentials";
import * as vscode from "vscode";

import { reuseable, throttle } from "./func";
import { prettyStringify } from "./stringify";

export class RequestError extends Error {
  constructor(message: string) {
    super(message);
    if (typeof Object.setPrototypeOf === "function") {
      Object.setPrototypeOf(this, RequestError.prototype);
    }
  }
}

export class RequestNotFoundError extends RequestError {
  constructor(message: string) {
    super(message);
    if (typeof Object.setPrototypeOf === "function") {
      Object.setPrototypeOf(this, RequestNotFoundError.prototype);
    }
  }
}

export class RequestForbiddenError extends RequestError {
  constructor(message: string) {
    super(message);
    if (typeof Object.setPrototypeOf === "function") {
      Object.setPrototypeOf(this, RequestForbiddenError.prototype);
    }
  }
}

export class RequestUnauthorizedError extends RequestError {
  constructor(message: string) {
    super(message);
    if (typeof (<any>Object).setPrototypeOf === "function") {
      (<any>Object).setPrototypeOf(this, RequestUnauthorizedError.prototype);
    }
  }
}

// only report network error once in 5 seconds
export const throttledReportNetworkError = throttle(
  () =>
    vscode.window.showErrorMessage("Request Failed, Maybe an Network Error"),
  5000
);

export const getFetchOptions = (forceUpdate?: boolean): RequestInit =>
  forceUpdate ? { cache: "reload" } : {};

const _cache = new Map();

export const fetch = reuseable(
  async (url: string, options?: RequestInit): Promise<unknown> => {
    const headers = options && "headers" in options ? options.headers : {};

    /**
     * We are reusing the same values from the https://developer.mozilla.org/en-US/docs/Web/API/Request/cache.
     * But the way is not the same because we couldn't control how the cache-control returns from external APIs.
     * Instead of relying on the browser caching stragety and API response header, we use an im-memory map to
     * cache all requests.
     */
    if (
      _cache.has(url) &&
      !["no-store", "no-cache", "reload"].includes(options?.cache!)
    ) {
      return _cache.get(url);
    }

    let response: Response;
    try {
      response = await self.fetch(url, {
        mode: "cors",
        ...options,
        headers,
      });
    } catch (e) {
      void throttledReportNetworkError();
      throw new RequestError("Request Failed, Maybe an Network Error");
    }
    if (response.status < 400) {
      _cache.set(url, await response.json());
      return _cache.get(url);
    }
    if (response.status === 403) {
      // if there is no token saved and the rate limit exceeded,
      // open the authorizing overly for requesting a access token
      return response.json().then((data) => {
        throw new RequestForbiddenError(prettyStringify(data));
      });
    }
    if (response.status === 401) {
      return response.json().then((data) => {
        throw new RequestUnauthorizedError(prettyStringify(data));
      });
    }
    if (response.status === 404) {
      throw new RequestNotFoundError("Not Found");
    }
    throw new RequestError(
      (await response.json().catch(noop))?.message ||
        `GitHub1s: Request got HTTP ${response.status} response`
    );
  }
);
