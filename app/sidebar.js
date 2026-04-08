/* =====================================================
   sidebar.js — ハンバーガーメニュー・コース選択・ホールストリップ
   ===================================================== */

function toggleMenu() {
  var panel = document.getElementById('menuPanel');
  var overlay = document.getElementById('menuOverlay');
  var btn = document.getElementById('hbgBtn');
  var isOpen = panel.classList.contains('open');
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
  var v = document.getElementById('gcSel').value;
  st.gcIdx = v === '' ? null : parseInt(v); st.cIdx = null; st.hIdx = 0;
  var cs = document.getElementById('courseSel');
  cs.innerHTML = '<option value="">-- コース --</option>';
  if (gc()) gc().courses.forEach(function(c, i) {
    var o = document.createElement('option'); o.value = i; o.textContent = c.name; cs.appendChild(o);
  });
  roundShots = {}; roundId = 'round_' + Date.now();
}

function onCourseSel() {
  var v = document.getElementById('courseSel').value;
  st.cIdx = v === '' ? null : parseInt(v); st.hIdx = 0;
  renderStrip(); loadHole(); updateHoleNavBtns();
  closeMenu();
}

// ============================================================
// ホールストリップ
// ============================================================
function renderStrip() {
  var strip = document.getElementById('holeStrip');
  if (!course()) { strip.innerHTML = ''; updateHoleNavBtns(); return; }
  strip.innerHTML = course().holes.map(function(h, i) {
    var key = st.gcIdx + '_' + st.cIdx + '_' + i;
    var shots = roundShots[key] || [];
    var meta = roundShots[key + '_meta'] || {};
    var badge = '';
    if (meta.cupIn) {
      var s    = meta.totalShots || (meta.par + (meta.scoreDiff || 0));
      var diff = s - meta.par;
      var sd   = scoreDef(diff);
      var lbl  = diff === 0 ? 'E' : (diff > 0 ? '+' + diff : String(diff));
      badge = '<span class="sbadge ' + sd.cls + '">' + lbl + '</span>';
    } else if (shots.length) {
      badge = '<span class="sbadge cupin">' + shots.length + '打</span>';
    }
    var active = i === st.hIdx ? 'active' : '';
    var nodata = !hasData(h) ? 'no-data' : '';
    return '<button class="h-btn ' + active + ' ' + nodata + '" onclick="selectHole(' + i + ')">'
      + h.no + 'H<span class="par">PAR' + h.par + '</span>' + badge + '</button>';
  }).join('');
  updateHoleNavBtns();
}

function selectHole(i) {
  closeMenu(); // 最初に閉じる
  st.hIdx = i; renderStrip(); loadHole(); closeReview();
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
  var nav = document.getElementById('holeNavBtns');
  if (!nav) return;
  if (!course()) { nav.style.display = 'none'; return; }
  nav.style.display = 'flex';
  var prev = document.getElementById('prevHoleBtn');
  var next = document.getElementById('nextHoleBtn');
  if (prev) prev.disabled = st.hIdx <= 0;
  if (next) next.disabled = st.hIdx >= course().holes.length - 1;
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
  var h = hole(); var n = curShots().length + 1;
  var teeDef = TEE_TYPES.find(function(t){ return t.key === st.teeType; }) || TEE_TYPES[0];
  var teeTag = '<span style="color:' + teeDef.color + ';font-size:10px;margin-left:4px;">' + teeDef.icon + '</span>';
  if (appMode === 'measure') {
    document.getElementById('modeInfo').innerHTML =
      h && hasData(h) ? '<strong>H' + h.no + ' PAR' + h.par + '</strong>' + teeTag + ' タップ → ティーからの距離＋残り距離' : 'コースを選択';
  } else {
    document.getElementById('modeInfo').innerHTML =
      h && hasData(h) ? '<strong class="rec">🏌️ 記録</strong>' + teeTag + ' ' + n + '打目 — 落下地点をタップ' : '座標未登録';
  }
}

