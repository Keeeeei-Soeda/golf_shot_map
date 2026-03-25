/* =====================================================
   map.js — 地図・ホール読み込み・ピン配置・回転・ヤードパネル
   ===================================================== */

// ============================================================
// 凡例 表示/非表示
// ============================================================
function showLegend() {
  const el = document.getElementById('legend');
  if (el) el.style.display = 'block';
}

function hideLegend() {
  const el = document.getElementById('legend');
  if (el) el.style.display = 'none';
}

// ============================================================
// ヤード情報パネル
// ============================================================
function toggleYardageInfo() {
  yardageInfoOpen = !yardageInfoOpen;
  const el = document.getElementById('yardageInfo');
  const btn = document.getElementById('yiToggleBtn');
  el.style.display = yardageInfoOpen ? 'block' : 'none';
  btn.classList.toggle('open', yardageInfoOpen);
}

function renderYardageInfo(h) {
  const el = document.getElementById('yardageInfo');
  const mapBtns = document.getElementById('mapBtns');
  if (!h || !hasData(h)) {
    el.style.display = 'none';
    if (mapBtns) mapBtns.style.display = 'none';
    return;
  }
  if (mapBtns) mapBtns.style.display = 'flex';
  showLegend(); // ホール切替時に凡例を復活

  updateYardagePanel(h);
  el.style.display = yardageInfoOpen ? 'block' : 'none';
}

// 現在打数に応じてヤードパネルを更新
function updateYardagePanel(h) {
  if (!h) h = hole();
  if (!h || !hasData(h)) return;

  const shots = curShots();
  const nextNo = shots.length + 1; // 次の打数番号

  let fromLat, fromLng, fromLabel;
  if (shots.length === 0) {
    fromLat = h.tee.lat; fromLng = h.tee.lng;
    fromLabel = `第${nextNo}打`;
  } else {
    const last = shots[shots.length - 1];
    fromLat = last.lat; fromLng = last.lng;
    fromLabel = `第${nextNo}打`;
  }

  const toFront  = Math.round(haversine(fromLat, fromLng, h.front.lat,  h.front.lng)  * 1.09361);
  const toCenter = Math.round(haversine(fromLat, fromLng, h.center.lat, h.center.lng) * 1.09361);
  const toBack   = Math.round(haversine(fromLat, fromLng, h.back.lat,   h.back.lng)   * 1.09361);

  document.getElementById('yardageInfo').innerHTML = `
    <div class="yi-horiz">
      <div class="yi-badge">H${h.no}<span class="yi-par"> PAR${h.par}</span></div>
      <div class="yi-sep">|</div>
      <div class="yi-item">
        <div class="yi-label">${fromLabel}→F</div>
        <div class="yi-val blue">${toFront}<span>yd</span></div>
      </div>
      <div class="yi-sep">|</div>
      <div class="yi-item">
        <div class="yi-label">${fromLabel}→C</div>
        <div class="yi-val green">${toCenter}<span>yd</span></div>
      </div>
      <div class="yi-sep">|</div>
      <div class="yi-item">
        <div class="yi-label">${fromLabel}→B</div>
        <div class="yi-val yellow">${toBack}<span>yd</span></div>
      </div>
    </div>
    <div id="yiMeasure"></div>
  `;
}

function updateYardageMeasure(fromLabel, fromYd, toName, toYd) {
  const mEl = document.getElementById('yiMeasure');
  if (!mEl) return;
  mEl.innerHTML = `
    <div class="yi-horiz yi-measure-row">
      <div class="yi-item">
        <div class="yi-label">${fromLabel}</div>
        <div class="yi-val blue">${fromYd}<span>yd</span></div>
      </div>
      <div class="yi-sep">→</div>
      <div class="yi-item">
        <div class="yi-label">${toName}まで</div>
        <div class="yi-val yellow">${toYd}<span>yd</span></div>
      </div>
    </div>
  `;
}

