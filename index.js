'use strict';

(function() {
  var status = document.getElementById('status');
  var current = null;
  var viewer;
  var entries = {};
  var configs = window.TOUR_SCENES;

  try {
    viewer = new Marzipano.Viewer(document.getElementById('pano'));
    var geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
    var limiter = Marzipano.RectilinearView.limit.traditional(2048, 100 * Math.PI / 180);
    configs.forEach(function(config) { addScene(config, geometry, limiter); });
    configs.forEach(addArrows);
    select(1, false);
  } catch (error) {
    status.textContent = 'Не удалось запустить панораму. Проверь поддержку WebGL в браузере.';
    console.error(error);
  }

  function addScene(config, geometry, limiter) {
    var filename = '6_' + config.id + ' - Панорама.jpg';
    var source = Marzipano.ImageUrlSource.fromString('assets/' + encodeURIComponent(filename));
    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: new Marzipano.RectilinearView({ yaw: config.links[0].yaw, pitch: 0, fov: Math.PI / 2 }, limiter)
    });
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = '6_' + config.id;
    button.title = config.name;
    button.setAttribute('aria-pressed', 'false');
    document.getElementById('scenes').appendChild(button);

    var marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'plan-marker';
    marker.textContent = config.id;
    marker.style.left = config.x * 100 + '%';
    marker.style.top = config.y * 100 + '%';
    marker.title = config.name;
    marker.setAttribute('aria-label', 'Точка ' + config.id + ': ' + config.name);
    marker.setAttribute('aria-pressed', 'false');
    document.getElementById('plan-image').appendChild(marker);

    var entry = entries[config.id] = {
      config: config, scene: scene, button: button, marker: marker, loaded: false
    };
    scene.layer().textureStore().addEventListener('textureLoad', function() {
      entry.loaded = true;
      if (current === entry) { status.textContent = ''; }
    });
    scene.layer().textureStore().addEventListener('textureError', function(tile, error) {
      entry.loaded = false;
      if (current === entry) { status.textContent = 'Не удалось загрузить ' + filename; }
      console.error(error);
    });
    button.addEventListener('click', function() { select(config.id, false); });
    marker.addEventListener('click', function() {
      select(config.id, false);
      document.getElementById('plan').close();
    });
  }

  function select(id, preserveHeading) {
    var next = entries[id];
    if (next === current) { return; }
    if (preserveHeading && current) {
      // Keep the world heading even when panorama exports have different rotations.
      var previousView = current.scene.view();
      next.scene.view().setParameters({
        yaw: previousView.yaw() - current.config.northYaw + next.config.northYaw,
        pitch: previousView.pitch(),
        fov: previousView.fov()
      });
    } else {
      var forward = next.config.links.find(function(link) { return link.to > id; }) || next.config.links[0];
      next.scene.view().setParameters({ yaw: forward.yaw, pitch: 0, fov: Math.PI / 2 });
    }
    current = next;
    configs.forEach(function(config) {
      var entry = entries[config.id];
      entry.button.setAttribute('aria-pressed', String(entry === next));
      entry.marker.setAttribute('aria-pressed', String(entry === next));
    });
    document.getElementById('location').textContent = '6_' + id + ' · ' + next.config.name;
    status.textContent = next.loaded ? '' : 'Загрузка панорамы ' + id + '…';
    next.scene.switchTo({ transitionDuration: 300 });
  }

  function addArrows(config) {
    config.links.forEach(function(link) {
      var target = entries[link.to].config;
      var arrow = document.createElement('button');
      arrow.type = 'button';
      arrow.className = 'travel-arrow';
      arrow.dataset.to = link.to;
      arrow.title = 'Перейти: ' + target.name + ' (6_' + link.to + ')';
      arrow.setAttribute('aria-label', arrow.title);
      arrow.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="53"/><path d="M30 69 L60 39 L90 69"/></svg>';
      arrow.addEventListener('click', function() { select(link.to, true); });
      // Embed the arrow in a horizontal plane below the camera, facing the passageway.
      entries[config.id].scene.hotspotContainer().createHotspot(arrow,
        { yaw: link.yaw, pitch: link.pitch },
        { perspective: { radius: 650, extraTransforms: 'rotateX(' + (Math.PI / 2 - link.pitch) + 'rad)' } }
      );
    });
  }

  var plan = document.getElementById('plan');
  document.getElementById('show-plan').addEventListener('click', function() { plan.showModal(); });
  document.getElementById('close-plan').addEventListener('click', function() { plan.close(); });
})();
