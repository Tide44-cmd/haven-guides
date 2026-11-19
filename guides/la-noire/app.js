const storageKey = 'haven-la-noire-v1';
let guide;
let state = { clues: [], cases: [], crimes: [], vehicles: [], weapons: [] };
let activeView = 'cases';
let activeDesk = 'patrol';
let activeCrimeDesk = 'all';
let activeArsenal = 'all';
let incompleteOnly = true;
let firstCaseRender = true;

const byId = id => document.getElementById(id);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const checked = type => new Set(state[type]);
const has = (type, id) => state[type].includes(id);

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, ...state })); } catch { /* Keep the guide usable when storage is blocked. */ }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    for (const key of Object.keys(state)) state[key] = Array.isArray(saved[key]) ? [...new Set(saved[key])] : [];
  } catch { state = { clues: [], cases: [], crimes: [], vehicles: [], weapons: [] }; }
}

function toggle(type, id, value) {
  const set = checked(type);
  value ? set.add(id) : set.delete(id);
  state[type] = [...set];
  save();
}

function markRelatedGearUsed(caseItem) {
  let changed = false;
  for (const item of caseItem.vehicleOpportunities) if (!has('vehicles', item.id)) { state.vehicles.push(item.id); changed = true; }
  for (const item of caseItem.weaponOpportunities) if (!has('weapons', item.id)) { state.weapons.push(item.id); changed = true; }
  if (changed) save();
}

function caseIsDone(caseItem) {
  if (has('cases', caseItem.id)) return true;
  const clues = caseItem.blocks.flatMap(block => block.clues);
  return clues.length > 0 && clues.every(clue => has('clues', clue.id));
}

function renderHeader() {
  const cases = guide.desks.flatMap(desk => desk.cases);
  const done = cases.filter(caseIsDone).length;
  byId('case-progress').textContent = done;
  byId('case-progress-bar').style.width = `${done / cases.length * 100}%`;
  byId('crime-tab-count').textContent = `${state.crimes.length}/${guide.totals.streetCrimes}`;
  byId('vehicle-count').textContent = `${state.vehicles.length}/${guide.totals.vehicles}`;
  byId('weapon-count').textContent = `${state.weapons.length}/${guide.totals.weapons}`;
}

function opportunityCards(caseItem) {
  const items = [
    ...caseItem.weaponOpportunities.map(item => ({ ...item, kind: 'Weapon', icon: '⚠' })),
    ...caseItem.vehicleOpportunities.map(item => ({ ...item, kind: 'Vehicle', icon: '◆' }))
  ];
  const sideObjectives = (caseItem.sideObjectives || []).map(item => ({ ...item, kind: 'Optional objective', icon: '☆' }));
  if (!items.length && !sideObjectives.length) return '';
  return `<div class="opportunity-grid">${[...items, ...sideObjectives].map(item => `<article class="opportunity ${item.kind === 'Optional objective' ? 'side-objective' : ''}"><span>${item.icon} ${item.kind}</span><strong>${item.source ? `<a href="${escapeHtml(item.source)}" target="_blank" rel="noopener">${escapeHtml(item.name)}</a>` : escapeHtml(item.name)}</strong><p>${escapeHtml(item.description || item.note)}</p></article>`).join('')}</div>`;
}

function renderTopic(topic) {
  const parts = topic.instruction.split(/:\s*/);
  return `<div class="topic"><span>${escapeHtml(parts.shift())}</span><strong>${escapeHtml(parts.join(': '))}</strong>${topic.response ? `<p>${escapeHtml(topic.response)}</p>` : ''}</div>`;
}

