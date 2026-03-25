/* =====================================================
   measure.js — 測定モード
   ===================================================== */

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
  const shots = curShots();

  // 起点：前打地点（なければティー）
  const prevIsTee = shots.length === 0;
  const origin = prevIsTee
    ? { lat: h.tee.lat, lng: h.tee.lng }
    : { lat: shots[shots.length-1].lat, lng: shots[shots.length-1].lng };
  const originLabel = prevIsTee ? 'ティーから' : `${shots.length}打目地点から`;
  const originYd = Math.round(haversine(origin.lat, origin.lng, pos.lat(), pos.lng()) * 1.09361);

  // ターゲットピン
  const pinMap     = { front: h.front, center: h.center, back: h.back };
  const pinNameMap = { front: 'フロント', center: 'センター', back: 'バック' };
  let targetKey, targetPos, targetName;
  if (measureSelectedPin && pinMap[measureSelectedPin]) {
    targetKey  = measureSelectedPin;
    targetPos  = pinMap[measureSelectedPin];
    targetName = pinNameMap[measureSelectedPin];
  } else {
    const targets = [
      { key: 'front',  pos: h.front,  name: 'フロント' },
      { key: 'center', pos: h.center, name: 'センター' },
      { key: 'back',   pos: h.back,   name: 'バック'   },
    ];
    let near = targets[0];
    let minD  = haversine(pos.lat(), pos.lng(), near.pos.lat, near.pos.lng);
    targets.slice(1).forEach(t => {
      const d = haversine(pos.lat(), pos.lng(), t.pos.lat, t.pos.lng);
      if (d < minD) { minD = d; near = t; }
    });
    targetKey  = near.key;
    targetPos  = near.pos;
    targetName = near.name;
  }
  const pinYd = Math.round(haversine(pos.lat(), pos.lng(), targetPos.lat, targetPos.lng) * 1.09361);

  updateYardageMeasure(originLabel, originYd, targetName, pinYd);

  // ライン描画
  if (teeLine) teeLine.setMap(null);
  teeLine = new google.maps.Polyline({ path: [origin, pos], map,
    strokeColor: '#4a9fd4', strokeOpacity: .7, strokeWeight: 2,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 }, offset: '100%' }] });
  if (pinLine) pinLine.setMap(null);
  pinLine = new google.maps.Polyline({ path: [pos, { lat: targetPos.lat, lng: targetPos.lng }], map,
    strokeColor: '#e8c84a', strokeOpacity: .85, strokeWeight: 2,
    icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 }, offset: '100%' }] });

  // 地図上ラベル
  if (measureFromLabel) measureFromLabel.setMap(null);
  measureFromLabel = makeLabel(
    { lat: (origin.lat + pos.lat()) / 2, lng: (origin.lng + pos.lng()) / 2 },
    `${originYd}yd`, '#000', '#4a9fd4'
  );
  if (measureToLabel) measureToLabel.setMap(null);
  measureToLabel = makeLabel(
    { lat: (pos.lat() + targetPos.lat) / 2, lng: (pos.lng() + targetPos.lng) / 2 },
    `残${pinYd}yd`, '#000', '#e8c84a'
  );
}

function clearMeasure() {
  if (measureClick) { measureClick.setMap(null); measureClick = null; }
  if (teeLine) { teeLine.setMap(null); teeLine = null; }
  if (pinLine)  { pinLine.setMap(null);  pinLine = null; }
  if (measureFromLabel) { measureFromLabel.setMap(null); measureFromLabel = null; }
  if (measureToLabel)   { measureToLabel.setMap(null);   measureToLabel = null; }
  measureSelectedPin = null;
  const mEl = document.getElementById('yiMeasure');
  if (mEl) mEl.innerHTML = '';
}
