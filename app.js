/* =====================================================
   app.js — Golf Tracker アプリロジック
   ===================================================== */

// クラブ一覧
const CLUBS = ['1W','3W','5W','4H','5H','3I','4I','5I','6I','7I','8I','9I','PW','AW','SW','PT'];

// スコア定義
const SCORE_DEFS = [
  { diff: -2, name: 'イーグル',       cls: 'eagle'  },
  { diff: -1, name: 'バーディ',       cls: 'birdie' },
  { diff:  0, name: 'パー',           cls: 'par'    },
  { diff:  1, name: 'ボギー',         cls: 'bogey'  },
  { diff:  2, name: 'ダブルボギー',   cls: 'dbl'    },
  { diff:  3, name: 'トリプルボギー', cls: 'tpl'    },
];

function scoreDef(diff) {
  return SCORE_DEFS.find(d => d.diff === diff) || { diff, name: `+${diff}`, cls: 'other' };
}

// ============================================================
// 状態
// ============================================================
let map = null, mapsLoaded = false;
let st = { gcIdx: null, cIdx: null, hIdx: 0 };
let appMode = 'measure';

// 測定モード
let measureClick = null, teeLine = null, pinLine = null;

// ショット保存済みレイヤー
let shotMarkers = [], shotLines = [];

// ペンディング（位置確定前）
let pendingPos = null, selectedClub = null;
let pendingMarker = null, pendingCarryLine = null, pendingPinLine = null;
let pendingCarryLabel = null, pendingPinLabel = null;

// GPS
let gpsMarker = null, gpsWatch = null, gpsActive = false;

// ラウンドデータ
let roundShots = {}, roundId = null;

// カップインパネルの選択スコア差
let cpSelectedDiff = null;

// ============================================================
// ヘルパー
// ============================================================
const gc       = () => st.gcIdx !== null ? COURSES[st.gcIdx] : null;
const course   = () => gc() && st.cIdx !== null ? gc().courses[st.cIdx] : null;
const hole     = () => course() ? course().holes[st.hIdx] : null;
const hasData  = (h) => h && h.tee && h.front;
const holeKey  = () => `${st.gcIdx}_${st.cIdx}_${st.hIdx}`;
const curShots = () => roundShots[holeKey()] || [];

function haversine(la1, lo1, la2, lo2) {
  const R = 6371000, r = Math.PI / 180;
  const dL = (la2 - la1) * r, dN = (lo2 - lo1) * r;
  const a = Math.sin(dL/2)**2 + Math.cos(la1*r) * Math.cos(la2*r) * Math.sin(dN/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ============================================================
// セレクタ初期化
// ============================================================
function initSelects() {
  const s = document.getElementById('gcSel');
  COURSES.forEach((c, i) => {
    const o = document.createElement('option');
    o.value = i; o.textContent = `${c.name}（${c.pref}）`; s.appendChild(o);
  });
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
}

// ============================================================
// ラウンド保存
// ============================================================
function saveRound() {
  if (!gc() || !course() || !roundId) return;
  const all = JSON.parse(localStorage.getItem('golfRounds') || '[]');
  const idx = all.findIndex(r => r.id === roundId);
  const data = { id: roundId, date: new Date().toLocaleDateString('ja-JP'),
    gcName: gc().name, courseName: course().name, shots: roundShots, updatedAt: Date.now() };
  if (idx >= 0) all[idx] = data; else all.unshift(data);
  localStorage.setItem('golfRounds', JSON.stringify(all.slice(0, 30)));
  updateBadge();
}

function updateBadge() {
  const all = JSON.parse(localStorage.getItem('golfRounds') || '[]');
  const b = document.getElementById('histBadge');
  b.textContent = all.length; b.style.display = all.length ? 'block' : 'none';
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
      const sd = scoreDef(meta.scoreDiff);
      const label = meta.scoreDiff === 0 ? 'E' : meta.scoreDiff > 0 ? `+${meta.scoreDiff}` : String(meta.scoreDiff);
      badge = `<span class="sbadge ${sd.cls}">${label}</span>`;
    } else if (shots.length) {
      badge = `<span class="sbadge cupin">${shots.length}打</span>`;
    }
    return `<button class="h-btn ${i === st.hIdx ? 'active' : ''} ${!hasData(h) ? 'no-data' : ''}" onclick="selectHole(${i})">
      ${h.no}H<span class="par">PAR${h.par}</span>${badge}
    </button>`;
  }).join('');
}

