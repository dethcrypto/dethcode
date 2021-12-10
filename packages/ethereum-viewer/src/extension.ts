import stringify from "fast-json-stable-stringify";
import * as vscode from "vscode";

import * as etherscan from "./etherscan";
import { MemFS } from "./fileSystemProvider";

export function activate(context: vscode.ExtensionContext) {
  const fs = new MemFS();
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("memfs", fs, {
      isCaseSensitive: true,
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ethereum-viewer.helloWorld", async () => {
      const files = await etherscan.fetchFiles(
        "mainnet",
        "0x99c9fc46f92e8a1c0dec1b1747d010903e884be1"
      );

      // await Promise.all(
      //   Object.entries(files).map(([path, content]) =>
      //     // vscode.workspace.fs.writeFile(
      //     //   vscode.Uri.parse(`memfs://${path}`),
      //     //   new TextEncoder().encode(content)
      //     // )
      //   )
      // );

      const encoder = new TextEncoder();
      for (const [filepath, content] of Object.entries(files)) {
        console.log(
          "WRITING",
          filepath,
          content,
          "uri=",
          vscode.Uri.from({
            scheme: "memfs",
            path: filepath,
          })
        );

        fs.writeFile(
          vscode.Uri.from({
            scheme: "memfs",
            path: filepath,
          }),
          encoder.encode(content),
          {
            create: true,
            overwrite: true,
          }
        );
      }

      void vscode.window.showInformationMessage(stringify(files));
    })
  );
}

export function deactivate() {}
