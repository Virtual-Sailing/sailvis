## Project Setup

```sh
pnpm install
```

## Run modes
### Run web dev
```pnpm run web```
### Run electron build in dev mode
```pnpm run electron```
### Build web ver
```pnpm run build-web```
### Build electron ver
```pnpm run build-electron```
### Build standalone Windows electron ver with installer
```sh
pnpm run build:win
```

### Build 32-bit standalone Windows electron ver with installer
```sh
pnpm run build:win32
```

This target pins Electron 22 because Electron 23 and newer require Windows 10+.
