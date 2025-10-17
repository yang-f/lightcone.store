const state = {
  categories: [],
  sites: [],
  selectedCategoryIds: new Set(),
  favorites: new Set(JSON.parse(localStorage.getItem('favorites') || '[]')),
  theme: localStorage.getItem('theme') || 'auto',
  search: '',
  sort: 'default',
  showFavoritesOnly: false,
};

const els = {
  categoryChips: document.getElementById('categoryChips'),
  sitesGrid: document.getElementById('sitesGrid'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  showFavoritesOnly: document.getElementById('showFavoritesOnly'),
  themeToggle: document.getElementById('themeToggle'),
};

init();

async function init() {
  applyTheme(state.theme);
  attachEvents();
  await loadData();
  renderCategories();
  renderSites();
}

function attachEvents() {
  els.searchInput.addEventListener('input', () => {
    state.search = els.searchInput.value.trim();
    renderSites();
  });
  els.sortSelect.addEventListener('change', () => {
    state.sort = els.sortSelect.value;
    renderSites();
  });
  els.showFavoritesOnly.addEventListener('change', () => {
    state.showFavoritesOnly = els.showFavoritesOnly.checked;
    renderSites();
  });
  els.themeToggle.addEventListener('click', () => {
    const next = nextTheme(state.theme);
    state.theme = next;
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
}

function nextTheme(current) {
  // auto -> light -> dark -> auto
  if (current === 'auto') return 'light';
  if (current === 'light') return 'dark';
  return 'auto';
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'auto') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

async function loadData() {
  try {
    const res = await fetch('assets/data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('加载数据失败');
    const json = await res.json();
    state.categories = json.categories || [];
    state.sites = json.sites || [];
  } catch (err) {
    console.error(err);
    state.categories = [];
    state.sites = [];
  }
}

function renderCategories() {
  els.categoryChips.innerHTML = '';
  const frag = document.createDocumentFragment();
  state.categories.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = cat.name;
    chip.setAttribute('data-id', cat.id);
    chip.addEventListener('click', () => {
      toggleCategory(cat.id, chip);
    });
    frag.appendChild(chip);
  });
  els.categoryChips.appendChild(frag);
}

function toggleCategory(id, chipEl) {
  if (state.selectedCategoryIds.has(id)) {
    state.selectedCategoryIds.delete(id);
    chipEl.classList.remove('active');
  } else {
    state.selectedCategoryIds.add(id);
    chipEl.classList.add('active');
  }
  renderSites();
}

function renderSites() {
  const query = state.search.toLowerCase();
  const hasCategoryFilter = state.selectedCategoryIds.size > 0;
  const showFavOnly = state.showFavoritesOnly;

  let list = state.sites.filter(site => {
    if (showFavOnly && !state.favorites.has(site.id)) return false;
    if (hasCategoryFilter && !site.categoryIds?.some(id => state.selectedCategoryIds.has(id))) return false;
    if (!query) return true;
    const hay = `${site.name} ${site.description || ''} ${(site.tags || []).join(' ')}`.toLowerCase();
    return hay.includes(query);
  });

  if (state.sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === 'za') list.sort((a, b) => b.name.localeCompare(a.name));

  els.sitesGrid.innerHTML = '';
  const frag = document.createDocumentFragment();
  list.forEach(site => frag.appendChild(renderCard(site)));
  els.sitesGrid.appendChild(frag);
}

function renderCard(site) {
  const card = document.createElement('div');
  card.className = 'card';

  const icon = document.createElement('img');
  icon.className = 'icon';
  icon.loading = 'lazy';
  icon.decoding = 'async';
  icon.src = site.icon || `https://www.google.com/s2/favicons?sz=64&domain=${new URL(site.url).hostname}`;

  const content = document.createElement('div');
  content.className = 'content';

  const title = document.createElement('div');
  title.className = 'title';

  const link = document.createElement('a');
  link.href = site.url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = site.name;

  const favBtn = document.createElement('button');
  favBtn.className = 'fav-btn';
  favBtn.textContent = state.favorites.has(site.id) ? '★ 收藏' : '☆ 收藏';
  if (state.favorites.has(site.id)) favBtn.classList.add('active');
  favBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFavorite(site.id, favBtn);
  });

  const desc = document.createElement('div');
  desc.className = 'desc';
  desc.textContent = site.description || '';

  const meta = document.createElement('div');
  meta.className = 'meta';
  (site.tags || []).forEach(tag => {
    const el = document.createElement('span');
    el.className = 'tag';
    el.textContent = tag;
    meta.appendChild(el);
  });

  title.appendChild(link);
  title.appendChild(favBtn);
  content.appendChild(title);
  content.appendChild(desc);
  content.appendChild(meta);

  card.appendChild(icon);
  card.appendChild(content);
  return card;
}

function toggleFavorite(id, btn) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }
  localStorage.setItem('favorites', JSON.stringify([...state.favorites]));
  btn.textContent = state.favorites.has(id) ? '★ 收藏' : '☆ 收藏';
  btn.classList.toggle('active', state.favorites.has(id));
}


