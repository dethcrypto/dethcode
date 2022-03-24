import type { UnionToIntersection } from "ts-essentials";

import type { ExposedFunctions } from "../../vscode-host/src/deth/in-iframe/lib";

const log = console.log.bind(console, "\x1b[32m [ecv:top]");

// on load, we copy pathname and search params to the iframe
const iframe = document.getElementById("frame")! as HTMLIFrameElement;
const url = new URL(iframe.getAttribute("src")!);
const { hostname, pathname, search } = window.location;

url.pathname = pathname;
url.search = search;

// prefix of the hostname is passed to `explorer` search param
// @see vscode-host/src/deth/commands/ethViewerCommands.ts
if (hostname.endsWith(".deth.net") && !url.searchParams.get("explorer")) {
  url.searchParams.set("explorer", hostname.slice(0, -9));
}

log("setting iframe src:", url.href);
iframe.setAttribute("src", url.href);
// @todo in the future, we should also listen for postMessage events when
// the ECV app inside of the iframe updates the URL, but it's not happening
// right now

void (function exposeFunctions() {
  let channel: MessageChannel;

  const exposedFunctions: ExposedFunctions.Async = {
    /**
     * see VSCode's BrowserKeyboardMapperFactoryBase._getBrowserKeyMapping
     */
    async getLayoutMap() {
      const keyboard = (navigator as any).keyboard as NavigatorKeyboard | null;

      if (!keyboard) {
        throw new Error(
          '"navigator.keyboard" is not available — it should not be called from the editor'
        );
      }

      const keyboardLayoutMap = await keyboard.getLayoutMap();
      // KeyboardLayoutMap can't be cloned, so it can't be sent with postMessage
      return new Map(keyboardLayoutMap);
    },
    async setTitle(title: string) {
      document.title = title;
    },
  };

  type ExposedFunctionCall = {
    [P in keyof ExposedFunctions]: {
      type: P;
      args: Parameters<ExposedFunctions[P]>;
    };
  }[keyof ExposedFunctions];

  iframe.addEventListener("load", function onLoad() {
    iframe.removeEventListener("load", onLoad);

    channel = new MessageChannel();
    const iframeWindow = iframe.contentWindow!;

    log("iframe loaded, passing channel port");
    // The code responsible for interaction with this port lies in
    // vscode-host/src/deth/in-iframe.ts
    iframeWindow.postMessage({ type: "port-open" }, "*", [channel.port2]);

    channel.port1.start();
    channel.port1.onmessage = (event) => {
      if (event.data && "type" in event.data) {
        const data = event.data as ExposedFunctionCall;
        const fun = exposedFunctions[data.type];

        // This isn't very pretty, but it's a way to preserve a semblance of
        // and avoid a huge switch case with this command-dispatch pattern
        type Fun = UnionToIntersection<typeof fun>;
        type Args = Parameters<Fun>;

        void (fun as Fun)(...(data.args as Args)).then((res) => {
          log(`returned from ${data.type}:`, res, event.data);

          channel.port1.postMessage({ type: "result", fun: data.type, res });
        });
      } else {
        log("received unexpected message from iframe:", event.data);
      }
    };
  });
})();

interface NavigatorKeyboard {
  getLayoutMap(): Promise<KeyboardLayoutMap>;
}
/** https://developer.mozilla.org/en-US/docs/Web/API/KeyboardLayoutMap */
interface KeyboardLayoutMap
  extends Iterable<
    [label: string, key: string] /* example: ['BracketRight', ']'] */
  > {}