function selectHole(i) { st.hIdx = i; renderStrip(); loadHole(); closeReview(); updateSNLink(); }

// ============================================================
// モード切替
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
// ヤード情報パネル描画
// ============================================================
function renderYardageInfo(h) {
  const el = document.getElementById('yardageInfo');
  if (!h || !hasData(h)) { el.style.display = 'none'; return; }

  // 座標から計算：ティー→フロントエッジ、ティー→センター
  const teeToFront  = Math.round(haversine(h.tee.lat, h.tee.lng, h.front.lat,  h.front.lng)  * 1.09361);
  const teeToCenter = Math.round(haversine(h.tee.lat, h.tee.lng, h.center.lat, h.center.lng) * 1.09361);

  // ShotNaviヤード（登録済みの場合のみ）
  const yd = h.yards;
  const ydRow = yd
    ? `<div class="yi-row yi-shotnavi">
        <div class="yi-cell"><div class="yi-label">バック</div><div class="yi-val sn">${yd.back}<span>yd</span></div></div>
        <div class="yi-cell"><div class="yi-label">レギュラー</div><div class="yi-val sn">${yd.reg}<span>yd</span></div></div>
        <div class="yi-cell"><div class="yi-label">レディース</div><div class="yi-val sn">${yd.ladies}<span>yd</span></div></div>
      </div>`
    : '';

  el.innerHTML = `
    <div class="yi-title">H${h.no} <span class="yi-par">PAR ${h.par}</span></div>
    <div class="yi-row">
      <div class="yi-cell">
        <div class="yi-label">ティー → フロント</div>
        <div class="yi-val blue">${teeToFront}<span>yd</span></div>
      </div>
      <div class="yi-cell">
        <div class="yi-label">ティー → センター</div>
        <div class="yi-val green">${teeToCenter}<span>yd</span></div>
      </div>
    </div>
    ${ydRow}
  `;
  el.style.display = 'block';
}

// ============================================================
// 地図ロード
// ============================================================
function loadHole() {
  const h = hole();
  document.getElementById('reviewBtn').style.display = 'none';
  updateCupBtn();
  if (!h || !hasData(h)) {
    document.getElementById('map').style.display = 'none';
    document.getElementById('emptyMap').style.display = 'flex';
    document.getElementById('emptyMap').querySelector('p').textContent =
      h ? `${h.no}番ホールの座標はまだ登録されていません` : 'コースを選択してください';
    document.getElementById('legend').style.display = 'none';
    document.getElementById('recBanner').style.display = 'none';
    clearMeasure(); clearPending(); clearShotLayer(); updateInfo(); return;
  }
  document.getElementById('emptyMap').style.display = 'none';
  document.getElementById('map').style.display = 'block';
  document.getElementById('legend').style.display = 'block';
  document.getElementById('reviewBtn').style.display = 'flex';
  renderYardageInfo(h);
  clearMeasure(); clearPending();
  if (!mapsLoaded) return;
  if (!map) {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: h.tee.lat, lng: h.tee.lng }, zoom: 17,
      mapTypeId: 'satellite', tilt: 0,
      disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy',
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER }
    });
    map.addListener('click', onMapClick);
  } else {
    const b = new google.maps.LatLngBounds();
    [h.tee, h.front, h.back].forEach(p => b.extend(p));
    map.fitBounds(b, { top: 60, bottom: 60, left: 40, right: 40 });
  }
  placePins(h); renderShotLayer(); updateInfo(); updateRecBanner();
}

