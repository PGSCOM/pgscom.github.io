import Plyr from 'plyr';

/** Inicializa Plyr en todos los <video> del contenido del proyecto */
function initVideos() {
  document.querySelectorAll('.pd-contenido video').forEach((v) => {
    if (v.classList.contains('plyr--setup')) return;
    v.classList.add('plyr--setup');
    new Plyr(v, {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      invertTime: false,
      toggleInvert: false,
      resetOnEnd: true,
    });
  });
}

initVideos();

// Los vídeos que aparezcan dinámicamente (p.ej. al cambiar de pestaña) también
// se inicializan observando los cambios en el contenedor del contenido.
const contenido = document.querySelector('.pd-contenido');
if (contenido) {
  const obs = new MutationObserver(initVideos);
  obs.observe(contenido, { childList: true, subtree: true });
}
