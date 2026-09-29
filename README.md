# Panorama tour

Static 360° panorama viewer based on Marzipano 0.10.2. Includes five equirectangular JPEG panoramas (4096×2048) and a floor plan. The same files also run in an offline Electron application for Windows.

## Published site

https://sandexzx.github.io/marzipano-tour/

## Windows application

Download the portable Windows x64 EXE from https://github.com/sandexzx/marzipano-tour/releases/latest. Target systems: Windows 10/11 x64. Run the downloaded EXE; no installer, browser or internet connection is required. The application includes Electron (Chromium and Node.js) and all original images. Portable packaging extracts runtime files to a temporary directory; Electron also stores normal application preferences/cache in the user profile. This is not a zero-disk-write application.

The EXE is unsigned. Windows SmartScreen or antivirus may flag an unfamiliar unsigned executable; users should verify that it was obtained from this repository's release page. Code signing is not configured.

### Development

Use Node.js 22, then run `npm ci`, `npm test`, and `npm start`. `npm run smoke` automatically loads all five panoramas and the plan in Electron and exits with a nonzero code on failure. On Linux, Electron requires a graphical session and correctly configured Chromium sandbox support. A one-off test with `npm run smoke -- --no-sandbox` is possible in an isolated development environment, but disabling the sandbox is not part of the shipped application.

`electron/main.cjs` creates a sandboxed window with Node integration disabled and context isolation enabled. `electron/server.cjs` serves only explicitly allowed tour files on a random loopback port, working with assets inside the packaged ASAR archive. Permissions, new windows and external renderer requests are denied. The local server is started and stopped by the application; users do not launch it manually.

### Windows builds and releases

`.github/workflows/windows.yml` builds on `windows-latest` using locked npm dependencies. It runs Node tests, builds a portable x64 EXE with electron-builder, then smoke-tests the unpacked packaged application with software WebGL before uploading the EXE. The test checks packaged runtime/assets; the portable self-extraction launcher still needs a real-user Windows test.

- Manual test build: `gh workflow run windows.yml`; download from that run's artifacts (14-day retention).
- Release: update `package.json` and lockfile version, commit/push, then create and push a matching `vX.Y.Z` tag. Tag builds automatically publish the EXE to GitHub Releases only after successful build and smoke test.
- The website continues to publish from `main`; desktop releases are independent versioned snapshots and do not automatically update already downloaded applications.

## Structure

- `index.html`, `index.js`, `style.css`: viewer interface, scene switching, perspective navigation arrows and interactive floor plan.
- `tour.js`: scene names, normalized floor-plan coordinates, estimated orientation offsets and per-link yaw/pitch calibration.
- `assets/`: original panorama images and floor plan.
- `vendor/marzipano.js`: browser bundle built from the adjacent Marzipano source checkout using Browserify.
- `vendor/MARZIPANO-LICENSE`, `vendor/MARZIPANO-AUTHORS`, `vendor/licenses/`: library attribution and dependency licenses. These licenses do not grant rights to the panorama images or floor plan.
- `.nojekyll`: disables Jekyll processing on GitHub Pages.
- `electron/`, `tests/`, `package.json`, `package-lock.json`: desktop wrapper, server tests and locked build dependencies.
- `.github/workflows/windows.yml`: Windows packaging and release automation.

All asset URLs are relative, so the site works under the repository path on GitHub Pages. No backend, CDN, npm installation or build step is required to host this folder.

## Navigation and calibration

The route is `6_1 ↔ 6_2 ↔ 6_3 ↔ 6_4 ↔ 6_5`. The endpoints have one navigation arrow; interior positions have two. The scene-to-plan mapping is inferred from the entry vestibule, corridor and bedroom visible in the source panoramas; it should be confirmed against the original scene/export data if exact registration is required.

Arrows are Marzipano embedded hotspots, not fixed screen overlays. CSS perspective transforms place them in a horizontal plane below the camera. Marzipano updates their projections with camera rotation and zoom; arrows outside the viewing direction are not expected to remain on screen. Each arrow moves to the adjacent scene. Approximate world heading, pitch and field of view are preserved between linked scenes using each scene's `northYaw` offset. Header and floor-plan navigation reset the camera toward an available forward passage.

To adjust calibration, edit `tour.js`:

- `x`, `y`: floor-plan image fractions from the top-left corner.
- `northYaw`: the panorama yaw corresponding to upward on the plan, in radians. This is used for inter-scene heading preservation.
- `links[].to`: adjacent scene ID.
- `links[].yaw`: panorama direction of the passageway, in radians; `0` corresponds to the horizontal center of the equirectangular image.
- `links[].pitch`: vertical placement below the horizon, in radians.

Directions are visually estimated, not surveyed. Passageway bearings are calibrated independently of the straight line between plan markers because the corridor route turns around walls.

## Local preview

Run `python3 -m http.server 8081 --bind 127.0.0.1` in this directory and open http://localhost:8081/.

## Deployment

GitHub Pages publishes from the root of the `main` branch. To update the site, commit and push changes to that branch. Check deployment with `gh api repos/sandexzx/marzipano-tour/pages/builds/latest`.

## Privacy

The repository and website are public. All images, including the floor plan, can be downloaded by visitors. There is no access control.
