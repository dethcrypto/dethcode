/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from "assert";
import {
  CancellationTokenSource,
  Progress,
  Range,
  TextSearchOptions,
  TextSearchResult,
  Uri,
} from "vscode";

import {
  fixNewline,
  MemFSTextSearchProvider,
  // fixRegexNewline,
} from "./textSearchProvider";

describe(MemFSTextSearchProvider.name, () => {
  // @todo tests for fixRegexNewline
  // @todo tests for TextSearchProvider

  const textSearchOptions: TextSearchOptions = {
    maxResults: 10,
    excludes: [],
    includes: [],
    folder: Uri.parse("memfs:///"),
    useIgnoreFiles: false,
    followSymlinks: true,
    useGlobalIgnoreFiles: true,
  };

  it("provides expected search results", async () => {
    const files: ConstructorParameters<typeof MemFSTextSearchProvider>[0] = [
      [
        "a.txt",
        `\
line one
line two
line three
`,
      ],
      [
        "b.txt",
        `\
first line in the second file
there are two lines in this file
`,
      ],
    ];

    let { progress, actual, provider } = setupProvider(files);

    let searchComplete = provider.provideTextSearchResults(
      { pattern: "one" },
      textSearchOptions,
      progress,
      new CancellationTokenSource().token
    );

    let expected: TextSearchResult[] = [
      {
        uri: Uri.parse("memfs:///a.txt"),
        ranges: [new Range(0, 5, 0, 8)],
        preview: {
          text: "line one",
          matches: [new Range(0, 5, 0, 8)],
        },
      },
    ];

    // we actually don't need strict-equal here, we'd be fine with same elements in different order
    assert.deepStrictEqual(await searchComplete, { limitHit: false });
    assert.deepStrictEqual(actual, expected);

    ({ progress, actual, provider } = setupProvider(files));

    searchComplete = provider.provideTextSearchResults(
      { pattern: "line" },
      textSearchOptions,
      progress,
      new CancellationTokenSource().token
    );

    expected = [
      {
        uri: Uri.parse("memfs:///a.txt"),
        ranges: [new Range(0, 0, 0, 4)],
        preview: {
          text: "line one",
          matches: [new Range(0, 0, 0, 4)],
        },
      },
      {
        uri: Uri.parse("memfs:///a.txt"),
        ranges: [new Range(1, 0, 1, 4)],
        preview: {
          text: "line two",
          matches: [new Range(0, 0, 0, 4)],
        },
      },
      {
        uri: Uri.parse("memfs:///a.txt"),
        ranges: [new Range(2, 0, 2, 4)],
        preview: {
          text: "line three",
          matches: [new Range(0, 0, 0, 4)],
        },
      },
      {
        uri: Uri.parse("memfs:///b.txt"),
        ranges: [new Range(0, 6, 0, 10)],
        preview: {
          text: "first line in the second file",
          matches: [new Range(0, 6, 0, 10)],
        },
      },
      {
        uri: Uri.parse("memfs:///b.txt"),
        ranges: [new Range(1, 14, 1, 18)],
        preview: {
          text: "there are two lines in this file",
          matches: [new Range(0, 14, 0, 18)],
        },
      },
    ];

    assert.deepStrictEqual(await searchComplete, { limitHit: false });
    assert.deepStrictEqual(actual, expected);
  });

  it("returns `limitHit: true` if results exceed `maxResults` given RegExp pattern", async () => {
    const str = "1 2 3 4";
    const { progress, actual, provider } = setupProvider([["a.txt", str]]);

    const searchComplete = provider.provideTextSearchResults(
      { pattern: "\\d", isRegExp: true },
      { ...textSearchOptions, maxResults: 2 },
      progress,
      new CancellationTokenSource().token
    );

    assert.deepStrictEqual(await searchComplete, { limitHit: true });
    assert.deepStrictEqual(actual, [
      {
        uri: Uri.parse("memfs:///a.txt"),
        ranges: [new Range(0, 0, 0, 1), new Range(0, 2, 0, 3)],
        preview: {
          text: str,
          matches: [new Range(0, 0, 0, 1), new Range(0, 2, 0, 3)],
        },
      },
    ]);
  });

  it("returns `limitHit: true` if results exceed `maxResults` given string pattern", async () => {
    const str = "\n0 0 0 0";
    const { progress, actual, provider } = setupProvider([["a.txt", str]]);

    const searchComplete = provider.provideTextSearchResults(
      { pattern: "0" },
      { ...textSearchOptions, maxResults: 3 },
      progress,
      new CancellationTokenSource().token
    );

    assert.deepStrictEqual(await searchComplete, { limitHit: true });
    const ranges = stringifyResults(actual);
    assert.deepStrictEqual(ranges, [
      "/a.txt 1,0-1,1",
      "/a.txt 1,2-1,3",
      "/a.txt 1,4-1,5",
    ]);
  });

  describe(fixNewline.name, () => {
    it("adds optional \\r before \\n in pattern", () => {
      function testFixNewline([
        inputReg,
        testStr,
        shouldMatch = true,
      ]: readonly [string, string, boolean?]): void {
        const fixed = fixNewline(inputReg);
        const reg = new RegExp(fixed);
        assert.strictEqual(
          reg.test(testStr),
          shouldMatch,
          `${inputReg} => ${reg}, ${testStr}, ${shouldMatch}`
        );
      }

      (
        [
          ["foo", "foo"],

          ["foo\n", "foo\r\n"],
          ["foo\n", "foo\n"],
          ["foo\nabc", "foo\r\nabc"],
          ["foo\nabc", "foo\nabc"],
          ["foo\r\n", "foo\r\n"],

          ["foo\nbarc", "foobar", false],
          ["foobar", "foo\nbar", false],
        ] as const
      ).forEach(testFixNewline);
    });
  });
});

function setupProvider(
  ...args: ConstructorParameters<typeof MemFSTextSearchProvider>
) {
  let actual: TextSearchResult[] = [];
  const progress: Progress<TextSearchResult> = {
    report: (result) => {
      actual.push(result);
    },
  };

  const provider = new MemFSTextSearchProvider(...args);

  return { progress, actual, provider };
}

function stringifyResults(actual: TextSearchResult[]) {
  return actual.flatMap((r) =>
    "ranges" in r
      ? (Array.isArray(r.ranges) ? r.ranges : [r.ranges]).map(
          (range) => `${r.uri.path} ${stringifyRange(range)}`
        )
      : []
  );
}

const stringifyRange = (range: Range) =>
  `${range.start.line},${range.start.character}-${range.end.line},${range.end.character}`;
