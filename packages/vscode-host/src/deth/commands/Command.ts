import type * as workbench from "vs/workbench/workbench.web.api";
import { EthViewerCommands } from "./ethViewerCommands";

export type CommandId = `dethcrypto.vscode-host.${string}`;

export const CommandId = (id: keyof EthViewerCommands): CommandId =>
  `dethcrypto.vscode-host.${id}`;

export interface Command extends workbench.ICommand {
  id: CommandId;
}