function renderBlock(block, index, caseItem) {
  const found = block.clues.filter(clue => has('clues', clue.id)).length;
  return `<details class="route-block" data-route-block="${index}">
    <summary><span class="route-index">${String(index + 1).padStart(2, '0')}</span><span><strong>${escapeHtml(block.title)}</strong><small>${block.clues.length ? `${found}/${block.clues.length} clues here · ${block.caseRunning || found}/${caseItem.clueTotal} in case` : block.type === 'interview' ? `${block.topics.length} interview topic${block.topics.length === 1 ? '' : 's'}` : 'Route guidance'}</small></span><i>⌄</i></summary>
    <div class="route-body">
      ${block.clues.length ? `<div class="clue-list">${block.clues.map(clue => `<label class="check-row ${has('clues', clue.id) ? 'done' : ''}"><input type="checkbox" data-check="clues" data-id="${clue.id}" ${has('clues', clue.id) ? 'checked' : ''}><span><strong>${escapeHtml(clue.name)}</strong></span></label>`).join('')}</div>` : ''}
      ${block.topics.length ? `<div class="topic-list">${block.topics.map(renderTopic).join('')}</div>` : ''}
      ${block.paragraphs.map(paragraph => `<p class="route-copy">${escapeHtml(paragraph)}</p>`).join('')}
    </div>
  </details>`;
}

