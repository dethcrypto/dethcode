import { join } from "path";
import { assert, StrictOmit } from "ts-essentials";

import { fetch as _fetch } from "../util/fetch";
import { makeSolidFetch } from "../util/solidFetch";
import { prettyStringify } from "../util/stringify";
import * as types from "./api-types";
import { apiUrlToWebsite } from "./apiUrlToWebsite";
import { fileExtension } from "./fileExtension";
import { ApiName, explorerApiKeys, explorerApiUrls } from "./networks";

const fetchEtherscanResponse = makeSolidFetch({
  async verifyResponse(response: unknown): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (response as any)?.message === "OK" || false;
  },
});

interface FetchFilesOptions {
  /**
   * For unit testing.
   * @internal
   */
  fetch?: typeof _fetch;
  /**
   * If more than 0, we fetch implementation contract and merge its files.
   */
  proxyDepth?: number;
  /**
   * If true multiple files are not prefixed.
   */
  skipPrefix?: boolean;
}

export async function fetchFiles(
  apiName: ApiName,
  contractAddress: string,
  {
    fetch = fetchEtherscanResponse,
    proxyDepth = 3,
    skipPrefix = false,
  }: FetchFilesOptions = {}
): Promise<FetchFilesResult> {
  const apiUrl = explorerApiUrls[apiName];
  const url =
    apiUrl +
    "?module=contract" +
    "&action=getsourcecode" +
    `&address=${contractAddress}` +
    `&apikey=${explorerApiKeys[apiName]}`;

  const response = (await fetch(url)) as types.ContractSourceResponse;

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

  if (
    !sourceCode ||
    (!info.ContractName && abi === "Contract source code not verified")
  ) {
    return {
      files: {
        "error.md": contractNotVerifiedErrorMsg(apiName, contractAddress),
      },
      info,
    };
  }

  if (types.sourceHasSettings(sourceCode)) {
    let parsed = types.parseSourceCode(sourceCode);

    files["settings.json"] = prettyStringify(parsed.settings);

    for (const [path, { content }] of Object.entries(parsed.sources)) {
      files[path] = content;
    }

    if (!skipPrefix) files = prefixFiles(files, info.ContractName);
  } else if (types.sourceHasMultipleFiles(sourceCode)) {
    const parsed = types.parseSourceCode(sourceCode);

    for (const [path, { content }] of Object.entries(parsed)) {
      files[path] = content;
    }

    if (!skipPrefix) files = prefixFiles(files, info.ContractName);
  } else {
    files[info.ContractName + fileExtension(info)] = sourceCode;
  }

  if (
    implementationAddr &&
    proxyDepth > 0 &&
    implementationAddr !== contractAddress
  ) {
    const implementation = await fetchFiles(apiName, implementationAddr, {
      fetch,
      proxyDepth: proxyDepth - 1,
    });

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
  info: ContractInfoWithImplementation;
}

export interface ContractInfoWithImplementation extends ContractInfo {
  implementation?: ContractInfo;
}

export interface ContractInfo
  extends StrictOmit<
    types.ContractInfo,
    "SourceCode" | "ABI" | "Implementation"
  > {}

export interface FileContents
  extends Record<types.FilePath, types.FileContent> {}

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
