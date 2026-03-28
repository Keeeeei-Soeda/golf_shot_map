/* =====================================================
   history.js — ラウンド履歴・GPS・ShotNaviリンク
   ===================================================== */

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

function closeHistory() {
  document.getElementById('histPanel').classList.remove('open');
}

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
// キャディノート エクスポート
// ============================================================
function exportCaddyNotes() {
  var all = JSON.parse(localStorage.getItem('golfRounds') || '[]');
  if (!all.length) { alert('エクスポートするデータがありません'); return; }

  var notes = all.map(function(r) {
    // cIdx ごとにコース別に整理 { cIdx: { hIdx: {...} } }
    var courses = {};

    Object.keys(r.shots).forEach(function(k) {
      if (k.indexOf('_meta') !== -1) return;
      var parts = k.split('_'); // gcIdx_cIdx_hIdx
      if (parts.length < 3) return;
      var gcIdx = parseInt(parts[0]);
      var cIdx  = parseInt(parts[1]);
      var hIdx  = parseInt(parts[2]);

      var metaKey = k + '_meta';
      var meta  = r.shots[metaKey] || {};
      var shots = r.shots[k] || [];

      // コース名を COURSES から取得
      var courseName = '';
      try { courseName = COURSES[gcIdx].courses[cIdx].name; } catch(e) {}

      if (!courses[cIdx]) {
        courses[cIdx] = { courseIndex: cIdx, courseName: courseName, holes: {} };
      }
      courses[cIdx].holes[hIdx] = {
        holeIndex: hIdx,
        par: meta.par || null,
        totalShots: meta.totalShots || null,
        scoreDiff: meta.scoreDiff !== undefined ? meta.scoreDiff : null,
        cupIn: meta.cupIn || false,
        shots: shots.map(function(s) {
          return { no: s.no, club: s.club, carry: s.carry, remaining: s.remaining,
                   fromLabel: s.fromLabel, lat: s.lat, lng: s.lng };
        })
      };
    });

    // courses を配列に変換（旧形式 holes も互換のため残す）
    var coursesArr = Object.keys(courses).sort().map(function(ci) { return courses[ci]; });

    // 旧形式互換: 全コースのホールをフラットにまとめた holes
    var holesFlat = {};
    coursesArr.forEach(function(c) {
      Object.keys(c.holes).forEach(function(hi) {
        var key = c.courseIndex + '_' + hi;
        holesFlat[key] = c.holes[hi];
      });
    });

    return {
      id: r.id,
      date: r.date,
      gcName: r.gcName,
      courseName: r.courseName,
      courses: coursesArr,
      holes: holesFlat  // 旧caddy.html互換
    };
  });

  var json = JSON.stringify({ exportedAt: new Date().toISOString(), rounds: notes }, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'caddy_notes.json'; a.click();
  URL.revokeObjectURL(url);
}
