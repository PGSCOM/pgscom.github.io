import { select } from 'd3-selection';
import gsap from 'gsap';

// ── Panal de proyectos: springboard estilo Apple ──────────────────────────────
// Todos los proyectos visibles a la vez como iconos-squircle en una rejilla
// hexagonal, con su nombre debajo. El tamaño del icono viene de `peso`, el aro
// de color indica la categoría, y al mover el cursor una "lupa" tipo Apple
// Watch magnifica los iconos cercanos. Las chips de leyenda resaltan una
// categoría sin ocultar el resto. Escala solo: más proyectos → más filas.

function initPanal() {
  const dataEl = document.getElementById('burbujas-data');
  const wrap = document.getElementById('mapaWrap');
  const tip = document.getElementById('mapaTip');
  const chipsEl = document.getElementById('mapaPills');
  if (!dataEl || !wrap || !tip || !chipsEl) return;

  const { cats, projects } = JSON.parse(dataEl.textContent);
  const catById = Object.fromEntries(cats.map((c) => [c.id, c]));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const svg = select('#mapaChart');
  if (svg.empty()) return;

  let entered = false;   // animación de entrada ya reproducida
  let hlCat = null;      // categoría resaltada de forma fija (chips / órbita)
  let narrow = isNarrow();
  let nodes = [];
  let icons = null;
  let W = 0;
  let H = 0;
  let fisheyeOn = false;
  let rafId = 0;

  function isNarrow() {
    return (wrap.clientWidth || window.innerWidth) < 620;
  }

  // Superellipse |x/r|^n + |y/r|^n = 1 → forma de icono de iOS
  function squircle(r, n = 4.5) {
    const STEPS = 64;
    let d = '';
    for (let i = 0; i < STEPS; i++) {
      const t = (i / STEPS) * Math.PI * 2;
      const c = Math.cos(t);
      const s = Math.sin(t);
      const x = r * Math.sign(c) * Math.abs(c) ** (2 / n);
      const y = r * Math.sign(s) * Math.abs(s) ** (2 / n);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
    }
    return d + 'Z';
  }

  function wrapTitle(t, maxChars) {
    const words = t.trim().split(/\s+/);
    const lines = [];
    let cur = '';
    for (const w of words) {
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    if (lines.length > 2) {
      lines.length = 2;
      lines[1] = lines[1].slice(0, Math.max(1, maxChars - 1)) + '…';
    }
    return lines;
  }

  function render() {
    if (!icons) return;
    icons.attr('transform', (d) =>
      `translate(${d.x + d.ox},${d.y + d.oy}) scale(${d.k * d.s})`);
  }

  function build() {
    narrow = isNarrow();
    W = narrow ? 400 : 1000;
    const side = narrow ? 14 : 30;
    const cols = narrow ? 3 : 6;
    const dx = (W - side * 2) / cols;
    const rMin = narrow ? 27 : 36;
    const rMax = narrow ? 41 : 54;
    const labelFs = narrow ? 11.5 : 13;
    const dy = rMax * 2 + labelFs * 2 + (narrow ? 14 : 18);

    // ── Posiciones en panal: filas equilibradas (sin huérfanos) y centradas,
    //    con desplazamiento alterno para el aspecto hexagonal ──
    const n = projects.length;
    const numRows = Math.max(1, Math.ceil(n / cols));
    const base = Math.floor(n / numRows);
    const extra = n % numRows;
    const slots = [];
    let row = 0;
    for (let r = 0; r < numRows; r++) {
      const inRow = base + (r < extra ? 1 : 0);
      const rowW = inRow * dx;
      const shift = narrow ? 0 : (r % 2 === 0 ? -1 : 1) * dx / 4;
      const startX = (W - rowW) / 2 + dx / 2 + shift;
      for (let c = 0; c < inRow; c++) {
        slots.push([startX + c * dx, side + rMax + 6 + r * dy]);
      }
      row++;
    }
    H = side + row * dy + labelFs * 2;

    const keepK = entered || reduced ? 1 : 0;
    nodes = projects.map((p, i) => ({
      ...p,
      r: rMin + (rMax - rMin) * Math.sqrt((p.peso ?? 50) / 100),
      x: slots[i][0],
      y: slots[i][1],
      k: keepK, // escala de entrada
      s: 1,     // escala de lupa (actual)
      ox: 0,    // desplazamiento de lupa (actual)
      oy: 0,
      ts: 1,    // objetivos hacia los que se interpola
      tox: 0,
      toy: 0,
    }));

    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    // ── Defs: degradado de legibilidad + clip squircle por icono ──
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'bub-fade').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
    grad.append('stop').attr('offset', '0.45').attr('stop-color', 'rgba(2,8,23,0)');
    grad.append('stop').attr('offset', '1').attr('stop-color', 'rgba(2,8,23,0.55)');

    nodes.forEach((d) => {
      defs.append('clipPath').attr('id', `bclip-${d.id}`)
        .append('path').attr('d', squircle(d.r));
    });

    // ── Iconos: enlaces SVG reales ──
    icons = svg.append('g').attr('class', 'mapa-icons')
      .selectAll('a')
      .data(nodes)
      .enter()
      .append('a')
      .attr('class', 'picon')
      .attr('href', (d) => `/proyectos/${d.id}`)
      .attr('aria-label', (d) => `${d.titulo} — ${catById[d.cat]?.titulo ?? ''}`);

    icons.append('path')
      .attr('d', (d) => squircle(d.r))
      .attr('fill', 'rgba(13,18,38,0.95)');

    icons.append('image')
      .attr('href', (d) => d.imagen)
      .attr('x', (d) => -d.r).attr('y', (d) => -d.r)
      .attr('width', (d) => d.r * 2).attr('height', (d) => d.r * 2)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('clip-path', (d) => `url(#bclip-${d.id})`)
      .each(function (d) {
        // Si la imagen no existe: fondo tintado de la categoría + su icono
        this.addEventListener('error', () => {
          const g = select(this.parentNode);
          const color = catById[d.cat]?.color ?? '#9bb4d0';
          this.remove();
          g.insert('path', '.picon-ring')
            .attr('d', squircle(d.r))
            .attr('fill', color)
            .attr('fill-opacity', 0.16);
          const logo = catById[d.cat]?.logo;
          if (logo) {
            const s = d.r * 0.78;
            g.insert('image', '.picon-ring')
              .attr('href', logo)
              .attr('x', -s / 2)
              .attr('y', -s / 2)
              .attr('width', s)
              .attr('height', s)
              .attr('opacity', 0.9)
              .attr('pointer-events', 'none');
          }
        }, { once: true });
      });

    icons.append('path')
      .attr('d', (d) => squircle(d.r))
      .attr('fill', 'url(#bub-fade)');

    icons.append('path')
      .attr('class', 'picon-ring')
      .attr('d', (d) => squircle(d.r))
      .attr('fill', 'none')
      .attr('stroke', (d) => catById[d.cat]?.color ?? '#9bb4d0')
      .attr('stroke-width', 1.6);

    // Insignia de premio
    icons.filter((d) => d.premio)
      .append('text')
      .attr('x', (d) => d.r * 0.72)
      .attr('y', (d) => -d.r * 0.62)
      .attr('text-anchor', 'middle')
      .attr('font-size', (d) => Math.max(13, d.r * 0.34))
      .attr('pointer-events', 'none')
      .text('🏆');

    // Nombre bajo el icono, como en una pantalla de inicio
    icons.each(function (d) {
      const g = select(this);
      const maxChars = Math.max(10, Math.floor((narrow ? 15 : 17) * (d.r / rMax + 0.35)));
      const lines = wrapTitle(d.titulo, maxChars);
      lines.forEach((line, i) => {
        g.append('text')
          .attr('class', 'picon-label')
          .attr('text-anchor', 'middle')
          .attr('x', 0)
          .attr('y', d.r + labelFs + 4 + i * (labelFs + 2))
          .attr('font-family', "'Chakra Petch', sans-serif")
          .attr('font-size', labelFs)
          .attr('font-weight', 500)
          .attr('fill', 'rgba(255,255,255,0.88)')
          .attr('stroke', 'rgba(0,8,20,0.6)')
          .attr('stroke-width', 2.5)
          .attr('paint-order', 'stroke')
          .attr('pointer-events', 'none')
          .text(line);
      });
    });

    // ── Tooltip y resaltado por icono ──
    icons
      .on('click', (event, d) => {
        // Marca la imagen para el morph de view-transition hacia la ficha
        const img = event.currentTarget.querySelector('image');
        if (img) img.style.viewTransitionName = 'project-hero';
      })
      .on('mouseenter', function (event, d) {
        select(this).raise();
        select(this).select('.picon-ring').attr('stroke-width', 3);
        showTip(d);
        moveTip(event);
      })
      .on('mousemove', (event) => moveTip(event))
      .on('mouseleave', function () {
        select(this).select('.picon-ring').attr('stroke-width', 1.6);
        tip.style.display = 'none';
      })
      .on('focus', function (event, d) {
        showTip(d);
        const r = wrap.getBoundingClientRect();
        const b = this.getBoundingClientRect();
        positionTip(b.right - r.left + 10, b.top - r.top);
      })
      .on('blur', () => { tip.style.display = 'none'; });

    applyHighlight();
    render();

    // ── Lupa tipo Apple Watch ──
    fisheyeOn = finePointer && !reduced && !narrow;
    if (fisheyeOn) {
      const sigma = dx * 0.85;
      const AMP = 0.5;
      const PUSH = dx * 0.16;

      const els = icons.nodes();
      let raised = null;
      const setTargets = (mx, my) => {
        let nearest = -1;
        let nearestDist = Infinity;
        nodes.forEach((d, i) => {
          const ddx = d.x - mx;
          const ddy = d.y - my;
          const dist = Math.hypot(ddx, ddy) || 1;
          const f = Math.exp(-(dist * dist) / (2 * sigma * sigma));
          d.ts = 1 + AMP * f;
          d.tox = (ddx / dist) * PUSH * f;
          d.toy = (ddy / dist) * PUSH * f;
          if (dist < nearestDist) { nearestDist = dist; nearest = i; }
        });
        // El icono más cercano al cursor pasa al frente para que su
        // nombre no quede tapado por la fila siguiente
        if (nearest >= 0 && els[nearest] !== raised) {
          raised = els[nearest];
          raised.parentNode.appendChild(raised);
        }
        startLoop();
      };

      const clearTargets = () => {
        for (const d of nodes) { d.ts = 1; d.tox = 0; d.toy = 0; }
        startLoop();
      };

      svg.node().addEventListener('pointermove', (e) => {
        const rect = svg.node().getBoundingClientRect();
        setTargets(
          ((e.clientX - rect.left) / rect.width) * W,
          ((e.clientY - rect.top) / rect.height) * H
        );
      });
      svg.node().addEventListener('pointerleave', clearTargets);
    }
  }

  // Interpola suavemente escala/desplazamiento hacia sus objetivos
  function startLoop() {
    if (rafId) return;
    const step = () => {
      let busy = false;
      for (const d of nodes) {
        d.s += (d.ts - d.s) * 0.22;
        d.ox += (d.tox - d.ox) * 0.22;
        d.oy += (d.toy - d.oy) * 0.22;
        if (Math.abs(d.ts - d.s) > 0.002 || Math.abs(d.tox - d.ox) > 0.1 || Math.abs(d.toy - d.oy) > 0.1) {
          busy = true;
        }
      }
      render();
      rafId = busy ? requestAnimationFrame(step) : 0;
    };
    rafId = requestAnimationFrame(step);
  }

  // ── Tooltip ──
  function showTip(d) {
    const cat = catById[d.cat];
    const techs = (d.tecnologias || [])
      .map((t) => `<span class="mapa-tip-tech">${t}</span>`)
      .join('');
    tip.innerHTML = `
      <div class="mapa-tip-titulo">${d.titulo}</div>
      <div class="mapa-tip-cat" style="color:${cat?.color ?? '#9bb4d0'}">${cat?.titulo ?? ''}</div>
      ${d.premio ? `<div class="mapa-tip-premio">🏆 ${d.premio}</div>` : ''}
      ${d.descripcion ? `<div class="mapa-tip-desc">${d.descripcion}</div>` : ''}
      <div class="mapa-tip-peso">
        <span>Envergadura</span>
        <span class="mapa-tip-barra"><i style="width:${d.peso ?? 50}%;background:${cat?.color ?? '#9bb4d0'}"></i></span>
      </div>
      ${techs ? `<div class="mapa-tip-techs">${techs}</div>` : ''}
    `;
    tip.style.display = 'block';
  }

  function positionTip(x, y) {
    const r = wrap.getBoundingClientRect();
    const tw = tip.offsetWidth || 220;
    tip.style.left = (x + tw < r.width ? x : Math.max(0, x - tw - 28)) + 'px';
    tip.style.top = Math.max(0, Math.min(y, r.height - tip.offsetHeight - 8)) + 'px';
  }

  function moveTip(event) {
    const r = wrap.getBoundingClientRect();
    positionTip(event.clientX - r.left + 16, event.clientY - r.top - 12);
  }

  // ── Resaltado por categoría (no oculta nada, solo atenúa el resto) ──
  function applyHighlight(previewCat) {
    const cat = previewCat !== undefined ? previewCat : hlCat;
    if (!icons) return;
    icons.classed('dim', (d) => cat !== null && d.cat !== cat);
    chipsEl.querySelectorAll('.mapa-pill').forEach((p) => {
      p.classList.toggle('act', p.dataset.cat === hlCat);
      p.setAttribute('aria-pressed', p.dataset.cat === hlCat ? 'true' : 'false');
    });
    document.querySelectorAll('.proyecto-card').forEach((card) => {
      card.classList.toggle('is-active', card.dataset.aptitudId === hlCat);
    });
  }

  function setHighlight(cat) {
    hlCat = cat;
    applyHighlight();
  }

  // ── Chips de leyenda ──
  cats.forEach((c) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'mapa-pill';
    el.dataset.cat = c.id;
    el.setAttribute('aria-pressed', 'false');
    const dot = document.createElement('span');
    dot.className = 'mapa-pill-dot';
    dot.style.background = c.color;
    el.appendChild(dot);
    el.appendChild(document.createTextNode(c.titulo));
    el.addEventListener('click', () => setHighlight(hlCat === c.id ? null : c.id));
    el.addEventListener('mouseenter', () => applyHighlight(c.id));
    el.addEventListener('mouseleave', () => applyHighlight());
    chipsEl.appendChild(el);
  });

  // ── La órbita de categorías lleva al panal y resalta su categoría ──
  document.querySelectorAll('.proyecto-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const id = card.dataset.aptitudId;
      if (!id) return;
      setHighlight(hlCat === id ? null : id);
      document.getElementById('proyectos-mapa')?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  });

  build();

  // ── Entrada: los iconos brotan al entrar en viewport ──
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting) || entered) return;
      entered = true;
      io.disconnect();
      if (reduced) {
        nodes.forEach((d) => (d.k = 1));
        render();
      } else {
        gsap.to(nodes, {
          k: 1,
          duration: 0.7,
          ease: 'back.out(1.7)',
          stagger: 0.035,
          onUpdate: render,
        });
      }
    },
    { threshold: 0.1 }
  );
  io.observe(wrap);

  // ── Cambio de layout (6 ↔ 3 columnas) al redimensionar ──
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      if (isNarrow() !== narrow) build();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPanal);
} else {
  initPanal();
}
