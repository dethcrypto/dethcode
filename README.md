<p align="center">
  <img src="https://github.com/dethcrypto/ethereum-code-viewer/blob/master/docs/logo.png?raw=true" width="300" alt="ethereum code viewer">
  <h3 align="center">Ethereum Code Viewer</h3>
  <p align="center">View source of deployed Ethereum smart contracts in VS Code</p>
  <p align="center">Comfortably browse contracts verified on etherscan</p>

  <p align="center">
    <a href="https://github.com/dethcrypto/ethereum-code-viewer/actions"><img alt="Build Status" src="https://github.com/dethcrypto/ethereum-code-viewer/workflows/ci.yml/badge.svg"></a>
    <a href="https://discord.gg/wQDkeDgzgv"><img alt="Join our discord!" src="https://img.shields.io/discord/895381864922091630.svg?color=7289da&label=deth&logo=discord&style=flat-square"></a>
  </p>
  
  <p align="center">
    <strong>💸 Enjoy using Ethereum Code Viewer? Consider funding development via <a href="https://gitcoin.co/grants/4038/deth-typechain">GitCoin</a> 💸</strong>
  </p>
</p>

## Features ⚡

- frictionless - just tweak URL while browsing etherscan `.io` -> `deth.net`
- proxy support - automatically follows proxies and displays implementation source code
- multichain - supports many etherscan instances (testnets, L2s, L1s) (COMING SOON)

## Examples

- Arbitrum ERC20 Gateway: [Ethereum Code Viewer](https://etherscan.deth.net/address/0xa3a7b6f88361f48403514059f1f16c8e78d60eec#code) | [etherscan](https://etherscan.io/address/0xa3a7b6f88361f48403514059f1f16c8e78d60eec#code)

### Contributing

#### Repository structure and package managers

The repository contains two packages, `ethereum-viewer` extension and the VSCode compilation meant for hosting it online.

All packages (currently one) except of `@dethcrypto/ethereum-viewer-vscode-host` located in `packages/vscode-host` are managed by `pnpm`.
As VSCode depends on Yarn, our `vscode-host` also needs Yarn.

You need to create dummy certs using `mkcert`:

```sh
cd ./certs
mkcert localhost
mkcert -install
```

#### Scripts

- **`pnpm install`** - Installs dependencies for the workspace, `ethereum-viewer` extension, and triggers `yarn install` for `vscode-host` through the `postinstall` script.

- **`pnpm build`** - Builds all packages.

- **`pnpm watch`** - Starts webpack for `ethereum-extension` in watch mode.

- **`pnpm serve`** - Starts HTTP server with `vscode-host`.

- **`pnpm dev`** - Copies `ethereum-extension` and serves `vscode-host`. Run alongside `pnpm watch`.

#### Resources

Ethereum Viewer is a VSCode Web Extension using FileSystemProvider API to show sources of deployed Ethereum smart contracts.
The following links might be provide some insight, if you're not familiar with some of the aforementioned terms.

- https://code.visualstudio.com/api/extension-guides/web-extensions
- https://code.visualstudio.com/api/references/vscode-api#FileSystemProvider
- https://github.com/microsoft/vscode-extension-samples/blob/main/fsprovider-sample/README.md
