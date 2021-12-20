import { assert } from "ts-essentials";

import { fetchFiles } from "../explorer";
import { ContractSourceResponse } from "../explorer/api-types";
import type { fetch } from "../util/fetch";

describe(fetchFiles.name, () => {
  it("calls optimistic.etherscan", async () => {
    let url: string | undefined;
    const f: typeof fetch = async (_url): Promise<ContractSourceResponse> => {
      url = _url;
      return {
        status: "1",
        message: "OK",
        result: [
          {
            SourceCode:
              '// SPDX-License-Identifier: AGPL-3.0-or-later\r\n\r\n// Copyright (C) 2017, 2018, 2019 dbrock, rain, mrchico\r\n// Copyright (C) 2021 Dai Foundation\r\n\r\n// This program is free software: you can redistribute it and/or modify\r\n// it under the terms of the GNU Affero General Public License as published by\r\n// the Free Software Foundation, either version 3 of the License, or\r\n// (at your option) any later version.\r\n//\r\n// This program is distributed in the hope that it will be useful,\r\n// but WITHOUT ANY WARRANTY; without even the implied warranty of\r\n// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\r\n// GNU Affero General Public License for more details.\r\n//\r\n// You should have received a copy of the GNU Affero General Public License\r\n// along with this program.  If not, see <https://www.gnu.org/licenses/>.\r\n\r\npragma solidity 0.7.6;\r\n\r\n// Improved Dai token\r\n\r\ncontract Dai {\r\n\r\n  // --- Auth ---\r\n  mapping (address => uint256) public wards;\r\n  function rely(address usr) external auth {\r\n    wards[usr] = 1;\r\n    emit Rely(usr);\r\n  }\r\n  function deny(address usr) external auth {\r\n    wards[usr] = 0;\r\n    emit Deny(usr);\r\n  }\r\n  modifier auth {\r\n    require(wards[msg.sender] == 1, "Dai/not-authorized");\r\n    _;\r\n  }\r\n\r\n  // --- ERC20 Data ---\r\n  string  public constant name     = "Dai Stablecoin";\r\n  string  public constant symbol   = "DAI";\r\n  string  public constant version  = "2";\r\n  uint8   public constant decimals = 18;\r\n  uint256 public totalSupply;\r\n\r\n  mapping (address => uint256)                      public balanceOf;\r\n  mapping (address => mapping (address => uint256)) public allowance;\r\n  mapping (address => uint256)                      public nonces;\r\n\r\n  event Approval(address indexed owner, address indexed spender, uint256 value);\r\n  event Transfer(address indexed from, address indexed to, uint256 value);\r\n  event Rely(address indexed usr);\r\n  event Deny(address indexed usr);\r\n\r\n  // --- Math ---\r\n  function _add(uint256 x, uint256 y) internal pure returns (uint256 z) {\r\n    require((z = x + y) >= x);\r\n  }\r\n  function _sub(uint256 x, uint256 y) internal pure returns (uint256 z) {\r\n    require((z = x - y) <= x);\r\n  }\r\n\r\n  // --- EIP712 niceties ---\r\n  uint256 public immutable deploymentChainId;\r\n  bytes32 private immutable _DOMAIN_SEPARATOR;\r\n  bytes32 public constant PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");\r\n\r\n  constructor() public {\r\n    wards[msg.sender] = 1;\r\n    emit Rely(msg.sender);\r\n\r\n    uint256 chainId;\r\n    assembly {chainId := chainid()}\r\n    deploymentChainId = chainId;\r\n    _DOMAIN_SEPARATOR = _calculateDomainSeparator(chainId);\r\n  }\r\n\r\n  function _calculateDomainSeparator(uint256 chainId) private view returns (bytes32) {\r\n    return keccak256(\r\n      abi.encode(\r\n        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),\r\n        keccak256(bytes(name)),\r\n        keccak256(bytes(version)),\r\n        chainId,\r\n        address(this)\r\n      )\r\n    );\r\n  }\r\n  function DOMAIN_SEPARATOR() external view returns (bytes32) {\r\n    uint256 chainId;\r\n    assembly {chainId := chainid()}\r\n    return chainId == deploymentChainId ? _DOMAIN_SEPARATOR : _calculateDomainSeparator(chainId);\r\n  }\r\n\r\n  // --- ERC20 Mutations ---\r\n  function transfer(address to, uint256 value) external returns (bool) {\r\n    require(to != address(0) && to != address(this), "Dai/invalid-address");\r\n    uint256 balance = balanceOf[msg.sender];\r\n    require(balance >= value, "Dai/insufficient-balance");\r\n\r\n    balanceOf[msg.sender] = balance - value;\r\n    balanceOf[to] += value;\r\n\r\n    emit Transfer(msg.sender, to, value);\r\n\r\n    return true;\r\n  }\r\n  function transferFrom(address from, address to, uint256 value) external returns (bool) {\r\n    require(to != address(0) && to != address(this), "Dai/invalid-address");\r\n    uint256 balance = balanceOf[from];\r\n    require(balance >= value, "Dai/insufficient-balance");\r\n\r\n    if (from != msg.sender) {\r\n      uint256 allowed = allowance[from][msg.sender];\r\n      if (allowed != type(uint256).max) {\r\n        require(allowed >= value, "Dai/insufficient-allowance");\r\n\r\n        allowance[from][msg.sender] = allowed - value;\r\n      }\r\n    }\r\n\r\n    balanceOf[from] = balance - value;\r\n    balanceOf[to] += value;\r\n\r\n    emit Transfer(from, to, value);\r\n\r\n    return true;\r\n  }\r\n  function approve(address spender, uint256 value) external returns (bool) {\r\n    allowance[msg.sender][spender] = value;\r\n\r\n    emit Approval(msg.sender, spender, value);\r\n\r\n    return true;\r\n  }\r\n  function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {\r\n    uint256 newValue = _add(allowance[msg.sender][spender], addedValue);\r\n    allowance[msg.sender][spender] = newValue;\r\n\r\n    emit Approval(msg.sender, spender, newValue);\r\n\r\n    return true;\r\n  }\r\n  function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {\r\n    uint256 allowed = allowance[msg.sender][spender];\r\n    require(allowed >= subtractedValue, "Dai/insufficient-allowance");\r\n    allowed = allowed - subtractedValue;\r\n    allowance[msg.sender][spender] = allowed;\r\n\r\n    emit Approval(msg.sender, spender, allowed);\r\n\r\n    return true;\r\n  }\r\n\r\n  // --- Mint/Burn ---\r\n  function mint(address to, uint256 value) external auth {\r\n    require(to != address(0) && to != address(this), "Dai/invalid-address");\r\n    balanceOf[to] = balanceOf[to] + value; // note: we don\'t need an overflow check here b/c balanceOf[to] <= totalSupply and there is an overflow check below\r\n    totalSupply   = _add(totalSupply, value);\r\n\r\n    emit Transfer(address(0), to, value);\r\n  }\r\n  function burn(address from, uint256 value) external {\r\n    uint256 balance = balanceOf[from];\r\n    require(balance >= value, "Dai/insufficient-balance");\r\n\r\n    if (from != msg.sender && wards[msg.sender] != 1) {\r\n      uint256 allowed = allowance[from][msg.sender];\r\n      if (allowed != type(uint256).max) {\r\n        require(allowed >= value, "Dai/insufficient-allowance");\r\n\r\n        allowance[from][msg.sender] = allowed - value;\r\n      }\r\n    }\r\n\r\n    balanceOf[from] = balance - value; // note: we don\'t need overflow checks b/c require(balance >= value) and balance <= totalSupply\r\n    totalSupply     = totalSupply - value;\r\n\r\n    emit Transfer(from, address(0), value);\r\n  }\r\n\r\n  // --- Approve by signature ---\r\n  function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {\r\n    require(block.timestamp <= deadline, "Dai/permit-expired");\r\n\r\n    uint256 chainId;\r\n    assembly {chainId := chainid()}\r\n\r\n    bytes32 digest =\r\n      keccak256(abi.encodePacked(\r\n          "\\x19\\x01",\r\n          chainId == deploymentChainId ? _DOMAIN_SEPARATOR : _calculateDomainSeparator(chainId),\r\n          keccak256(abi.encode(\r\n            PERMIT_TYPEHASH,\r\n            owner,\r\n            spender,\r\n            value,\r\n            nonces[owner]++,\r\n            deadline\r\n          ))\r\n      ));\r\n\r\n    require(owner != address(0) && owner == ecrecover(digest, v, r, s), "Dai/invalid-permit");\r\n\r\n    allowance[owner][spender] = value;\r\n    emit Approval(owner, spender, value);\r\n  }\r\n}',
            ABI: '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"usr","type":"address"}],"name":"Deny","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"usr","type":"address"}],"name":"Rely","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"usr","type":"address"}],"name":"deny","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deploymentChainId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"usr","type":"address"}],"name":"rely","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]',
            ContractName: "Dai",
            CompilerVersion: "v0.7.6-allow_kall",
            OptimizationUsed: "1",
            Runs: "200",
            ConstructorArguments: "",
            EVMVersion: "Default",
            Library: "",
            LicenseType: "Unknown",
            Proxy: "0",
            Implementation: "",
            SwarmSource: "",
          },
        ],
      };
    };

    await fetchFiles("optimistic.etherscan", "0x0", f);

    const expected =
      "https://api-optimistic.etherscan.io/api?module=contract&action=getsourcecode&address=0x0&apikey=862Y3WJ4JB4B34PZQRFEV3IK6SZ8GNR9N5";

    assert(
      url === expected,
      `url should match expected value "${expected}", but instead received "${url}"`
    );
  });

  it("returns file with error message when contract is unverified", async () => {
    const f = async (): Promise<ContractSourceResponse> => {
      return {
        status: "1",
        message: "OK",
        result: [
          {
            SourceCode: "",
            ABI: "Contract source code not verified",
            ContractName: "",
            CompilerVersion: "",
            OptimizationUsed: "",
            Runs: "",
            ConstructorArguments: "",
            EVMVersion: "Default",
            Library: "",
            LicenseType: "Unknown",
            Proxy: "0",
            Implementation: "",
            SwarmSource: "",
          },
        ],
      };
    };

    const { files } = await fetchFiles("etherscan", "0x0", f);

    const expected =
      "Oops! It seems this contract source code is not verified on https://etherscan.io.";
    assert(
      files["error.md"].includes(expected),
      `Expected ${files["error.md"]} to contain ${expected}`
    );
  });
});