// ============================================================
// ホール読み込み
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
    
    document.getElementById('recBanner').style.display = 'none';
    const mapBtns = document.getElementById('mapBtns');
    if (mapBtns) mapBtns.style.display = 'none';
    clearMeasure(); clearPending(); clearShotLayer(); updateInfo(); return;
  }
  document.getElementById('emptyMap').style.display = 'none';
  document.getElementById('map').style.display = 'block';
  
  document.getElementById('reviewBtn').style.display = 'flex';
  renderYardageInfo(h);
  clearMeasure(); clearPending();
  if (!mapsLoaded) return;

  const bearing = calcBearing(h.tee.lat, h.tee.lng, h.center.lat, h.center.lng);
  const midLat  = (h.tee.lat + h.center.lat) / 2;
  const midLng  = (h.tee.lng + h.center.lng) / 2;
  const holeDistM = haversine(h.tee.lat, h.tee.lng, h.center.lat, h.center.lng);
  const zoom = holeDistM > 400 ? 16 : holeDistM > 250 ? 17 : 18;

  if (!map) {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: midLat, lng: midLng }, zoom,
      mapTypeId: 'hybrid',
      mapId: 'c041c97b58243474e5cf18cb',
      disableDefaultUI: true, zoomControl: true,
      gestureHandling: 'greedy', rotateControl: false,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER }
    });
    map.addListener('click', onMapClick);
  } else {
    map.setZoom(zoom);
    map.panTo({ lat: midLat, lng: midLng });
  }
  window._currentBearing = bearing;
  placePins(h); renderShotLayer(); updateInfo(); updateRecBanner();
}

// ============================================================
// ピン配置
// ============================================================
function placePins(h) {
  if (window._pins) window._pins.forEach(m => m.setMap(null));
  window._pins = [];
  const shotCount = curShots().length;
  const showFB = shotCount >= 1; // 2打目以降のみF/Bを表示

  const mk = (pos, color, lbl, title, pinKey, fbPin) => {
    if (fbPin && !showFB) return null;
    const m = new google.maps.Marker({ position: pos, map, title,
      icon: { path: google.maps.SymbolPath.CIRCLE, scale: 11,
        fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
      label: { text: lbl, color: '#fff', fontSize: '11px', fontWeight: 'bold' }
    });
    m.addListener('click', () => {
      if (appMode === 'measure' && pinKey) {
        measureSelectedPin = pinKey;
        if (measureClick) showDists(measureClick.getPosition());
      }
    });
    return m;
  };
  const pins = [
    mk(h.tee,    '#4a9fd4', 'T', 'ティー',   null,     false),
    mk(h.front,  '#e05252', 'F', 'フロント', 'front',  true),
    mk(h.center, '#a78bfa', 'C', 'センター', 'center', false),
    mk(h.back,   '#e8c84a', 'B', 'バック',   'back',   true),
  ];
  window._pins = pins.filter(p => p !== null);
}

// ============================================================
// 手動回転
// ============================================================
function rotateToHole() {
  if (!map || window._currentBearing === undefined) return;
  const btn = document.getElementById('rotateBtn');
  const currentHeading = map.getHeading() || 0;
  const target = window._currentBearing;
  const diff = Math.min(Math.abs(currentHeading - target), 360 - Math.abs(currentHeading - target));
  if (diff < 10) {
    map.setHeading(0);
    if (btn) { btn.textContent = '⛳↑'; btn.title = 'ホール方向に回転'; }
  } else {
    map.setHeading(target);
    if (btn) { btn.textContent = '🧭N'; btn.title = '北向きに戻す'; }
  }
}

// ============================================================
// 地図タップ
// ============================================================
function onMapClick(e) {
  hideLegend();
  if (appMode === 'measure') { handleMeasure(e.latLng); return; }
  updatePendingPos(e.latLng);
  if (!document.getElementById('shotPanel').classList.contains('open')) openShotPanelUI();
}

// ============================================================
// Google Maps コールバック
// ============================================================
window.initMap = function () { mapsLoaded = true; loadHole(); };
