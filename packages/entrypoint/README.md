The website hosted on convenience URL entry points powering the "simple domain
change" use case.

( To open Ethereum Code Viewer from a [supported blockchain explorer][explorers],
change the TLD (i.e. `.io`, `.com`) to `.deth.net`. )

[explorers]: ../../docs/supported-explorers.md

## Contributing

### Setup

- Generate HTTPS certificates using `mkcert` as describe in [root README.md](../../README.md)

### Scripts

- **`pnpm serve`** - Starts HTTP server with the entrypoint website.

- **`pnpm build`** - Builds the website to `./dist` directory, using localhost as the iframe `src`.

- **`pnpm build:production`** - Builds the website to `./dist` directory, using *https://ecv.deth.net* as the iframe `src`.
