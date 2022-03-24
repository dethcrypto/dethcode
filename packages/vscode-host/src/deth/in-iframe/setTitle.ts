/**
 * @file allows the editor working from iframe to set the top-level window title
 * @see https://github.com/dethcrypto/ethereum-code-viewer/pull/39
 */

import {
  ExposedFunctions,
  makePlaceholderImplementation,
  PlaceholderImplementationListeners,
} from "./lib";

export function setup(listeners: PlaceholderImplementationListeners) {
  listeners.setTitle = [];
  makePlaceholderImplementation("setTitle", listeners);
}

export function onCallerCreated(
  setTopLevelTitle: ExposedFunctions.Async["setTitle"]
) {
  const target = document.querySelector("title")!;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => void setTopLevelTitle(document.title));
  });
  observer.observe(target, { childList: true });
}
