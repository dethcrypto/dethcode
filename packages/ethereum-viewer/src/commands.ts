import * as vscode from "vscode";

// @ts-ignore
import { DethCommands } from "../../vscode-host/src/deth/command-types";

export const executeHostCommand: DethCommands["executeCommand"] = (
  command,
  ...args
) =>
  vscode.commands.executeCommand<any>(
    `dethcrypto.vscode-host.${command}`,
    ...args
  );
