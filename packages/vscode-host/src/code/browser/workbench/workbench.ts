import { Event } from "vs/base/common/event";
import { URI, UriComponents } from "vs/base/common/uri";
import { localize } from "vs/nls";
import {
  create,
  ICommand,
  IWorkbenchConstructionOptions,
  IWorkspace,
  IWorkspaceProvider,
} from "vs/workbench/workbench.web.api";
import { renderNotification } from "../../../deth/notification";

async function main() {
  // create workbench
  let config: IWorkbenchConstructionOptions & {
    folderUri?: UriComponents;
    workspaceUri?: UriComponents;
  } = {};

  if ((window as any).product) {
    config = (window as any).product;
  } else {
    const result = await fetch("/product.json");
    config = await result.json();
  }

  if (Array.isArray(config.additionalBuiltinExtensions)) {
    config.additionalBuiltinExtensions.forEach((extension) => {
      extension.extensionLocation = URI.revive(extension.extensionLocation);
    });
  }

  let workspace = undefined;
  if (config.folderUri) {
    workspace = { folderUri: URI.revive(config.folderUri) };
  } else if (config.workspaceUri) {
    workspace = { workspaceUri: URI.revive(config.workspaceUri) };
  }

  if (workspace) {
    const workspaceProvider: IWorkspaceProvider = {
      workspace,
      open: async (
        _workspace: IWorkspace,
        _options?: { reuse?: boolean; payload?: object }
      ) => true,
      trusted: true,
    };
    config = { ...config, workspaceProvider };
  }

  const contractAddress = ethViewerCommands["get-contract-address"]();

  setTimeout(() => renderNotification(), 500);

  create(document.body, {
    ...config,
    commands: getCommands(),
    configurationDefaults: {
      "workbench.colorTheme": "Tomorrow Night Blue",
    },
    windowIndicator: {
      onDidChange: Event.None,
      label: localize(
        "playgroundLabel",
        `$(remote) deth.net` + (contractAddress ? `: ${contractAddress}` : "")
      ),
      tooltip: localize(
        "playgroundTooltip",
        "See Ethereum Code Viewer on GitHub"
      ),
      command: "dethcrypto.vscode-host.open-repo-on-github",
    },
    // @todo extensions gallery would be lit, but we'd need a CORS proxy for it
    // additionalBuiltinExtensions: [
    //   ...(config.additionalBuiltinExtensions || []),
    //   // extensions to fetch on startup
    // ],
    // productConfiguration: {
    //   extensionsGallery: {
    //     serviceUrl: "https://marketplace.visualstudio.com/_apis/public/gallery",
    //     itemUrl: "https://marketplace.visualstudio.com/items",
    //     resourceUrlTemplate:
    //       "https://{publisher}.vscode-unpkg.net/{publisher}/{name}/{version}/{path}",
    //     controlUrl:
    //       "https://az764295.vo.msecnd.net/extensions/marketplace.json",
    //     recommendationsUrl:
    //       "https://az764295.vo.msecnd.net/extensions/workspaceRecommendations.json.gz",
    //     ...{ cacheUrl: "https://vscode.blob.core.windows.net/gallery/index" },
    //   },
    // },
  });
}

const ethViewerCommands = {
  "get-browser-url": () => window.location.href,
  "replace-browser-url": (url: string) => window.location.replace(url),
  "get-contract-address": (): string | null => {
    const url = new URL(window.location.href);

    // surge.sh doesn't seem to support rewrites, so we also read from search params.
    const fromSearchParams = url.searchParams.get("contract");
    if (fromSearchParams?.startsWith("0x")) return fromSearchParams;

    let path = url.pathname.slice(1);

    if (path.startsWith("address/")) path = path.slice(8);

    return path.startsWith("0x") ? path : null;
  },
  "open-repo-on-github": () => {
    window.open("https://github.com/dethcrypto/ethereum-code-viewer", "_blank");
  },
};

function getCommands(): readonly ICommand[] {
  return Object.entries(ethViewerCommands).map(([id, handler]) => ({
    id: `dethcrypto.vscode-host.${id}`,
    handler,
  }));
}

void main();
