const dlcStorageKey = 'haven-dbd-dlc-owned-v1';
const achievementStorageKey = 'haven-dbd-achievements-v1';

let dlcCatalogue = [];
let achievements = [];
let characterMetadata = {};
let ownedDlc = loadSet(dlcStorageKey);
let earnedAchievements = loadSet(achievementStorageKey);
let activeDlcFilter = 'all';
let incompleteOnly = true;

const byId = id => document.getElementById(id);
const dlcGrid = byId('dlc-grid');
const achievementList = byId('achievement-list');

function loadSet(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(dlcStorageKey, JSON.stringify([...ownedDlc]));
  localStorage.setItem(achievementStorageKey, JSON.stringify([...earnedAchievements]));
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function setView(viewId, updateHash = true) {
  document.querySelectorAll('.tracker-view').forEach(view => {
    const active = view.id === viewId;
    view.classList.toggle('active', active);
    view.hidden = !active;
  });
  document.querySelectorAll('[data-view-target]').forEach(button => {
    const active = button.dataset.viewTarget === viewId;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  if (updateHash) history.replaceState(null, '', viewId === 'achievements-view' ? '#achievements' : '#dlc');
}

function renderDlc() {
  const query = byId('dlc-search').value.trim().toLocaleLowerCase();
  const visible = dlcCatalogue.filter(item => {
    const isOwned = ownedDlc.has(item.name);
    const filterMatch = activeDlcFilter === 'owned' ? isOwned
      : activeDlcFilter === 'missing' ? !isOwned
      : activeDlcFilter === 'licensed' ? item.licensed
      : activeDlcFilter === 'original' ? !item.licensed
      : true;
    return filterMatch && item.name.toLocaleLowerCase().includes(query);
  });

  dlcGrid.innerHTML = visible.map(item => {
    const isOwned = ownedDlc.has(item.name);
    return `<label class="dlc-card ${isOwned ? 'owned' : ''}">
      <input type="checkbox" data-dlc-name="${escapeHtml(item.name)}" ${isOwned ? 'checked' : ''}>
      <span class="checkmark" aria-hidden="true">${isOwned ? '✓' : ''}</span>
      <span class="dlc-copy"><strong>${escapeHtml(item.name)}</strong><span class="type-badge ${item.licensed ? 'licensed' : 'original'}">${item.licensed ? 'Licensed' : 'Original'}</span></span>
    </label>`;
  }).join('');

  const ownedItems = dlcCatalogue.filter(item => ownedDlc.has(item.name));
  const licensedOwned = ownedItems.filter(item => item.licensed).length;
  const percent = dlcCatalogue.length ? Math.round(ownedItems.length / dlcCatalogue.length * 100) : 0;
  byId('owned-count').textContent = ownedItems.length;
  byId('total-count').textContent = dlcCatalogue.length;
  byId('licensed-owned').textContent = licensedOwned;
  byId('original-owned').textContent = ownedItems.length - licensedOwned;
  byId('dlc-progress-percent').textContent = `${percent}%`;
  byId('dlc-progress-bar').style.width = `${percent}%`;
  byId('hero-dlc-count').textContent = `${ownedItems.length}/${dlcCatalogue.length}`;
  byId('dlc-result-line').textContent = `${visible.length} of ${dlcCatalogue.length} DLC shown`;
  byId('dlc-empty-state').hidden = visible.length !== 0;
}

function getPlanningTip(item) {
  if (/^Adept /i.test(item.name)) return `Use only ${item.character || 'this character'}’s three unique perks. Leave the fourth perk slot empty.`;
  if (/single (?:public )?match|single trial/i.test(item.description)) return 'This must be completed within one match.';
  if (item.map && /repair|generator/i.test(item.description)) return `Select ${item.map} if an offering is available, finish the named generator, then escape in the same match.`;
  if (/public matches/i.test(item.description) && /\d/.test(item.description)) return 'The total builds across public matches unless the requirement says otherwise.';
  return '';
}

function selectedValue(id) {
  return byId(id).value;
}

function renderAchievements() {
  const query = selectedValue('achievement-search').trim().toLocaleLowerCase();
  const role = selectedValue('role-filter');
  const character = selectedValue('character-filter');
  const map = selectedValue('map-filter');
  const dlc = selectedValue('achievement-dlc-filter');
  const visible = achievements.filter(item => {
    if (incompleteOnly && earnedAchievements.has(item.id)) return false;
    if (role && item.role !== role) return false;
    if (character && item.character !== character) return false;
    if (map && item.map !== map) return false;
    if (dlc && item.dlc !== dlc) return false;
    const haystack = `${item.name} ${item.description} ${item.character} ${item.map} ${item.dlc}`.toLocaleLowerCase();
    return !query || haystack.includes(query);
  });

  achievementList.innerHTML = visible.map(item => {
    const earned = earnedAchievements.has(item.id);
    const tip = getPlanningTip(item);
    const badges = [item.role, item.character, item.map, item.dlc].filter(Boolean);
    return `<label class="achievement-card ${earned ? 'earned' : ''}">
      <input type="checkbox" data-achievement-id="${escapeHtml(item.id)}" ${earned ? 'checked' : ''}>
      <span class="achievement-check" aria-hidden="true">${earned ? '✓' : ''}</span>
      <span class="achievement-copy">
        <span class="achievement-badges">${badges.map((badge, index) => `<span class="achievement-badge ${index === 0 ? item.role.toLowerCase() : ''}">${escapeHtml(badge)}</span>`).join('')}</span>
        <strong>${escapeHtml(item.name)}</strong>
        <span class="achievement-description">${escapeHtml(item.description)}</span>
        ${tip ? `<span class="planning-tip"><b>Planning note</b>${escapeHtml(tip)}</span>` : ''}
      </span>
    </label>`;
  }).join('');

  const total = achievements.length;
  const earned = achievements.filter(item => earnedAchievements.has(item.id)).length;
  const percent = total ? Math.round(earned / total * 100) : 0;
  byId('achievement-earned-count').textContent = earned;
  byId('achievement-total-count').textContent = total;
  byId('achievement-percent').textContent = `${percent}%`;
  byId('achievement-progress-bar').style.width = `${percent}%`;
  byId('achievement-remaining').textContent = `${total - earned} left`;
  byId('hero-achievement-count').textContent = `${earned}/${total}`;
  byId('achievement-result-line').textContent = `${visible.length} achievement${visible.length === 1 ? '' : 's'} shown · ${total - earned} incomplete overall`;
  byId('achievement-empty-state').hidden = visible.length !== 0;

  const active = [role && `Role: ${role}`, character && `Character: ${character}`, map && `Map: ${map}`, dlc && `Content: ${dlc}`].filter(Boolean);
  const activeLine = byId('active-filter-line');
  activeLine.hidden = active.length === 0;
  activeLine.innerHTML = active.length ? `<span>${active.map(escapeHtml).join(' · ')}</span><button type="button" data-clear-filters>Clear filters</button>` : '';
  renderCharacterTiles();
}

function initials(name) {
  return name.replace(/^The /, '').split(/[\s/]+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}

function renderCharacterTiles() {
  const current = selectedValue('character-filter');
  const grouped = new Map();
  achievements.filter(item => item.character && item.role !== 'Misc').forEach(item => {
    if (!grouped.has(item.character)) grouped.set(item.character, { role: item.role, items: [] });
    grouped.get(item.character).items.push(item);
  });

  const tileHtml = role => [...grouped.entries()]
    .filter(([, value]) => value.role === role)
    .filter(([, value]) => value.items.some(item => !earnedAchievements.has(item.id)))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => {
      const meta = characterMetadata[name] || {};
      const earned = value.items.filter(item => earnedAchievements.has(item.id)).length;
      const portrait = meta.image
        ? `<img src="${escapeHtml(meta.image)}" alt="" loading="lazy">`
        : `<span class="character-initials" aria-hidden="true">${escapeHtml(initials(name))}</span>`;
      return `<button class="character-tile ${role.toLowerCase()}-tile ${current === name ? 'active' : ''}" type="button" data-character="${escapeHtml(name)}" data-role="${role}">
        <span class="character-portrait">${portrait}</span><span class="character-name">${escapeHtml(meta.label || name)}</span><span class="character-count">${earned}/${value.items.length}</span>
      </button>`;
    }).join('');

  byId('killer-characters').innerHTML = tileHtml('Killer');
  byId('survivor-characters').innerHTML = tileHtml('Survivor');
}

function populateSelect(id, values) {
  const select = byId(id);
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b)).forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function updateCharacterOptions(role, preferredCharacter = byId('character-filter').value) {
  const select = byId('character-filter');
  const characters = [...new Set(achievements
    .filter(item => item.character && (!role || item.role === role))
    .map(item => item.character))]
    .sort((a, b) => a.localeCompare(b));
  select.innerHTML = '<option value="">All characters</option>';
  characters.forEach(character => {
    const option = document.createElement('option');
    option.value = character;
    option.textContent = character;
    select.append(option);
  });
  select.value = characters.includes(preferredCharacter) ? preferredCharacter : '';
  select.disabled = characters.length === 0;
}

function clearAchievementFilters() {
  ['achievement-search', 'role-filter', 'character-filter', 'map-filter', 'achievement-dlc-filter'].forEach(id => { byId(id).value = ''; });
  updateCharacterOptions('');
  renderAchievements();
}

document.addEventListener('change', event => {
  const dlcInput = event.target.closest('[data-dlc-name]');
  if (dlcInput) {
    dlcInput.checked ? ownedDlc.add(dlcInput.dataset.dlcName) : ownedDlc.delete(dlcInput.dataset.dlcName);
    saveProgress(); renderDlc(); return;
  }
  const achievementInput = event.target.closest('[data-achievement-id]');
  if (achievementInput) {
    achievementInput.checked ? earnedAchievements.add(achievementInput.dataset.achievementId) : earnedAchievements.delete(achievementInput.dataset.achievementId);
    saveProgress(); renderAchievements(); return;
  }
  if (event.target.matches('#role-filter')) {
    updateCharacterOptions(event.target.value);
    renderAchievements();
    return;
  }
  if (event.target.matches('#character-filter,#map-filter,#achievement-dlc-filter')) renderAchievements();
});

document.addEventListener('click', event => {
  const tab = event.target.closest('[data-view-target]');
  if (tab) setView(tab.dataset.viewTarget);
  const tile = event.target.closest('[data-character]');
  if (tile) {
    byId('role-filter').value = tile.dataset.role;
    updateCharacterOptions(tile.dataset.role, tile.dataset.character);
    renderAchievements();
    document.querySelector('.achievement-filters').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (event.target.closest('[data-clear-character]')) {
    byId('character-filter').value = '';
    renderAchievements();
  }
  if (event.target.closest('[data-clear-filters]')) clearAchievementFilters();
});

document.querySelectorAll('[data-dlc-filter]').forEach(button => button.addEventListener('click', () => {
  activeDlcFilter = button.dataset.dlcFilter;
  document.querySelectorAll('[data-dlc-filter]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderDlc();
}));

byId('dlc-search').addEventListener('input', renderDlc);
byId('achievement-search').addEventListener('input', renderAchievements);
byId('mark-all-dlc').addEventListener('click', () => { dlcCatalogue.forEach(item => ownedDlc.add(item.name)); saveProgress(); renderDlc(); });
byId('reset-dlc').addEventListener('click', () => {
  if (ownedDlc.size && confirm('Reset your entire Dead by Daylight DLC collection?')) { ownedDlc.clear(); saveProgress(); renderDlc(); }
});
byId('incomplete-toggle').addEventListener('click', event => {
  incompleteOnly = !incompleteOnly;
  event.currentTarget.classList.toggle('active', incompleteOnly);
  event.currentTarget.setAttribute('aria-pressed', String(incompleteOnly));
  event.currentTarget.textContent = `Show incomplete only: ${incompleteOnly ? 'On' : 'Off'}`;
  renderAchievements();
});
byId('reset-achievements').addEventListener('click', () => {
  if (earnedAchievements.size && confirm('Reset all earned achievement progress?')) { earnedAchievements.clear(); saveProgress(); renderAchievements(); }
});
byId('export-progress').addEventListener('click', () => {
  const backup = { version: 1, exportedAt: new Date().toISOString(), dlcOwned: [...ownedDlc], achievementsEarned: [...earnedAchievements] };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  link.download = `haven-dbd-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});
byId('import-progress').addEventListener('click', () => byId('progress-file').click());
byId('progress-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    if (!Array.isArray(backup.dlcOwned) || !Array.isArray(backup.achievementsEarned)) throw new Error('Unsupported backup');
    const validDlc = new Set(dlcCatalogue.map(item => item.name));
    const validAchievements = new Set(achievements.map(item => item.id));
    ownedDlc = new Set(backup.dlcOwned.filter(name => validDlc.has(name)));
    earnedAchievements = new Set(backup.achievementsEarned.filter(id => validAchievements.has(id)));
    saveProgress(); renderDlc(); renderAchievements();
    alert('Progress imported successfully.');
  } catch {
    alert('That file is not a valid Haven Dead by Daylight progress export.');
  }
  event.target.value = '';
});

Promise.all([
  fetch('dlc.json').then(response => response.ok ? response.json() : Promise.reject(new Error('DLC catalogue failed'))),
  fetch('achievements.json').then(response => response.ok ? response.json() : Promise.reject(new Error('Achievement catalogue failed'))),
  fetch('characters.json').then(response => response.ok ? response.json() : {})
]).then(([dlcItems, achievementItems, characterItems]) => {
  dlcCatalogue = dlcItems;
  achievements = achievementItems;
  characterMetadata = characterItems;
  updateCharacterOptions('');
  populateSelect('map-filter', achievements.map(item => item.map));
  populateSelect('achievement-dlc-filter', achievements.map(item => item.dlc));
  renderDlc();
  renderAchievements();
  setView(location.hash === '#achievements' ? 'achievements-view' : 'dlc-view', false);
}).catch(error => {
  byId('dlc-result-line').textContent = 'Unable to load tracker data.';
  byId('achievement-result-line').textContent = 'Unable to load tracker data.';
  console.error(error);
});
