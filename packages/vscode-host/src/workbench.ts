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
  });
})();
