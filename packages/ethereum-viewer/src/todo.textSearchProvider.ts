import {
  CancellationToken,
  Disposable,
  Position,
  Progress,
  Range,
  TextSearchComplete,
  TextSearchOptions,
  TextSearchProvider,
  TextSearchQuery,
  TextSearchResult,
  Uri,
} from "vscode";

export class StaticTextSearchProvider
  implements TextSearchProvider, Disposable
{
  private readonly disposable?: Disposable;

  constructor(
    private readonly files: readonly [string /* key */, string /* contents */][]
  ) {}

  dispose() {
    this.disposable?.dispose();
  }

  provideTextSearchResults(
    query: TextSearchQuery,
    options: TextSearchOptions,
    progress: Progress<TextSearchResult>,
    _token: CancellationToken
  ): TextSearchComplete {
    const matchesQuery = (content: string) => {
      let pattern = query.pattern;

      if (!query.isCaseSensitive) {
        content = content.toLowerCase();
        pattern = pattern.toLowerCase();
      }

      if (query.isRegExp) return content.match(new RegExp(pattern));

      return content.includes(pattern);
    };

    // @todo handle options.includes and options.excludes
    // @todo handle all options on query
    const files = this.files.filter(([, content]) => matchesQuery(content));

    for (const [path, content] of files) {
      const lines = content.split("\n");
      const lineIndex = lines.findIndex(matchesQuery);
      const line = lines[lineIndex];
      if (line) {
        const lineNumber = lineIndex;
        console.log({ path, lineNumber, line })
        progress.report({
          uri: Uri.from({ scheme: "memfs", path: "/" + path }),
          lineNumber,
          text: line,
          ranges: [
            // This is really bad. I'm not handling column number at all.
            new Range(
              new Position(lineNumber, 0),
              new Position(lineNumber, line.length)
            ),
          ],
          preview: {
            text: line,
            matches: [
              new Range(
                new Position(lineNumber, 0),
                new Position(lineNumber, line.length)
              )
            ], 
          }
        });
      }
    }

    return { limitHit: files.length >= options.maxResults };
  }
}