function renderCase(caseItem, deskName, forceOpen) {
  const clues = caseItem.blocks.flatMap(block => block.clues);
  const found = clues.filter(clue => has('clues', clue.id)).length;
  const done = caseIsDone(caseItem);
  return `<details class="case-card ${done ? 'complete' : ''}" data-case-id="${caseItem.id}" ${forceOpen ? 'open' : ''}>
    <summary><span class="case-file">${escapeHtml(deskName)} file</span><span class="case-title"><strong>${escapeHtml(caseItem.title)}</strong><small>${found}/${caseItem.clueTotal} clues found</small></span><span class="case-status">${done ? 'Closed' : 'Open'} <i>⌄</i></span></summary>
    <div class="case-body">
      ${caseItem.objectives.length ? `<div class="objectives"><span>Case objectives</span><ul>${caseItem.objectives.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
      ${opportunityCards(caseItem)}
      <div class="route-list">${caseItem.blocks.map((block, index) => renderBlock(block, index, caseItem)).join('')}</div>
      <div class="case-actions"><span>Clues save as you tick them. Close the case when you’re ready to move on.</span><button type="button" data-case-solved="${caseItem.id}" class="case-complete ${done ? 'done' : ''}">${done ? '✓ Case solved' : 'Mark case solved'}</button></div>
    </div>
  </details>`;
}

function renderCases() {
  const query = byId('search').value.trim().toLowerCase();
  byId('desk-strip').innerHTML = guide.desks.map(desk => {
    const done = desk.cases.filter(caseIsDone).length;
    return `<button type="button" class="desk-button ${desk.id === activeDesk ? 'active' : ''}" data-desk="${desk.id}"><strong>${desk.name}</strong><span>${done}/${desk.cases.length} cases</span></button>`;
  }).join('');
  const desk = guide.desks.find(item => item.id === activeDesk);
  const openIds = firstCaseRender ? new Set() : new Set([...document.querySelectorAll('.case-card[open]')].map(item => item.dataset.caseId));
  firstCaseRender = false;
  const visible = desk.cases.filter(caseItem => {
    if (incompleteOnly && caseIsDone(caseItem)) return false;
    if (!query) return true;
    return JSON.stringify(caseItem).toLowerCase().includes(query);
  });
  byId('case-list').innerHTML = visible.map(item => renderCase(item, desk.name, openIds.has(item.id))).join('');
  byId('case-result').textContent = `${visible.length} of ${desk.cases.length} ${desk.name} cases shown`;
  showEmpty(!visible.length);
}

function renderCrimes() {
  const query = byId('search').value.trim().toLowerCase();
  const desks = ['all', ...new Set(guide.streetCrimes.map(crime => crime.desk))];
  byId('crime-filters').innerHTML = desks.map(desk => `<button type="button" class="pill ${desk === activeCrimeDesk ? 'active' : ''}" data-crime-desk="${desk}">${desk === 'all' ? 'All desks' : desk}</button>`).join('');
  const visible = guide.streetCrimes.filter(crime => {
    if (activeCrimeDesk !== 'all' && crime.desk !== activeCrimeDesk) return false;
    if (incompleteOnly && has('crimes', crime.id)) return false;
    return !query || JSON.stringify(crime).toLowerCase().includes(query);
  });
  byId('crime-list').innerHTML = visible.map(crime => `<label class="crime-card ${has('crimes', crime.id) ? 'done' : ''}">
    <input type="checkbox" data-check="crimes" data-id="${crime.id}" ${has('crimes', crime.id) ? 'checked' : ''}>
    <span class="crime-number">${String(crime.number).padStart(2, '0')}</span>
    <span class="crime-content"><span class="meta">${crime.desk} · ${escapeHtml(crime.time)}</span><strong>${escapeHtml(crime.title)}</strong>${crime.unlock ? `<small>Available after ${escapeHtml(crime.unlock)}</small>` : ''}${crime.vehicleOpportunities.length ? `<span class="mini-notice">◆ Vehicle: ${crime.vehicleOpportunities.map(item => escapeHtml(item.name)).join(', ')}</span>` : ''}<p>${escapeHtml(crime.paragraphs.join(' '))}</p></span>
  </label>`).join('');
  byId('crime-result').textContent = `${visible.length} street crime${visible.length === 1 ? '' : 's'} shown · ${guide.totals.streetCrimes - state.crimes.length} remaining overall`;
  showEmpty(!visible.length);
}

function renderArsenal() {
  const query = byId('search').value.trim().toLowerCase();
  const categories = ['all', 'weapons', ...new Set(guide.vehicles.map(vehicle => vehicle.category))];
  byId('arsenal-filters').innerHTML = categories.map(category => `<button type="button" class="pill ${category === activeArsenal ? 'active' : ''}" data-arsenal="${escapeHtml(category)}">${category === 'all' ? 'Everything' : category === 'weapons' ? 'Weapons' : escapeHtml(category)}</button>`).join('');
  const items = [
    ...guide.weapons.map(item => ({ ...item, type: 'weapons', group: 'Weapon', detail: item.note })),
    ...guide.vehicles.map(item => ({ ...item, type: 'vehicles', group: item.category, detail: [item.location, item.story, item.notes].filter(Boolean).join(' · ') }))
  ].filter(item => {
    if (activeArsenal !== 'all' && item.group !== activeArsenal && item.type !== activeArsenal) return false;
    if (incompleteOnly && has(item.type, item.id)) return false;
    return !query || `${item.name} ${item.detail} ${item.group}`.toLowerCase().includes(query);
  });
  byId('arsenal-list').innerHTML = items.map(item => `<label class="arsenal-card ${has(item.type, item.id) ? 'done' : ''}"><input type="checkbox" data-check="${item.type}" data-id="${item.id}" ${has(item.type, item.id) ? 'checked' : ''}><span><span class="meta">${escapeHtml(item.group)}</span><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.detail || 'No additional location note supplied.')}</p></span></label>`).join('');
  byId('arsenal-result').textContent = `${items.length} catalogue item${items.length === 1 ? '' : 's'} shown`;
  showEmpty(!items.length);
}

function showEmpty(value) { byId('empty-state').hidden = !value; }
function render() {
  document.querySelectorAll('.guide-view').forEach(view => view.classList.toggle('active', view.id === `${activeView}-view`));
  document.querySelectorAll('.view-tab').forEach(tab => { const active = tab.dataset.view === activeView; tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); });
  renderHeader();
  if (activeView === 'cases') renderCases();
  if (activeView === 'crimes') renderCrimes();
  if (activeView === 'arsenal') renderArsenal();
}

document.addEventListener('click', event => {
  const tab = event.target.closest('[data-view]');
  if (tab) { activeView = tab.dataset.view; byId('search').value = ''; render(); return; }
  const desk = event.target.closest('[data-desk]');
  if (desk) { activeDesk = desk.dataset.desk; firstCaseRender = true; render(); return; }
  const crimeDesk = event.target.closest('[data-crime-desk]');
  if (crimeDesk) { activeCrimeDesk = crimeDesk.dataset.crimeDesk; render(); return; }
  const arsenal = event.target.closest('[data-arsenal]');
  if (arsenal) { activeArsenal = arsenal.dataset.arsenal; render(); return; }
  const caseButton = event.target.closest('[data-case-solved]');
  if (caseButton) {
    const desk = guide.desks.find(item => item.id === activeDesk);
    const caseIndex = desk.cases.findIndex(item => item.id === caseButton.dataset.caseSolved);
    const currentCase = desk.cases[caseIndex];
    const nextCase = desk.cases.slice(caseIndex + 1).find(item => !caseIsDone(item));
    markRelatedGearUsed(currentCase);
    toggle('cases', caseButton.dataset.caseSolved, true);
    render();
    if (nextCase) {
      const nextCard = document.querySelector(`.case-card[data-case-id="${nextCase.id}"]`);
      if (nextCard) { nextCard.open = true; nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
  }
});

document.addEventListener('change', event => {
  const input = event.target.closest('[data-check]');
  if (!input) return;
  const caseCard = input.closest('.case-card');
  const openBlocks = caseCard ? new Set([...caseCard.querySelectorAll('.route-block[open]')].map(block => block.dataset.routeBlock)) : new Set();
  toggle(input.dataset.check, input.dataset.id, input.checked);
  if (caseCard) {
    const currentCase = guide.desks.flatMap(desk => desk.cases).find(item => item.id === caseCard.dataset.caseId);
    const matchingItems = input.dataset.check === 'vehicles' ? currentCase?.vehicleOpportunities : input.dataset.check === 'weapons' ? currentCase?.weaponOpportunities : [];
    const matchingItem = matchingItems?.find(item => item.id === input.dataset.id);
    if (matchingItem) toggle(input.dataset.check, matchingItem.id, input.checked);
  }
  render();
  if (caseCard) {
    const renderedCase = document.querySelector(`.case-card[data-case-id="${caseCard.dataset.caseId}"]`);
    if (renderedCase) {
      renderedCase.open = true;
      renderedCase.querySelectorAll('.route-block').forEach(block => { block.open = openBlocks.has(block.dataset.routeBlock); });
    }
  }
});

byId('search').addEventListener('input', render);
byId('incomplete-toggle').addEventListener('click', event => {
  incompleteOnly = !incompleteOnly;
  event.currentTarget.classList.toggle('active', incompleteOnly);
  event.currentTarget.setAttribute('aria-pressed', String(incompleteOnly));
  event.currentTarget.textContent = `Incomplete only: ${incompleteOnly ? 'Yes' : 'No'}`;
  render();
});

byId('export-progress').addEventListener('click', () => {
  const backup = { version: 1, game: guide.game, exportedAt: new Date().toISOString(), ...state };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  link.download = `haven-la-noire-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});
byId('import-progress').addEventListener('click', () => byId('progress-file').click());
byId('progress-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    for (const key of Object.keys(state)) if (!Array.isArray(backup[key])) throw new Error('Invalid backup');
    state = Object.fromEntries(Object.keys(state).map(key => [key, [...new Set(backup[key])]]));
    save(); render(); alert('L.A. Noire progress imported successfully.');
  } catch { alert('That file is not a valid Haven L.A. Noire progress export.'); }
  event.target.value = '';
});
byId('reset-progress').addEventListener('click', () => {
  if (!Object.values(state).some(items => items.length)) return;
  if (!confirm('Reset all L.A. Noire progress?')) return;
  state = { clues: [], cases: [], crimes: [], vehicles: [], weapons: [] }; save(); render();
});

fetch('data.json').then(response => response.ok ? response.json() : Promise.reject(new Error('Guide failed to load'))).then(data => { guide = data; load(); render(); }).catch(error => { byId('case-result').textContent = 'Unable to load the case notebook.'; console.error(error); });
