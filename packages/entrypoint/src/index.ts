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

iframe.setAttribute("src", url.href);
// @todo in the future, we should also listen for postMessage events when
// the ECV app inside of the iframe updates the URL, but it's not happening
// right now

// TODO FOR NOW: Expose top-level API for

void (function exposeFunctions() {
  const channel = new MessageChannel();

  const exposedFunctions = {
    /**
     * see VSCode's BrowserKeyboardMapperFactoryBase._getBrowserKeyMapping
     */
    async getLayoutMap() {
      const keyboard = (navigator as any).keyboard as NavigatorKeyboard | null;

      if (!keyboard) return [];

      let res: KeyboardMapping = {};
      for (const key of await keyboard.getLayoutMap()) {
        res[key[0]] = {
          value: key[1],
          withShift: "",
          withAltGr: "",
          withShiftAltGr: "",
        };
      }

      return res;
    },
  };

  type ExposedFunctionCall = {
    fun: "getLayoutMap";
    args: Parameters<typeof exposedFunctions["getLayoutMap"]>;
  };

  iframe.addEventListener("load", () => {
    const iframeWindow = iframe.contentWindow!;

    iframeWindow.postMessage({ type: "port-open" }, "*", [channel.port2]);

    channel.port1.onmessage = (event) => {
      console.log("[ecv] Received message from iframe:", event.data);

      if (event.data && "type" in event.data) {
        const data = event.data as ExposedFunctionCall;
        void exposedFunctions[data.fun](...data.args).then((res) => {
          console.log(`[ecv] Returned from ${data.fun}:`, res, event.data);

          iframeWindow.postMessage(
            { type: "result", args: [data.fun, res] },
            "*",
            [channel.port2]
          );
        });
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
interface KeyboardMapping
  extends Record<
    string,
    {
      value: string;
      withShift: string;
      withAltGr: string;
      withShiftAltGr: string;
    }
  > {}
