const progressKey = 'haven-sod2-route-v1';
let progress = {};

try {
  progress = JSON.parse(localStorage.getItem(progressKey) || '{}') || {};
} catch {
  progress = {};
}

const tasks = [...document.querySelectorAll('[data-task]')];

function saveProgress() {
  localStorage.setItem(progressKey, JSON.stringify(progress));
}

function updateProgress() {
  tasks.forEach(input => { input.checked = Boolean(progress[input.dataset.task]); });
  const complete = tasks.filter(input => input.checked).length;
  document.querySelector('#route-complete').textContent = `${complete}/${tasks.length}`;

  document.querySelectorAll('.run-card').forEach(card => {
    const runTasks = [...card.querySelectorAll('[data-task]')];
    const runComplete = runTasks.filter(input => input.checked).length;
    card.querySelector('[data-run-count]').textContent = `${runComplete}/${runTasks.length}`;
  });
}

tasks.forEach(input => {
  input.addEventListener('change', () => {
    progress[input.dataset.task] = input.checked;
    saveProgress();
    updateProgress();
  });
});

document.querySelector('#reset-route').addEventListener('click', () => {
  if (confirm('Reset all State of Decay 2 route progress?')) {
    progress = {};
    saveProgress();
    updateProgress();
  }
});

updateProgress();
