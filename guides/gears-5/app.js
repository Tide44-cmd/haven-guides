const storageKey = 'haven-gears-5-progress-v1';
const sectionOrder = ['Campaign', 'Horde', 'Escape', 'Versus', 'Cross-Mode/Misc', 'Progression/Tour/Re-Ups', 'Collections/Skins', 'Hivebusters Campaign'];

let achievements = [];
let classData = null;
let completed = new Set();
let classProgress = {};
let xpPerHour = 1;
let activeSection = '';
let incompleteOnly = true;

const byId = id => document.getElementById(id);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify({ version: 1, initialized: true, completed: [...completed], classProgress, xpPerHour }));
}

function getStoredState() {
  try {
    const state = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return state && state.initialized ? state : null;
  } catch {
    return null;
  }
}

function applyInitialState() {
  const stored = getStoredState();
  completed = new Set(stored ? stored.completed || [] : achievements.filter(item => item.defaultCompleted).map(item => item.id));
  classProgress = {};
  classData.classes.forEach(item => {
    const saved = stored?.classProgress?.[item.name];
    classProgress[item.name] = { level: Number(saved?.level ?? item.defaultLevel), xp: Number(saved?.xp ?? item.defaultXp) };
  });
  xpPerHour = Number(stored?.xpPerHour ?? classData.xpPerHour) || classData.xpPerHour;
  saveState();
}

function populatePackFilter() {
  const packs = [...new Set(achievements.map(item => item.sourcePack))].sort((a, b) => a.localeCompare(b));
  byId('pack-filter').insertAdjacentHTML('beforeend', packs.map(pack => `<option value="${escapeHtml(pack)}">${escapeHtml(pack)}</option>`).join(''));
}

function countFor(section = '') {
  const items = section ? achievements.filter(item => item.section === section) : achievements;
  return { total: items.length, done: items.filter(item => completed.has(item.id)).length };
}

function renderCategories() {
  const categories = [{ name: '', label: 'All achievements' }, ...sectionOrder.map(name => ({ name, label: name }))];
  byId('category-grid').innerHTML = categories.map(item => {
    const count = countFor(item.name);
    const finished = count.total > 0 && count.done === count.total;
    return `<button class="category-card ${activeSection === item.name ? 'active' : ''}" type="button" data-section="${escapeHtml(item.name)}" aria-pressed="${activeSection === item.name}">
      ${finished ? '<i class="category-check" aria-label="Complete">✓</i>' : ''}
      <strong>${escapeHtml(item.label)}</strong><span><b>${count.done}/${count.total}</b> complete</span>
    </button>`;
  }).join('');
}

function renderAchievements() {
  const query = byId('achievement-search').value.trim().toLocaleLowerCase();
  const pack = byId('pack-filter').value;
  const visible = achievements.filter(item => {
    if (activeSection && item.section !== activeSection) return false;
    if (pack && item.sourcePack !== pack) return false;
    if (incompleteOnly && completed.has(item.id)) return false;
    return !query || `${item.name} ${item.description} ${item.note}`.toLocaleLowerCase().includes(query);
  });

  byId('achievement-list').innerHTML = visible.map(item => {
    const done = completed.has(item.id);
    return `<label class="achievement-card ${done ? 'completed' : ''}">
      <input type="checkbox" data-achievement-id="${escapeHtml(item.id)}" ${done ? 'checked' : ''}>
      <span class="achievement-copy">
        <span class="achievement-meta"><span class="achievement-badge type">${escapeHtml(item.section)}</span><span class="achievement-badge">${escapeHtml(item.sourcePack)}</span></span>
        <strong>${escapeHtml(item.name)}</strong>
        <span class="achievement-description">${escapeHtml(item.description)}</span>
        ${item.note ? `<span class="achievement-note">Note: ${escapeHtml(item.note)}</span>` : ''}
      </span>
    </label>`;
  }).join('');

  const overall = countFor();
  const percent = overall.total ? Math.round(overall.done / overall.total * 100) : 0;
  byId('completed-count').textContent = overall.done;
  byId('total-count').textContent = overall.total;
  byId('hero-complete').textContent = `${overall.done}/${overall.total}`;
  byId('hero-percent').textContent = `${percent}% complete`;
  byId('hero-bar').style.width = `${percent}%`;
  byId('result-line').textContent = `${visible.length} achievement${visible.length === 1 ? '' : 's'} shown · ${overall.total - overall.done} incomplete overall`;
  byId('empty-state').hidden = visible.length !== 0;
  renderCategories();
}

function levelRecord(level) {
  return classData.xpCurve.find(item => item.level === level) || classData.xpCurve[0];
}

function normalizeClassValue(name) {
  const progress = classProgress[name];
  progress.level = Math.min(20, Math.max(1, Math.round(Number(progress.level) || 1)));
  const record = levelRecord(progress.level);
  progress.xp = progress.level === 20 ? 0 : Math.min(record.xpToNext, Math.max(0, Math.round(Number(progress.xp) || 0)));
  return progress;
}

function classStats(name) {
  const progress = normalizeClassValue(name);
  const record = levelRecord(progress.level);
  const lifetime = Math.min(classData.maxLifetimeXp, record.lifetimeXp + progress.xp);
  const remaining = Math.max(0, classData.maxLifetimeXp - lifetime);
  return { ...progress, lifetime, remaining, percent: lifetime / classData.maxLifetimeXp * 100 };
}

function formatNumber(value) {
  return Math.round(value).toLocaleString('en-GB');
}

