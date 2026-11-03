const storageKey = 'haven-eso-achievements-v1';
const bucketOrder = [
  'Story & Factions',
  'Zone Completion',
  'Exploration & Collectibles',
  'Dungeons',
  'Trials, Arenas & Archive',
  'PvP & Alliance War',
  'Guilds, Crafting & Systems',
  'Character & Progression'
];

const bucketIcons = {
  'Story & Factions': '◆',
  'Zone Completion': '⌂',
  'Exploration & Collectibles': '✦',
  'Dungeons': '⚔',
  'Trials, Arenas & Archive': '◈',
  'PvP & Alliance War': '⚑',
  'Guilds, Crafting & Systems': '✧',
  'Character & Progression': '▲'
};

let achievements = [];
let completed = new Set();
let partProgress = {};
let activeBucket = 'Story & Factions';
let incompleteOnly = true;

const byId = id => document.getElementById(id);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

function loadState() {
  try {
    const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
    completed = new Set(Array.isArray(state.completed) ? state.completed : []);
    partProgress = state.partProgress && typeof state.partProgress === 'object' ? state.partProgress : {};
  } catch {
    completed = new Set();
    partProgress = {};
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify({ version: 1, completed: [...completed], partProgress }));
}

function bucketCount(bucket = '') {
  const items = bucket ? achievements.filter(item => item.bucket === bucket) : achievements;
  return { total: items.length, done: items.filter(item => completed.has(item.id)).length };
}

function renderBuckets() {
  const buckets = [{ name: '', label: 'All achievements', icon: '◎' }, ...bucketOrder.map(name => ({ name, label: name, icon: bucketIcons[name] }))];
  byId('bucket-grid').innerHTML = buckets.map(bucket => {
    const count = bucketCount(bucket.name);
    const active = activeBucket === bucket.name;
    return `<button class="bucket-card ${active ? 'active' : ''}" type="button" data-bucket="${escapeHtml(bucket.name)}" aria-pressed="${active}">
      <strong>${escapeHtml(bucket.label)}</strong><span class="bucket-icon" aria-hidden="true">${bucket.icon}</span>
      <span class="bucket-count"><b>${count.done}/${count.total}</b> complete</span>
    </button>`;
  }).join('');
}

function progressStatus(item) {
  if (!item.progress) return null;
  const saved = partProgress[item.id];
  if (item.progress.type === 'counter') {
    const current = Math.min(item.progress.target, Math.max(0, Number(saved?.current) || 0));
    return { done: current, total: item.progress.target, percent: item.progress.target ? current / item.progress.target * 100 : 0, ready: current >= item.progress.target };
  }
  const checks = Array.isArray(saved?.checks) ? saved.checks : [];
  const done = item.progress.items.filter((_, index) => Boolean(checks[index])).length;
  return { done, total: item.progress.items.length, percent: item.progress.items.length ? done / item.progress.items.length * 100 : 0, ready: done === item.progress.items.length };
}

function renderPartProgress(item) {
  const status = progressStatus(item);
  if (!status) return '';
  const label = escapeHtml(item.progress.label || 'Part progress');
  if (item.progress.type === 'counter') {
    return `<details class="part-progress ${status.ready ? 'ready' : ''}">
      <summary><span>${label}</span><small>${status.ready ? 'Ready to claim' : `${status.done}/${status.total}`}</small></summary>
      <div class="part-body"><div class="counter-row">
        <input type="number" min="0" max="${item.progress.target}" step="1" value="${status.done}" data-counter-id="${item.id}" aria-label="${label}">
        <span class="part-track" aria-hidden="true"><i style="width:${status.percent.toFixed(2)}%"></i></span>
        <b>${status.done}/${status.total}</b>
      </div></div>
    </details>`;
  }
  const checks = Array.isArray(partProgress[item.id]?.checks) ? partProgress[item.id].checks : [];
  return `<details class="part-progress ${status.ready ? 'ready' : ''}">
    <summary><span>${label}</span><small>${status.ready ? 'Ready to claim' : `${status.done}/${status.total}`}</small></summary>
    <div class="part-body"><div class="part-list">${item.progress.items.map((part, index) => {
      const checked = Boolean(checks[index]);
      return `<label class="part-item ${checked ? 'checked' : ''}"><input type="checkbox" data-part-id="${item.id}" data-part-index="${index}" ${checked ? 'checked' : ''}><span>${escapeHtml(part)}</span></label>`;
    }).join('')}</div></div>
  </details>`;
}