// ============================================================
// ピン配置
// ============================================================
function placePins(h) {
  if (window._pins) window._pins.forEach(m => m.setMap(null));
  window._pins = [];
  const mk = (pos, color, lbl, title) => {
    const m = new google.maps.Marker({ position: pos, map, title,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 11,
        fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
      label: { text: lbl, color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });
    m.addListener('click', () => { if (appMode === 'measure' && measureClick) showDists(measureClick.getPosition()); });
    return m;
  };
  window._pins.push(mk(h.tee,    '#4a9fd4', 'T', 'ティー'));
  window._pins.push(mk(h.front,  '#e05252', 'F', 'フロント'));
  window._pins.push(mk(h.center, '#a78bfa', 'C', 'センター'));
  window._pins.push(mk(h.back,   '#e8c84a', 'B', 'バック'));
}

// ============================================================
// 地図タップ
// ============================================================
function onMapClick(e) {
  if (appMode === 'measure') { handleMeasure(e.latLng); return; }
  updatePendingPos(e.latLng);
  if (!document.getElementById('shotPanel').classList.contains('open')) openShotPanelUI();
}

// ============================================================
// 測定モード
// ============================================================
function handleMeasure(pos) {
  if (measureClick) measureClick.setMap(null);
  if (teeLine) { teeLine.setMap(null); teeLine = null; }
  if (pinLine)  { pinLine.setMap(null);  pinLine = null; }
  measureClick = new google.maps.Marker({
    position: pos, map,
    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8,
      fillColor: '#fff', fillOpacity: .9, strokeColor: '#4a9fd4', strokeWeight: 2.5 },
    zIndex: 99
  });
  showDists(pos);
}

function showDists(pos) {
  const h = hole(); if (!h || !hasData(h)) return;
  const teeYd = Math.round(haversine(h.tee.lat, h.tee.lng, pos.lat(), pos.lng()) * 1.09361);
  const targets = [
    { pos: h.front,  name: 'フロント' },
    { pos: h.center, name: 'センター' },
    { pos: h.back,   name: 'バック'   },
  ];
  let near = targets[0];
  let minD = haversine(pos.lat(), pos.lng(), near.pos.lat, near.pos.lng);
  targets.slice(1).forEach(t => {
    const d = haversine(pos.lat(), pos.lng(), t.pos.lat, t.pos.lng);
    if (d < minD) { minD = d; near = t; }
  });
  document.getElementById('dpTeeYd').innerHTML = `${teeYd}<span>yd</span>`;
  document.getElementById('dpPinYd').innerHTML = `${Math.round(minD * 1.09361)}<span>yd</span>`;
  document.getElementById('dpPinLabel').textContent = `${near.name}まで`;
  document.getElementById('distPanel').classList.add('show');
  if (teeLine) teeLine.setMap(null);
  teeLine = new google.maps.Polyline({ path: [{ lat: h.tee.lat, lng: h.tee.lng }, pos], map,
    strokeColor: '#4a9fd4', strokeOpacity: .7, strokeWeight: 2,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 }, offset: '100%' }] });
  if (pinLine) pinLine.setMap(null);
  pinLine = new google.maps.Polyline({ path: [pos, { lat: near.pos.lat, lng: near.pos.lng }], map,
    strokeColor: '#e8c84a', strokeOpacity: .85, strokeWeight: 2,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 }, offset: '100%' }] });
}

function clearMeasure() {
  if (measureClick) { measureClick.setMap(null); measureClick = null; }
  if (teeLine) { teeLine.setMap(null); teeLine = null; }
  if (pinLine)  { pinLine.setMap(null);  pinLine = null; }
  document.getElementById('distPanel').classList.remove('show');
}

