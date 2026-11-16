const storageKey = 'haven-fear2-collectibles-v1';

let route = null;
let completed = new Set();
let typeFilter = 'all';
let incompleteOnly = true;
let firstRender = true;

const byId = id => document.getElementById(id);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    completed = new Set(Array.isArray(saved.completed) ? saved.completed : []);
  } catch {
    completed = new Set();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, completed: [...completed] }));
  } catch {
    // The tracker remains usable if local storage is blocked.
  }
}

function itemMatches(item, query) {
  if (typeFilter !== 'all' && item.type !== typeFilter) return false;
  if (incompleteOnly && completed.has(item.id)) return false;
  if (!query) return true;
  return `${item.type} ${item.number} ${item.name} ${item.section} ${item.location}`.toLocaleLowerCase().includes(query);
}

function renderMissionStrip(query) {
  byId('mission-strip').innerHTML = route.missions.map(mission => {
    const done = mission.items.filter(item => completed.has(item.id)).length;
    const available = mission.items.some(item => itemMatches(item, query));
    return `<button class="mission-jump ${done === mission.items.length ? 'complete' : ''} ${available ? '' : 'unavailable'}" type="button" data-mission-jump="${mission.number}" ${available ? '' : 'aria-disabled="true"'}>
      <strong>M${mission.number} · ${escapeHtml(mission.title)}</strong><span>${done}/${mission.items.length} secured</span>
    </button>`;
  }).join('');
}

function renderCollectible(item) {
  const done = completed.has(item.id);
  const title = item.type === 'intel' ? `Intel ${item.number} · ${escapeHtml(item.name)}` : escapeHtml(item.name);
  return `<label class="collectible ${done ? 'done' : ''}">
    <input type="checkbox" data-collectible-id="${item.id}" ${done ? 'checked' : ''}>
    <span class="collectible-main">
      <span class="collectible-topline"><span class="type-badge ${item.type}">${item.type === 'intel' ? 'Intel' : 'Reflex'}</span><h3>${title}</h3></span>
      ${item.section ? `<span class="journal">${escapeHtml(item.section)}</span>` : ''}
      <p class="location">${escapeHtml(item.location)}</p>
    </span>
  </label>`;
}

function render() {
  const query = byId('collectible-search').value.trim().toLocaleLowerCase();
  const openMissions = firstRender
    ? new Set([1])
    : new Set([...document.querySelectorAll('.mission-card[open]')].map(card => Number(card.dataset.mission)));
  firstRender = false;

  let visibleCount = 0;
  const missionHtml = route.missions.map(mission => {
    const visibleItems = mission.items.filter(item => itemMatches(item, query));
    if (!visibleItems.length) return '';
    visibleCount += visibleItems.length;
    const done = mission.items.filter(item => completed.has(item.id)).length;
    return `<details class="mission-card" data-mission="${mission.number}" ${openMissions.has(mission.number) ? 'open' : ''}>
      <summary>
        <span class="mission-number">${String(mission.number).padStart(2, '0')}</span>
        <span class="mission-title"><strong>${escapeHtml(mission.title)}</strong><small>${mission.intelCount} Intel · ${mission.reflexCount} Reflex Injector${mission.reflexCount === 1 ? '' : 's'}</small></span>
        <span class="mission-progress">${done}/${mission.items.length} secured</span>
      </summary>
      <div class="mission-body">${visibleItems.map(renderCollectible).join('')}</div>
    </details>`;
  }).join('');

  byId('mission-list').innerHTML = missionHtml;
  byId('empty-state').hidden = visibleCount !== 0;
  renderMissionStrip(query);

  const allItems = route.missions.flatMap(mission => mission.items);
  const intelDone = allItems.filter(item => item.type === 'intel' && completed.has(item.id)).length;
  const reflexDone = allItems.filter(item => item.type === 'reflex' && completed.has(item.id)).length;
  const totalDone = intelDone + reflexDone;
  byId('hero-complete').textContent = totalDone;
  byId('intel-complete').textContent = intelDone;
  byId('reflex-complete').textContent = reflexDone;
  byId('hero-bar-fill').style.width = `${totalDone / route.totals.collectibles * 100}%`;
  byId('result-line').textContent = `${visibleCount} collectible${visibleCount === 1 ? '' : 's'} shown · ${route.totals.collectibles - totalDone} remaining overall`;
}

document.addEventListener('click', event => {
  const typeButton = event.target.closest('[data-type]');
  if (typeButton) {
    typeFilter = typeButton.dataset.type;
    document.querySelectorAll('[data-type]').forEach(button => {
      const active = button === typeButton;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render();
    return;
  }

  const missionButton = event.target.closest('[data-mission-jump]');
  if (missionButton && missionButton.getAttribute('aria-disabled') !== 'true') {
    const mission = document.querySelector(`.mission-card[data-mission="${missionButton.dataset.missionJump}"]`);
    if (mission) {
      mission.open = true;
      mission.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

document.addEventListener('change', event => {
  const checkbox = event.target.closest('[data-collectible-id]');
  if (!checkbox) return;
  checkbox.checked ? completed.add(checkbox.dataset.collectibleId) : completed.delete(checkbox.dataset.collectibleId);
  saveProgress();
  render();
});

byId('collectible-search').addEventListener('input', render);
byId('incomplete-toggle').addEventListener('click', event => {
  incompleteOnly = !incompleteOnly;
  event.currentTarget.classList.toggle('active', incompleteOnly);
  event.currentTarget.setAttribute('aria-pressed', String(incompleteOnly));
  event.currentTarget.textContent = `Incomplete only: ${incompleteOnly ? 'Yes' : 'No'}`;
  render();
});

byId('export-progress').addEventListener('click', () => {
  const backup = { version: 1, game: route.game, exportedAt: new Date().toISOString(), completed: [...completed] };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  link.download = `haven-fear2-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

byId('import-progress').addEventListener('click', () => byId('progress-file').click());
byId('progress-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    if (!Array.isArray(backup.completed)) throw new Error('Unsupported backup');
    const validIds = new Set(route.missions.flatMap(mission => mission.items.map(item => item.id)));
    completed = new Set(backup.completed.filter(id => validIds.has(id)));
    saveProgress();
    render();
    alert('F.E.A.R. 2 progress imported successfully.');
  } catch {
    alert('That file is not a valid Haven F.E.A.R. 2 progress export.');
  }
  event.target.value = '';
});

byId('reset-progress').addEventListener('click', () => {
  if (!completed.size) return;
  if (!confirm('Reset every F.E.A.R. 2 collectible?')) return;
  completed.clear();
  saveProgress();
  render();
});

fetch('collectibles.json')
  .then(response => response.ok ? response.json() : Promise.reject(new Error('Collectible route failed to load')))
  .then(data => {
    route = data;
    loadProgress();
    render();
  })
  .catch(error => {
    byId('result-line').textContent = 'Unable to load the collectible route.';
    console.error(error);
  });
