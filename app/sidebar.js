/* =====================================================
   sidebar.js — ハンバーガーメニュー・コース選択・ホールストリップ
   ===================================================== */

function toggleMenu() {
  const panel = document.getElementById('menuPanel');
  const overlay = document.getElementById('menuOverlay');
  const btn = document.getElementById('hbgBtn');
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open', !isOpen);
  overlay.classList.toggle('show', !isOpen);
  btn.classList.toggle('open', !isOpen);
}

function closeMenu() {
  document.getElementById('menuPanel').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('show');
  document.getElementById('hbgBtn').classList.remove('open');
}

function onGCSel() {
  const v = document.getElementById('gcSel').value;
  st.gcIdx = v === '' ? null : parseInt(v); st.cIdx = null; st.hIdx = 0;
  const cs = document.getElementById('courseSel');
  cs.innerHTML = '<option value="">-- コース --</option>';
  if (gc()) gc().courses.forEach((c, i) => {
    const o = document.createElement('option'); o.value = i; o.textContent = c.name; cs.appendChild(o);
  });
  roundShots = {}; roundId = `round_${Date.now()}`; updateSNLink();
}

function onCourseSel() {
  const v = document.getElementById('courseSel').value;
  st.cIdx = v === '' ? null : parseInt(v); st.hIdx = 0;
  renderStrip(); loadHole(); updateSNLink(); updateHoleNavBtns();
  closeMenu();
}

// ============================================================
// ホールストリップ
// ============================================================
function renderStrip() {
  const strip = document.getElementById('holeStrip');
  if (!course()) { strip.innerHTML = ''; updateHoleNavBtns(); return; }
  strip.innerHTML = course().holes.map((h, i) => {
    const key = `${st.gcIdx}_${st.cIdx}_${i}`;
    const shots = roundShots[key] || [];
    const meta = roundShots[`${key}_meta`] || {};
    let badge = '';
    if (meta.cupIn) {
      const s   = meta.totalShots || (meta.par + (meta.scoreDiff || 0));
      const diff = s - meta.par;
      const sd   = scoreDef(diff);
      const label = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : String(diff);
      badge = `<span class="sbadge ${sd.cls}">${label}</span>`;
    } else if (shots.length) {
      badge = `<span class="sbadge cupin">${shots.length}打</span>`;
    }
    return `<button class="h-btn ${i === st.hIdx ? 'active' : ''} ${!hasData(h) ? 'no-data' : ''}" onclick="selectHole(${i})">
      ${h.no}H<span class="par">PAR${h.par}</span>${badge}
    </button>`;
  }).join('');
  updateHoleNavBtns();
}

function selectHole(i) {
  st.hIdx = i; renderStrip(); loadHole(); closeReview(); updateSNLink(); closeMenu();
}

// ============================================================
// 前H / 次H ナビゲーション
// ============================================================
function prevHole() {
  if (!course() || st.hIdx <= 0) return;
  selectHole(st.hIdx - 1);
}

function nextHole() {
  if (!course() || st.hIdx >= course().holes.length - 1) return;
  selectHole(st.hIdx + 1);
}

function updateHoleNavBtns() {
  const nav = document.getElementById('holeNavBtns');
  if (!nav) return;
  if (!course()) { nav.style.display = 'none'; return; }
  nav.style.display = 'flex';
  document.getElementById('prevHoleBtn').disabled = st.hIdx <= 0;
  document.getElementById('nextHoleBtn').disabled = st.hIdx >= course().holes.length - 1;
}

// ============================================================
// モード・UI状態
// ============================================================
function setMode(m) {
  appMode = m;
  document.getElementById('tabMeasure').classList.toggle('active', m === 'measure');
  document.getElementById('tabRecord').classList.toggle('active', m === 'record');
  clearMeasure(); clearPending(); updateInfo(); updateRecBanner(); updateCupBtn();
}

