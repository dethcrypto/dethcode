import { window, commands, ExtensionContext, QuickPickItem } from "vscode";
import { networkNames, explorerApiUrls, ApiName } from "./explorer";
import { openContractSource } from "./openContractSource";
import { unsafeEntries } from "./util/unsafeEntries";
import { FileSystem } from "./filesystem";

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
        await window.showWarningMessage(
          "Sorry, we can't open a contract with no address 🤷‍♂️"
        );
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

      await openContractSource(context, { fs, address, apiName });
    },
  };

  for (const [key, value] of Object.entries(contributedCommands)) {
    context.subscriptions.push(
      commands.registerCommand(`ethereum-viewer.${key}`, value)
    );
  }
}
