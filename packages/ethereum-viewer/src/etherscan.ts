import { assert, StrictOmit } from "ts-essentials";

import { fetch } from "./util/fetch";
import { prettyStringify } from "./util/stringify";

const ETHERSCAN_API_KEY = "862Y3WJ4JB4B34PZQRFEV3IK6SZ8GNR9N5";

export async function fetchFiles(
  network: Network,
  contractAddress: string
): Promise<FetchFilesResult> {
  const api = `https://api${
    network === "mainnet" ? "" : `-${network}`
  }.etherscan.io/api`;

  const url = `${api}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;

  const response = (await fetch(url)) as Etherscan.ContractSourceResponse;

  assert(
    response.message === "OK",
    "Failed to fetch contract source\n" + prettyStringify(response)
  );

  const data = response.result[0];

  // `.SourceCode` is apparently JSON surrounded with one set of curly braces
  let sourceCode = JSON.parse(
    data.SourceCode.slice(1, -1)
  ) as Etherscan.ContractSources;

  const files: FileContents = {
    "settings.json": prettyStringify(
      sourceCode.settings,
      // @ts-expect-error bad types
      { space: "  " }
    ),
  };

  for (const [path, { content }] of Object.entries(sourceCode.sources)) {
    files[path] = content;
  }

  const info = data as FetchFilesResult["info"];
  delete (info as Partial<Etherscan.ContractInfo>).ABI;
  delete (info as Partial<Etherscan.ContractInfo>).SourceCode;

  if (data.Implementation) {
    const implementation = await fetchFiles(network, data.Implementation);
    Object.assign(files, implementation.files);
    info.implementation = implementation.info;
  }

  return { files, info };
}

export interface FetchFilesResult {
  files: FileContents;
  info: ContractInfo & { implementation?: ContractInfo };
}

export interface ContractInfo
  extends StrictOmit<
    Etherscan.ContractInfo,
    "SourceCode" | "ABI" | "Implementation"
  > {}

export interface FileContents extends Record<FilePath, FileContent> {}

export type FilePath = string & { __brand?: "Path" };

export type FileContent = string & { __brand?: "FileContent" };

export type Network = "mainnet" | "ropsten" | "rinkeby" | "kovan" | "goerli";

declare namespace Etherscan {
  interface ContractSourceResponse {
    message: string;
    result: Etherscan.ContractInfo[];
  }

  interface ContractInfo {
    SourceCode: string;
    ABI: string;
    ContractName: string;
    CompilerVersion: string;
    OptimizationUsed: string;
    Runs: string;
    ConstructorArguments: string;
    EVMVersion: string;
    Library: string;
    LicenseType: string;
    Proxy: string;
    Implementation: string;
    SwarmSource: string;
  }

  interface ContractSources {
    language: string;
    settings: {
      evmVersion: string;
      libraries: string[];
      metadata: object;
      optimizer: object;
      outputSelection: object;
      remappings: string[];
    };
    sources: Record<FilePath, File>;
  }

  type File = { content: FileContent };

  type Abi = object[];
}
