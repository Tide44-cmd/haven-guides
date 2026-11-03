const appearanceKey = 'haven-home-appearance-v1';

const titleArt = {
  'The Darkness': 'THE<br>DARKNESS',
  'State of Decay 2': 'STATE OF<br>DECAY 2',
  'Dead by Daylight': 'DEAD BY<br>DAYLIGHT',
  'The Elder Scrolls Online': 'ELDER SCROLLS<br>ONLINE'
};

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]);

let appearance = { artwork: true, softFocus: false };

try {
  const saved = JSON.parse(localStorage.getItem(appearanceKey) || '{}');
  if (typeof saved.artwork === 'boolean') appearance.artwork = saved.artwork;
  if (typeof saved.softFocus === 'boolean') appearance.softFocus = saved.softFocus;
} catch {
  // A damaged preference should never stop the guide list from loading.
}

const artworkToggle = document.querySelector('#artwork-toggle');
const focusToggle = document.querySelector('#focus-toggle');
const appearanceStatus = document.querySelector('#appearance-status');

function applyAppearance(announce = false) {
  document.body.classList.toggle('home-no-art', !appearance.artwork);
  document.body.classList.toggle('home-soft-art', appearance.artwork && appearance.softFocus);

  artworkToggle.classList.toggle('active', appearance.artwork);
  artworkToggle.setAttribute('aria-pressed', String(appearance.artwork));
  artworkToggle.textContent = `Artwork: ${appearance.artwork ? 'On' : 'Off'}`;

  focusToggle.classList.toggle('active', appearance.softFocus && appearance.artwork);
  focusToggle.setAttribute('aria-pressed', String(appearance.artwork && appearance.softFocus));
  focusToggle.disabled = !appearance.artwork;
  focusToggle.textContent = appearance.artwork ? `Soft focus: ${appearance.softFocus ? 'On' : 'Off'}` : 'Soft focus: —';

  try {
    localStorage.setItem(appearanceKey, JSON.stringify(appearance));
  } catch {
    // The visual controls still work when storage is unavailable.
  }
  if (announce) {
    appearanceStatus.textContent = appearance.artwork
      ? `Card artwork is on with ${appearance.softFocus ? 'soft' : 'sharp'} focus.`
      : 'Card artwork is off. Original gradient cards are shown.';
  }
}

artworkToggle.addEventListener('click', () => {
  appearance.artwork = !appearance.artwork;
  applyAppearance(true);
});

focusToggle.addEventListener('click', () => {
  appearance.softFocus = !appearance.softFocus;
  applyAppearance(true);
});

applyAppearance();

fetch('games.json')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load games');
    return response.json();
  })
  .then(games => {
    document.querySelector('#games').innerHTML = games.map(game => {
      const art = titleArt[game.title] || escapeHtml(game.title);
      const artworkUrl = game.artwork ? new URL(game.artwork, document.baseURI).href : '';
      const artwork = artworkUrl ? `url('${artworkUrl}')` : 'none';
      return `<a class="game-card" href="${encodeURI(game.url)}">
        <div class="game-art ${escapeHtml(game.theme || '')}" style="--tile-image:${artwork}">
          <span class="game-art-title">${art}</span>
        </div>
        <div class="game-details">
          <small>${escapeHtml(game.platform)} · ${escapeHtml(game.year)}</small>
          <h2>${escapeHtml(game.title)}</h2>
          <p>${escapeHtml(game.description)}</p>
          <small>${escapeHtml(game.tag)} →</small>
        </div>
      </a>`;
    }).join('');
  })
  .catch(() => {
    document.querySelector('#games').innerHTML = '<p class="empty">Unable to load games. Use a local web server or open via GitHub Pages.</p>';
  });
