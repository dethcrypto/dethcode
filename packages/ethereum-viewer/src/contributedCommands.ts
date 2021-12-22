import { commands, ExtensionContext, QuickPickItem, window } from "vscode";

import { ApiName, explorerApiUrls, networkNames } from "./explorer";
import { FileSystem } from "./fs";
import { openContractSource } from "./openContractSource";
import { renderStatusBarItems } from "./statusBar";
import { unsafeEntries } from "./util/unsafeEntries";

export function registerContributedCommands(
  context: ExtensionContext,
  fs: FileSystem
) {
  const contributedCommands = {
    async open() {
      const address = await window.showInputBox({
        title: "contract address",
        placeHolder: "0x0000000000000000000000000000000000000000",
      });

      if (!address) {
        // cancelling is not an error
        return;
      }

      const networks = unsafeEntries(networkNames);

      interface Item extends QuickPickItem {
        apiName: ApiName;
      }

      const picked = await window.showQuickPick(
        networks.map(
          ([apiName, networkName]): Item => ({
            label: networkName,
            detail: explorerApiUrls[apiName as ApiName],
            apiName,
          })
        ),
        {
          canPickMany: false,
          title: "network",
          matchOnDetail: true,
        }
      );

      if (!picked) {
        await window.showWarningMessage("Sorry, we need to pick a network.");
        return;
      }

      const { apiName } = picked;

      const info = await openContractSource(context, { fs, address, apiName });

      renderStatusBarItems({
        contractAddress: address,
        contractName: info.ContractName || "contract",
        apiName,
      });
    },
  };

  for (const [key, value] of Object.entries(contributedCommands)) {
    context.subscriptions.push(
      commands.registerCommand(`ethereum-viewer.${key}`, value)
    );
  }
}
