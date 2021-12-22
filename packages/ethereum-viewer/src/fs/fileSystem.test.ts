import { strictEqual } from "assert";

import { FileSystem } from "./fileSystem";

describe(FileSystem.name, () => {
  it("creates file", () => {
    const fs = FileSystem();
    fs.writeFile("test.txt", "test");

    strictEqual(fs.readFile("test.txt"), "test");
  });

  it("creates file and directories leading to it", () => {
    const fs = FileSystem();
    fs.writeFile("a/b/c/d/test-2.txt", "woop");

    strictEqual(fs.readFile("a/b/c/d/test-2.txt"), "woop");
  });
});
