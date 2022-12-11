import {
  commands,
  Disposable,
  ExtensionContext,
  Uri,
  window,
  workspace,
} from "vscode";

import * as explorer from "./explorer";
import { fileExtension } from "./explorer/fileExtension";
import {
  FileSystem,
  MemFSTextSearchProvider,
  StaticFileSearchProvider,
} from "./fs";
import { fixtures } from "./test/fixtures";

const IS_ONLINE = true; // Treat this as a toggle for development.

let fileSearchProviderDisposable: Disposable | undefined;
let textSearchProviderDisposable: Disposable | undefined;

export async function openContractSource(
  context: ExtensionContext,
  fs: FileSystem,
  apiName: explorer.ApiName,
  address: string
): Promise<string> {
  const { entries, mainFile, contractName } = await saveContractFilesToFs(
    fs,
    apiName,
    address
  );

  fileSearchProviderDisposable?.dispose();
  fileSearchProviderDisposable = workspace.registerFileSearchProvider(
    "memfs",
    new StaticFileSearchProvider(entries.map(([path]) => path))
  );
  context.subscriptions.push(fileSearchProviderDisposable);

  textSearchProviderDisposable?.dispose();
  textSearchProviderDisposable = workspace.registerTextSearchProvider(
    "memfs",
    new MemFSTextSearchProvider(entries)
  );
  context.subscriptions.push(textSearchProviderDisposable);

  await showTextDocument(mainFile);

  return contractName;
}

async function saveContractFilesToFs(
  fs: FileSystem,
  apiName: explorer.ApiName,
  address: string
) {
  if (address.includes(",")) {
    const addresses = address.split(",");
    const results = await Promise.all(
      addresses.map((a) =>
        saveSingleContractFilesToFs(fs, apiName, a, {
          prefix: a + "/",
          allowProxies: false,
          includeMainInfo: true,
        })
      )
    );
    return {
      entries: results.flatMap((r) => r.entries),
      mainFile: results[0].mainFile,
      contractName: results[0].contractName,
    };
  }
  return saveSingleContractFilesToFs(fs, apiName, address, {
    allowProxies: true,
    includeMainInfo: false,
  });
}

async function saveSingleContractFilesToFs(
  fs: FileSystem,
  apiName: explorer.ApiName,
  address: string,
  options: {
    prefix?: string;
    allowProxies: boolean;
    includeMainInfo: boolean;
  }
) {
  let result: explorer.FetchFilesResult;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (IS_ONLINE) {
    result = await explorer.fetchFiles(apiName, address, {
      proxyDepth: options.allowProxies ? undefined : 0,
      skipPrefix: !!options.prefix,
    });
  } else {
    result = fixtures.etherscanResult;
  }

  const withPrefix = (file: string) =>
    options.prefix ? options.prefix + file : file;

  const entries = Object.entries(result.files);
  for (const [path, content] of entries) {
    fs.writeFile(withPrefix(path), content);
  }

  const mainFile = getMainContractFile(entries, result.info);

  if (options.includeMainInfo) {
    fs.writeFile(withPrefix("main.md"), `Main file: ${mainFile}`);
  }

  return {
    entries,
    mainFile: withPrefix(mainFile),
    contractName: result.info.ContractName ?? "contract",
  };
}

function getMainContractFile(
  files: [string, string][],
  info: explorer.FetchFilesResult["info"]
): string {
  const ext = fileExtension(info);
  const name = info.implementation?.ContractName ?? info.ContractName;

  let fileToShow = files.find(([path]) => path.endsWith(`/${name}${ext}`));

  if (!fileToShow) {
    const regexp = new RegExp(`contract\\s+${name}`);
    fileToShow = files.find(([path, source]) => regexp.test(source));
  }

  if (!fileToShow) fileToShow = files.sort(byPathLength)[0];

  return fileToShow[0];
}

async function showTextDocument(path: string) {
  // We're trying to open the file even if it doesn't exist yet.
  // Because the following seems to be very slow:
  // // onFileChangeOnce(
  // //   context,
  // //   fs,
  // //   mainFile,
  // //   (e) => void showTextDocument(e.uri.path)
  // // );
  // It's causing some errors in the console, but in the end it provides better UX.
  await window.showTextDocument(
    Uri.from({ scheme: "memfs", path: "/" + path })
  );
  await commands.executeCommand(
    "workbench.files.action.showActiveFileInExplorer"
  );
}

const byPathLength = (
  a: [string, ...unknown[]],
  b: [string, ...unknown[]]
): number => b[0].split("/").length - a[0].split("/").length;

// A note for later?
// function _onFileChangeOnce(
//   context: vscode.ExtensionContext,
//   fs: FileSystem,
//   path: string,
//   callback: (file: vscode.FileChangeEvent) => void
// ) {
//   const disposable = fs.onDidChangeFile((events) => {
//     const event = events.find((event) => event.uri.path === path);
//     if (event) {
//       callback(event);
//       disposable.dispose();
//       context.subscriptions.splice(context.subscriptions.indexOf(disposable));
//     }
//   });

//   context.subscriptions.push(disposable);
// }