function updateInfo() {
  const h = hole(); const n = curShots().length + 1;
  if (appMode === 'measure')
    document.getElementById('modeInfo').innerHTML =
      h && hasData(h) ? `<strong>H${h.no} PAR${h.par}</strong> タップ → ティーからの距離＋残り距離` : 'コースを選択';
  else
    document.getElementById('modeInfo').innerHTML =
      h && hasData(h) ? `<strong class="rec">🏌️ 記録</strong> ${n}打目 — 落下地点をタップ` : '座標未登録';
}

function updateRecBanner() {
  const banner = document.getElementById('recBanner');
  if (appMode !== 'record' || !hole() || !hasData(hole()) ||
      document.getElementById('shotPanel').classList.contains('open')) {
    banner.style.display = 'none'; return;
  }
  const shots = curShots(); const n = shots.length + 1;
  banner.textContent = `${n}打目 — ${shots.length === 0 ? 'ティーから' : `${shots.length}打目から`}の落下地点をタップ`;
  banner.style.display = 'block';
}

function updateCupBtn() {
  document.getElementById('cupBtn').style.display =
    (appMode === 'record' && hole() && hasData(hole())) ? 'block' : 'none';
}

// ============================================================
// インライン コース選択（emptyMap上）
// ============================================================
let emSelectedGcIdx = null;

function initEmSelector() {
  // 都道府県の一覧（重複なし）
  const prefs = [...new Set(COURSES.map(c => c.pref))];
  document.getElementById('emPrefBtns').innerHTML = prefs.map(p =>
    `<button class="em-pref-btn" onclick="emSelectPref('${p}')">${p}</button>`
  ).join('');
}

function emSelectPref(pref) {
  // その都道府県のゴルフ場一覧
  const gcs = COURSES.map((c, i) => ({ ...c, idx: i })).filter(c => c.pref === pref);
  document.getElementById('emGcBtns').innerHTML = gcs.map(gc =>
    `<button class="em-gc-btn" onclick="emSelectGc(${gc.idx})">${gc.name}</button>`
  ).join('');
  document.getElementById('emStepPref').style.display = 'none';
  document.getElementById('emStepGc').style.display = 'flex';
}

function emBackToPref() {
  document.getElementById('emStepGc').style.display = 'none';
  document.getElementById('emStepPref').style.display = 'flex';
}

function emSelectGc(gcIdx) {
  emSelectedGcIdx = gcIdx;
  const gc = COURSES[gcIdx];
  document.getElementById('emCourseBtns').innerHTML = gc.courses.map((c, ci) =>
    `<button class="em-course-btn" onclick="emSelectCourse(${gcIdx},${ci})">${c.name}</button>`
  ).join('');
  document.getElementById('emStepGc').style.display = 'none';
  document.getElementById('emStepCourse').style.display = 'flex';
}

function emBackToGc() {
  document.getElementById('emStepCourse').style.display = 'none';
  document.getElementById('emStepGc').style.display = 'flex';
}

function emSelectCourse(gcIdx, cIdx) {
  // サイドバーのselectと同じ状態にセット
  st.gcIdx = gcIdx; st.cIdx = cIdx; st.hIdx = 0;
  roundShots = {}; roundId = `round_${Date.now()}`;
  // ドロップダウンUIも同期
  const gcSel = document.getElementById('gcSel');
  gcSel.value = gcIdx;
  const cs = document.getElementById('courseSel');
  cs.innerHTML = '<option value="">-- コース --</option>';
  COURSES[gcIdx].courses.forEach((c, i) => {
    const o = document.createElement('option');
    o.value = i; o.textContent = c.name; cs.appendChild(o);
  });
  cs.value = cIdx;
  // emSelectorをリセット
  emResetSelector();
  renderStrip(); loadHole(); updateSNLink();
}

function emResetSelector() {
  document.getElementById('emStepPref').style.display = 'flex';
  document.getElementById('emStepGc').style.display = 'none';
  document.getElementById('emStepCourse').style.display = 'none';
  emSelectedGcIdx = null;
}
