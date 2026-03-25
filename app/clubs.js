/* =====================================================
   clubs.js — クラブセット編集パネル
   ===================================================== */

const CLUB_PRESETS = {
  'ドライバー':       ['1W'],
  'フェアウェイウッド': ['3W','5W'],
  'ユーティリティ':   ['4UT','5UT'],
  'アイアン':         ['3I','4I','5I','6I','7I','8I','9I'],
  'ウェッジ':         ['SW','PW','AW','50°','52°','54°','55°','56°','57°','58°','60°'],
  'パター':           ['PT'],
};

// クラブの正規ソート順（長い順）
const CLUB_ORDER = [
  '1W','3W','5W',
  '4UT','5UT',
  '3I','4I','5I','6I','7I','8I','9I',
  'SW','PW','AW','50°','52°','54°','55°','56°','57°','58°','60°',
  'PT',
];

function sortClubs(arr) {
  const filled = arr.filter(c => c !== '');
  filled.sort((a, b) => {
    const ia = CLUB_ORDER.indexOf(a);
    const ib = CLUB_ORDER.indexOf(b);
    // リストにないもの（その他）は末尾
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return Array.from({length: 14}, (_, i) => filled[i] || '');
}

let editingClubs = [];

function openClubEditor() {
  editingClubs = [...CLUBS];
  closeMenu();
  setTimeout(() => {
    renderClubEditor();
    document.getElementById('clubEditorPanel').classList.add('open');
  }, 280);
}

function closeClubEditor() {
  document.getElementById('clubEditorPanel').classList.remove('open');
}

function renderClubEditor() {
  const count = editingClubs.filter(c => c !== '').length;
  document.getElementById('ceCount').textContent = `${count} / 14本`;
  document.getElementById('ceCountBar').style.width = `${(count/14)*100}%`;
  document.getElementById('ceCountBar').style.background = count > 14 ? 'var(--red)' : 'var(--gv)';

  document.getElementById('ceSlots').innerHTML = editingClubs.map((c, i) =>
    c ? `<div class="ce-slot filled" onclick="removeClubSlot(${i})">${c}<span class="ce-rm">✕</span></div>`
      : `<div class="ce-slot empty">—</div>`
  ).join('');

  document.getElementById('cePresets').innerHTML = Object.entries(CLUB_PRESETS).map(([cat, clubs]) => `
    <div class="ce-cat">
      <div class="ce-cat-label">${cat}</div>
      <div class="ce-cat-clubs">
        ${clubs.map(c => {
          const sel = editingClubs.includes(c);
          return `<button class="ce-club-btn ${sel ? 'sel' : ''}" onclick="toggleClubPreset('${c}')">${c}</button>`;
        }).join('')}
      </div>
    </div>
  `).join('');

  document.getElementById('ceOtherInput').value = '';
}

function toggleClubPreset(club) {
  const idx = editingClubs.findIndex(c => c === club);
  if (idx !== -1) {
    editingClubs[idx] = '';
  } else {
    const emptyIdx = editingClubs.findIndex(c => c === '');
    if (emptyIdx === -1) return;
    editingClubs[emptyIdx] = club;
  }
  editingClubs = sortClubs(editingClubs);
  renderClubEditor();
}

function removeClubSlot(i) {
  editingClubs[i] = '';
  editingClubs = sortClubs(editingClubs);
  renderClubEditor();
}

function addOtherClub() {
  const val = document.getElementById('ceOtherInput').value.trim();
  if (!val) return;
  const emptyIdx = editingClubs.findIndex(c => c === '');
  if (emptyIdx === -1) { alert('14本が上限です'); return; }
  editingClubs[emptyIdx] = val;
  editingClubs = sortClubs(editingClubs);
  renderClubEditor();
}

function saveClubEditor() {
  const count = editingClubs.filter(c => c !== '').length;
  if (count < 1) { alert('最低1本は選択してください'); return; }
  CLUBS = sortClubs([...editingClubs]);
  saveClubs(CLUBS);
  closeClubEditor();
}

function resetClubEditor() {
  editingClubs = sortClubs([...DEFAULT_CLUBS]);
  renderClubEditor();
}
