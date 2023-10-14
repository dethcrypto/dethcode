import { log } from "../logger";

/**
 * @param messagePort - the port to send the message to.
 * @param functionName - name of the function exposed from top level window.
 * @param args - arguments for the function call.
 * @param parse - optional function to postprocess the result received.
 * @returns a promise that resolves to the result of the function call
 */
export function postFunctionCall<TFunctionName extends keyof ExposedFunctions>(
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

export function makePlaceholderImplementation<
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

export type ExposedFunctionResult = {
  [P in keyof ExposedFunctions]: {
    type: "result";
    fun: P;
    res: ReturnType<ExposedFunctions[P]>;
  };
}[keyof ExposedFunctions];

export type PlaceholderImplementationListeners = {
  [P in keyof ExposedFunctions]?: Array<
    (result: ReturnType<ExposedFunctions[P]>) => void
  >;
};

export type ExposedFunctions = {
  getLayoutMap: () => Map<string, string>;
  setTitle: (title: string) => void;
};

type AsyncResults<T extends Record<string, (...args: any[]) => void>> = {
  [K in keyof T]: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>;
};

export declare namespace ExposedFunctions {
  export type Async = AsyncResults<ExposedFunctions>;
}
