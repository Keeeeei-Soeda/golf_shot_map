/* =====================================================
   shot.js — ショット記録・カップイン・サマリー・スコアカード
   ===================================================== */

// ショット評価定義
const SHOT_RESULTS = [
  { key: 'ナイスショット', icon: '👍', cls: 'nice' },
  { key: 'ミスショット',   icon: '😤', cls: 'miss' },
  { key: 'ダフり',         icon: '⛏',  cls: 'duff' },
  { key: 'スライス',       icon: '↗',  cls: 'slice' },
  { key: 'フック',         icon: '↙',  cls: 'hook'  },
];

// ============================================================
// ペンディング（位置確定前）
// ============================================================
function updatePendingPos(pos) {
  const h = hole(); if (!h || !hasData(h)) return;
  pendingPos = pos;
  const shots = curShots();
  const holeOff = roundShots[holeKey() + '_offset'] || 0;
  const prevIsTee = shots.length === 0;
  const prevPos = prevIsTee
    ? activeTee(h)
    : { lat: shots[shots.length-1].lat, lng: shots[shots.length-1].lng };
  const carryYd = Math.round(haversine(prevPos.lat, prevPos.lng, pos.lat(), pos.lng()) * 1.09361);
  const remYd   = Math.round(haversine(pos.lat(), pos.lng(), h.center.lat, h.center.lng) * 1.09361);
  const fromLabel = prevIsTee ? 'ティーから' : `${shots[shots.length-1].no}打目から`;
  const nextNo = shots.length + 1 + holeOff;

  updateSpDistTab(carryYd, remYd, fromLabel);

  if (pendingMarker) pendingMarker.setPosition(pos);
  else {
    pendingMarker = new google.maps.Marker({
      position: pos, map,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 13,
        fillColor: '#f59e0b', fillOpacity: .85, strokeColor: '#fff', strokeWeight: 2 },
      label: { text: `${nextNo}`, color: '#000', fontSize: '11px', fontWeight: 'bold' },
      zIndex: 100
    });
  }

  if (pendingCarryLine) pendingCarryLine.setMap(null);
  pendingCarryLine = new google.maps.Polyline({ path: [prevPos, { lat: pos.lat(), lng: pos.lng() }], map,
    strokeColor: '#4a9fd4', strokeOpacity: .75, strokeWeight: 2.5,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3 }, offset: '100%' }] });

  if (pendingPinLine) pendingPinLine.setMap(null);
  pendingPinLine = new google.maps.Polyline({ path: [{ lat: pos.lat(), lng: pos.lng() }, { lat: h.center.lat, lng: h.center.lng }], map,
    strokeColor: '#e8c84a', strokeOpacity: .8, strokeWeight: 2,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 }, offset: '100%' }] });

  if (pendingCarryLabel) pendingCarryLabel.setMap(null);
  pendingCarryLabel = makeLabel(
    { lat: (prevPos.lat + pos.lat()) / 2, lng: (prevPos.lng + pos.lng()) / 2 },
    `${carryYd}yd`, '#000', '#4a9fd4'
  );
  if (pendingPinLabel) pendingPinLabel.setMap(null);
  pendingPinLabel = makeLabel(
    { lat: (pos.lat() + h.center.lat) / 2, lng: (pos.lng() + h.center.lng) / 2 },
    `残${remYd}yd`, '#000', '#e8c84a'
  );
}

