import { expect } from "earljs";
import { givenUrl } from "../test/test-utils";

import { ethViewerCommands } from "./commands";

describe("ethViewerCommands", () => {
  const { getApiName } = ethViewerCommands;

  describe(getApiName.name, () => {
    it("reads API name from subdomain in hostname", () => {
      givenUrl(
        "https://ropsten.etherscan.deth.net:8080/address/0x1234567890123456789012345678901234567890"
      );

      expect(getApiName()).toEqual("ropsten.etherscan");
    });

    it("reads API name from search params", () => {
      givenUrl(
        "https://localhost:1234/0x1234567890123456789012345678901234567890?api=etherscan"
      );

      expect(getApiName()).toEqual("etherscan");
    });
  });
});
