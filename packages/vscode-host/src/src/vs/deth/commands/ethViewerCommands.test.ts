import { expect } from "earljs";
import { givenUrl } from "../../../../test/test-utils";

import { ethViewerCommands } from "./getCommands";

describe("ethViewerCommands", () => {
  const { getApiName, getContractAddress } = ethViewerCommands;

  describe(getApiName.name, () => {
    it("reads API name from 'explorer' search param", () => {
      givenUrl(
        "https://localhost:1234/0x1234567890123456789012345678901234567890?explorer=etherscan"
      );

      expect(getApiName()).toEqual("etherscan");
    });

    it("reads the address right after first slash", () => {
      givenUrl(
        "https://etherscan.deth.net/0xe9e7cea3dedca5984780bafc599bd69add087d56"
      );

      expect(getContractAddress()).toEqual(
        "0xe9e7cea3dedca5984780bafc599bd69add087d56"
      );
    });

    it("ignores trailing slash after address", () => {
      givenUrl(
        "https://ethereum-code-viewer-q6izia4ey-dethcrypto.vercel.app/token/0xda10009cbd5d07dd0cecc66161fc93d7c9000da1/?explorer=optimistic.etherscan"
      );

      expect(getContractAddress()).toEqual(
        "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
      );
    });
  });
});
