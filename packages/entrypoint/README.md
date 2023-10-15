The website hosted on convenience URL entry points powering the "simple domain
change" use case.

( To open DethCode from a [supported blockchain explorer][explorers], change the
TLD (i.e. `.io`, `.com`) to `.deth.net`. )

[explorers]: ../../docs/supported-explorers.md

![domains and iframes](https://user-images.githubusercontent.com/15332326/147769185-649bfacf-8a5c-4aa7-89e1-325441f7633f.png)

## Contributing

### Setup

- Generate HTTPS certificates using `mkcert` as describe in
  [root README.md](../../README.md)

### Scripts

- **`pnpm serve`** - Starts HTTP server with the entrypoint website.

- **`pnpm build`** - Builds the website to `./dist` directory, using localhost
  as the iframe `src`.

- **`pnpm build:production`** - Builds the website to `./dist` directory, using
  *https://code.deth.net* as the iframe `src`.

- **`pnpm dev`** - runs `build` and `serve`.
