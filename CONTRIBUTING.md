## Contributing

We welcome all kinds of contributions :)

### Repository structure and package managers

The repository contains few packages:

- `ethereum-viewer` - VSCode extension, this is where most of the business logic
  resides,
- `vscode-host` - tweaked VSCode instance. Default settings were changed and
  some features hidden. Note: since some time, vscode officially supports web
  builds which greatly simplified this package,
- `entrypoint` - Simple website that cointains an iframe to vscode host. It's
  done so multiple instances of DethCode for different chains, can share the
  same settings (because they all use a single instance under the hood).

All packages except of `@dethcrypto/vscode-host` located in
`packages/vscode-host` are managed by `pnpm`. As VSCode depends on Yarn, our
`vscode-host` also needs Yarn.

## Development

```
pnpm install

cd packages/ethereum-viewer # build for the first time
pnpm build

cd packages/vscode-host
node scripts/prepareVSCode.js # clones vscode into ./vscode dir
node scripts/compileVSCode.js
node scripts/prepareAdditionalExtensions.js # extensions like solidity and vyper support
node scripts/copyExtensions.js

cd ./vscode
node ./scripts/code-web-deth.js # loads extensions from ./packages/vscode-host/dist/extensions
yarn watch # in a new tab
yarn watch-web # in a new tab
```

Changes to vscode will be automatically applied. To make them permanent copy
them to `./packages/vscode-host/src/`.

After introducing changes to `packages/ethereum-viewer` run
`pnpm run build:dev`.

Btw. this will be improved soon ;)

## Production build

Note: full, production build of VSCode host is painfully slow and takes ~0.5h
even on M1 Mac.

```
pnpm build
```

### Resources

DethCode's is a VSCode Web Extension using FileSystemProvider API to show
sources of deployed Ethereum smart contracts. The following links might be
provide some insight, if you're not familiar with some of the aforementioned
terms.

- https://code.visualstudio.com/api/extension-guides/web-extensions
- https://code.visualstudio.com/api/references/vscode-api#FileSystemProvider
- https://github.com/microsoft/vscode-extension-samples/blob/main/fsprovider-sample/README.md

### Troubleshooting

If you are having issues with MacOS and Python try the following:

```
$ brew install sqlite
$ npm config set sqlite /opt/homebrew/opt/sqlite
$ npm config set python python3
```
