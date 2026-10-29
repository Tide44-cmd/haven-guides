import fs from 'node:fs';

const api = 'https://deadbydaylight.fandom.com/api.php';
const headers = { 'User-Agent': 'HavenGuides/1.0 (portrait catalogue update)' };
const aliases = {
  'Bill Overbeck': 'William “Bill” Overbeck',
  'David Tapp': 'Detective Tapp',
  'Leon Scott Kennedy': 'Leon S. Kennedy',
  'The Troupe': 'Aestri Yazar / Baermar Uraz'
};

async function renderedPage(page) {
  const url = new URL(api);
  Object.entries({ action: 'parse', page, prop: 'text', format: 'json', origin: '*' }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Wiki API ${response.status}`);
  const data = await response.json();
  return data.parse.text['*'];
}

function decode(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
}

function portraits(html, role) {
  const result = {};
  const prefix = role === 'Killer' ? 'K' : 'S';
  const pattern = new RegExp(`<a href="/wiki/[^"]+" title="([^"]+)"><img[^>]+data-image-key="(${prefix}\\d+_[^"]+_Portrait\\.png)"[^>]+data-src="(https://static\\.wikia\\.nocookie\\.net/[^"]+?\\.png)(?:/[^"<]*)?"`, 'g');
  for (const match of html.matchAll(pattern)) {
    const wikiName = decode(match[1]);
    const trackerName = aliases[wikiName] || wikiName;
    result[trackerName] = { role, image: match[3] };
  }
  return result;
}

const [killerHtml, survivorHtml] = await Promise.all([renderedPage('Killers'), renderedPage('Survivors')]);
const scraped = { ...portraits(killerHtml, 'Killer'), ...portraits(survivorHtml, 'Survivor') };
const charactersUrl = new URL('./characters.json', import.meta.url);
const achievementsUrl = new URL('./achievements.json', import.meta.url);
const existing = JSON.parse(fs.readFileSync(charactersUrl, 'utf8'));
const achievements = JSON.parse(fs.readFileSync(achievementsUrl, 'utf8'));
const output = { ...scraped };

for (const [name, value] of Object.entries(existing)) {
  output[name] = value.source === 'wiki.gg' ? value : output[name] ? { ...value, ...output[name] } : value;
}
fs.writeFileSync(charactersUrl, `${JSON.stringify(output, null, 2)}\n`);

const trackerCharacters = [...new Set(achievements.map(item => item.character).filter(Boolean))];
const missing = trackerCharacters.filter(name => !output[name]);
console.log(`Saved ${Object.keys(output).length} character records.`);
console.log(`Portrait coverage: ${trackerCharacters.length - missing.length}/${trackerCharacters.length} tracker characters.`);
if (missing.length) console.log(`No portrait on the linked wiki pages: ${missing.join(', ')}`);
