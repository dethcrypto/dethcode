import * as vscode from "vscode";

import { MemFS } from "./fileSystemProvider";

/**
 * Facade on top of MemFS file system provider for more convenient programmatic use.
 */
export const FileSystem = () => {
  const fs = new MemFS();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return {
    register() {
      return vscode.workspace.registerFileSystemProvider("memfs", fs, {
        isCaseSensitive: true,
      });
    },
    writeFile(path: string, content: string) {
      if (!path.startsWith("/")) path = "/" + path;

      // const uri = vscode.Uri.from({ scheme: "memfs", path: path });
      const uri = vscode.Uri.from({ scheme: "memfs", path: path });

      fs.writeFile(uri, encoder.encode(content), {
        create: true,
        overwrite: true,
      });
    },
    readFile(path: string): string {
      if (!path.startsWith("/")) path = "/" + path;

      const buffer = fs.readFile(
        vscode.Uri.from({ scheme: "memfs", path: path })
      );

      return decoder.decode(buffer);
    },
  };
};
