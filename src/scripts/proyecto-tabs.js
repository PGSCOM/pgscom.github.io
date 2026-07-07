function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ensureHeadingId(heading, usedIds) {
  if (heading.id) {
    usedIds.add(heading.id);
    return heading.id;
  }

  const base = slugify(heading.textContent || '') || 'apartado';
  let id = base;
  let i = 2;
  while (usedIds.has(id) || document.getElementById(id)) {
    id = `${base}-${i++}`;
  }

  heading.id = id;
  usedIds.add(id);
  return id;
}

export function initProyectoTabs() {
  const container = document.querySelector('.pd-contenido');
  if (!container) return;

  const topSections = Array.from(container.querySelectorAll(':scope > h2'));
  if (topSections.length < 2) return;

  const tabsRoot = document.createElement('section');
  tabsRoot.className = 'pd-tabs';

  const tabList = document.createElement('div');
  tabList.className = 'pd-tabs-list';
  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'Apartados del proyecto');

  const panels = document.createElement('div');
  panels.className = 'pd-tabs-panels';

  const usedIds = new Set(Array.from(container.querySelectorAll('[id]'), (el) => el.id));
  const tabs = [];
  const panelByHeadingId = new Map();

  topSections.forEach((heading, index) => {
    const headingId = ensureHeadingId(heading, usedIds);
    const tabId = `pd-tab-${headingId}`;
    const panelId = `pd-panel-${headingId}`;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'pd-tab-btn';
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
    tab.textContent = heading.textContent?.trim() || `Apartado ${index + 1}`;

    const panel = document.createElement('section');
    panel.className = 'pd-tab-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.hidden = true;

    let current = heading;
    while (current) {
      const next = current.nextElementSibling;
      if (current !== heading && current.tagName === 'H2') break;
      panel.appendChild(current);
      current = next;
    }

    panelByHeadingId.set(headingId, index);
    tabs.push({ tab, panel, headingId });
    tabList.appendChild(tab);
    panels.appendChild(panel);
  });

  tabsRoot.appendChild(tabList);
  tabsRoot.appendChild(panels);
  container.prepend(tabsRoot);

  const setActive = (index, { updateHash = false, focusTab = false } = {}) => {
    tabs.forEach(({ tab, panel }, i) => {
      const active = i === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('tabindex', active ? '0' : '-1');
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    const activeTab = tabs[index];
    if (!activeTab) return;

    if (focusTab) activeTab.tab.focus();

    if (updateHash && activeTab.headingId) {
      history.replaceState(null, '', `#${activeTab.headingId}`);
    }
  };

  tabs.forEach(({ tab }, index) => {
    tab.addEventListener('click', () => setActive(index, { updateHash: true }));
  });

  tabList.addEventListener('keydown', (event) => {
    const currentIndex = tabs.findIndex(({ tab }) => tab.getAttribute('aria-selected') === 'true');
    if (currentIndex === -1) return;

    let nextIndex = null;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    setActive(nextIndex, { updateHash: true, focusTab: true });
  });

  const initialHash = window.location.hash.replace('#', '');
  const initialIndex = panelByHeadingId.get(initialHash) ?? 0;
  setActive(initialIndex);

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    const index = panelByHeadingId.get(hash);
    if (typeof index === 'number') setActive(index);
  });
}
