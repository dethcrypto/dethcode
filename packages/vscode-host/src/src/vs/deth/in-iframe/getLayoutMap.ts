/**
 * @file allows the editor working from iframe to get keyboard layout map
 * @see https://github.com/dethcrypto/ethereum-code-viewer/pull/39
 */

import {
  ExposedFunctions,
  makePlaceholderImplementation,
  PlaceholderImplementationListeners,
} from "./lib";

const keyboard = (navigator as any).keyboard;

export function setup(listeners: PlaceholderImplementationListeners) {
  if (keyboard) {
    keyboard.getLayoutMap = makePlaceholderImplementation(
      "getLayoutMap",
      listeners
    );
  }
}

export function onCallerCreated(
  getTopLevelLayoutMap: ExposedFunctions.Async["getLayoutMap"]
) {
  if (keyboard) {
    keyboard.getLayoutMap = getTopLevelLayoutMap;
  }
}
