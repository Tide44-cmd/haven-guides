const raw = [
  ['Chapter 1 — Beginnings', [
    ['heart', 'George Handel — first favour', 'Canal Street, stairs to Chinatown', 'Speak to George, confront Compton Scarr downstairs and tell him to let George play. Return to George.'],
    ['heart', 'Charlane Warburton — four coins', 'Fulton Street station', 'Collect all four coins from the tracks in one attempt; ask to retry if needed.'],
    ['heart', 'Ingrid Pulanski — lost bracelet', 'Fulton Street, incoming-train platform', 'Search the tracks below the platform edge for her bracelet and return it.'],
    ['outfit', 'Potato Sack', 'Chinatown, outside subway', 'Look for a glowing glass display case near the alley. Smash it and collect the outfit.'],
    ['outfit', 'Jungle Outfit', 'Near Dutch Oven Harry’s hideout', 'Find the locked room near Matty Forehand. Send Creeping Dark through the upper opening to unlock it.']
  ]],
  ['Chapter 2 — No Man’s Land', [
    ['letter', 'First trenches — bunker hatch', 'After the plane crash', 'Break the bunker hatch beyond the low wall and climb down.'],
    ['letter', 'Barbed-wire bridge', 'Ruined battlefield', 'Cross the small barbed-wire bridge to the bunker roof.'],
    ['letter', 'Crucified creature', 'Battlefield', 'Use Creeping Dark to retrieve the letter near its feet.'],
    ['letter', 'Outside enemy bunker', 'After Kamikaze Darkling breach', 'Use Creeping Dark along the outer ledge.'],
    ['letter', 'British soldier’s bunker', 'Friendly trenches', 'Search near the harmonica-playing soldier.'],
    ['letter', 'Village shack', 'Village entrance', 'Turn right after climbing the ladder.'],
    ['letter', 'Ruined building near church', 'Village upper paths', 'Cross two bridges and search left of the cross-marked door.'],
    ['letter', 'Above the bell', 'Path towards the Hills', 'Use Creeping Dark on the raised platform.'],
    ['letter', 'Side trench', 'No Man’s Land', 'Check the left branch before the hilltop.'],
    ['letter', 'Destroyed house fireplace', 'After Darkness Guns', 'Search the ruined house fireplace.'],
    ['letter', 'Behind sewer entrance', 'Village return route', 'Turn around immediately after crouching through the narrow passage.'],
    ['letter', 'Lower platform at staircase', 'Sewer staircase', 'Send Creeping Dark over the railing at the top.'],
    ['letter', 'Pump tunnels', 'After draining water', 'Take the first left through the lower door.'],
    ['letter', 'Upper bunker railing', 'Towards Gustav cannon', 'Search the upper-level railing.'],
    ['letter', 'Cannon railway gate', 'Outside Gustav cannon', 'Follow tracks to the locked gate.'],
    ['letter', 'Beneath cannon catwalk', 'Inside Gustav cannon', 'Use Creeping Dark under the catwalk.'],
    ['letter', 'Cannon roof ledge', 'Top of Gustav cannon', 'Send Creeping Dark along the right ledge before entering controls.']
  ]],
  ['Chapter 3 — Return to New York', [
    ['heart', 'Dana Cutrone — apartment key', 'Fulton Street → Chinatown', 'Accept Dana’s request and retrieve her keys from Joey Skelton.'],
    ['outfit', 'Lumberjack Outfit', 'Dana’s apartment', 'Collect the outfit case inside Joey’s apartment.'],
    ['heart', 'Dana Cutrone — return key', 'Fulton Street', 'Return the keys to Dana.'],
    ['heart', 'Jimmy the Grape — informant', 'Canal Street → Grinder’s Lane', 'Kill the informant and recover the list.'],
    ['outfit', 'Fireman Outfit', 'Informant’s apartment', 'Search the room for the outfit case.'],
    ['heart', 'Jimmy the Grape — return list', 'Canal Street', 'Return the list to Jimmy.'],
    ['heart', 'Vinny — contract 1', 'Lower East Side', 'Kill target near Aunt Sarah’s and report back.'],
    ['heart', 'Vinny — contract 2', 'Grinder’s Lane', 'Kill the guarded target and report back.'],
    ['heart', 'Vinny — contract 3', 'Lower East Side', 'Destroy noisy car and occupants; report back.'],
    ['heart', 'Vinny — contract 4', 'Chinatown', 'Kill the dealer between Orchid and Plum; report back.'],
    ['heart', 'Vinny — contract 5', 'Gun Hill', 'Send Creeping Dark through elevated open window to kill surveillance target.'],
    ['outfit', 'Sledgehammer Outfit', 'Gun Hill surveillance room', 'Collect the outfit case near surveillance equipment.'],
    ['heart', 'Vinny — final report', 'Fulton Street', 'Report the fifth contract to Vinny.'],
    ['heart', 'George Handel — stolen harmonica', 'Lower East Side', 'Kill Compton Scarr and recover George’s harmonica. Return it.'],
    ['heart', 'Terence Willis — Whitefish gang', 'Canal Street → Whitefish', 'Eliminate gang and return to Terence.'],
    ['heart', 'Lucas Hellinger — shell game', 'Canal Street', 'Use Terence’s advice, distract Lucas and pick marked cup.'],
    ['heart', 'Mitch Duval — missing brother', 'Fulton Street → City Hall tunnels', 'Follow tunnels, disarm traps and find Mitch’s brother.'],
    ['outfit', 'Jackhammer Outfit', 'Abandoned City Hall station', 'Search the old subway carriage.'],
    ['heart', 'Mitch Duval — report back', 'Fulton Street', 'Return to Mitch after dealing with his brother.']
  ]],
  ['Chapter 4 — Second Underworld Visit', [
    ['letter', 'Under Gustav cannon platform', 'After cannon hatch', 'Use Creeping Dark beneath raised platform.'],
    ['letter', 'Building ladder and grate', 'Return route', 'Climb down the ladder and turn right.'],
    ['letter', 'Sewer entrance grate', 'Sewers', 'Collect letter in front of breakable grate.'],
    ['letter', 'Waterway platform', 'Sewers', 'Follow water right and climb onto platform.'],
    ['heart', 'Charlie Hazelgrove — message for Rosie', 'Village return route', 'Speak to Charlie among British soldiers and accept message and locket.'],
    ['letter', 'Room after giant creature', 'After tank battle', 'Enter room on left before following Tony.'],
    ['letter', 'Castle upper catwalk', 'Castle bunker', 'Climb stairs, turn right and follow catwalk.'],
    ['letter', 'Path after firing cannon', 'Return from Gustav cannon', 'Search beside left light before wooden planks.'],
    ['letter', 'Outside castle entrance', 'Castle gate', 'Check final light on right.'],
    ['letter', 'Dirt mound in corridor', 'Castle interior', 'Use Creeping Dark on left dirt mound.'],
    ['letter', 'Final room with four chairs', 'Castle interior', 'Collect letter near gate before interacting with chairs.']
  ]],
  ['Chapter 5 — Final Return to New York', [
    ['heart', 'Rosie Hazelgrove — Charlie’s message', 'Fulton Street', 'Wake Rosie and deliver message and locket.'],
    ['heart', 'Little Petey — letter delivery', 'Fulton Street → Canal Street', 'Deliver letter to Mickey Famiano near vending machine.'],
    ['heart', 'Enzo Scardina — briefcase exchange', 'Canal Street → Fulton Street', 'Swap cases with Frankie Noses Tieri and return to Enzo.'],
    ['heart', 'Alfred Blackmoore — eviction', 'Canal Street → Chinatown', 'Confront Dana, retrieve keys and return to Alfred.'],
    ['heart', 'Frank Rottenberg — insulin', 'Trinity Cemetery', 'Use Creeping Dark to retrieve insulin from bathroom and return it.']
  ]]
];

