import { join } from "path";
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

  const {
    SourceCode: sourceCode,
    ABI: _abi,
    Implementation: implementationAddr,
    ..._info
  } = response.result[0];

  const info: FetchFilesResult["info"] = _info;

  let files: FileContents = {};

  // if there is more than one file, `.SourceCode` is JSON surrounded with one
  // set of curly braces
  const isFlattened = !sourceCode.startsWith("{");

  if (isFlattened) {
    files[info.ContractName + ".sol"] = sourceCode;
  } else {
    let parsed = JSON.parse(
      sourceCode.slice(1, -1)
    ) as Etherscan.ContractSources;

    files["settings.json"] = prettyStringify(parsed.settings);

    for (const [path, { content }] of Object.entries(parsed.sources)) {
      files[path] = content;
    }

    files = prefixFiles(files, info.ContractName);
  }

  if (implementationAddr) {
    const implementation = await fetchFiles(network, implementationAddr);
    Object.assign(
      files,
      prefixFiles(implementation.files, implementation.info.ContractName)
    );
    info.implementation = implementation.info;
  }

  return { files, info };
}

function prefixFiles(files: FileContents, prefix: string): FileContents {
  const res: any = {};

  const keys = Object.keys(files);

  for (const k of keys) {
    res[join(prefix, k)] = files[k];
  }

  return res;
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

  type MultipleSourceCodes = `{${string}}`;
  type FlattenedSourceCode = `//${string}}`;

  interface ContractInfo {
    SourceCode: MultipleSourceCodes | FlattenedSourceCode;
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