// ============================================================
// ペンディング（位置確定前の地図表示）
// ============================================================
function updatePendingPos(pos) {
  const h = hole(); if (!h || !hasData(h)) return;
  pendingPos = pos;
  const shots = curShots();
  const prevIsTee = shots.length === 0;
  const prevPos = prevIsTee
    ? { lat: h.tee.lat, lng: h.tee.lng }
    : { lat: shots[shots.length-1].lat, lng: shots[shots.length-1].lng };
  const carryYd = Math.round(haversine(prevPos.lat, prevPos.lng, pos.lat(), pos.lng()) * 1.09361);
  const remYd   = Math.round(haversine(pos.lat(), pos.lng(), h.center.lat, h.center.lng) * 1.09361);

  document.getElementById('spCarry').innerHTML  = `${carryYd}<span>yd</span>`;
  document.getElementById('spRemain').innerHTML = `${remYd}<span>yd</span>`;
  document.getElementById('spCarryFrom').textContent = prevIsTee ? 'ティーから' : `${shots.length}打目地点から`;

  // マーカー
  if (pendingMarker) pendingMarker.setPosition(pos);
  else {
    pendingMarker = new google.maps.Marker({
      position: pos, map,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 13,
        fillColor: '#f59e0b', fillOpacity: .85, strokeColor: '#fff', strokeWeight: 2 },
      label: { text: `${shots.length + 1}`, color: '#000', fontSize: '11px', fontWeight: 'bold' },
      zIndex: 100
    });
  }

  // 飛距離ライン（青）
  if (pendingCarryLine) pendingCarryLine.setMap(null);
  pendingCarryLine = new google.maps.Polyline({ path: [prevPos, { lat: pos.lat(), lng: pos.lng() }], map,
    strokeColor: '#4a9fd4', strokeOpacity: .75, strokeWeight: 2.5,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3 }, offset: '100%' }] });

  // 残り距離ライン（黄）
  if (pendingPinLine) pendingPinLine.setMap(null);
  pendingPinLine = new google.maps.Polyline({ path: [{ lat: pos.lat(), lng: pos.lng() }, { lat: h.center.lat, lng: h.center.lng }], map,
    strokeColor: '#e8c84a', strokeOpacity: .8, strokeWeight: 2,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 }, offset: '100%' }] });

  // ラベル
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
// ショット登録パネル
// ============================================================
function openShotPanelUI() {
  document.getElementById('spShotNo').textContent = `${curShots().length + 1}打目を登録`;
  document.getElementById('clubGrid').innerHTML = CLUBS.map(c =>
    `<button class="cb" onclick="selectClub('${c}')">${c}</button>`).join('');
  document.getElementById('spOkBtn').disabled = true;
  selectedClub = null;
  document.getElementById('shotPanel').classList.add('open');
  document.getElementById('recBanner').style.display = 'none';
}

function selectClub(c) {
  selectedClub = c;
  document.querySelectorAll('.cb').forEach(b => b.classList.toggle('sel', b.textContent === c));
  document.getElementById('spOkBtn').disabled = false;
}

function confirmShot() {
  if (!pendingPos || !selectedClub) return;
  const h = hole(); if (!h) return;
  const key = holeKey();
  if (!roundShots[key]) roundShots[key] = [];
  const shots = roundShots[key];
  const prevIsTee = shots.length === 0;
  const prevPos = prevIsTee
    ? { lat: h.tee.lat, lng: h.tee.lng }
    : { lat: shots[shots.length-1].lat, lng: shots[shots.length-1].lng };
  const no      = shots.length + 1;
  const carryYd = Math.round(haversine(prevPos.lat, prevPos.lng, pendingPos.lat(), pendingPos.lng()) * 1.09361);
  const remYd   = Math.round(haversine(pendingPos.lat(), pendingPos.lng(), h.center.lat, h.center.lng) * 1.09361);
  shots.push({ no, lat: pendingPos.lat(), lng: pendingPos.lng(),
    club: selectedClub, carry: carryYd, remaining: remYd,
    fromLabel: prevIsTee ? 'ティー' : `${shots.length}打目地点` });
  saveRound(); cancelShot(); renderShotLayer(); renderStrip(); updateInfo(); updateRecBanner();
}

function cancelShot() {
  pendingPos = null; selectedClub = null;
  clearPending();
  document.getElementById('shotPanel').classList.remove('open');
  updateRecBanner();
}