function updateRecBanner() {
  var banner = document.getElementById('recBanner');
  if (appMode !== 'record' || !hole() || !hasData(hole()) ||
      document.getElementById('shotPanel').classList.contains('open')) {
    banner.style.display = 'none'; return;
  }
  var shots = curShots(); var n = shots.length + 1;
  var from = shots.length === 0 ? 'ティーから' : shots.length + '打目から';
  banner.textContent = n + '打目 — ' + from + 'の落下地点をタップ';
  banner.style.display = 'block';
}

function updateCupBtn() {
  document.getElementById('cupBtn').style.display =
    (appMode === 'record' && hole() && hasData(hole())) ? 'block' : 'none';
}

// コース戦略ボタン（サイドバー）
function openStrategySelectorFromMenu() {
  if (typeof openStrategySelector === 'function') openStrategySelector();
}

// ============================================================
// インライン コース選択（emptyMap上）
// ============================================================
var emSelectedGcIdx = null;

function initEmSelector() {
  var prefs = [];
  COURSES.forEach(function(c) {
    if (prefs.indexOf(c.pref) === -1) prefs.push(c.pref);
  });
  document.getElementById('emPrefBtns').innerHTML = prefs.map(function(p) {
    return '<button class="em-pref-btn" onclick="emSelectPref(\'' + p + '\')">' + p + '</button>';
  }).join('');
}

function emSelectPref(pref) {
  var gcs = [];
  COURSES.forEach(function(c, i) {
    if (c.pref === pref) gcs.push({ name: c.name, idx: i });
  });
  document.getElementById('emGcBtns').innerHTML = gcs.map(function(g) {
    return '<button class="em-gc-btn" onclick="emSelectGc(' + g.idx + ')">' + g.name + '</button>';
  }).join('');
  document.getElementById('emStepPref').style.display = 'none';
  document.getElementById('emStepGc').style.display = 'flex';
}

function emBackToPref() {
  document.getElementById('emStepGc').style.display = 'none';
  document.getElementById('emStepPref').style.display = 'flex';
}

function emSelectGc(gcIdx) {
  emSelectedGcIdx = gcIdx;
  var g = COURSES[gcIdx];
  document.getElementById('emCourseBtns').innerHTML = g.courses.map(function(c, ci) {
    return '<button class="em-course-btn" onclick="emSelectCourse(' + gcIdx + ',' + ci + ')">' + c.name + '</button>';
  }).join('');
  document.getElementById('emStepGc').style.display = 'none';
  document.getElementById('emStepCourse').style.display = 'flex';
}

function emBackToGc() {
  document.getElementById('emStepCourse').style.display = 'none';
  document.getElementById('emStepGc').style.display = 'flex';
}

function emSelectCourse(gcIdx, cIdx) {
  st.gcIdx = gcIdx; st.cIdx = cIdx; st.hIdx = 0;
  roundShots = {}; roundId = 'round_' + Date.now();
  var gcSel = document.getElementById('gcSel');
  gcSel.value = gcIdx;
  var cs = document.getElementById('courseSel');
  cs.innerHTML = '<option value="">-- コース --</option>';
  COURSES[gcIdx].courses.forEach(function(c, i) {
    var o = document.createElement('option');
    o.value = i; o.textContent = c.name; cs.appendChild(o);
  });
  cs.value = cIdx;
  // ティー種別選択ステップへ進む
  document.getElementById('emStepCourse').style.display = 'none';
  document.getElementById('emStepTee').style.display = 'flex';
}

function emBackToCourse() {
  document.getElementById('emStepTee').style.display = 'none';
  document.getElementById('emStepCourse').style.display = 'flex';
}

function emSelectTee(teeType) {
  st.teeType = teeType;
  emResetSelector();
  renderStrip(); loadHole(); updateHoleNavBtns();
}

function emResetSelector() {
  document.getElementById('emStepPref').style.display = 'flex';
  document.getElementById('emStepGc').style.display = 'none';
  document.getElementById('emStepCourse').style.display = 'none';
  document.getElementById('emStepTee').style.display = 'none';
  emSelectedGcIdx = null;
}

