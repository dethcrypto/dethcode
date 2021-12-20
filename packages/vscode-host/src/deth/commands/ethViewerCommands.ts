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
    if (path.startsWith("token/")) path = path.slice(6);
    if (path.endsWith("/")) path = path.slice(0, -1);

    return path.startsWith("0x") ? path : null;
  },
  getApiName: (): string | null => {
    const { hostname } = window.location;

    if (hostname.endsWith(".deth.net")) return hostname.slice(0, -9);

    return new URLSearchParams(window.location.search).get("explorer");
  },
  openRepoOnGithub: () => {
    window.open("https://github.com/dethcrypto/ethereum-code-viewer", "_blank");
  },
};

export type EthViewerCommands = typeof ethViewerCommands;

export type ExecuteHostCommand = UnionToIntersection<
  {
    [K in keyof EthViewerCommands]: (
      command: K,
      ...args: Parameters<EthViewerCommands[K]>
    ) => Thenable<ReturnType<EthViewerCommands[K]>>;
  }[keyof EthViewerCommands]
>;

export declare type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
