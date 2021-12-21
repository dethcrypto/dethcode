import * as vscode from "vscode";

import type {
  ExecuteHostCommand,
  // @ts-ignore - this import won't exist at runtime, we're using it only for better DX
} from "../../vscode-host/src/deth/commands/ethViewerCommands";

export const executeHostCommand: ExecuteHostCommand = (command, ...args) =>
  vscode.commands.executeCommand<any>(
    `dethcrypto.vscode-host.${command}`,
    ...args
  );
