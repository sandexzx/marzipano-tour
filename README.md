# Panorama tour

Static 360° panorama viewer based on Marzipano 0.10.2. Includes five equirectangular JPEG panoramas (4096×2048) and a floor plan.

## Published site

https://sandexzx.github.io/marzipano-tour/

## Structure

- `index.html`, `index.js`, `style.css`: viewer interface, scene switching, perspective navigation arrows and interactive floor plan.
- `tour.js`: scene names, normalized floor-plan coordinates, estimated orientation offsets and per-link yaw/pitch calibration.
- `assets/`: original panorama images and floor plan.
- `vendor/marzipano.js`: browser bundle built from the adjacent Marzipano source checkout using Browserify.
- `vendor/MARZIPANO-LICENSE`, `vendor/MARZIPANO-AUTHORS`, `vendor/licenses/`: library attribution and dependency licenses. These licenses do not grant rights to the panorama images or floor plan.
- `.nojekyll`: disables Jekyll processing on GitHub Pages.

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
