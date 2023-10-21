import { Event } from "vs/base/common/event";
import { URI, UriComponents } from "vs/base/common/uri";
import { localize } from "vs/nls";
import { create } from "vs/workbench/workbench.web.main";
import { IWorkspace } from "vs/platform/workspace/common/workspace";

import {
  CommandId,
  ethViewerCommands,
  getCommands,
} from "../../../deth/commands/getCommands";
import { patchForWorkingInIframe } from "../../../deth/in-iframe/patchForWorkingInIframe";

async function main() {
  patchForWorkingInIframe();

  // create workbench
  let config: any & {
    folderUri?: UriComponents;
    workspaceUri?: UriComponents;
  } = {};

  if ((window as any).product) {
    config = (window as any).product;
  } else {
    const result = await fetch("/product.json");
    config = await result.json();
    // for non https environments (like devmode), we need to tweak protocol to load extensions
    if (location.protocol !== "https:") {
      config.additionalBuiltinExtensions =
        config.additionalBuiltinExtensions.forEach((extension: any) => {
          extension.scheme = "http";
        });
    }
  }

  if (Array.isArray(config.additionalBuiltinExtensions)) {
    config.additionalBuiltinExtensions.forEach((extension: any) => {
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
    const workspaceProvider: any = {
      workspace,
      open: async (
        _workspace: IWorkspace,
        _options?: { reuse?: boolean; payload?: object }
      ) => true,
      trusted: true,
    };
    config = { ...config, workspaceProvider };
  }

  const apiName = ethViewerCommands.getApiName() || "etherscan";

  create(document.body, {
    ...config,
    commands: getCommands(),
    configurationDefaults: {
      // Omits ${rootName} "Untitled (Workspace)" from the title
      "window.title":
        "${dirty}${activeEditorShort}${separator}${appName}${separator}${remoteName}",
    },
    windowIndicator: {
      onDidChange: Event.None,
      label: localize("playgroundLabel", `$(remote) ${apiName}.deth.net`),
      tooltip: localize("playgroundTooltip", "See DethCode on GitHub"),
      command: CommandId("openRepoOnGithub"),
    },
  });
}

main().catch(console.error);
