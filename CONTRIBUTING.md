## Contributing

We welcome all kinds of contributions :)

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

pnpm build # this builds whole vscode and can take A LOT of time. If you are having issues, read below
pnpm serve
```

### Scripts

- **`pnpm install`** - Installs dependencies for the workspace,
  `ethereum-viewer` extension, and triggers `yarn install` for `vscode-host`
  through the `postinstall` script.

- **`pnpm build`** - Builds all packages.

  If you are having issues with MacOS and Python try the following:
  ```
  $ brew install sqlite
  $ npm config set sqlite /opt/homebrew/opt/sqlite
  $ npm config set python python3
  ```

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
