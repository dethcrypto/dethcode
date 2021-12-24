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

export interface OpenContractSourceArgs {
  fs: FileSystem;
  apiName: explorer.ApiName;
  address: string;
}

export async function openContractSource(
  context: ExtensionContext,
  args: OpenContractSourceArgs
) {
  const [entries, info] = await saveContractFilesToFs(args);

  const mainFile = getMainContractFile(entries, info);

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

  // We're trying to open the file even if it doesn't exist yet.
  await showTextDocument(mainFile);
  // Because the following seems to be very slow:
  // // onFileChangeOnce(
  // //   context,
  // //   fs,
  // //   mainFile,
  // //   (e) => void showTextDocument(e.uri.path)
  // // );
  // It's causing some errors in the console, but in the end it provides better UX.
}

async function saveContractFilesToFs({
  fs,
  address,
  apiName,
}: OpenContractSourceArgs) {
  let result: explorer.FetchFilesResult;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (IS_ONLINE) {
    result = await explorer.fetchFiles(apiName, address);
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
  info: explorer.FetchFilesResult["info"]
): string {
  const ext = fileExtension(info);

  let fileToShow =
    info.implementation &&
    files.find(([path]) =>
      path.endsWith(`/${info.implementation!.ContractName}${ext}`)
    );

  if (!fileToShow)
    fileToShow = files.find(([path]) =>
      path.endsWith(`/${info.ContractName}${ext}`)
    );

  if (!fileToShow) fileToShow = files.sort(byPathLength)[0];

  return fileToShow[0];
}

async function showTextDocument(path: string) {
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
