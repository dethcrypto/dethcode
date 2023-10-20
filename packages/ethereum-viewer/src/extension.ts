import * as vscode from "vscode";

import { registerContributedCommands } from "./contributedCommands";
import { executeHostCommand } from "./executeHostCommand";
import * as explorer from "./explorer";
import { explorerApiUrls, networkNames } from "./explorer";
import { FileSystem } from "./fs";
import { openContractSource } from "./openContractSource";
import { renderStatusBarItems } from "./statusBar";

let initialized = false;
const fs = FileSystem();

const IN_DETH_HOST = vscode.env.appName === "DethCode";

/**
 * We need to trigger activation on startup to read URL and automatically open a contract.
 * This requires "activationEvents": ["*"]" in package.json.
 */
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

  renderStatusBarItems({
    contractAddress: address,
    contractName: "contract",
    apiName,
  });

  const contractName = await openContractSource(context, fs, apiName, address);

  renderStatusBarItems({
    contractAddress: address,
    contractName,
    apiName,
  });
}

async function detectExplorerApiName(): Promise<explorer.ApiName> {
  if (IN_DETH_HOST) {
    const detectedName = await executeHostCommand("getApiName");

    if (!detectedName) return "etherscan";

    if (!(detectedName in explorerApiUrls)) {
      if (detectedName !== "code") {
        await vscode.window.showErrorMessage(
          `"${detectedName}" is not a valid network. Using mainnet etherscan instead.`
        );
      }

      return "etherscan";
    }

    return detectedName as explorer.ApiName;
  } else {
    return "etherscan";
  }
}
