import stringify from "fast-json-stable-stringify";
import { assert } from "ts-essentials";

import { fetch } from "./util/fetch";

const ETHERSCAN_API_KEY = "862Y3WJ4JB4B34PZQRFEV3IK6SZ8GNR9N5";

export async function fetchFiles(
  network: Network,
  contractAddress: string
): Promise<FlatFileSystem> {
  const api = `https://api${
    network === "mainnet" ? "" : `-${network}`
  }.etherscan.io/api`;

  const url = `${api}?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;

  const response = (await fetch(url)) as Etherscan.ContractSourceResponse;

  assert(
    response.message === "OK",
    "Failed to fetch contract source\n" + stringify(response)
  );

  // @todo no idea why res.result is an array.
  const data = response.result[0];

  // `.SourceCode` is apparently JSON surrounded with one set of curly braces
  let sourceCode = JSON.parse(
    data.SourceCode.slice(1, -1)
  ) as Etherscan.ContractSources;

  const results: FlatFileSystem = {
    "settings.json": stringify(sourceCode.settings),
  };

  for (const [path, { content }] of Object.entries(sourceCode.sources)) {
    results[path] = content;
  }

  return results;
}

export interface FlatFileSystem extends Record<FilePath, FileContent> {}

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
