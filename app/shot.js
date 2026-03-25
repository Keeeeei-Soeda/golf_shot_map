/* =====================================================
   shot.js — ショット記録・カップイン・サマリー・スコアカード
   ===================================================== */

// ============================================================
// ペンディング（位置確定前）
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
  const fromLabel = prevIsTee ? 'ティーから' : `${shots.length}打目から`;

  updateSpDistTab(carryYd, remYd, fromLabel);

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
  const n = curShots().length + 1;
  document.getElementById('spShotNo').textContent = `${n}打目を登録`;
  document.getElementById('clubGrid').innerHTML = CLUBS.map((c, i) =>
    c ? `<button class="cb" onclick="selectClub('${c}')">${c}</button>`
      : `<div class="cb-empty"></div>`
  ).join('');
  document.getElementById('spOkBtn').disabled = true;
  selectedClub = null;
  switchSpTab('record');
  document.getElementById('shotPanel').classList.add('open');
  document.getElementById('recBanner').style.display = 'none';
}

function switchSpTab(tab) {
  document.getElementById('spTabRecord').classList.toggle('active', tab === 'record');
  document.getElementById('spTabDist').classList.toggle('active', tab === 'dist');
  document.getElementById('spBodyRecord').style.display = tab === 'record' ? 'block' : 'none';
  document.getElementById('spBodyDist').style.display   = tab === 'dist'   ? 'block' : 'none';
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
  const totalShots = shots.length + 1;
  const diff = totalShots - h.par;
  cpSelectedDiff = diff;
  const sd = scoreDef(diff);
  document.getElementById('cpHoleInfo').textContent = `H${h.no} PAR${h.par}`;
  document.getElementById('cpShots').textContent = shots.length > 0 ? totalShots : '—';
  const lbl = document.getElementById('cpScoreLabel');
  lbl.textContent   = shots.length > 0 ? `${sd.name}（${diff > 0 ? '+' : ''}${diff}）` : '（打数未記録）';
  lbl.className     = `cup-score-label ${sd.cls}`;
  lbl.style.background = shots.length > 0 ? '' : 'transparent';
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
  const totalShots = roundShots[key].length + 1;
  roundShots[`${key}_meta`] = { cupIn: true, scoreDiff: cpSelectedDiff, par: h.par, totalShots };
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

  const shotRows = shots.map(s => `
    <div class="hs-shot">
      <div class="hs-no">${s.no}</div>
      <div class="hs-club">${s.club}</div>
      <div class="hs-dists">
        <span class="hs-carry">${s.carry}yd</span>
        <span class="hs-arr">→</span>
        <span class="hs-rem">残${s.remaining}yd</span>
      </div>
    </div>`).join('');
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
    document.getElementById('hsHoleInfo').textContent = `H${h.no} PAR${h.par}　${totalShots}打`;
  }
  document.getElementById('holeSummaryPanel').classList.add('open');
}

function closeHoleSummary() {
  document.getElementById('holeSummaryPanel').classList.remove('open');
  const nextIdx = st.hIdx + 1;
  if (course() && nextIdx < course().holes.length) selectHole(nextIdx);
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
    const label = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : String(diff);
    return `<td class="sc-cell ${sd.cls}">${s}<br><small>${label}</small></td>`;
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