// ============================================================
// スコアカードパネル
// ============================================================
function openScorecard() {
  var g = gc();
  var body = document.getElementById('scpBody');
  body.innerHTML = g ? buildFullScorecard() : '<p class="scp-no-course">コースを選択してください</p>';
  document.getElementById('scorecardPanel').classList.add('open');
  closeMenu();
}

function closeScorecard() {
  document.getElementById('scorecardPanel').classList.remove('open');
}

function buildFullScorecard() {
  var g = gc();
  if (!g) return '';

  var grandTotalPar = 0, grandTotalScore = 0, grandTotalDiff = 0, grandAny = false;

  var cols = g.courses.map(function(c, ci) {
    var holes = c.holes;
    var totalPar = 0, totalScore = 0, totalDiff = 0, anyScore = false;

    var rows = holes.map(function(h, hi) {
      var metaKey = st.gcIdx + '_' + ci + '_' + hi + '_meta';
      var meta = roundShots[metaKey] || {};
      totalPar += h.par;
      if (meta.cupIn) {
        anyScore = true;
        var s    = meta.totalShots || (meta.par + (meta.scoreDiff || 0));
        var diff = s - meta.par;
        var sd   = scoreDef(diff);
        var lbl  = diff === 0 ? 'E' : (diff > 0 ? '+' + diff : String(diff));
        totalScore += s;
        totalDiff  += diff;
        return '<tr>'
          + '<td class="scp-hole-no">' + h.no + 'H</td>'
          + '<td class="scp-par-val">' + h.par + '</td>'
          + '<td class="scp-score-cell ' + sd.cls + '">' + s + '<small>' + lbl + '</small></td>'
          + '</tr>';
      }
      return '<tr>'
        + '<td class="scp-hole-no">' + h.no + 'H</td>'
        + '<td class="scp-par-val">' + h.par + '</td>'
        + '<td class="scp-score-cell empty">—</td>'
        + '</tr>';
    }).join('');

    grandTotalPar += totalPar;
    if (anyScore) {
      grandAny = true;
      grandTotalScore += totalScore;
      grandTotalDiff  += totalDiff;
    }

    var totLbl  = totalDiff === 0 ? 'E' : (totalDiff > 0 ? '+' + totalDiff : String(totalDiff));
    var totCell = anyScore ? (totalScore + '<small>' + totLbl + '</small>') : '—';

    return '<div class="scp-course-col">'
      + '<div class="scp-course-name">' + c.name + '</div>'
      + '<table class="scp-table">'
      + '<thead><tr><th>H</th><th>PAR</th><th>Score</th></tr></thead>'
      + '<tbody>' + rows + '</tbody>'
      + '<tfoot><tr class="scp-total-row">'
      + '<td>合計</td><td>' + totalPar + '</td>'
      + '<td class="scp-total-score">' + totCell + '</td>'
      + '</tr></tfoot>'
      + '</table></div>';
  }).join('');

  var grandLbl  = grandTotalDiff === 0 ? 'E' : (grandTotalDiff > 0 ? '+' + grandTotalDiff : String(grandTotalDiff));
  var diffCls   = grandTotalDiff === 0 ? 'even' : (grandTotalDiff > 0 ? 'plus' : 'minus');
  var grandHtml = '';
  if (g.courses.length >= 2) {
    var grandVal  = grandAny ? String(grandTotalScore) : '—';
    var grandDiff = grandAny ? '<span class="scp-grand-diff ' + diffCls + '">' + grandLbl + '</span>' : '';
    grandHtml = '<div class="scp-grand">'
      + '<div class="scp-grand-label">🏆 トータル<br><small style="font-size:10px">PAR ' + grandTotalPar + '</small></div>'
      + '<div><span class="scp-grand-val">' + grandVal + '</span>' + grandDiff + '</div>'
      + '</div>';
  }

  return '<div class="scp-gc-name">⛳ ' + g.name + '</div>'
    + '<div class="scp-courses-wrap">' + cols + '</div>'
    + grandHtml;
}