// ============================================================
// カップインパネル
// ============================================================
function openCupPanel() {
  const h = hole(); if (!h) return;
  const shots = curShots();
  const diff = shots.length - h.par;
  cpSelectedDiff = diff;
  const sd = scoreDef(diff);
  document.getElementById('cpHoleInfo').textContent = `H${h.no} PAR${h.par}`;
  document.getElementById('cpShots').textContent = shots.length || '—';
  const lbl = document.getElementById('cpScoreLabel');
  lbl.textContent   = shots.length ? `${sd.name}（${diff > 0 ? '+' : ''}${diff}）` : '（打数未記録）';
  lbl.className     = `cup-score-label ${sd.cls}`;
  lbl.style.background = shots.length ? '' : 'transparent';
  document.getElementById('cpScoreBtns').innerHTML = SCORE_DEFS.map(d => {
    const label = d.diff === 0 ? 'E' : d.diff > 0 ? `+${d.diff}` : String(d.diff);
    return `<button class="score-btn ${d.cls} ${d.diff === cpSelectedDiff ? 'sel' : ''}"
      onclick="selectCupScore(${d.diff})">${d.name}<br><small>${label}</small></button>`;
  }).join('');
  document.getElementById('cupPanel').classList.add('open');
  document.getElementById('recBanner').style.display = 'none';
}

function selectCupScore(diff) {
  cpSelectedDiff = diff;
  document.querySelectorAll('.score-btn').forEach(b => {
    const d = parseInt(b.getAttribute('onclick').match(/-?\d+/)[0]);
    b.classList.toggle('sel', d === diff);
  });
}

function confirmCupIn() {
  const h = hole(); if (!h) return;
  const key = holeKey();
  if (!roundShots[key]) roundShots[key] = [];
  roundShots[`${key}_meta`] = { cupIn: true, scoreDiff: cpSelectedDiff, par: h.par };
  saveRound(); closeCupPanel(); renderStrip(); updateInfo(); updateRecBanner();
  const nextIdx = st.hIdx + 1;
  if (course() && nextIdx < course().holes.length) {
    setTimeout(() => selectHole(nextIdx), 400);
  }
}

function closeCupPanel() {
  document.getElementById('cupPanel').classList.remove('open');
  updateRecBanner();
}

// ============================================================
// 保存済みショット描画
// ============================================================
function makeShotIcon(s) {
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
  document.getElementById('legShot').style.display = 'flex';
  const path = [{ lat: h.tee.lat, lng: h.tee.lng }, ...shots.map(s => ({ lat: s.lat, lng: s.lng }))];
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
  document.getElementById('legShot').style.display = 'none';
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
    ? shots.map(s => `
        <div class="rv-shot">
          <div class="rv-no">${s.no}</div>
          <div class="rv-body">
            <div class="rv-club">${s.club}</div>
            <div class="rv-line">
              ${s.fromLabel}から <span class="hi">${s.carry}yd</span> 飛んで
              センターピンまで <span class="hi y">${s.remaining}yd</span> 残り
            </div>
          </div>
          <button class="rv-del" onclick="deleteShot(${s.no-1})">✕</button>
        </div>`).join('')
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
  roundShots[key].forEach((s, i) => { s.no = i + 1; });
  if (!roundShots[key].length) delete roundShots[key];
  saveRound(); renderShotLayer(); renderStrip(); openReview(); updateInfo(); updateRecBanner();
}

function clearHoleShots() {
  const key = holeKey();
  delete roundShots[key]; delete roundShots[`${key}_meta`];
  saveRound(); clearShotLayer(); renderStrip(); closeReview(); updateInfo(); updateRecBanner();
}

// ============================================================
// GPS
// ============================================================
function onGpsBtn() {
  if (appMode === 'record' && gpsActive && gpsMarker && map) {
    updatePendingPos(gpsMarker.getPosition());
    if (!document.getElementById('shotPanel').classList.contains('open')) openShotPanelUI();
  } else {
    gpsActive ? stopGPS() : startGPS();
  }
}

function startGPS() {
  if (!navigator.geolocation) { alert('GPS非対応'); return; }
  gpsActive = true;
  document.getElementById('gpsBtn').classList.add('active');
  gpsWatch = navigator.geolocation.watchPosition(pos => {
    const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    if (!map) return;
    if (!gpsMarker) {
      gpsMarker = new google.maps.Marker({ position: ll, map, title: '現在地',
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 9,
          fillColor: '#4a9fd4', fillOpacity: .9, strokeColor: '#fff', strokeWeight: 2.5 } });
    } else gpsMarker.setPosition(ll);
  }, err => { alert('GPS取得失敗: ' + err.message); stopGPS(); }, { enableHighAccuracy: true, maximumAge: 3000 });
}

