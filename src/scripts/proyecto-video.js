import { VideoSkinElement } from '@videojs/html/video';
import { VideoPlayerElement } from '@videojs/html/video/player';

/**
 * @param {HTMLElement} el
 * @returns {boolean}
 */
function inHiddenPanel(el) {
  return !!el.closest('.pd-tab-panel[hidden]');
}

/**
 * @param {HTMLVideoElement} video
 */
function wrapVideo(video) {
  if (video.closest('video-player')) return;
  const player = new VideoPlayerElement();
  const skin = new VideoSkinElement();
  video.replaceWith(player);
  player.appendChild(skin);
  skin.appendChild(video);
}

function initVideos() {
  document.querySelectorAll('.pd-contenido video').forEach((v) => {
    if (inHiddenPanel(v)) return;
    wrapVideo(v);
  });
}

initVideos();

const contenido = document.querySelector('.pd-contenido');
if (contenido) {
  const obs = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes.length) {
        m.target.querySelectorAll('video').forEach(wrapVideo);
        continue;
      }
      if (m.type === 'attributes' && m.attributeName === 'hidden' && !m.target.hidden) {
        m.target.querySelectorAll('video').forEach(wrapVideo);
      }
    }
  });
  obs.observe(contenido, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
}
