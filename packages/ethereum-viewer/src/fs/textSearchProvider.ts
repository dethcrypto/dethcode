import {
  CancellationToken,
  Disposable,
  Progress,
  ProviderResult,
  Range,
  TextSearchComplete,
  TextSearchMatch,
  TextSearchOptions,
  TextSearchProvider,
  TextSearchQuery,
  TextSearchResult,
  Uri,
} from "vscode";

export class MemFSTextSearchProvider implements TextSearchProvider, Disposable {
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
  ): ProviderResult<TextSearchComplete> {
    const limit = new Limit(options.maxResults || Infinity);

    // @todo handle options.includes, options.folder and options.excludes
    // @todo handle all options on query
    for (const [path, content] of this.files) {
      const uri = Uri.from({ scheme: "memfs", path: "/" + path });
      searchInFile(query, options, progress, uri, content, limit);
      if (limit.isHit()) break;
    }

    return { limitHit: limit.isHit() };
  }
}

function searchInFile(
  query: TextSearchQuery,
  _options: TextSearchOptions,
  progress: Progress<TextSearchResult>,
  uri: Uri,
  content: string,
  limit: Limit
): void {
  let { pattern } = query;

  const originalLines = content.split("\n");

  if (!query.isCaseSensitive) {
    content = content.toLowerCase();
    pattern = pattern.toLowerCase();
  }

  const lines = content.split("\n");

  for (
    let lineIndex = 0;
    lineIndex < lines.length && !limit.isHit();
    lineIndex++
  ) {
    const line = lines[lineIndex];
    const matches: TextSearchMatch[] = [];

    if (query.isRegExp) {
      const regex = new RegExp(fixNewline(pattern), "g");

      let hits = Array.from(line.matchAll(regex)).filter(hasIndex);
      if (!hits.length) continue;

      limit.increase(hits.length);
      if (limit.isHit()) {
        hits = hits.slice(0, limit.max - limit.current());
      }

      matches.push({
        uri,
        ranges: hits.map(
          (hit) =>
            new Range(
              lineIndex,
              hit.index,
              lineIndex,
              hit.index + hit[0].length
            )
        ),
        preview: {
          text: originalLines[lineIndex],
          matches: hits.map(
            (hit) => new Range(0, hit.index, 0, hit.index + hit[0].length)
          ),
        },
      });
    } else {
      let indices = getIndicesOf(pattern, line);
      if (!indices.length) continue;

      limit.increase(indices.length);
      if (limit.isHit()) {
        indices = indices.slice(0, limit.max - limit.current());
      }

      matches.push({
        uri,
        ranges: indices.map(
          (index) =>
            new Range(lineIndex, index, lineIndex, index + pattern.length)
        ),
        preview: {
          text: originalLines[lineIndex],
          matches: indices.map(
            (index) => new Range(0, index, 0, index + pattern.length)
          ),
        },
      });
    }

    matches.forEach((m) => {
      progress.report(m);
    });
  }
}

class Limit {
  private _current: number;
  constructor(public readonly max: number) {
    this._current = 0;
  }

  isHit() {
    return this._current >= this.max;
  }

  increase(value: number) {
    this._current += value;
  }

  public current() {
    return this._current;
  }
}

function hasIndex(
  hit: RegExpMatchArray
): hit is RegExpMatchArray & { index: number } {
  return hit.index !== undefined;
}

function getIndicesOf(pattern: string, text: string) {
  let startIndex = 0;
  let index: number;
  let indices = [];

  while ((index = text.indexOf(pattern, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + 1;
  }

  return indices;
}

/**
 * Replaces _actual newline_ in the pattern with escaped newline.
 */
export function fixNewline(pattern: string): string {
  return pattern.replace(/\n/g, "\\r?\\n");
}

// @todo VSCode RipgrepTextSearchProvider fixes regex with the following code
// export function fixRegexNewline(pattern: string): string {
// 	// we parse the pattern anew each tiem
// 	let re: ReAST.Pattern;
// 	try {
// 		re = new RegExpParser().parsePattern(pattern);
// 	} catch {
// 		return pattern;
// 	}

// 	let output = '';
// 	let lastEmittedIndex = 0;
// 	const replace = (start: number, end: number, text: string) => {
// 		output += pattern.slice(lastEmittedIndex, start) + text;
// 		lastEmittedIndex = end;
// 	};

// 	const context: ReAST.Node[] = [];
// 	const visitor = new RegExpVisitor({
// 		onCharacterEnter(char) {
// 			if (char.raw !== '\\n') {
// 				return;
// 			}

// 			const parent = context[0];
// 			if (!parent) {
// 				// simple char, \n -> \r?\n
// 				replace(char.start, char.end, '\\r?\\n');
// 			} else if (context.some(isLookBehind)) {
// 				// no-op in a lookbehind, see #100569
// 			} else if (parent.type === 'CharacterClass') {
// 				if (parent.negate) {
// 					// negative bracket expr, [^a-z\n] -> (?![a-z]|\r?\n)
// 					const otherContent = pattern.slice(parent.start + 2, char.start) + pattern.slice(char.end, parent.end - 1);
// 					replace(parent.start, parent.end, '(?!\\r?\\n' + (otherContent ? `|[${otherContent}]` : '') + ')');
// 				} else {
// 					// positive bracket expr, [a-z\n] -> (?:[a-z]|\r?\n)
// 					const otherContent = pattern.slice(parent.start + 1, char.start) + pattern.slice(char.end, parent.end - 1);
// 					replace(parent.start, parent.end, otherContent === '' ? '\\r?\\n' : `(?:[${otherContent}]|\\r?\\n)`);
// 				}
// 			} else if (parent.type === 'Quantifier') {
// 				replace(char.start, char.end, '(?:\\r?\\n)');
// 			}
// 		},
// 		onQuantifierEnter(node) {
// 			context.unshift(node);
// 		},
// 		onQuantifierLeave() {
// 			context.shift();
// 		},
// 		onCharacterClassRangeEnter(node) {
// 			context.unshift(node);
// 		},
// 		onCharacterClassRangeLeave() {
// 			context.shift();
// 		},
// 		onCharacterClassEnter(node) {
// 			context.unshift(node);
// 		},
// 		onCharacterClassLeave() {
// 			context.shift();
// 		},
// 		onAssertionEnter(node) {
// 			if (isLookBehind(node)) {
// 				context.push(node);
// 			}
// 		},
// 		onAssertionLeave(node) {
// 			if (context[0] === node) {
// 				context.shift();
// 			}
// 		},
// 	});

// 	visitor.visit(re);
// 	output += pattern.slice(lastEmittedIndex);
// 	return output;
// }
