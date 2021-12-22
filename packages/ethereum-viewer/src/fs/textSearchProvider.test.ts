/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from "assert";

import {
  fixNewline,
  MemFSTextSearchProvider,
  // fixRegexNewline,
} from "./textSearchProvider";

describe(MemFSTextSearchProvider.name, () => {
  // @todo tests for fixRegexNewline
  // @todo tests for TextSearchProvider

  it("fixNewline - matching", () => {
    function testFixNewline([inputReg, testStr, shouldMatch = true]: readonly [
      string,
      string,
      boolean?
    ]): void {
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
