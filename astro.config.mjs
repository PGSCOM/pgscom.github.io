// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import generarHLS from './scripts/generate-hls.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://pgscom.es',
  // Los SVG de src/assets pasan por <Image>/getImage (formato webp), así que hay que permitir rasterizarlos
  image: { dangerouslyProcessSVG: true },
  integrations: [
    mdx(),
    // HLS de los mp4 locales antes de dev/build (ver scripts/generate-hls.mjs)
    { name: 'hls-local', hooks: { 'astro:config:setup': generarHLS } },
  ],
});
