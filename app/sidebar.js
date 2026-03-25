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
  renderStrip(); loadHole(); updateSNLink();
  closeMenu();
}

// ============================================================
// ホールストリップ
// ============================================================
function renderStrip() {
  const strip = document.getElementById('holeStrip');
  if (!course()) { strip.innerHTML = ''; return; }
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
}

function selectHole(i) {
  st.hIdx = i; renderStrip(); loadHole(); closeReview(); updateSNLink(); closeMenu();
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
