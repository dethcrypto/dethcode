import { assert } from "ts-essentials";
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';

describe("Web Extension Test Suite", () => {
  void vscode.window.showInformationMessage("Start all tests.");

  it("Sample test", () => {
    assert(-1 === [1, 2, 3].indexOf(5));
    assert(-1 === [1, 2, 3].indexOf(0));
  });
});
