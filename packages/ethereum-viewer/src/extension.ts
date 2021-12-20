import * as vscode from "vscode";

import { addresses } from "./addresses";
import { executeHostCommand } from "./commands";
import * as etherscan from "./etherscan";
import { networkApiUrls, networkNames } from "./etherscan";
import { StaticFileSearchProvider } from "./fileSearchProvider";
import { FileSystem } from "./filesystem";
import { fixtures } from "./test/fixtures";
// import { StaticTextSearchProvider } from "./textSearchProvider";

let initialized = false;
const fs = FileSystem();

const IN_DETH_HOST = vscode.env.appName === "Ethereum Code Viewer";
const USE_ETHERSCAN = true; // Treat this as a toggle for development.

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(fs.register());
  // @todo a command that accepts a contract address
  // context.subscriptions.push(
  //   vscode.commands.registerCommand("ethereum-viewer.helloWorld", async () => {
  //   })
  // );

  if (!initialized) {
    initialized = true;
    void main(context);
  }
}

export function deactivate() {}

async function main(context: vscode.ExtensionContext) {
  const apiName = await detectEtherscanApiName();
  const network = networkNames[apiName];

  vscode.workspace.updateWorkspaceFolders(0, 0, {
    uri: vscode.Uri.parse("memfs:/"),
    name: network,
  });

  let contractAddress: string | null = addresses.L1ChugSplashProxy;

  if (IN_DETH_HOST)
    contractAddress = await executeHostCommand("get-contract-address");

  if (!contractAddress) {
    return;
  }

  const [entries, info] = await saveContractFilesToFs(
    fs,
    apiName,
    contractAddress
  );

  const mainFile = getMainContractFile(entries, info);

  context.subscriptions.push(
    vscode.workspace.registerFileSearchProvider(
      "memfs",
      new StaticFileSearchProvider(entries.map(([path]) => path))
    )
  );

  // We're instead trying to open the file even if it doesn't exist yet.
  await showTextDocument(mainFile);
  // This seems to be very slow:
  // // onFileChangeOnce(
  // //   context,
  // //   fs,
  // //   mainFile,
  // //   (e) => void showTextDocument(e.uri.path)
  // // );
  // It's causing some errors in the console, but in the end it provides better UX.
}

async function detectEtherscanApiName(): Promise<etherscan.ApiName> {
  if (IN_DETH_HOST) {
    const detectedName = await executeHostCommand("get-api-name");
    if (!detectedName || !(detectedName in networkApiUrls)) {
      await vscode.window.showErrorMessage(
        `${detectedName} is not a valid network. Using mainnet etherscan instead.`
      );

      return "etherscan";
    } else {
      return detectedName as etherscan.ApiName;
    }
  } else {
    return "etherscan";
  }
}

async function saveContractFilesToFs(
  fs: FileSystem,
  network: etherscan.ApiName,
  address: string
) {
  let result: etherscan.FetchFilesResult;

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

  return [entries, result.info] as const;
}

function getMainContractFile(
  files: [string, ...unknown[]][],
  info: etherscan.FetchFilesResult["info"]
): string {
  let fileToShow =
    // @todo @krzkaczor, I'd personally swap this and the next statement — it feels off showing the implementation over proxy.
    info.implementation &&
    files.find(([path]) =>
      path.endsWith(`/${info.implementation!.ContractName}.sol`)
    );

  if (!fileToShow)
    files.find(([path]) => path.endsWith(`/${info.ContractName}.sol`));

  if (!fileToShow) fileToShow = files.sort(byPathLength)[0];

  return fileToShow[0];
}

async function showTextDocument(path: string) {
  await vscode.window.showTextDocument(
    vscode.Uri.from({ scheme: "memfs", path: "/" + path })
  );
  await vscode.commands.executeCommand(
    "workbench.files.action.showActiveFileInExplorer"
  );
}

const byPathLength = (
  a: [string, ...unknown[]],
  b: [string, ...unknown[]]
): number => b[0].split("/").length - a[0].split("/").length;

function _onFileChangeOnce(
  context: vscode.ExtensionContext,
  fs: FileSystem,
  path: string,
  callback: (file: vscode.FileChangeEvent) => void
) {
  const disposable = fs.onDidChangeFile((events) => {
    const event = events.find((event) => event.uri.path === path);
    if (event) {
      callback(event);
      disposable.dispose();
      context.subscriptions.splice(context.subscriptions.indexOf(disposable));
    }
  });

  context.subscriptions.push(disposable);
}
