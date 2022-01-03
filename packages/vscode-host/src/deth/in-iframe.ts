import { log } from "./logger";

/**
 * @see /packages/entrypoint/README.md
 */
export function patchForWorkingInIframe() {
  // We don't have to do anything here if the user visited ecv.deth.net directly.
  if (window.parent === window) return;

  // If the message channel is not open yet, we store a listener for it.
  const functionsCalledBeforeOpening: PlaceholderImplementationListeners = {};

  const keyboard = (navigator as any).keyboard;
  if (keyboard) {
    keyboard.getLayoutMap = makePlaceholderImplementation(
      "getLayoutMap",
      functionsCalledBeforeOpening
    );
  }

  const onPortOpen = (event: MessageEvent<unknown>) => {
    if (
      event.ports.length > 0 &&
      typeof event.data === "object" &&
      event.data &&
      (event.data as Record<string, unknown>).type === "port-open"
    ) {
      log("received port-open message");

      window.removeEventListener("message", onPortOpen);
      const messagePort = event.ports[0];

      const createHandler = <TFunctionName extends keyof ExposedFunctions>(
        functionName: TFunctionName
      ) => {
        type Args = Parameters<ExposedFunctions[TFunctionName]>;

        return async (args: Args = [] as Args) => {
          const res = await postFunctionCall(messagePort, functionName, args);
          if (functionsCalledBeforeOpening[functionName]) {
            log(`calling old listeners for "${functionName}"`);
            functionsCalledBeforeOpening[functionName]!.forEach((f) => f(res));
            functionsCalledBeforeOpening[functionName] = undefined;
          }
          return res;
        };
      };

      if (keyboard) {
        keyboard.getLayoutMap = createHandler("getLayoutMap");
      }
    }
  };

  window.addEventListener("message", onPortOpen);
}

type ExposedFunctions = {
  getLayoutMap: () => Map<string, [string, string]>;
};

type ExposedFunctionResult = {
  [P in keyof ExposedFunctions]: {
    type: "result";
    fun: P;
    res: ReturnType<ExposedFunctions[P]>;
  };
}[keyof ExposedFunctions];

type PlaceholderImplementationListeners = {
  [P in keyof ExposedFunctions]?: Array<
    (result: ReturnType<ExposedFunctions[P]>) => void
  >;
};

/**
 * @param messagePort - the port to send the message to.
 * @param functionName - name of the function exposed from top level window.
 * @param args - arguments for the function call.
 * @param parse - optional function to postprocess the result received.
 * @returns a promise that resolves to the result of the function call
 */
function postFunctionCall<TFunctionName extends keyof ExposedFunctions>(
  messagePort: MessagePort,
  functionName: TFunctionName,
  args: Parameters<ExposedFunctions[TFunctionName]>,
  parse?: (res: unknown) => ReturnType<ExposedFunctions[TFunctionName]>
) {
  type Result = ReturnType<ExposedFunctions[TFunctionName]>;

  return new Promise<Result>((resolve) => {
    messagePort.addEventListener("message", (e) => {
      const { data } = e as MessageEvent<ExposedFunctionResult>;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (data.type === "result" && data.fun === functionName) {
        log(`${data.fun} received result:`, data.res);

        const result = parse ? parse(data.res) : data.res;
        resolve(result as Result);
      }
    });

    log(`sending message ${functionName}`);
    messagePort.postMessage({ type: functionName, args });
  });
}
function makePlaceholderImplementation<
  TFunctionName extends keyof ExposedFunctions
>(
  functionName: TFunctionName,
  functionsCalledBeforeOpening: PlaceholderImplementationListeners
) {
  () => {
    return new Promise((resolve) => {
      functionsCalledBeforeOpening[functionName] ||= [];
      functionsCalledBeforeOpening[functionName]!.push(resolve);
    });
  };
}