const chapters = raw.map((chapter, chapterIndex) => ({
  name: chapter[0],
  items: chapter[1].map((item, itemIndex) => ({
    id: `${chapterIndex}-${itemIndex}`,
    type: item[0],
    name: item[1],
    where: item[2],
    description: item[3]
  }))
}));

const achievementKey = 'darkness-tracker-v1';
const types = {
  heart: ['♡', 'Heart of Gold'],
  outfit: ['♧', 'Darkling Outfit'],
  letter: ['✉', 'Underworld Letter']
};
let savedAchievements = readStorage(achievementKey, {});
let incompleteOnly = false;

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}

function renderAchievements() {
  const all = chapters.flatMap(chapter => chapter.items);
  document.querySelector('#stats').innerHTML = Object.entries(types).map(([type, [icon, name]]) => {
    const matching = all.filter(item => item.type === type);
    const completed = matching.filter(item => savedAchievements[item.id]).length;
    return `<div class="stat"><div class="icon">${icon}</div><b>${completed}/${matching.length}</b><span>${name}</span></div>`;
  }).join('');

  document.querySelector('#overall').textContent = `${all.filter(item => savedAchievements[item.id]).length} of ${all.length} steps complete`;
  document.querySelector('#chapters').innerHTML = chapters.map(chapter => `
    <details open>
      <summary>${chapter.name}</summary>
      <p>${chapter.items.filter(item => savedAchievements[item.id]).length}/${chapter.items.length} steps complete</p>
      ${chapter.items.filter(item => !incompleteOnly || !savedAchievements[item.id]).map(item => `
        <label class="task ${savedAchievements[item.id] ? 'done' : ''}">
          <input type="checkbox" data-id="${item.id}" ${savedAchievements[item.id] ? 'checked' : ''}>
          <span>
            <small>${types[item.type][1]}</small>
            <strong class="name">${item.name}</strong>
            <span class="where">${item.where}</span>
            <span class="description">${item.description}</span>
          </span>
        </label>`).join('')}
    </details>`).join('');

  document.querySelectorAll('input[data-id]').forEach(input => {
    input.addEventListener('change', () => {
      savedAchievements[input.dataset.id] = input.checked;
      localStorage.setItem(achievementKey, JSON.stringify(savedAchievements));
      renderAchievements();
    });
  });
}

