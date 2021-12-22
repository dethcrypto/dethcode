import { expect } from "earljs";

import { explorerApiUrls } from "../ethereum-viewer/src/explorer/networks";
import { apiUrlToWebsite } from "../ethereum-viewer/src/explorer/apiUrlToWebsite";
import { ethViewerCommands } from "../vscode-host/src/deth/commands/ethViewerCommands";
import { givenUrl } from "../vscode-host/src/test/test-utils";
import { toDethNet } from "./bookmarklet";

describe(`bookmarklet: ${toDethNet.name}`, () => {
  const websiteUrls = Object.values(explorerApiUrls).map(
    (url) =>
      apiUrlToWebsite(url) +
      "/address/0x0000000000000000000000000000000000000000"
  );

  it("returns hostname ending with deth.net", () => {
    const urls = websiteUrls.map(toDethNet);
    for (const actual of urls) {
      expect(actual).toEqual(expect.stringMatching(/\.deth\.net\//));
    }
  });

  it("preserves contract address", () => {
    const urls = websiteUrls.map(toDethNet);
    for (const actual of urls) {
      expect(actual).toEqual(expect.stringMatching(/address\/0x[0-9a-f]{40}/));
    }

    const address = `0x${Math.floor(
      Math.random() * 10 ** Math.floor(Math.log10(Number.MAX_SAFE_INTEGER))
    )}`.padEnd(42, "0");

    expect(toDethNet(`https://etherscan.io/address/${address}`)).toEqual(
      `https://etherscan.deth.net/address/${address}`
    );
  });

  it("preserves explorer api name for all explorers", () => {
    for (const apiName of Object.keys(explorerApiUrls)) {
      const websiteUrl =
        apiUrlToWebsite(
          explorerApiUrls[apiName as keyof typeof explorerApiUrls]
        ) + "/address/0x0000000000000000000000000000000000000000";

      const ecvUrl = toDethNet(websiteUrl);

      givenUrl(ecvUrl);
      expect(ethViewerCommands.getApiName()).toEqual(apiName);
    }
  });
});
