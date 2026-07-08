import Plyr from 'plyr';

const plyrOpts = {
  controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
  invertTime: false,
  toggleInvert: false,
  resetOnEnd: true,
};

/** Comprueba si un elemento está dentro de un panel oculto (pestaña no activa) */
function inHiddenPanel(el) {
  return !!el.closest('.pd-tab-panel[hidden]');
}

/** Inicializa Plyr en vídeos y embeds (YouTube/Vimeo) dentro de un contenedor */
function initVideos(container = document) {
  container.querySelectorAll('video, [data-plyr-provider]').forEach((el) => {
    if (el.classList.contains('plyr--setup')) return;
    // En la carga inicial saltamos los que están dentro de pestañas ocultas
    if (container === document && inHiddenPanel(el)) return;
    el.classList.add('plyr--setup');
    new Plyr(el, plyrOpts);
  });
}

initVideos();

// Observa cambios en el contenido para capturar vídeos que aparezcan
// dinámicamente, sobre todo al cambiar de pestaña (hidden → visible).
const contenido = document.querySelector('.pd-contenido');
if (contenido) {
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      // Nuevos nodos añadidos al DOM
      if (m.type === 'childList' && m.addedNodes.length) {
        initVideos(m.target);
        continue;
      }
      // Un panel oculto se ha hecho visible → inicializar sus vídeos
      if (m.type === 'attributes' && m.attributeName === 'hidden' && !m.target.hidden) {
        initVideos(m.target);
      }
    }
  });
  obs.observe(contenido, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden'],
  });
}
