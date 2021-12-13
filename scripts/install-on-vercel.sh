#!/usr/bin/env bash

# We need to install xkbfile to build VSCode.
# `gyp: Call to '${PKG_CONFIG:-pkg-config} x11 xkbfile --libs' returned exit status 1 while in binding.gyp. while trying to load binding.gyp``
# see https://stackoverflow.com/questions/55878536/no-package-xkbfile-found-when-build-vscode-on-ubuntu
sudo apt-get install -y g++ gcc make python2.7 pkg-config libx11-dev libxkbfile-dev libsecret-1-dev

# Vercel doesn't have PNPM.
npm i -g pnpm@6.23.6

# Our `postinstall` script is apparently suspicious, and it's skipped withou `--unsafe-perm`.
pnpm install --unsafe-perm
