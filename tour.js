'use strict';

// Plan coordinates are normalized against the original 2823 x 2152 image.
// Yaw calibration is estimated visually from the passageways in each panorama.
window.TOUR_SCENES = [
  { id: 1, name: 'Вход', x: 0.710, y: 0.680, northYaw: 0,
    links: [{ to: 2, yaw: 0, pitch: 0.48 }] },
  { id: 2, name: 'Коридор у входа', x: 0.710, y: 0.575, northYaw: 0.20,
    links: [{ to: 1, yaw: Math.PI, pitch: 0.48 }, { to: 3, yaw: 0.20, pitch: 0.48 }] },
  { id: 3, name: 'Середина коридора', x: 0.710, y: 0.424, northYaw: 0.30,
    links: [{ to: 2, yaw: Math.PI, pitch: 0.48 }, { to: 4, yaw: 0.30, pitch: 0.48 }] },
  { id: 4, name: 'Поворот к комнате', x: 0.751, y: 0.306, northYaw: -0.25,
    links: [{ to: 3, yaw: -3.00, pitch: 0.48 }, { to: 5, yaw: 1.22, pitch: 0.48 }] },
  { id: 5, name: 'Крайняя комната', x: 0.826, y: 0.289, northYaw: -1.10,
    links: [{ to: 4, yaw: -2.51, pitch: 0.48 }] }
];
