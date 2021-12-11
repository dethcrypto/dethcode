import * as vscode from "vscode";

import * as etherscan from "./etherscan";
import { FileSystem } from "./filesystem";
import { fixtures } from "./test/fixtures";
import { prettyStringify } from "./util/stringify";

let initialized = false;

export function activate(context: vscode.ExtensionContext) {
  const fs = FileSystem();

  context.subscriptions.push(fs.register());

  const network: etherscan.Network = "mainnet";

  if (!initialized) {
    initialized = true;

    vscode.workspace.updateWorkspaceFolders(0, 0, {
      uri: vscode.Uri.parse("memfs:/"),
      name: network,
    });

    void saveContractFilesToFs(
      network,
      "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1"
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("ethereum-viewer.helloWorld", async () => {
      // @todo a command that accepts a contract address
    })
  );

  async function saveContractFilesToFs(
    network: etherscan.Network,
    address: string
  ) {
    let files: etherscan.FileContents;

    const USE_ETHERSCAN = true; // Treat this as a toggle for development.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (USE_ETHERSCAN) {
      files = await etherscan.fetchFiles(network, address);
    } else {
      files = fixtures.files;
    }

    const entries = Object.entries(files);
    for (const [path, content] of entries) {
      fs.writeFile(path, content);
    }

    const [file] = entries.sort(byPathLength)[0];

    showTextDocument(file);
  }

  function showTextDocument(path: string) {
    console.log("showing", { path });
    void vscode.window.showTextDocument(
      vscode.Uri.from({ scheme: "memfs", path: "/" + path })
    );
  }
}

export function deactivate() {}

// For demonstration purposes:

function _demoGlobalStorageUri(context: vscode.ExtensionContext) {
  void vscode.workspace.fs
    .writeFile(
      vscode.Uri.joinPath(context.globalStorageUri, "fixtures.json"),
      new TextEncoder().encode(prettyStringify(fixtures))
    )
    .then(() => {
      return vscode.window.showTextDocument(
        vscode.Uri.joinPath(context.globalStorageUri, "fixtures.json")
      );
    });
}

const byPathLength = (
  a: [string, ...unknown[]],
  b: [string, ...unknown[]]
): number => b[0].split("/").length - a[0].split("/").length;
