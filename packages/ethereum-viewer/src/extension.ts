import * as vscode from "vscode";
import { addresses } from "./addresses";

import { registerContributedCommands } from "./contributedCommands";
import { executeHostCommand } from "./executeHostCommand";
import * as explorer from "./explorer";
import { explorerApiUrls, networkNames } from "./explorer";
import { FileSystem } from "./fs";
import { openContractSource } from "./openContractSource";

let initialized = false;
const fs = FileSystem();

const IN_DETH_HOST = vscode.env.appName === "Ethereum Code Viewer";

export async function activate(context: vscode.ExtensionContext) {
  fs.register(context);

  if (!initialized) {
    initialized = true;
    void main(context);
  }
}

export function deactivate() {}

async function main(context: vscode.ExtensionContext) {
  registerContributedCommands(context, fs);

  const apiName = await detectExplorerApiName();
  const network = networkNames[apiName];

  vscode.workspace.updateWorkspaceFolders(0, 0, {
    uri: vscode.Uri.parse("memfs:/"),
    name: network,
  });

  let address: string | undefined;

  if (IN_DETH_HOST) address = await executeHostCommand("getContractAddress");

  if (!address) {
    return;
  }

  await openContractSource(context, { fs, apiName, address });
}

async function detectExplorerApiName(): Promise<explorer.ApiName> {
  if (IN_DETH_HOST) {
    const detectedName = await executeHostCommand("getApiName");

    if (!detectedName) return "etherscan";

    if (!(detectedName in explorerApiUrls)) {
      await vscode.window.showErrorMessage(
        `"${detectedName}" is not a valid network. Using mainnet etherscan instead.`
      );

      return "etherscan";
    }

    return detectedName as explorer.ApiName;
  } else {
    return "etherscan";
  }
}