function formatTime(hours) {
  if (!Number.isFinite(hours) || hours <= 0) return '0h';
  const minutes = Math.round(hours * 60);
  const days = Math.floor(minutes / 1440);
  const hrs = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days) return `${days}d ${hrs}h`;
  if (hrs) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function renderClasses() {
  const grouped = new Map();
  classData.classes.forEach(item => {
    if (!grouped.has(item.category)) grouped.set(item.category, []);
    grouped.get(item.category).push(item);
  });

  byId('class-groups').innerHTML = [...grouped.entries()].map(([category, items]) => `<section class="class-group">
    <h3>${escapeHtml(category)}</h3>
    ${items.map(item => {
      const stats = classStats(item.name);
      return `<div class="class-row" data-class-row="${escapeHtml(item.name)}">
        <span class="class-name">${escapeHtml(item.name)}</span>
        <label class="class-field"><span>Current level</span><input type="number" min="1" max="20" step="1" value="${stats.level}" data-class-level="${escapeHtml(item.name)}"></label>
        <label class="class-field"><span>XP into level</span><input type="number" min="0" max="${levelRecord(stats.level).xpToNext}" step="1" value="${stats.xp}" data-class-xp="${escapeHtml(item.name)}" ${stats.level === 20 ? 'disabled' : ''}></label>
        <span class="class-progress"><span>${formatNumber(stats.remaining)} XP left · ${formatTime(stats.remaining / xpPerHour)}</span><i class="mini-track"><i style="width:${stats.percent.toFixed(2)}%"></i></i></span>
      </div>`;
    }).join('')}
  </section>`).join('');

  const stats = classData.classes.map(item => classStats(item.name));
  const complete = stats.filter(item => item.remaining === 0).length;
  const remaining = stats.reduce((sum, item) => sum + item.remaining, 0);
  const time = remaining / xpPerHour;
  byId('xp-rate').value = xpPerHour;
  byId('classes-complete').textContent = complete;
  byId('xp-remaining').textContent = formatNumber(remaining);
  byId('time-remaining').textContent = formatTime(time);
  byId('class-done-summary').textContent = `${complete}/${stats.length}`;
  byId('time-summary').textContent = `${formatTime(time)} remaining`;
}

function renderAll() {
  renderAchievements();
  renderClasses();
}

document.addEventListener('click', event => {
  const category = event.target.closest('[data-section]');
  if (category) {
    activeSection = category.dataset.section;
    renderAchievements();
    byId('result-line').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

document.addEventListener('change', event => {
  const achievement = event.target.closest('[data-achievement-id]');
  if (achievement) {
    achievement.checked ? completed.add(achievement.dataset.achievementId) : completed.delete(achievement.dataset.achievementId);
    saveState();
    renderAchievements();
    return;
  }
  const levelInput = event.target.closest('[data-class-level]');
  if (levelInput) {
    classProgress[levelInput.dataset.classLevel].level = Number(levelInput.value);
    saveState();
    renderClasses();
    return;
  }
  const xpInput = event.target.closest('[data-class-xp]');
  if (xpInput) {
    classProgress[xpInput.dataset.classXp].xp = Number(xpInput.value);
    saveState();
    renderClasses();
  }
});

byId('achievement-search').addEventListener('input', renderAchievements);
byId('pack-filter').addEventListener('change', renderAchievements);
byId('xp-rate').addEventListener('change', event => {
  xpPerHour = Math.max(1, Math.round(Number(event.target.value) || classData.xpPerHour));
  saveState();
  renderClasses();
});
byId('incomplete-toggle').addEventListener('click', event => {
  incompleteOnly = !incompleteOnly;
  event.currentTarget.classList.toggle('active', incompleteOnly);
  event.currentTarget.setAttribute('aria-pressed', String(incompleteOnly));
  event.currentTarget.textContent = `Show incomplete only: ${incompleteOnly ? 'Yes' : 'No'}`;
  renderAchievements();
});
byId('export-progress').addEventListener('click', () => {
  const backup = { version: 1, exportedAt: new Date().toISOString(), completed: [...completed], classProgress, xpPerHour };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
  link.download = `haven-gears-5-progress-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});
byId('import-progress').addEventListener('click', () => byId('progress-file').click());
byId('progress-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const backup = JSON.parse(await file.text());
    if (!Array.isArray(backup.completed) || !backup.classProgress) throw new Error('Unsupported backup');
    const validIds = new Set(achievements.map(item => item.id));
    completed = new Set(backup.completed.filter(id => validIds.has(id)));
    classData.classes.forEach(item => {
      const saved = backup.classProgress[item.name];
      if (saved) classProgress[item.name] = { level: Number(saved.level), xp: Number(saved.xp) };
    });
    xpPerHour = Math.max(1, Number(backup.xpPerHour) || classData.xpPerHour);
    saveState();
    renderAll();
    alert('Gears 5 progress imported successfully.');
  } catch {
    alert('That file is not a valid Haven Gears 5 progress export.');
  }
  event.target.value = '';
});
byId('reset-progress').addEventListener('click', () => {
  if (!confirm('Reset every Gears 5 achievement and class value?')) return;
  completed.clear();
  classProgress = Object.fromEntries(classData.classes.map(item => [item.name, { level: 1, xp: 0 }]));
  xpPerHour = classData.xpPerHour;
  saveState();
  renderAll();
});

Promise.all([
  fetch('achievements.json').then(response => response.ok ? response.json() : Promise.reject(new Error('Achievement data failed'))),
  fetch('classes.json').then(response => response.ok ? response.json() : Promise.reject(new Error('Class data failed')))
]).then(([achievementItems, loadedClassData]) => {
  achievements = achievementItems;
  classData = loadedClassData;
  populatePackFilter();
  applyInitialState();
  renderAll();
}).catch(error => {
  byId('result-line').textContent = 'Unable to load tracker data.';
  byId('time-summary').textContent = 'Unable to load class data.';
  console.error(error);
});
