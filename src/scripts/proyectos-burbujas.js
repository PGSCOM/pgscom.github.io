import { forceSimulation, forceCollide, forceManyBody, forceX, forceY } from 'd3-force';
import { select } from 'd3-selection';
import { scaleSqrt } from 'd3-scale';
import { drag } from 'd3-drag';
import 'd3-transition';
import gsap from 'gsap';

// ── Mapa de proyectos: burbujas-squircle con simulación de física ─────────────
// Cada proyecto es un "squircle" (forma de icono de iOS) cuyo tamaño viene de
// la propiedad `peso` del JSON. Las burbujas se agrupan por categoría en zonas
// y se pueden filtrar desde las pills o desde la órbita de categorías.

function initBurbujas() {
  const dataEl = document.getElementById('burbujas-data');
  const wrap = document.getElementById('mapaWrap');
  const tip = document.getElementById('mapaTip');
  const pillsEl = document.getElementById('mapaPills');
  if (!dataEl || !wrap || !tip || !pillsEl) return;

  const { cats, projects } = JSON.parse(dataEl.textContent);
  const catById = Object.fromEntries(cats.map((c) => [c.id, c]));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const svg = select('#mapaChart');
  if (svg.empty()) return;

  let curCat = 'all';
  let entered = false; // ya se reprodujo la animación de entrada
  let narrow = isNarrow();
  let sim = null;
  let nodes = [];
  let bubs = null;
  let W = 0;
  let H = 0;
  let zones = {};

  function isNarrow() {
    return (wrap.clientWidth || window.innerWidth) < 620;
  }

  // Superellipse |x/r|^n + |y/r|^n = 1 → la forma "casi cuadrada" de los
  // iconos de iOS. n controla cuánto se acerca al cuadrado.
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

  // La esquina del squircle sobresale del círculo inscrito (~4%)
  const EXTENT = Math.SQRT2 * 0.5 ** (2 / 4.5);

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

  function target(d) {
    return curCat === 'all' ? zones[d.cat] : [W / 2, H / 2];
  }

  function clampX(d) { return Math.max(d.r * EXTENT + 2, Math.min(W - d.r * EXTENT - 2, d.x)); }
  function clampY(d) { return Math.max(d.r * EXTENT + 2, Math.min(H - d.r * EXTENT - 2, d.y)); }

  function redraw() {
    if (!bubs) return;
    bubs.attr('transform', (d) => {
      d.x = clampX(d);
      d.y = clampY(d);
      return `translate(${d.x},${d.y}) scale(${d.k * d.h})`;
    });
  }

  function build() {
    narrow = isNarrow();
    const cols = narrow ? 2 : 3;
    const rows = Math.ceil(cats.length / cols);
    W = narrow ? 640 : 1000;
    H = narrow ? 980 : 640;
    const cellW = W / cols;
    const cellH = H / rows;

    zones = {};
    cats.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      // Desplazado hacia abajo para dejar aire a la etiqueta de zona
      zones[c.id] = [(col + 0.5) * cellW, (row + 0.5) * cellH + 18];
    });

    const rScale = scaleSqrt().domain([0, 100]).range([0, narrow ? 62 : 86]);
    const keepK = entered || reduced ? 1 : 0;
    nodes = projects.map((p, i) => {
      const [zx, zy] = zones[p.cat] || [W / 2, H / 2];
      return {
        ...p,
        r: Math.max(narrow ? 26 : 32, rScale(p.peso ?? 50)),
        x: zx + Math.cos(i * 2.4) * 30,
        y: zy + Math.sin(i * 2.4) * 30,
        k: keepK, // escala de entrada
        h: 1,     // escala de hover
      };
    });

    if (sim) sim.stop();
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    // ── Defs: degradado de legibilidad + clip squircle por burbuja ──
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'bub-fade').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
    grad.append('stop').attr('offset', '0.3').attr('stop-color', 'rgba(2,8,23,0)');
    grad.append('stop').attr('offset', '1').attr('stop-color', 'rgba(2,8,23,0.86)');

    nodes.forEach((d) => {
      defs.append('clipPath').attr('id', `bclip-${d.id}`)
        .append('path').attr('d', squircle(d.r));
    });

    // ── Divisores y etiquetas de zona ──
    const divG = svg.append('g').attr('class', 'mapa-divs');
    for (let c = 1; c < cols; c++) {
      divG.append('line')
        .attr('x1', c * cellW).attr('y1', 16).attr('x2', c * cellW).attr('y2', H - 16)
        .attr('stroke', 'rgba(255,255,255,0.13)').attr('stroke-width', 1).attr('stroke-dasharray', '3,7');
    }
    for (let r = 1; r < rows; r++) {
      divG.append('line')
        .attr('x1', 16).attr('y1', r * cellH).attr('x2', W - 16).attr('y2', r * cellH)
        .attr('stroke', 'rgba(255,255,255,0.13)').attr('stroke-width', 1).attr('stroke-dasharray', '3,7');
    }

    const zlG = svg.append('g').attr('class', 'mapa-zlabels');
    cats.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      zlG.append('text')
        .attr('x', (col + 0.5) * cellW)
        .attr('y', row * cellH + 22)
        .attr('text-anchor', 'middle')
        .attr('font-family', "'Chakra Petch', sans-serif")
        .attr('font-size', narrow ? 12 : 13)
        .attr('font-weight', 600)
        .attr('letter-spacing', '0.12em')
        .attr('fill', c.color)
        .attr('opacity', 0.85)
        .text(c.titulo.toUpperCase());
    });

    // ── Burbujas ──
    bubs = svg.append('g').attr('class', 'mapa-bubs')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'bub')
      .attr('tabindex', 0)
      .attr('role', 'link')
      .attr('aria-label', (d) => `${d.titulo} — ${catById[d.cat]?.titulo ?? ''}`);

    // Fondo (por si la imagen tarda) + imagen recortada al squircle
    bubs.append('path')
      .attr('d', (d) => squircle(d.r))
      .attr('fill', 'rgba(13,18,38,0.95)');

    bubs.append('image')
      .attr('href', (d) => d.imagen)
      .attr('x', (d) => -d.r).attr('y', (d) => -d.r)
      .attr('width', (d) => d.r * 2).attr('height', (d) => d.r * 2)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('clip-path', (d) => `url(#bclip-${d.id})`)
      .each(function (d) {
        // Si la imagen no existe: fondo tintado del color de la categoría + su icono
        this.addEventListener('error', () => {
          const g = select(this.parentNode);
          const color = catById[d.cat]?.color ?? '#9bb4d0';
          this.remove();
          g.insert('path', '.bub-ring')
            .attr('d', squircle(d.r))
            .attr('fill', color)
            .attr('fill-opacity', 0.16);
          const logo = catById[d.cat]?.logo;
          if (logo) {
            const s = d.r * 0.62;
            g.insert('image', '.bub-ring')
              .attr('href', logo)
              .attr('x', -s / 2)
              .attr('y', -s / 2 - d.r * 0.14)
              .attr('width', s)
              .attr('height', s)
              .attr('opacity', 0.9)
              .attr('pointer-events', 'none');
          }
        }, { once: true });
      });

    bubs.append('path')
      .attr('d', (d) => squircle(d.r))
      .attr('fill', 'url(#bub-fade)');

    bubs.append('path')
      .attr('class', 'bub-ring')
      .attr('d', (d) => squircle(d.r))
      .attr('fill', 'none')
      .attr('stroke', (d) => catById[d.cat]?.color ?? '#9bb4d0')
      .attr('stroke-width', 1.6)
      .attr('opacity', 0.9);

    // Título dentro de la burbuja (solo si cabe)
    bubs.each(function (d) {
      if (d.r < 40) return;
      const g = select(this);
      const fs = Math.max(11, Math.min(17, d.r * 0.24));
      const maxChars = Math.max(7, Math.floor((d.r * 1.55) / (fs * 0.56)));
      const lines = wrapTitle(d.titulo, maxChars);
      const lh = fs + 2;
      const baseY = d.r * 0.66;
      lines.forEach((line, i) => {
        g.append('text')
          .attr('class', 'bub-titulo')
          .attr('text-anchor', 'middle')
          .attr('x', 0)
          .attr('y', baseY - (lines.length - 1 - i) * lh)
          .attr('font-family', "'Chakra Petch', sans-serif")
          .attr('font-size', fs)
          .attr('font-weight', 600)
          .attr('fill', '#fff')
          .attr('stroke', 'rgba(0,8,20,0.55)')
          .attr('stroke-width', 2.5)
          .attr('paint-order', 'stroke')
          .attr('pointer-events', 'none')
          .text(line);
      });
      if (d.premio) {
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('x', 0)
          .attr('y', -d.r * 0.58)
          .attr('font-size', Math.max(13, d.r * 0.24))
          .attr('pointer-events', 'none')
          .text('🏆');
      }
    });

    // ── Física ──
    sim = forceSimulation(nodes)
      .force('charge', forceManyBody().strength(-14))
      .force('collide', forceCollide((d) => d.r * 1.05 + 4).strength(0.95))
      .force('x', forceX((d) => target(d)[0]).strength(curCat === 'all' ? 0.07 : 0.12))
      .force('y', forceY((d) => target(d)[1]).strength(curCat === 'all' ? 0.07 : 0.12))
      .on('tick', redraw)
      .stop();

    // ── Arrastrar burbujas ──
    bubs.call(
      drag()
        .clickDistance(6)
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.25).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

    // ── Interacción: tooltip, click y teclado ──
    bubs
      .on('click', (event, d) => {
        if (event.defaultPrevented) return; // venía de un drag
        window.location.href = `/proyectos/${d.id}`;
      })
      .on('keydown', (event, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.location.href = `/proyectos/${d.id}`;
        }
      })
      .on('mouseenter', function (event, d) {
        select(this).raise();
        select(this).select('.bub-ring').attr('stroke-width', 3).attr('opacity', 1);
        gsap.to(d, { h: 1.06, duration: 0.25, ease: 'power2.out', onUpdate: redraw });
        showTip(d);
        moveTip(event);
      })
      .on('mousemove', (event) => moveTip(event))
      .on('mouseleave', function (event, d) {
        select(this).select('.bub-ring').attr('stroke-width', 1.6).attr('opacity', 0.9);
        gsap.to(d, { h: 1, duration: 0.25, ease: 'power2.out', onUpdate: redraw });
        tip.style.display = 'none';
      });

    applyFilterStyles(0);
    redraw();

    if (entered || reduced) {
      sim.alpha(0.9).restart();
    }
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

  function moveTip(event) {
    const r = wrap.getBoundingClientRect();
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    const tw = tip.offsetWidth || 220;
    tip.style.left = (x + 16 + tw < r.width ? x + 16 : Math.max(0, x - tw - 16)) + 'px';
    tip.style.top = Math.max(0, Math.min(y - 12, r.height - tip.offsetHeight - 8)) + 'px';
  }

  // ── Filtro por categoría ──
  function applyFilterStyles(dur) {
    if (!bubs) return;
    const visible = (d) => curCat === 'all' || d.cat === curCat;
    bubs
      .style('pointer-events', (d) => (visible(d) ? 'auto' : 'none'))
      .attr('tabindex', (d) => (visible(d) ? 0 : -1))
      .transition().duration(dur)
      .style('opacity', (d) => (visible(d) ? 1 : 0.07));
    svg.select('.mapa-divs').transition().duration(dur).style('opacity', curCat === 'all' ? 1 : 0);
    svg.select('.mapa-zlabels').transition().duration(dur).style('opacity', curCat === 'all' ? 1 : 0);
  }

  function setFilter(cat) {
    curCat = cat;
    const s = cat === 'all' ? 0.07 : 0.12;
    sim.force('x', forceX((d) => target(d)[0]).strength(s));
    sim.force('y', forceY((d) => target(d)[1]).strength(s));
    sim.alpha(0.6).restart();
    applyFilterStyles(350);
    tip.style.display = 'none';

    pillsEl.querySelectorAll('.mapa-pill').forEach((p) => {
      p.classList.toggle('act', p.dataset.cat === cat);
      p.setAttribute('aria-pressed', p.dataset.cat === cat ? 'true' : 'false');
    });
    document.querySelectorAll('.proyecto-card').forEach((card) => {
      card.classList.toggle('is-active', card.dataset.aptitudId === cat);
    });
  }

  // ── Pills de filtro ──
  [{ id: 'all', titulo: 'Todos', color: null }, ...cats].forEach((c) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'mapa-pill' + (c.id === 'all' ? ' act' : '');
    el.dataset.cat = c.id;
    el.setAttribute('aria-pressed', c.id === 'all' ? 'true' : 'false');
    if (c.color) {
      const dot = document.createElement('span');
      dot.className = 'mapa-pill-dot';
      dot.style.background = c.color;
      el.appendChild(dot);
    }
    el.appendChild(document.createTextNode(c.titulo));
    el.addEventListener('click', () => setFilter(curCat === c.id && c.id !== 'all' ? 'all' : c.id));
    pillsEl.appendChild(el);
  });

  // ── La órbita de categorías también filtra el mapa ──
  document.querySelectorAll('.proyecto-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const id = card.dataset.aptitudId;
      if (!id) return;
      setFilter(curCat === id ? 'all' : id);
      document.getElementById('proyectos-mapa')?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'nearest',
      });
    });
  });

  build();

  // ── Entrada: las burbujas brotan al entrar en viewport ──
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting) || entered) return;
      entered = true;
      io.disconnect();
      sim.alpha(0.9).restart();
      if (reduced) {
        nodes.forEach((d) => (d.k = 1));
        redraw();
      } else {
        gsap.to(nodes, {
          k: 1,
          duration: 0.8,
          ease: 'back.out(1.7)',
          stagger: 0.045,
          onUpdate: redraw,
        });
      }
    },
    { threshold: 0.15 }
  );
  io.observe(wrap);

  // ── Cambio de layout (3×2 ↔ 2×3) al redimensionar ──
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
  document.addEventListener('DOMContentLoaded', initBurbujas);
} else {
  initBurbujas();
}
