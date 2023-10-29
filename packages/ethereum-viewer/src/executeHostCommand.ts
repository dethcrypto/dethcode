import * as vscode from "vscode";

export const executeHostCommand = (command: any, ...args: any[]) =>
  vscode.commands.executeCommand<any>(
    `dethcrypto.vscode-host.${command}`,
    ...args
  );
