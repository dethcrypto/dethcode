<p align="center">
  <br />
  <img src="https://github.com/dethcrypto/ethereum-code-viewer/blob/main/docs/logo.svg?raw=true" width="200" alt="">
  <br />
  <h2 align="center">DethCode</h2>
  <p align="center">
    <a href="https://github.com/dethcrypto/ethereum-code-viewer/actions"><img alt="Build Status" src="https://github.com/dethcrypto/ethereum-code-viewer/actions/workflows/ci.yml/badge.svg"></a>
  </p>
  <p align="center"><strong>View source of deployed Ethereum smart contracts in VS Code</strong></p>
  <p align="center">While on Etherscan, change <code>.io</code> to <code>.deth.net</code> and browse contracts comfortably in ephemeral VS Code instance</p>
</p>

## Usage

While browsing smart contract code on [Etherscan](https://etherscan.io/) just
change URL from `.io` to `.deth.net`. This will open Visual Studio Code instance
and fetch the verified code using Etherscan API.

![ecv](https://user-images.githubusercontent.com/1814312/146108385-6fa50ae7-14a5-45b2-be3d-201d22409cf7.gif)

Or save the following code snippet as a bookmarklet to quickly go from any
[supported chain explorer][supported_explorers] to DethCode.

```
javascript: location.href = location.href.replace(/\.\w+(\/)/, ".deth.net/")
```

## Features ⚡

- frictionless - just tweak URL while browsing etherscan `.io` -> `deth.net`
- proxy support - automatically follows proxies and displays implementation
  source code
- multichain - supports different etherscan instances: testnets, L2s, L1s ([all
  supported chains][supported_explorers])

[supported_explorers]:
  https://github.com/dethcrypto/dethcode/blob/main/packages/ethereum-viewer/src/explorer/networks.ts#L38

## Motivation

Browsing contracts directly on etherscan sucks! Browsing multi-file contracts on
etherscan sucks even more. Limited search, weird syntax highlighting, and many,
many more. Finally, it's often impossible to just git clone repository and
browse source code locally because it's hard to find the exact commit that
matches onchain code.

DethCode was born out of frustration, and it's here to fix all of these issues.
In addition, it improves the experience by automatically following the
implementation of proxies and so on.

### Is it still relevant since Etherscan implements something similar?

Etherscan decided that they like the idea of browsing smart contracts in
ephemeral VSCode instances so much that they decided to make it part of the
their offering. We don't hold a grudge against them, however this is precisely
why DethCode needs to live on!

DethCode is a fully open-source, public good that is available for anyone and is
developed by a community. Other blockchain explorers can use it/self-host it
instead of developing the same thing again. Furthermore, we are preparing to
launch, new advanced features that will make DethCode the best way to browse
ethereum's smart contracts.

## Examples

- Optimism L1CrossDomainMessenger:
  [dethcode](https://etherscan.deth.net/address/0x25ace71c97b33cc4729cf772ae268934f7ab5fa1)
  |
  [etherscan](https://etherscan.io/address/0x25ace71c97b33cc4729cf772ae268934f7ab5fa1#code)
- Arbitrum ERC20 Gateway on mainnet:
  [dethcode](https://etherscan.deth.net/address/0xa3a7b6f88361f48403514059f1f16c8e78d60eec)
  |
  [etherscan](https://etherscan.io/address/0xa3a7b6f88361f48403514059f1f16c8e78d60eec#code)
- Arbitrum ERC20 Gateway on arbitrum:
  [dethcode](https://arbiscan.deth.net/address/0x09e9222e96e7b4ae2a407b98d48e330053351eee)
  |
  [arbiscan](https://arbiscan.io/address/0x09e9222e96e7b4ae2a407b98d48e330053351eee#code)
- Dai Stablecoin:
  [dethcode](https://etherscan.deth.net/address/0x6b175474e89094c44da98b954eedeac495271d0f)
  |
  [etherscan](https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f#code)

## Contributing and development

Check out our [contributing guide](./CONTRIBUTING.md).

## Social

Follow me on [Twitter](https://twitter.com/krzkaczor).
