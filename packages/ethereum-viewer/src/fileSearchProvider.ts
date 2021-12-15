import { matchSorter } from "match-sorter";
import {
  CancellationToken,
  Disposable,
  FileSearchOptions,
  FileSearchProvider,
  FileSearchQuery,
  ProviderResult,
  Uri,
} from "vscode";

export class StaticFileSearchProvider
  implements FileSearchProvider, Disposable
{
  static scheme = "github1s";
  private readonly disposable?: Disposable;

  // HACK: We don't support searching for added files.
  constructor(private filePaths: string[]) {}

  dispose() {
    this.disposable?.dispose();
  }

  provideFileSearchResults(
    query: FileSearchQuery,
    _options: FileSearchOptions,
    _token: CancellationToken
  ): ProviderResult<Uri[]> {
    return matchSorter(this.filePaths, query.pattern).map((path) =>
      Uri.from({ scheme: "memfs", path: path })
    );
  }
}
