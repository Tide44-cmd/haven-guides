const storageKey = 'haven-dbd-dlc-owned-v1';
let catalogue = [];
let owned = new Set();
let activeFilter = 'all';

try {
  owned = new Set(JSON.parse(localStorage.getItem(storageKey) || '[]'));
} catch {
  owned = new Set();
}

const grid = document.querySelector('#dlc-grid');
const search = document.querySelector('#search');
const emptyState = document.querySelector('#empty-state');

function save() {
  localStorage.setItem(storageKey, JSON.stringify([...owned]));
}

function matchesFilter(item) {
  if (activeFilter === 'owned') return owned.has(item.name);
  if (activeFilter === 'missing') return !owned.has(item.name);
  if (activeFilter === 'licensed') return item.licensed;
  if (activeFilter === 'original') return !item.licensed;
  return true;
}

function updateStats() {
  const ownedItems = catalogue.filter(item => owned.has(item.name));
  const licensedOwned = ownedItems.filter(item => item.licensed).length;
  const originalOwned = ownedItems.length - licensedOwned;
  const percent = catalogue.length ? Math.round((ownedItems.length / catalogue.length) * 100) : 0;

  document.querySelector('#owned-count').textContent = ownedItems.length;
  document.querySelector('#total-count').textContent = catalogue.length;
  document.querySelector('#licensed-owned').textContent = licensedOwned;
  document.querySelector('#original-owned').textContent = originalOwned;
  document.querySelector('#progress-percent').textContent = `${percent}%`;
  document.querySelector('#progress-bar').style.width = `${percent}%`;
}

function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const visible = catalogue.filter(item => matchesFilter(item) && item.name.toLocaleLowerCase().includes(query));

  grid.innerHTML = visible.map(item => {
    const isOwned = owned.has(item.name);
    return `<label class="dlc-card ${isOwned ? 'owned' : ''}">
      <input type="checkbox" data-name="${escapeAttribute(item.name)}" ${isOwned ? 'checked' : ''}>
      <span class="checkmark" aria-hidden="true">${isOwned ? '✓' : ''}</span>
      <span class="dlc-copy">
        <strong>${escapeHtml(item.name)}</strong>
        <span class="type-badge ${item.licensed ? 'licensed' : 'original'}">${item.licensed ? 'Licensed' : 'Original'}</span>
      </span>
    </label>`;
  }).join('');

  document.querySelector('#result-line').textContent = `${visible.length} of ${catalogue.length} DLC shown`;
  emptyState.hidden = visible.length !== 0;

  grid.querySelectorAll('input[data-name]').forEach(input => {
    input.addEventListener('change', () => {
      input.checked ? owned.add(input.dataset.name) : owned.delete(input.dataset.name);
      save();
      updateStats();
      render();
    });
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    render();
  });
});

search.addEventListener('input', render);

document.querySelector('#mark-all').addEventListener('click', () => {
  catalogue.forEach(item => owned.add(item.name));
  save();
  updateStats();
  render();
});

document.querySelector('#reset').addEventListener('click', () => {
  if (owned.size && confirm('Reset your entire Dead by Daylight DLC collection?')) {
    owned.clear();
    save();
    updateStats();
    render();
  }
});

fetch('dlc.json')
  .then(response => {
    if (!response.ok) throw new Error('Could not load DLC catalogue');
    return response.json();
  })
  .then(items => {
    catalogue = items;
    updateStats();
    render();
  })
  .catch(error => {
    document.querySelector('#result-line').textContent = 'Unable to load the DLC catalogue.';
    console.error(error);
  });
