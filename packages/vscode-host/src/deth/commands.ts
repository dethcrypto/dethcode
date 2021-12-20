import type * as workbench from "vs/workbench/workbench.web.api";

export const ethViewerCommands = {
  getBrowserUrl: () => window.location.href,
  replaceBrowserUrl: (url: string) => window.location.replace(url),
  getContractAddress: (): string | null => {
    const url = new URL(window.location.href);

    // surge.sh doesn't seem to support rewrites, so we also read from search params.
    const fromSearchParams = url.searchParams.get("contract");
    if (fromSearchParams?.startsWith("0x")) return fromSearchParams;

    let path = url.pathname.slice(1);

    if (path.startsWith("address/")) path = path.slice(8);

    return path.startsWith("0x") ? path : null;
  },
  getApiName: (): string | null => {
    const { hostname } = window.location;

    if (hostname.endsWith(".deth.net")) return hostname.slice(0, -9);

    return new URLSearchParams(window.location.search).get("api");
  },
  openRepoOnGithub: () => {
    window.open("https://github.com/dethcrypto/ethereum-code-viewer", "_blank");
  },
};

type EthViewerCommands = typeof ethViewerCommands;

export type CommandId = `dethcrypto.vscode-host.${string}`;

export const CommandId = (id: keyof EthViewerCommands): CommandId =>
  `dethcrypto.vscode-host.${id}`;

export function getCommands(): readonly Command[] {
  return Object.entries(ethViewerCommands).map(([id, handler]) => ({
    id: CommandId(id as keyof EthViewerCommands),
    handler,
  }));
}

export type DethCommands = UnionToIntersection<
  {
    [K in keyof EthViewerCommands]: {
      executeCommand(
        command: K,
        ...args: Parameters<EthViewerCommands[K]>
      ): Thenable<ReturnType<EthViewerCommands[K]>>;
    };
  }[keyof EthViewerCommands]
>;

export interface Command extends workbench.ICommand {
  id: CommandId;
}

// Utility types

export declare type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