function stopGPS() {
  gpsActive = false;
  document.getElementById('gpsBtn').classList.remove('active');
  if (gpsWatch) { navigator.geolocation.clearWatch(gpsWatch); gpsWatch = null; }
  if (gpsMarker) { gpsMarker.setMap(null); gpsMarker = null; }
}

// ============================================================
// 履歴パネル
// ============================================================
function openHistory() {
  const all = JSON.parse(localStorage.getItem('golfRounds') || '[]');
  document.getElementById('histList').innerHTML = all.length
    ? all.map(r => {
        const hc = Object.keys(r.shots).filter(k => !k.includes('_meta')).length;
        const sc = Object.entries(r.shots).filter(([k]) => !k.includes('_meta')).reduce((a, [,v]) => a + v.length, 0);
        let totalDiff = 0, completedHoles = 0;
        const cells = Array.from({ length: 9 }, (_, i) => {
          const baseKey = Object.keys(r.shots).find(k => !k.includes('_meta') && k.endsWith(`_${i}`));
          const parts = baseKey ? baseKey.split('_') : [];
          const metaKey = parts.length >= 3 ? `${parts[0]}_${parts[1]}_${i}_meta` : null;
          const meta = metaKey ? (r.shots[metaKey] || {}) : {};
          if (meta.cupIn) { totalDiff += meta.scoreDiff || 0; completedHoles++; }
          const sd = meta.cupIn ? scoreDef(meta.scoreDiff) : null;
          const label = sd ? (meta.scoreDiff === 0 ? 'E' : meta.scoreDiff > 0 ? `+${meta.scoreDiff}` : String(meta.scoreDiff)) : '—';
          return `<div class="hr-score-cell" style="${sd ? `background:var(--${sd.cls});color:#fff` : ''}">
            <div class="hn">${i+1}</div><div class="sv">${label}</div>
          </div>`;
        }).join('');
        const totalLabel = completedHoles > 0 ? (totalDiff === 0 ? 'Even' : totalDiff > 0 ? `+${totalDiff}` : String(totalDiff)) : '—';
        return `<div class="hist-round" onclick="loadRound('${r.id}')">
          <div class="hr-title">${r.gcName} ${r.courseName}</div>
          <div class="hr-sub">${r.date}</div>
          <div class="hr-badges">
            <span class="hr-badge ${hc ? 'has' : ''}">${hc}ホール</span>
            <span class="hr-badge ${sc ? 'has' : ''}">${sc}打</span>
          </div>
          <div class="hr-score-grid">${cells}</div>
          <div class="hr-total">合計スコア <strong>${totalLabel}</strong></div>
        </div>`;
      }).join('') + `<button class="bb-btn danger" style="width:100%;margin-top:12px;" onclick="clearAllHistory()">すべて削除</button>`
    : '<div class="hist-empty">まだラウンド記録がありません</div>';
  document.getElementById('histPanel').classList.add('open');
}

function closeHistory() { document.getElementById('histPanel').classList.remove('open'); }

function loadRound(id) {
  const all = JSON.parse(localStorage.getItem('golfRounds') || '[]');
  const r = all.find(x => x.id === id); if (!r) return;
  roundId = r.id; roundShots = r.shots;
  closeHistory(); renderStrip(); renderShotLayer(); updateInfo(); updateRecBanner();
}

function clearAllHistory() {
  if (!confirm('すべての履歴を削除しますか？')) return;
  localStorage.removeItem('golfRounds'); updateBadge(); closeHistory();
}

// ============================================================
// ShotNavi リンク
// ============================================================
function updateSNLink() {
  const h = hole(), g = gc(), c = course();
  document.getElementById('snLink').href = (h && g && c) ?
    `https://shotnavi.jp/gcguide/cdata/hdata2_${g.gcid}_${c.cid}_${h.no}.htm` : '#';
}

// ============================================================
// Google Maps API コールバック
// ============================================================
window.initMap = function () { mapsLoaded = true; loadHole(); };

// 初期化
initSelects();
updateBadge();
