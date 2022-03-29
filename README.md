<p align="center">
  <br />
  <img src="https://github.com/dethcrypto/ethereum-code-viewer/blob/main/docs/logo.svg?raw=true" width="200" alt="">
  <br />
  <h2 align="center">DethCode</h2>
  <p align="center">
    <a href="https://github.com/dethcrypto/ethereum-code-viewer/actions"><img alt="Build Status" src="https://github.com/dethcrypto/ethereum-code-viewer/actions/workflows/ci.yml/badge.svg"></a>
    <a href="https://discord.gg/wQDkeDgzgv"><img alt="Join our Discord!" src="https://img.shields.io/discord/895381864922091630.svg?color=7289da&label=deth&logo=discord&style=flat-square"></a>
  </p>
  <p align="center"><strong>View source of deployed Ethereum smart contracts in VS Code</strong></p>
  <p align="center">While on Etherscan, change <code>.io</code> to <code>.deth.net</code> and browse contracts comfortably in ephemeral VS Code instance</p>
  <p align="center">
    <em>💸 Enjoy using DethCode? Consider funding development via <a href="https://gitcoin.co/grants/4038/deth-typechain">GitCoin</a> 💸</em>
  </p>
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
  https://github.com/dethcrypto/ethereum-code-viewer/blob/main/docs/supported-explorers.md

## Motivation

Browsing contracts directly on etherscan sucks! Browsing multi-file contracts on
etherscan sucks even more. Limited search, weird syntax highlighting, and many,
many more. Finally, it's often impossible to just git clone repository and
browse source code locally because it's hard to find the exact commit that
matches onchain code.

DethCode was born out of frustration, and it's here to fix all of these issues.
In addition, it improves the experience by automatically following the
implementation of proxies and so on.

## Examples

- Arbitrum ERC20 Gateway on mainnet:
  [dethcode](https://etherscan.deth.net/address/0xa3a7b6f88361f48403514059f1f16c8e78d60eec)
  |
  [etherscan](https://etherscan.io/address/0xa3a7b6f88361f48403514059f1f16c8e78d60eec#code)
- Arbitrum ERC20 Gateway on arbitrum:
  [dethcode](https://arbiscan.deth.net/address/0x09e9222e96e7b4ae2a407b98d48e330053351eee)
  |
  [arbiscan](https://arbiscan.io/address/0x09e9222e96e7b4ae2a407b98d48e330053351eee#code)
- Optimism L1CrossDomainMessenger:
  [dethcode](https://etherscan.deth.net/address/0x25ace71c97b33cc4729cf772ae268934f7ab5fa1)
  |
  [etherscan](https://etherscan.io/address/0x25ace71c97b33cc4729cf772ae268934f7ab5fa1#code)
- Dai Stablecoin:
  [dethcode](https://etherscan.deth.net/address/0x6b175474e89094c44da98b954eedeac495271d0f)
  |
  [etherscan](https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f#code)

## Contributing

### Repository structure and package managers

The repository contains two packages, `ethereum-viewer` extension and the VSCode
compilation meant for hosting it online.

All packages (currently one) except of `@dethcrypto/ethereum-viewer-vscode-host`
located in `packages/vscode-host` are managed by `pnpm`. As VSCode depends on
Yarn, our `vscode-host` also needs Yarn.

### Step by step instructions

```sh
# You need to create dummy certs using mkcert - https://github.com/FiloSottile/mkcert
cd ./certs
mkcert localhost
mkcert -install
cd ..

# install deps
pnpm install

# install vscode deps
cd packages/vscode-host/
yarn
cd ../../

pnpm build # this builds whole vscode and can take A LOT of time
pnpm serve
```

### Scripts

- **`pnpm install`** - Installs dependencies for the workspace,
  `ethereum-viewer` extension, and triggers `yarn install` for `vscode-host`
  through the `postinstall` script.

- **`pnpm build`** - Builds all packages.

- **`pnpm watch`** - Starts webpack for `ethereum-extension` in watch mode.

- **`pnpm serve`** - Starts HTTP server with `vscode-host`.

- **`pnpm dev`** - Copies `ethereum-extension` and serves `vscode-host`. Run
  alongside `pnpm watch`.

### Resources

DethCode's is a VSCode Web Extension using FileSystemProvider API to show
sources of deployed Ethereum smart contracts. The following links might be
provide some insight, if you're not familiar with some of the aforementioned
terms.

- https://code.visualstudio.com/api/extension-guides/web-extensions
- https://code.visualstudio.com/api/references/vscode-api#FileSystemProvider
- https://github.com/microsoft/vscode-extension-samples/blob/main/fsprovider-sample/README.md
