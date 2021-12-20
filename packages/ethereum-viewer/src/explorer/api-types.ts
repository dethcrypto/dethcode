export type FilePath = string & { __brand?: "Path" };

export type FileContent = string & { __brand?: "FileContent" };

export type File = { content: FileContent };

export interface ContractSourceResponse {
  status: "1" | "0";
  message: string;
  result: ContractInfo[];
}

export declare namespace SourceCode {
  type Unverified = "";
  type MultipleSources = `{${string}}` & { __brand?: "MultipleSources" };
  type MultipleSourcesWithSettings = `{{${string}}}` & {
    __brand?: "MultipleSourcesWithSettings";
  };
  type Flattened = FileContent;
}

export type SourceCode =
  | SourceCode.MultipleSourcesWithSettings
  | SourceCode.MultipleSources
  | SourceCode.Flattened
  | SourceCode.Unverified;

export function sourceHasSettings(
  s: SourceCode
): s is SourceCode.MultipleSourcesWithSettings {
  return s.startsWith("{{");
}

export function sourceHasMulitpleFiles(
  s: SourceCode
): s is SourceCode.MultipleSources {
  return s.startsWith("{");
}

export function parseSourceCode(
  s: SourceCode.MultipleSourcesWithSettings
): ContractSourcesWithSettings;
export function parseSourceCode(s: SourceCode.MultipleSources): ContractSources;
export function parseSourceCode(
  s: SourceCode.MultipleSources | SourceCode.MultipleSourcesWithSettings
) {
  return JSON.parse(sourceHasSettings(s) ? s.slice(1, -1) : s);
}

export interface ContractInfo {
  SourceCode: SourceCode;

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

export interface ContractSources extends Record<FilePath, File> {}

export interface ContractSourcesWithSettings {
  language: string;
  settings: {
    evmVersion: string;
    libraries: string[];
    metadata: object;
    optimizer: object;
    outputSelection: object;
    remappings: string[];
  };
  sources: ContractSources;
}
