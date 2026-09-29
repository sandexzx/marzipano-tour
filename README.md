# Panorama tour

Static 360° panorama viewer based on Marzipano 0.10.2. Includes five equirectangular JPEG panoramas (4096×2048) and a floor plan.

## Published site

https://sandexzx.github.io/marzipano-tour/

## Structure

- `index.html`, `index.js`, `style.css`: viewer interface and scene switching.
- `assets/`: original panorama images and floor plan.
- `vendor/marzipano.js`: browser bundle built from the adjacent Marzipano source checkout using Browserify.
- `vendor/MARZIPANO-LICENSE`, `vendor/MARZIPANO-AUTHORS`, `vendor/licenses/`: library attribution and dependency licenses. These licenses do not grant rights to the panorama images or floor plan.
- `.nojekyll`: disables Jekyll processing on GitHub Pages.

All asset URLs are relative, so the site works under the repository path on GitHub Pages. No backend, CDN, npm installation or build step is required to host this folder.

## Local preview

Run `python3 -m http.server 8081 --bind 127.0.0.1` in this directory and open http://localhost:8081/.

## Deployment

GitHub Pages publishes from the root of the `main` branch. To update the site, commit and push changes to that branch. Check deployment with `gh api repos/sandexzx/marzipano-tour/pages/builds/latest`.

## Privacy

The repository and website are public. All images, including the floor plan, can be downloaded by visitors. There is no access control.
