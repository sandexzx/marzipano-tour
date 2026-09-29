'use strict';

(function() {
  var status = document.getElementById('status');
  var current = null;
  var viewer;

  try {
    viewer = new Marzipano.Viewer(document.getElementById('pano'));
    var geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
    var limiter = Marzipano.RectilinearView.limit.traditional(2048, 100 * Math.PI / 180);

    for (var number = 1; number <= 5; number++) {
      addScene(number, geometry, limiter);
    }
  } catch (error) {
    status.textContent = 'Не удалось запустить панораму. Проверь поддержку WebGL в браузере.';
    console.error(error);
  }

  function addScene(number, geometry, limiter) {
    var filename = '6_' + number + ' - Панорама.jpg';
    var source = Marzipano.ImageUrlSource.fromString('assets/' + encodeURIComponent(filename));
    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: new Marzipano.RectilinearView({ yaw: 0, pitch: 0, fov: Math.PI / 2 }, limiter)
    });
    var loaded = false;
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = '6_' + number;
    button.setAttribute('aria-pressed', 'false');
    document.getElementById('scenes').appendChild(button);

    scene.layer().textureStore().addEventListener('textureLoad', function() {
      loaded = true;
      if (current === scene) { status.textContent = ''; }
    });
    scene.layer().textureStore().addEventListener('textureError', function(tile, error) {
      if (current === scene) { status.textContent = 'Не удалось загрузить ' + filename; }
      console.error(error);
    });

    function select() {
      current = scene;
      document.querySelectorAll('#scenes button').forEach(function(item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      status.textContent = loaded ? '' : 'Загрузка панорамы ' + number + '…';
      scene.switchTo({ transitionDuration: 300 });
    }
    button.addEventListener('click', select);
    if (number === 1) { select(); }
  }

  var plan = document.getElementById('plan');
  document.getElementById('show-plan').addEventListener('click', function() {
    plan.showModal();
  });
  document.getElementById('close-plan').addEventListener('click', function() {
    plan.close();
  });
})();
