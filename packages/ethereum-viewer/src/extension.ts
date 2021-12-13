import * as vscode from "vscode";

import * as etherscan from "./etherscan";
import { FileSystem } from "./filesystem";
import { fixtures } from "./test/fixtures";
import { prettyStringify } from "./util/stringify";

let initialized = false;

export async function activate(context: vscode.ExtensionContext) {
  const fs = FileSystem();

  context.subscriptions.push(fs.register());

  const network: etherscan.Network = "mainnet";

  // const browserUrl = (await vscode.commands.executeCommand(
  //   "dethcrypto.vscode-host.get-browser-url"
  // )) as string;

  // console.log("browserUrl", browserUrl);

  if (!initialized) {
    initialized = true;

    vscode.workspace.updateWorkspaceFolders(0, 0, {
      uri: vscode.Uri.parse("memfs:/"),
      name: network,
    });

    await saveContractFilesToFs(
      fs,
      network,
      "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1"
    );
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("ethereum-viewer.helloWorld", async () => {
      // @todo a command that accepts a contract address
    })
  );
}

export function deactivate() {}

async function saveContractFilesToFs(
  fs: FileSystem,
  network: etherscan.Network,
  address: string
) {
  let result: etherscan.FetchFilesResult;

  const USE_ETHERSCAN = true; // Treat this as a toggle for development.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (USE_ETHERSCAN) {
    result = await etherscan.fetchFiles(network, address);
  } else {
    result = fixtures.etherscanResult;
  }

  const entries = Object.entries(result.files);
  for (const [path, content] of entries) {
    fs.writeFile(path, content);
  }

  showMainContractFile(entries, result.info);
}

function showMainContractFile(
  entries: [string, etherscan.FileContent][],
  info: etherscan.FetchFilesResult["info"]
) {
  let fileToShow =
    // @todo @krzkaczor, I'd personally swap this and the next statement — it feels off showing the implementation over proxy.
    info.implementation &&
    entries.find(([path]) =>
      path.endsWith(`/${info.implementation!.ContractName}.sol`)
    );

  if (!fileToShow)
    entries.find(([path]) => path.endsWith(`/${info.ContractName}.sol`));

  if (!fileToShow) fileToShow = entries.sort(byPathLength)[0];

  showTextDocument(fileToShow[0]);
}

function showTextDocument(path: string) {
  void vscode.window.showTextDocument(
    vscode.Uri.from({ scheme: "memfs", path: "/" + path })
  );
}

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
