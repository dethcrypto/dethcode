import { Command, CommandId } from "./Command";
import { EthViewerCommands, ethViewerCommands } from "./ethViewerCommands";

export { Command, CommandId, ethViewerCommands };

export function getCommands(): readonly Command[] {
  return Object.entries(ethViewerCommands).map(([id, handler]) => ({
    id: CommandId(id as keyof EthViewerCommands),
    handler,
  }));
}