function makeLabel(pos, text, tc, bg) {
  const w = text.length * 8 + 14;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20">
    <rect x="0" y="0" width="${w}" height="20" rx="5" fill="${bg}" fill-opacity="0.9"/>
    <text x="${w/2}" y="14" text-anchor="middle" fill="${tc}" font-size="11" font-weight="bold" font-family="Arial,sans-serif">${text}</text>
  </svg>`;
  return new google.maps.Marker({ position: pos, map,
    icon: { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(w, 20), anchor: new google.maps.Point(w/2, 10) },
    zIndex: 55, clickable: false });
}

function clearPending() {
  [pendingMarker, pendingCarryLine, pendingPinLine, pendingCarryLabel, pendingPinLabel]
    .forEach(x => { if (x) x.setMap(null); });
  pendingMarker = pendingCarryLine = pendingPinLine = pendingCarryLabel = pendingPinLabel = null;
}

// ============================================================
// ショット登録パネル（タブ式）
// ============================================================
function openShotPanelUI() {
  const key = holeKey();
  const shots = curShots();
  const holeOff = roundShots[key + '_offset'] || 0;
  const n = shots.length + 1 + holeOff;
  document.getElementById('spShotNo').textContent = n + '打目を登録';
  document.getElementById('clubGrid').innerHTML = CLUBS.map((c, i) =>
    c ? `<button class="cb" onclick="selectClub('${c}')">${c}</button>`
      : `<div class="cb-empty"></div>`
  ).join('');
  document.getElementById('spOkBtn').disabled = true;
  selectedClub = null;
  selectedResult = null;

  // 評価ボタンのリセット
  document.querySelectorAll('.rb').forEach(b => b.classList.remove('sel'));

  // ペナルティタブのリセット
  shotObType = null;
  document.querySelectorAll('.sp-ob-btn').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.pb').forEach(b => b.classList.remove('sel'));

  // 1打目か2打目以降かでUIを出し分け
  const isTeeShot = (shots.length === 0);
  const teeSection    = document.getElementById('spPenaltyTeeSection');
  const hazardSection = document.getElementById('spPenaltyHazardSection');
  const statusEl      = document.getElementById('spPenaltyStatus');
  if (teeSection)    teeSection.style.display    = isTeeShot ? 'block' : 'none';
  if (hazardSection) hazardSection.style.display = isTeeShot ? 'none'  : 'block';
  if (statusEl) statusEl.textContent = isTeeShot
    ? 'OBの場合: 次の打数を選択 → 登録'
    : 'ドロップ地点が選択されました（1打罰を加算）';

  // 1打目はプレN選択まで登録ボタンを無効、2打目以降は即有効
  const spPenaltyOkBtn = document.getElementById('spPenaltyOkBtn');
  if (spPenaltyOkBtn) spPenaltyOkBtn.disabled = isTeeShot;

  switchSpTab('record');
  document.getElementById('shotPanel').classList.add('open');
  document.getElementById('recBanner').style.display = 'none';
}

// ショットパネル ペナルティ種別選択（トグル）
function selectShotObType(btn, type) {
  if (shotObType === type) {
    shotObType = null;
    document.querySelectorAll('.sp-ob-btn').forEach(b => b.classList.remove('sel'));
  } else {
    shotObType = type;
    document.querySelectorAll('.sp-ob-btn').forEach(b => b.classList.toggle('sel', b.dataset.type === type));
  }
}

function switchSpTab(tab) {
  document.getElementById('spTabRecord').classList.toggle('active', tab === 'record');
  document.getElementById('spTabDist').classList.toggle('active', tab === 'dist');
  document.getElementById('spTabPenalty').classList.toggle('active', tab === 'penalty');
  document.getElementById('spBodyRecord').style.display  = tab === 'record'  ? 'block' : 'none';
  document.getElementById('spBodyDist').style.display    = tab === 'dist'    ? 'block' : 'none';
  document.getElementById('spBodyPenalty').style.display = tab === 'penalty' ? 'block' : 'none';
}

function updateSpDistTab(carryYd, remYd, fromLabel) {
  const el = document.getElementById('spBodyDist');
  if (!el) return;
  el.innerHTML = `
    <div class="sp-dists">
      <div class="sp-dist-card carry">
        <div class="sdc-label">carry</div>
        <div class="sdc-from">${fromLabel}</div>
        <div class="sdc-val blue">${carryYd}<span>yd</span></div>
      </div>
      <div class="sp-dist-card remain">
        <div class="sdc-label">remaining</div>
        <div class="sdc-from">センターまで</div>
        <div class="sdc-val yellow">${remYd}<span>yd</span></div>
      </div>
    </div>
  `;
}

function selectClub(c) {
  selectedClub = c;
  document.querySelectorAll('.cb').forEach(b => b.classList.toggle('sel', b.textContent === c));
  document.getElementById('spOkBtn').disabled = false;
}

// ショット評価を選択（任意・トグル）
function selectResult(r) {
  if (selectedResult === r) {
    selectedResult = null;
    document.querySelectorAll('.rb').forEach(b => b.classList.remove('sel'));
  } else {
    selectedResult = r;
    document.querySelectorAll('.rb').forEach(b => b.classList.toggle('sel', b.dataset.key === r));
  }
}

// ============================================================
// ペナルティ記録機能
// ============================================================

// 【1打目専用】プレ3/4/5 選択（絶対打数を指定）
function selectPenalty(n) {
  const key = holeKey();
  const shots = curShots();
  const holeOff = roundShots[key + '_offset'] || 0;
  const currentNo = shots.length + 1 + holeOff;
  if (n < currentNo) return;

  roundShots[key + '_pendingPenalty'] = n;
  document.getElementById('spShotNo').textContent = 'ドロップ地点 → ' + n + '打目を登録';

  // ボタン選択状態を更新して登録ボタンを有効化
  document.querySelectorAll('.pb').forEach(b => {
    b.classList.toggle('sel', parseInt(b.id.replace('pbBtn', '')) === n);
  });
  const okBtn = document.getElementById('spPenaltyOkBtn');
  if (okBtn) okBtn.disabled = false;
}

function confirmPenaltyDrop() {
  const h = hole(); if (!h) return;
  const key = holeKey();
  if (!roundShots[key]) roundShots[key] = [];
  const shots = roundShots[key];
  const holeOff = roundShots[key + '_offset'] || 0;
  const prevIsTee = shots.length === 0;

  // 次打数の決定:
  //   1打目(ティー)モード → pendingPenalty に選択済みのプレN が入っている
  //   2打目以降モード     → 1打罰を自動計算 (shots.length + 3 + holeOff)
  const pendingN = roundShots[key + '_pendingPenalty'];

  // ティーショットOBは pendingPos 不要 — プレN 選択後にティー位置で自動登録
  if (!pendingPos) {
    if (prevIsTee && pendingN) {
      const tee = activeTee(h);
      if (tee) {
        pendingPos = new google.maps.LatLng(tee.lat, tee.lng);
      }
    }
    if (!pendingPos) {
      if (prevIsTee) alert('プレ3/プレ4/プレ5 をまず選択してください。');
      else alert('ドロップ地点を地図上でタップしてから登録してください。');
      return;
    }
  }

  const prevPos = prevIsTee
    ? activeTee(h)
    : { lat: shots[shots.length-1].lat, lng: shots[shots.length-1].lng };
  const carryYd = Math.round(haversine(prevPos.lat, prevPos.lng, pendingPos.lat(), pendingPos.lng()) * 1.09361);
  const remYd   = Math.round(haversine(pendingPos.lat(), pendingPos.lng(), h.center.lat, h.center.lng) * 1.09361);
  const fromLabel = prevIsTee ? 'ティー' : shots[shots.length-1].no + '打目地点';
  const dropNo = shots.length + 1 + holeOff;
  const n = pendingN || (shots.length + 3 + holeOff);

  shots.push({
    no: dropNo,
    lat: pendingPos.lat(), lng: pendingPos.lng(),
    club: null,
    carry: carryYd,
    remaining: remYd,
    fromLabel,
    isPenalty: true,
    penaltyTarget: n,
    obType: shotObType || null,
  });

  // 次のショットが n 打目になるようにオフセット再計算
  const newOffset = n - (shots.length + 1);
  if (newOffset > 0) {
    roundShots[key + '_offset'] = newOffset;
  } else {
    delete roundShots[key + '_offset'];
  }
  // pendingPenaltyは不要になったが念のため削除
  delete roundShots[key + '_pendingPenalty'];

  saveRound();
  cancelShot();
  renderShotLayer();
  renderStrip();
  updateInfo();
  updateRecBanner();
  placePins(hole());
}

function cancelPenalty() {
  const key = holeKey();
  delete roundShots[key + '_offset'];
  delete roundShots[key + '_pendingPenalty'];
  saveRound();

  // OB種別・プレボタンリセット
  shotObType = null;
  document.querySelectorAll('.sp-ob-btn').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.pb').forEach(b => b.classList.remove('sel'));

  const shots = curShots();
  const n = shots.length + 1;
  document.getElementById('spShotNo').textContent = n + '打目を登録';

  const okBtn = document.getElementById('spPenaltyOkBtn');
  if (okBtn) okBtn.disabled = true;
  switchSpTab('record');
}

function useReteePosition() {
  const h = hole(); if (!h || !hasData(h)) return;
  const shots = curShots();
  const prevPos = shots.length === 0
    ? activeTee(h)
    : { lat: shots[shots.length-1].lat, lng: shots[shots.length-1].lng };
  if (!prevPos) return;
  const G = window.google.maps;
  const latLng = new G.LatLng(prevPos.lat, prevPos.lng);
  updatePendingPos(latLng);
  const info = document.getElementById('spPenaltyStatus');
  if (info) info.textContent = '打ち直し：前の打点に戻って記録します（1打罰）';
}

function confirmShot() {
  if (!pendingPos || !selectedClub) return;
  const h = hole(); if (!h) return;
  const key = holeKey();
  if (!roundShots[key]) roundShots[key] = [];
  const shots = roundShots[key];
  // 通常ショット確定時はプレ待機状態をクリア
  delete roundShots[key + '_pendingPenalty'];
  const holeOff = roundShots[key + '_offset'] || 0;
  const prevIsTee = shots.length === 0;
  const prevPos = prevIsTee
    ? activeTee(h)
    : { lat: shots[shots.length-1].lat, lng: shots[shots.length-1].lng };
  const no      = shots.length + 1 + holeOff;
  const carryYd = Math.round(haversine(prevPos.lat, prevPos.lng, pendingPos.lat(), pendingPos.lng()) * 1.09361);
  const remYd   = Math.round(haversine(pendingPos.lat(), pendingPos.lng(), h.center.lat, h.center.lng) * 1.09361);
  const fromLabel = prevIsTee ? 'ティー' : `${shots[shots.length-1].no}打目地点`;
  shots.push({
    no,
    lat: pendingPos.lat(), lng: pendingPos.lng(),
    club: selectedClub,
    carry: carryYd,
    remaining: remYd,
    fromLabel,
    result: selectedResult || null,
  });
  saveRound(); cancelShot(); renderShotLayer(); renderStrip(); updateInfo(); updateRecBanner();
  updateYardagePanel();
  placePins(hole());
}

function cancelShot() {
  pendingPos = null; selectedClub = null; selectedResult = null;
  clearPending();
  document.getElementById('shotPanel').classList.remove('open');
  updateRecBanner();
}

// ============================================================
// カップインパネル
// ============================================================
function openCupPanel() {
  const h = hole(); if (!h) return;
  const key = holeKey();
  const shots = curShots();
  const holeOff = roundShots[key + '_offset'] || 0;

  // 罰打数・OB種別・パット数をリセット
  cpStrokePenalty = 0;
  cpObType = null;
  cpPutts = null;
  document.querySelectorAll('.cup-stroke-pen-btn').forEach(b => {
    b.classList.toggle('sel', b.dataset.pen === '0');
  });
  document.querySelectorAll('.cup-ob-btn').forEach(b => b.classList.remove('sel'));
  document.querySelectorAll('.cup-putts-btn').forEach(b => b.classList.remove('sel'));

  // ラウンド中に記録済みのペナルティ打数を計算して表示
  // 各ドロップ記録の (penaltyTarget - shot.no - 1) が実際の罰打数
  const recordedPenalties = shots.filter(s => s.isPenalty).reduce((sum, s) => {
    return sum + Math.max(0, (s.penaltyTarget || 0) - s.no - 1);
  }, 0);
  const badge = document.getElementById('cpRecordedPenaltyBadge');
  if (badge) {
    if (recordedPenalties > 0) {
      badge.textContent = 'ラウンド中: ' + recordedPenalties + '打罰記録済み（打数に含む）';
      badge.style.display = 'inline';
    } else {
      badge.style.display = 'none';
    }
  }

  // ペナルティオフセットを考慮した打数
  const defaultTotal = shots.length + 1 + holeOff;
  const diff = defaultTotal - h.par;
  cpSelectedDiff = diff;
  const sd = scoreDef(diff);
  document.getElementById('cpHoleInfo').textContent = `H${h.no} PAR${h.par}`;
  document.getElementById('cpShots').textContent = shots.length > 0 ? defaultTotal : '—';
  const lbl = document.getElementById('cpScoreLabel');
  lbl.textContent   = shots.length > 0 ? `${sd.name}（${diff > 0 ? '+' : ''}${diff}）` : '（打数未記録）';
  lbl.className     = `cup-score-label ${sd.cls}`;
  lbl.style.background = shots.length > 0 ? '' : 'transparent';
  const mainRow = SCORE_DEFS.map(d => {
    const label = d.diff === 0 ? 'E' : d.diff > 0 ? `+${d.diff}` : String(d.diff);
    return `<button class="score-btn ${d.cls} ${d.diff === cpSelectedDiff ? 'sel' : ''}" data-diff="${d.diff}"
      onclick="selectCupScore(${d.diff})">${d.name}<br><small>${label}</small></button>`;
  }).join('');
  const extRow = [8,9,10,11,12,13].map(n => {
    const extDiff = n - h.par;
    const label = extDiff > 0 ? `+${extDiff}` : String(extDiff);
    return `<button class="score-btn score-btn-ext other ${extDiff === cpSelectedDiff ? 'sel' : ''}" data-diff="${extDiff}"
      onclick="selectCupScore(${extDiff})">${n}打<br><small>${label}</small></button>`;
  }).join('');
  document.getElementById('cpScoreBtns').innerHTML = mainRow + `<div class="score-btn-ext-row">${extRow}</div>`;
  document.getElementById('cupPanel').classList.add('open');
  document.getElementById('recBanner').style.display = 'none';
}

function selectCupScore(diff) {
  cpSelectedDiff = diff;
  const h = hole();
  if (h) {
    document.getElementById('cpShots').textContent = h.par + diff;
    const sd = scoreDef(diff);
    const lbl = document.getElementById('cpScoreLabel');
    lbl.textContent = `${sd.name}（${diff > 0 ? '+' : ''}${diff}）`;
    lbl.className   = `cup-score-label ${sd.cls}`;
  }
  document.querySelectorAll('.score-btn').forEach(b => {
    b.classList.toggle('sel', parseInt(b.dataset.diff) === diff);
  });
}

// カップイン: 罰打数選択（0〜5）
function selectCupStrokePenalty(btn, n) {
  cpStrokePenalty = n;
  document.querySelectorAll('.cup-stroke-pen-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  // 罰打数を加えたスコアをリアルタイム更新
  const h = hole(); if (!h) return;
  const total = h.par + cpSelectedDiff + n;
  const diff  = total - h.par;
  document.getElementById('cpShots').textContent = total;
  const sd = scoreDef(diff);
  const lbl = document.getElementById('cpScoreLabel');
  lbl.textContent = sd.name + '（' + (diff > 0 ? '+' : '') + diff + '）';
  lbl.className = 'cup-score-label ' + sd.cls;
}

// カップイン: OB種別選択（トグル）
function selectCupObType(btn, type) {
  if (cpObType === type) {
    cpObType = null;
    document.querySelectorAll('.cup-ob-btn').forEach(b => b.classList.remove('sel'));
  } else {
    cpObType = type;
    document.querySelectorAll('.cup-ob-btn').forEach(b => b.classList.toggle('sel', b.dataset.type === type));
  }
}

function selectCupPutts(btn, n) {
  if (cpPutts === n) {
    cpPutts = null;
    document.querySelectorAll('.cup-putts-btn').forEach(b => b.classList.remove('sel'));
  } else {
    cpPutts = n;
    document.querySelectorAll('.cup-putts-btn').forEach(b => {
      b.classList.toggle('sel', parseInt(b.dataset.putts) === n);
    });
  }
}

function confirmCupIn() {
  const h = hole(); if (!h) return;
  const key = holeKey();
  if (!roundShots[key]) roundShots[key] = [];
  const totalShots = h.par + cpSelectedDiff;
  const finalTotal = totalShots + cpStrokePenalty;
  const finalDiff  = finalTotal - h.par;
  roundShots[`${key}_meta`] = {
    cupIn: true,
    scoreDiff: finalDiff,
    par: h.par,
    totalShots: finalTotal,
    strokePenalty: cpStrokePenalty > 0 ? cpStrokePenalty : null,
    obType: cpObType || null,
    putts: cpPutts
  };
  saveRound(); closeCupPanel(); renderStrip(); updateInfo(); updateRecBanner();
  openHoleSummary();
}

function closeCupPanel() {
  document.getElementById('cupPanel').classList.remove('open');
  updateRecBanner();
}

// ============================================================
// ホールサマリー
// ============================================================
function openHoleSummary() {
  const h = hole(); if (!h) return;
  const shots = curShots();
  const meta = roundShots[`${holeKey()}_meta`] || {};
  const sd = meta.cupIn ? scoreDef(meta.scoreDiff) : null;
  const totalShots = meta.totalShots || shots.length;

  const shotRows = shots.map(s => {
    if (s.isPenalty) {
      const obLabel = s.obType ? ' (' + s.obType + ')' : '';
      return '<div class="hs-shot hs-shot-penalty">'
        + '<div class="hs-no" style="background:var(--red);font-size:9px;">罰</div>'
        + '<div class="hs-club" style="color:var(--red);font-size:11px;">⚠️ ドロップ地点' + obLabel + '</div>'
        + '<div class="hs-dists">'
        + '<span style="color:var(--red);font-weight:700;">1打罰 → ' + s.penaltyTarget + '打目へ</span>'
        + '</div>'
        + '</div>';
    }
    const resultBadge = s.result
      ? `<span class="hs-result ${_resultCls(s.result)}">${_resultIcon(s.result)} ${s.result}</span>`
      : '';
    return `
    <div class="hs-shot">
      <div class="hs-no">${s.no}</div>
      <div class="hs-club">${s.club}</div>
      <div class="hs-dists">
        <span class="hs-carry">${s.carry}yd</span>
        <span class="hs-arr">→</span>
        <span class="hs-rem">残${s.remaining}yd</span>
        ${resultBadge}
      </div>
    </div>`;
  }).join('');
  const cupRow = `
    <div class="hs-shot hs-cupin">
      <div class="hs-no">⛳</div>
      <div class="hs-club">カップイン</div>
      <div class="hs-dists"><span class="hs-carry">${totalShots}打</span></div>
    </div>`;

  document.getElementById('hsShotList').innerHTML = shotRows + cupRow;
  document.getElementById('hsScoreCard').innerHTML = buildScoreCard();
  if (sd) {
    document.getElementById('hsScore').textContent = sd.name;
    document.getElementById('hsScore').className = `hs-score-badge ${sd.cls}`;
    const puttsText = meta.putts ? '　' + meta.putts + 'パット' : '';
    document.getElementById('hsHoleInfo').textContent = 'H' + h.no + ' PAR' + h.par + '　' + totalShots + '打' + puttsText;
  }
  document.getElementById('holeSummaryPanel').classList.add('open');
}

function closeHoleSummary() {
  document.getElementById('holeSummaryPanel').classList.remove('open');
  const nextIdx = st.hIdx + 1;
  // 2コース18H時は totalHoles()（18）。course().holes.length は第1コースの9のみで後半に進めないバグになる
  if (course() && nextIdx < totalHoles()) selectHole(nextIdx);
}

// ============================================================
// スコアカード
// ============================================================
function buildScoreCard() {
  if (!course()) return '';
  const holes = course().holes;
  const parRow   = holes.map(h => `<td>${h.par}</td>`).join('');
  const scoreRow = holes.map((h, i) => {
    const mk = `${st.gcIdx}_${st.cIdx}_${i}_meta`;
    const meta = roundShots[mk] || {};
    if (!meta.cupIn) return '<td class="sc-empty">—</td>';
    const s     = meta.totalShots || (meta.par + (meta.scoreDiff || 0));
    const diff  = s - meta.par;
    const sd    = scoreDef(diff);
    const label = diff === 0 ? 'E' : diff > 0 ? '+' + diff : String(diff);
    const puttsLabel = meta.putts ? '<div class="sc-putts">' + meta.putts + 'P</div>' : '';
    return '<td class="sc-cell ' + sd.cls + '">' + s + '<br><small>' + label + '</small>' + puttsLabel + '</td>';
  }).join('');
  const totalPar   = holes.reduce((a, h) => a + h.par, 0);
  const totalDiff  = holes.reduce((a, h, i) => {
    const meta = roundShots[`${st.gcIdx}_${st.cIdx}_${i}_meta`] || {};
    if (!meta.cupIn) return a;
    const s = meta.totalShots || (meta.par + (meta.scoreDiff || 0));
    return a + (s - meta.par);
  }, 0);
  const totalScore = holes.reduce((a, h, i) => {
    const meta = roundShots[`${st.gcIdx}_${st.cIdx}_${i}_meta`] || {};
    if (!meta.cupIn) return a;
    return a + (meta.totalShots || (meta.par + (meta.scoreDiff || 0)));
  }, 0);
  const totalLabel = totalDiff === 0 ? 'Even' : totalDiff > 0 ? `+${totalDiff}` : String(totalDiff);

  return `
    <table class="sc-table">
      <thead>
        <tr><th>H</th>${holes.map(h => `<th>${h.no}</th>`).join('')}<th>合計</th></tr>
      </thead>
      <tbody>
        <tr class="sc-par-row">
          <td class="sc-label">PAR</td>${parRow}<td>${totalPar}</td>
        </tr>
        <tr class="sc-score-row">
          <td class="sc-label">スコア</td>${scoreRow}
          <td class="sc-total">${totalScore || '—'}<br><small>${totalScore ? totalLabel : ''}</small></td>
        </tr>
      </tbody>
    </table>
  `;
}

// ============================================================
// 保存済みショット描画
// ============================================================
function makeShotIcon(s) {
  if (s.isPenalty) {
    // OB/ドロップ地点マーカー（赤枠・破線）
    const label = `→${s.penaltyTarget}打目`;
    const w = Math.max(72, label.length * 7 + 12);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="52">
      <circle cx="${w/2}" cy="14" r="12" fill="#1a0505" stroke="#e05252" stroke-width="2" stroke-dasharray="3,2"/>
      <text x="${w/2}" y="11" text-anchor="middle" fill="#e05252" font-size="7" font-weight="bold" font-family="Arial,sans-serif">OB</text>
      <text x="${w/2}" y="21" text-anchor="middle" fill="#e05252" font-size="10" font-weight="bold" font-family="Arial,sans-serif">${s.no}</text>
      <rect x="1" y="30" width="${w-2}" height="20" rx="5" fill="rgba(30,5,5,0.9)" stroke="#e05252" stroke-width="0.8"/>
      <text x="${w/2}" y="44" text-anchor="middle" fill="#e05252" font-size="9" font-family="Arial,sans-serif">${label}</text>
    </svg>`;
    return { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(w, 52), anchor: new google.maps.Point(w/2, 14) };
  }
  const label = `${s.carry}yd→${s.remaining}yd`;
  const w = Math.max(84, label.length * 7 + 12);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="52">
    <circle cx="${w/2}" cy="14" r="12" fill="#0d1e0d" stroke="#4caf50" stroke-width="2.5"/>
    <text x="${w/2}" y="19" text-anchor="middle" fill="#4caf50" font-size="12" font-weight="bold" font-family="Arial,sans-serif">${s.no}</text>
    <rect x="1" y="30" width="${w-2}" height="20" rx="5" fill="rgba(10,22,10,0.9)" stroke="#4caf50" stroke-width="0.8"/>
    <text x="${w/2}" y="44" text-anchor="middle" fill="#e8c84a" font-size="10" font-family="Arial,sans-serif">${label}</text>
  </svg>`;
  return { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(w, 52), anchor: new google.maps.Point(w/2, 14) };
}

function renderShotLayer() {
  clearShotLayer();
  const shots = curShots(); if (!shots.length) return;
  const h = hole(); if (!h) return;

  const tee = activeTee(h);
  const path = [{ lat: tee.lat, lng: tee.lng }, ...shots.map(s => ({ lat: s.lat, lng: s.lng }))];
  shotLines.push(new google.maps.Polyline({ path, map,
    strokeColor: '#4caf50', strokeOpacity: .6, strokeWeight: 2,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 }, offset: '100%', repeat: '70px' }] }));
  shots.forEach(s => {
    const m = new google.maps.Marker({ position: { lat: s.lat, lng: s.lng }, map, icon: makeShotIcon(s), zIndex: 50 });
    m.addListener('click', openReview);
    shotMarkers.push(m);
  });
}

function clearShotLayer() {
  shotMarkers.forEach(m => m.setMap(null)); shotMarkers = [];
  shotLines.forEach(l => l.setMap(null));   shotLines = [];
}

// ============================================================
// レビューパネル
// ============================================================
function toggleReview() {
  document.getElementById('reviewPanel').classList.contains('open') ? closeReview() : openReview();
}

function openReview() {
  const shots = curShots(); const h = hole();
  const meta  = roundShots[`${holeKey()}_meta`] || {};
  let titleHtml = h ? `H${h.no} PAR${h.par}　${shots.length}打` : 'ショット履歴';
  if (meta.cupIn) {
    const sd = scoreDef(meta.scoreDiff);
    titleHtml += `<span class="rv-score-badge ${sd.cls}" style="background:var(--${sd.cls})">${sd.name}</span>`;
  }
  document.getElementById('rvTitle').innerHTML = titleHtml;
  document.getElementById('rvList').innerHTML = shots.length
    ? shots.map((s, i) => {
        const resultHtml = s.result
          ? `<span class="rv-result ${_resultCls(s.result)}">${_resultIcon(s.result)} ${s.result}</span>`
          : '';
        const clubHtml = s.isPenalty
          ? `<span class="rv-penalty-label">⚠️ OB/ドロップ → ${s.penaltyTarget}打目へ</span>`
          : `${s.club}${resultHtml}`;
        return `
        <div class="rv-shot${s.isPenalty ? ' rv-shot-penalty' : ''}">
          <div class="rv-no">${s.no}</div>
          <div class="rv-body">
            <div class="rv-club">${clubHtml}</div>
            <div class="rv-line">
              ${s.fromLabel}から <span class="hi">${s.carry}yd</span> 飛んで
              センターピンまで <span class="hi y">${s.remaining}yd</span> 残り
            </div>
          </div>
          <button class="rv-del" onclick="deleteShot(${i})">✕</button>
        </div>`;
      }).join('')
    : '<p style="color:var(--gr);font-size:12px;text-align:center;padding:16px;">ショット未登録</p>';
  document.getElementById('reviewPanel').classList.add('open');
  document.getElementById('reviewOverlay').classList.add('show');
}

function closeReview() {
  document.getElementById('reviewPanel').classList.remove('open');
  document.getElementById('reviewOverlay').classList.remove('show');
}

function deleteShot(idx) {
  const key = holeKey(); if (!roundShots[key]) return;
  roundShots[key].splice(idx, 1);
  const holeOff = roundShots[key + '_offset'] || 0;
  // 配列インデックス i を使って re-numbering（オフセット対応）
  roundShots[key].forEach((s, i) => { s.no = i + 1 + holeOff; });
  if (!roundShots[key].length) delete roundShots[key];
  saveRound(); renderShotLayer(); renderStrip(); openReview(); updateInfo(); updateRecBanner();
}

function clearHoleShots() {
  const key = holeKey();
  delete roundShots[key];
  delete roundShots[`${key}_meta`];
  delete roundShots[`${key}_offset`];
  delete roundShots[`${key}_pendingPenalty`];
  saveRound(); clearShotLayer(); renderStrip(); closeReview(); updateInfo(); updateRecBanner();
}

// ============================================================
// 評価ヘルパー
// ============================================================
function _resultCls(r) {
  const m = SHOT_RESULTS.find(x => x.key === r);
  return m ? m.cls : '';
}
function _resultIcon(r) {
  const m = SHOT_RESULTS.find(x => x.key === r);
  return m ? m.icon : '';
}
