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

// ============================================================
// スコアカードパネル
// ============================================================
function openScorecard() {
  const g = gc();
  const body = document.getElementById('scpBody');
  if (!g) {
    body.innerHTML = '<p class="scp-no-course">コースを選択してください</p>';
  } else {
    body.innerHTML = buildFullScorecard();
  }
  document.getElementById('scorecardPanel').classList.add('open');
  closeMenu();
}

function closeScorecard() {
  document.getElementById('scorecardPanel').classList.remove('open');
}

function buildFullScorecard() {
  const g = gc();
  if (!g) return '';

  let grandTotalPar = 0, grandTotalScore = 0, grandTotalDiff = 0, grandAny = false;

  const cols = g.courses.map((c, ci) => {
    const holes = c.holes;
    let totalPar = 0, totalScore = 0, totalDiff = 0, anyScore = false;

    const rows = holes.map((h, hi) => {
      const meta = roundShots[`${st.gcIdx}_${ci}_${hi}_meta`] || {};
      totalPar += h.par;
      if (meta.cupIn) {
        anyScore = true;
        const s = meta.totalShots || (meta.par + (meta.scoreDiff || 0));
        const diff = s - meta.par;
        const sd = scoreDef(diff);
        const lbl = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : String(diff);
        totalScore += s; totalDiff += diff;
        return `<tr>
          <td class="scp-hole-no">${h.no}H</td>
          <td class="scp-par-val">${h.par}</td>
          <td class="scp-score-cell ${sd.cls}">${s}<small>${lbl}</small></td>
        </tr>`;
      }
      return `<tr>
        <td class="scp-hole-no">${h.no}H</td>
        <td class="scp-par-val">${h.par}</td>
        <td class="scp-score-cell empty">—</td>
      </tr>`;
    }).join('');

    grandTotalPar += totalPar;
    if (anyScore) { grandAny = true; grandTotalScore += totalScore; grandTotalDiff += totalDiff; }

    const totLbl = totalDiff === 0 ? 'E' : totalDiff > 0 ? `+${totalDiff}` : String(totalDiff);
    return `
      <div class="scp-course-col">
        <div class="scp-course-name">${c.name}</div>
        <table class="scp-table">
          <thead><tr><th>H</th><th>PAR</th><th>Score</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr class="scp-total-row">
              <td>合計</td>
              <td>${totalPar}</td>
              <td class="scp-total-score">${anyScore ? `${totalScore}<small>${totLbl}</small>` : '—'}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;
  }).join('');

  const grandLbl = grandTotalDiff === 0 ? 'E' : grandTotalDiff > 0 ? `+${grandTotalDiff}` : String(grandTotalDiff);
  const diffCls  = grandTotalDiff === 0 ? 'even' : grandTotalDiff > 0 ? 'plus' : 'minus';
  const grandHtml = g.courses.length >= 2 ? `
    <div class="scp-grand">
      <div class="scp-grand-label">🏆 トータル<br><small style="font-size:10px">PAR ${grandTotalPar}</small></div>
      <div>
        <span class="scp-grand-val">${grandAny ? grandTotalScore : '—'}</span>
        ${grandAny ? `<span class="scp-grand-diff ${diffCls}">${grandLbl}</span>` : ''}
      </div>
    </div>` : '';

  return `
    <div class="scp-gc-name">⛳ ${g.name}</div>
    <div class="scp-courses-wrap">${cols}</div>
    ${grandHtml}`;
}


function emResetSelector() {
  document.getElementById('emStepPref').style.display = 'flex';
  document.getElementById('emStepGc').style.display = 'none';
  document.getElementById('emStepCourse').style.display = 'none';
  emSelectedGcIdx = null;
}