document.querySelector('#filter').addEventListener('click', event => {
  incompleteOnly = !incompleteOnly;
  event.currentTarget.textContent = `Show incomplete only: ${incompleteOnly ? 'On' : 'Off'}`;
  renderAchievements();
});

document.querySelector('#reset-achievements').addEventListener('click', () => {
  if (confirm('Reset all achievement checklist progress?')) {
    savedAchievements = {};
    localStorage.setItem(achievementKey, '{}');
    renderAchievements();
  }
});

document.querySelector('#export').addEventListener('click', () => {
  const exportData = {
    achievements: savedAchievements,
    phones: readStorage('darkness-phone-numbers-v1', []),
    keepers: readStorage('darkness-keeper-numbers-v1', [])
  };
  const link = document.createElement('a');
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  link.href = URL.createObjectURL(blob);
  link.download = 'darkness-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelector('#import').addEventListener('click', () => document.querySelector('#file').click());
document.querySelector('#file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (imported.achievements || imported.phones || imported.keepers) {
      savedAchievements = imported.achievements || {};
      localStorage.setItem(achievementKey, JSON.stringify(savedAchievements));
      localStorage.setItem('darkness-phone-numbers-v1', JSON.stringify(imported.phones || []));
      localStorage.setItem('darkness-keeper-numbers-v1', JSON.stringify(imported.keepers || []));
    } else {
      savedAchievements = imported;
      localStorage.setItem(achievementKey, JSON.stringify(savedAchievements));
    }
    renderAchievements();
    numberTrackers.forEach(tracker => tracker.render());
  } catch {
    alert('That does not look like a valid Darkness progress file.');
  }
  event.target.value = '';
});

const phoneNumbers = [
  '4463','4525','4603','4649','4676','4682','4691','6418','6441','6454','6503','8164',
  '6713','6799','6892','8416','8766','8856','8881','8896','8989','1093','1228','1229',
  '1234','1266','3249','3318','1917','1952','3429','3440','3452','3492','3495','3496',
  '3520','5197','3791','3794','5211','3849','5311','5327','5438','5439','5465','5466',
  '5477','5549','5569','5595','5619','5709','7467','7526','7614','7641','7642','7643',
  '7710','7761','9345','9588','9868','9903','9913','2575','2734','2763','2764','4336','2941'
];

const keeperNumbers = [
  '6322','9132','1037','4565','4569','6118','6205','6325','6557',
  '8024','6667','6893','6969','8930','1206','1233','3243','3285'
];

function createNumberTracker(root, numbers, storageKey, title) {
  let entered = new Set(readStorage(storageKey, []));

  function save() {
    localStorage.setItem(storageKey, JSON.stringify([...entered]));
  }

  function render() {
    entered = new Set(readStorage(storageKey, []));
    root.innerHTML = `
      <div class="number-panel-head">
        <div>
          <div class="number-panel-title">${title}</div>
          <div class="number-progress">${entered.size} / ${numbers.length} entered</div>
        </div>
        <button class="copy-button" type="button" data-copy>▣ Copy all</button>
      </div>
      <div class="number-grid">
        ${numbers.map(number => `<button class="number-button ${entered.has(number) ? 'entered' : ''}" type="button" data-number="${number}" aria-pressed="${entered.has(number)}">${number}</button>`).join('')}
      </div>
      <div class="number-panel-foot">
        <span>Tap a number to mark it entered.</span>
        <button class="reset-link" type="button" data-reset>Reset</button>
      </div>`;

    root.querySelectorAll('[data-number]').forEach(button => {
      button.addEventListener('click', () => {
        entered.has(button.dataset.number) ? entered.delete(button.dataset.number) : entered.add(button.dataset.number);
        save();
        render();
      });
    });

    root.querySelector('[data-copy]').addEventListener('click', async event => {
      try {
        await navigator.clipboard.writeText(numbers.join(', '));
        event.currentTarget.textContent = '✓ Copied';
        setTimeout(() => { if (event.currentTarget) event.currentTarget.textContent = '▣ Copy all'; }, 1400);
      } catch {
        alert(numbers.join(', '));
      }
    });

    root.querySelector('[data-reset]').addEventListener('click', () => {
      if (entered.size && confirm(`Reset ${title.toLowerCase()} progress?`)) {
        entered.clear();
        save();
        render();
      }
    });
  }

  return { render };
}

const numberTrackers = [
  createNumberTracker(document.querySelector('[data-number-tracker="phones"]'), phoneNumbers, 'darkness-phone-numbers-v1', 'Telephone number tracker'),
  createNumberTracker(document.querySelector('[data-number-tracker="keepers"]'), keeperNumbers, 'darkness-keeper-numbers-v1', 'Keeper of Secrets tracker')
];

renderAchievements();
numberTrackers.forEach(tracker => tracker.render());
