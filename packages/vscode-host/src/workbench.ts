import { URI, UriComponents } from "vs/base/common/uri";
import {
  create,
  IWorkbenchConstructionOptions,
  IWorkspace,
  IWorkspaceProvider,
} from "vs/workbench/workbench.web.api";

void (async function () {
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

  create(document.body, {
    ...config,
    commands: [
      {
        id: "dethcrypto.vscode-host.get-browser-url",
        handler: () => window.location.href,
      },
      {
        id: "dethcrypto.vscode-host.replace-browser-url",
        handler: (url: string) => window.location.replace(url),
      },
    ],
    enableSyncByDefault: false,
    webviewEndpoint:
      window.location.origin +
      "/vscode/vs/workbench/contrib/webview/browser/pre",
    webWorkerExtensionHostIframeSrc:
      "/vscode/vs/workbench/services/extensions/worker/httpWebWorkerExtensionHostIframe.html",

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
})();
