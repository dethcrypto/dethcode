import { join } from "path";
import { assert, StrictOmit } from "ts-essentials";

import { fetch as _fetch } from "../util/fetch";
import { prettyStringify } from "../util/stringify";
import { ApiName, explorerApiKeys, explorerApiUrls } from "./networks";

export async function fetchFiles(
  apiName: ApiName,
  contractAddress: string,
  fetch: typeof _fetch = _fetch
): Promise<FetchFilesResult> {
  const apiUrl = explorerApiUrls[apiName];
  const url =
    apiUrl +
    "?module=contract" +
    "&action=getsourcecode" +
    `&address=${contractAddress}` +
    `&apikey=${explorerApiKeys[apiName]}`;

  const response = (await fetch(url)) as Etherscan.ContractSourceResponse;

  assert(
    response.message === "OK",
    "Failed to fetch contract source\n" + prettyStringify(response)
  );

  const {
    SourceCode: sourceCode,
    ABI: abi,
    Implementation: implementationAddr,
    ..._info
  } = response.result[0];

  const info: FetchFilesResult["info"] = _info;

  let files: FileContents = {};

  // if there is more than one file, `.SourceCode` is JSON surrounded with one
  // set of curly braces
  const isFlattened = !sourceCode.startsWith("{");

  if (!info.ContractName && abi === "Contract source code not verified") {
    return {
      files: {
        "error.md": contractNotVerifiedErrorMsg(apiName, contractAddress),
      },
      info,
    };
  }

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
    const implementation = await fetchFiles(apiName, implementationAddr);
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

export declare namespace Etherscan {
  interface ContractSourceResponse {
    status: "1" | "0";
    message: string;
    result: Etherscan.ContractInfo[];
  }

  type UnverifiedSourceCode = "";
  type MultipleSourceCodes = `{}`;
  type FlattenedSourceCode = FileContent;

  interface ContractInfo {
    SourceCode:
      | MultipleSourceCodes
      | FlattenedSourceCode
      | UnverifiedSourceCode;
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

function contractNotVerifiedErrorMsg(
  apiName: ApiName,
  contractAddress: string
) {
  const websiteUrl = apiUrlToWebsite(explorerApiUrls[apiName]);
  return `\
Oops! It seems this contract source code is not verified on ${websiteUrl}.

Take a look at ${websiteUrl}/address/${contractAddress}.
`;
}

function apiUrlToWebsite(url: string) {
  // This is a bit of a hack, but they all have the same URL scheme.
  return url
    .replace("//api.", "//")
    .replace("//api-", "//")
    .replace(/\/api$/, "");
}