function renderAchievements() {
  const query = byId('achievement-search').value.trim().toLocaleLowerCase();
  const tag = byId('tag-filter').value;
  const pack = byId('pack-filter').value;
  const visible = achievements.filter(item => {
    if (activeBucket && item.bucket !== activeBucket) return false;
    if (incompleteOnly && completed.has(item.id)) return false;
    if (tag && !item.tags.includes(tag)) return false;
    if (pack && item.pack !== pack) return false;
    const haystack = `${item.name} ${item.description} ${item.pack} ${item.bucket}`.toLocaleLowerCase();
    return !query || haystack.includes(query);
  });

  byId('achievement-list').innerHTML = visible.map(item => {
    const done = completed.has(item.id);
    const badges = [item.pack, ...item.tags.filter(tagName => tagName !== 'Part tracking').slice(0, 2)];
    return `<article class="achievement-card ${done ? 'completed' : ''}" data-card-id="${item.id}">
      <label class="achievement-main">
        <input type="checkbox" data-achievement-id="${item.id}" ${done ? 'checked' : ''}>
        <span class="achievement-copy">
          <span class="achievement-meta">${badges.map(badge => `<span class="achievement-badge">${escapeHtml(badge)}</span>`).join('')}</span>
          <strong>${escapeHtml(item.name)}</strong>
          <span class="achievement-description">${escapeHtml(item.description)}</span>
          ${item.guideNote ? `<span class="guide-note">${escapeHtml(item.guideNote)}</span>` : ''}
        </span>
      </label>
      ${renderPartProgress(item)}
    </article>`;
  }).join('');

  const overall = bucketCount();
  byId('completed-count').textContent = overall.done;
  byId('total-count').textContent = overall.total;
  byId('hero-progress').textContent = `${overall.done}/${overall.total}`;
  byId('result-line').textContent = `${visible.length} achievement${visible.length === 1 ? '' : 's'} shown · ${overall.total - overall.done} incomplete overall`;
  byId('empty-state').hidden = visible.length !== 0;
  renderBuckets();

  const active = [activeBucket && `Path: ${activeBucket}`, tag && `Focus: ${tag}`, pack && `Content: ${pack}`].filter(Boolean);
  const activeLine = byId('active-filter-line');
  activeLine.hidden = active.length === 0;
  activeLine.innerHTML = active.length ? `<span>${active.map(escapeHtml).join(' · ')}</span><button type="button" data-clear-filters>Clear filters</button>` : '';
}

function populateFilters() {
  const tags = [...new Set(achievements.flatMap(item => item.tags))].sort((a, b) => a.localeCompare(b));
  const packs = [...new Set(achievements.map(item => item.pack))].sort((a, b) => a.localeCompare(b));
  byId('tag-filter').insertAdjacentHTML('beforeend', tags.map(tag => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join(''));
  byId('pack-filter').insertAdjacentHTML('beforeend', packs.map(pack => `<option value="${escapeHtml(pack)}">${escapeHtml(pack)}</option>`).join(''));
}

function clearFilters() {
  activeBucket = '';
  byId('achievement-search').value = '';
  byId('tag-filter').value = '';
  byId('pack-filter').value = '';
  renderAchievements();
}

document.addEventListener('click', event => {
  const bucket = event.target.closest('[data-bucket]');
  if (bucket) {
    activeBucket = bucket.dataset.bucket;
    renderAchievements();
    byId('result-line').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (event.target.closest('[data-clear-filters]')) clearFilters();
});

document.addEventListener('change', event => {
  const achievementInput = event.target.closest('[data-achievement-id]');
  if (achievementInput) {
    achievementInput.checked ? completed.add(achievementInput.dataset.achievementId) : completed.delete(achievementInput.dataset.achievementId);
    saveState();
    renderAchievements();
    return;
  }
  const partInput = event.target.closest('[data-part-id]');
  if (partInput) {
    const id = partInput.dataset.partId;
    const index = Number(partInput.dataset.partIndex);
    const checks = Array.isArray(partProgress[id]?.checks) ? [...partProgress[id].checks] : [];
    checks[index] = partInput.checked;
    partProgress[id] = { checks };
    saveState();
    renderAchievements();
    return;
  }
  const counterInput = event.target.closest('[data-counter-id]');
  if (counterInput) {
    const item = achievements.find(achievement => achievement.id === counterInput.dataset.counterId);
    const current = Math.min(item.progress.target, Math.max(0, Math.round(Number(counterInput.value) || 0)));
    partProgress[item.id] = { current };
    saveState();
    renderAchievements();
    return;
  }
  if (event.target.matches('#tag-filter,#pack-filter')) renderAchievements();
});

byId('achievement-search').addEventListener('input', renderAchievements);
byId('incomplete-toggle').addEventListener('click', event => {
  incompleteOnly = !incompleteOnly;
  event.currentTarget.classList.toggle('active', incompleteOnly);
  event.currentTarget.setAttribute('aria-pressed', String(incompleteOnly));
  event.currentTarget.textContent = `Show incomplete only: ${incompleteOnly ? 'Yes' : 'No'}`;
  renderAchievements();
});
byId('export-progress').addEventListener('click', () => {
  const backup = { version: 1, exportedAt: new Date().toISOString(), completed: [...completed], partProgress };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  link.download = `haven-eso-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});
byId('import-progress').addEventListener('click', () => byId('progress-file').click());
byId('progress-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    if (!Array.isArray(backup.completed) || !backup.partProgress || typeof backup.partProgress !== 'object') throw new Error('Unsupported backup');
    const validIds = new Set(achievements.map(item => item.id));
    completed = new Set(backup.completed.filter(id => validIds.has(id)));
    partProgress = Object.fromEntries(Object.entries(backup.partProgress).filter(([id]) => validIds.has(id)));
    saveState();
    renderAchievements();
    alert('ESO progress imported successfully.');
  } catch {
    alert('That file is not a valid Haven ESO progress export.');
  }
  event.target.value = '';
});
byId('reset-progress').addEventListener('click', () => {
  if (!completed.size && !Object.keys(partProgress).length) return;
  if (!confirm('Reset every ESO achievement and part-progress entry?')) return;
  completed.clear();
  partProgress = {};
  saveState();
  renderAchievements();
});

fetch('achievements.json').then(response => response.ok ? response.json() : Promise.reject(new Error('Achievement data failed'))).then(items => {
  achievements = items;
  loadState();
  populateFilters();
  renderAchievements();
}).catch(error => {
  byId('result-line').textContent = 'Unable to load tracker data.';
  console.error(error);
});
