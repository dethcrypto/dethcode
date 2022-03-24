import { UnionToIntersection } from "../commands/ethViewerCommands";
import { log } from "../logger";
import {
  ExposedFunctions,
  PlaceholderImplementationListeners,
  postFunctionCall,
} from "./lib";

import * as getLayoutMap from "./getLayoutMap";
import * as setTitle from "./setTitle";

/**
 * @see /packages/entrypoint/README.md
 */
export function patchForWorkingInIframe() {
  // We don't have to do anything here if the user visited code.deth.net directly.
  if (window.parent === window) return;

  // If the message channel is not open yet, we store a listener for it.
  const functionsCalledBeforeOpening: PlaceholderImplementationListeners = {};

  setTitle.setup(functionsCalledBeforeOpening);
  getLayoutMap.setup(functionsCalledBeforeOpening);

  const onPortOpen = (event: MessageEvent<unknown>) => {
    if (
      event.ports.length > 0 &&
      typeof event.data === "object" &&
      event.data &&
      (event.data as Record<string, unknown>).type === "port-open"
    ) {
      window.removeEventListener("message", onPortOpen);
      const messagePort = event.ports[0];
      log("received port-open message", "messagePort:", messagePort);

      const createHandler = <TFunctionName extends keyof ExposedFunctions>(
        functionName: TFunctionName
      ) => {
        type Args = Parameters<ExposedFunctions[TFunctionName]>;

        return async (...args: Args) => {
          const res = await postFunctionCall(messagePort, functionName, args);
          if (functionsCalledBeforeOpening[functionName]) {
            log(`calling old listeners for "${functionName}"`);

            functionsCalledBeforeOpening[functionName]!.forEach((listener) => {
              const f = listener as UnionToIntersection<typeof listener>;
              f(res as ReturnType<typeof f>);
            });
            functionsCalledBeforeOpening[functionName] = undefined;
          }
          return res;
        };
      };

      setTitle.onCallerCreated(createHandler("setTitle"));
      getLayoutMap.onCallerCreated(createHandler("getLayoutMap"));
    }
  };

  window.addEventListener("message", onPortOpen);
}
