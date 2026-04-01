/* =====================================================
   strategy.js — マップ上の過去ラウンド記録オーバーレイ
   ===================================================== */

var strategyActive   = false;
var strategyRoundId  = null;
var strategySource   = 'local';

// コース別ショットデータ: { cIdx: { hIdx: shots[] } }
var strategyCourseData = {};
var strategyGcIdx = null;  // 戦略データのゴルフ場インデックス

var strategyMarkers  = [];
var strategyLines    = [];
var jsonRoundsCache  = null;

var ST_STATE_KEY = 'golfStrategyState';

// ============================================================
// 状態保存・復元
// ============================================================
function saveStrategyState() {
  if (!strategyActive) {
    localStorage.removeItem(ST_STATE_KEY);
    return;
  }
  localStorage.setItem(ST_STATE_KEY, JSON.stringify({
    active:  true,
    source:  strategySource,
    roundId: strategyRoundId
  }));
}

function restoreStrategyState() {
  try {
    var saved = JSON.parse(localStorage.getItem(ST_STATE_KEY) || 'null');
    if (!saved || !saved.active) return;
    strategySource  = saved.source  || 'local';
    strategyRoundId = saved.roundId || null;
    if (strategySource === 'local') {
      var all = JSON.parse(localStorage.getItem('golfRounds') || '[]');
      var r = all.find(function(x){ return x.id === strategyRoundId; });
      if (r) _applyLocalRound(r, false);
    } else {
      _fetchJsonRounds().then(function(rounds) {
        var r = rounds.find(function(x){ return x.id === strategyRoundId; });
        if (r) _applyJsonRound(r, false);
      }).catch(function(){});
    }
  } catch(e) {}
}

// ============================================================
// セレクターパネル
// ============================================================
function openStrategySelector() {
  var wrap = document.getElementById('stDeactivateWrap');
  if (wrap) wrap.style.display = strategyActive ? 'block' : 'none';
  document.getElementById('strategyPanel').classList.add('open');
  setStrategySourceTab(strategySource);
  closeMenu();
}

function closeStrategySelector() {
  document.getElementById('strategyPanel').classList.remove('open');
}

function setStrategySourceTab(src) {
  strategySource = src;
  document.getElementById('stTabLocal').classList.toggle('active', src === 'local');
  document.getElementById('stTabJson').classList.toggle('active',  src === 'json');
  _populateRoundList();
}

function _populateRoundList() {
  var list = document.getElementById('stRoundList');
  list.innerHTML = '<div class="st-loading">読み込み中...</div>';

  if (strategySource === 'local') {
    var all = JSON.parse(localStorage.getItem('golfRounds') || '[]');
    if (!all.length) {
      list.innerHTML = '<div class="st-empty">ローカル履歴がありません<br><small>先にラウンドを記録してください</small></div>';
      return;
    }
    list.innerHTML = all.map(function(r) {
      var hc = Object.keys(r.shots).filter(function(k){
        return k.indexOf('_meta') === -1 && r.shots[k].length > 0;
      }).length;
      var isOn = strategyActive && strategyRoundId === r.id;
      return '<div class="st-round-item' + (isOn ? ' active' : '') + '" onclick="activateStrategyLocal(\'' + r.id + '\')">'
        + '<div class="st-round-gc">' + r.gcName + '</div>'
        + '<div class="st-round-sub">' + r.courseName + '・' + r.date + '・' + hc + 'H記録</div>'
        + (isOn ? '<span class="st-on-badge">表示中</span>' : '')
        + '</div>';
    }).join('');
  } else {
    _fetchJsonRounds().then(function(rounds) {
      if (!rounds.length) {
        list.innerHTML = '<div class="st-empty">caddy_notes.json が見つかりません<br><small>エクスポート → data/ に配置してください</small></div>';
        return;
      }
      list.innerHTML = rounds.map(function(r) {
        var courses = r.courses || [];
        var hc = courses.reduce(function(acc, c){ return acc + Object.keys(c.holes||{}).length; }, 0);
        var isOn = strategyActive && strategyRoundId === r.id;
        return '<div class="st-round-item' + (isOn ? ' active' : '') + '" onclick="activateStrategyJson(\'' + r.id + '\')">'
          + '<div class="st-round-gc">' + r.gcName + '</div>'
          + '<div class="st-round-sub">' + r.date + '・' + hc + 'H記録</div>'
          + (isOn ? '<span class="st-on-badge">表示中</span>' : '')
          + '</div>';
      }).join('');
    }).catch(function() {
      list.innerHTML = '<div class="st-empty">読み込みに失敗しました</div>';
    });
  }
}

function _fetchJsonRounds() {
  if (jsonRoundsCache) return Promise.resolve(jsonRoundsCache);
  return fetch('./data/caddy_notes.json?v=' + Date.now())
    .then(function(r) { if (!r.ok) throw new Error('not found'); return r.json(); })
    .then(function(data) { jsonRoundsCache = data.rounds || []; return jsonRoundsCache; });
}

// ============================================================
// 起動
// ============================================================
function activateStrategyLocal(roundId) {
  var all = JSON.parse(localStorage.getItem('golfRounds') || '[]');
  var r = all.find(function(x){ return x.id === roundId; });
  if (!r) return;
  _applyLocalRound(r, true);
}

function activateStrategyJson(roundId) {
  _fetchJsonRounds().then(function(rounds) {
    var r = rounds.find(function(x){ return x.id === roundId; });
    if (r) _applyJsonRound(r, true);
  });
}

// ローカル履歴から適用 - cIdx を正しく分離
function _applyLocalRound(r, closePanel) {
  var shotKeys = Object.keys(r.shots).filter(function(k){
    return k.indexOf('_meta') === -1;
  });
  if (!shotKeys.length) {
    alert('このラウンドにはショットデータがありません');
    return;
  }

  // { cIdx: { hIdx: shots[] } } の形に整理
  strategyCourseData = {};
  shotKeys.forEach(function(k) {
    var parts = k.split('_'); // gcIdx_cIdx_hIdx
    if (parts.length < 3) return;
    var cIdx = parseInt(parts[1]);
    var hIdx = parseInt(parts[2]);
    if (!strategyCourseData[cIdx]) strategyCourseData[cIdx] = {};
    strategyCourseData[cIdx][hIdx] = r.shots[k] || [];
  });

  // 最初のキーからgcIdxを取得
  strategyGcIdx = parseInt(Object.keys(r.shots).filter(function(k){
    return k.indexOf('_meta') === -1;
  })[0].split('_')[0]);
  strategyRoundId = r.id;
  strategySource  = 'local';
  strategyActive  = true;

  clearMeasure();
  clearPending();
  updateInfo();
  updateRecBanner();
  updateCupBtn();
  renderStrategyLayer();
  saveStrategyState();
  _updateStrategyUI();
  if (closePanel) closeStrategySelector();
}

// JSON形式から適用（新フォーマット: courses[].holes）
function _applyJsonRound(r, closePanel) {
  strategyCourseData = {};
  var courses = r.courses || [];
  courses.forEach(function(c) {
    var cIdx = c.courseIndex;
    strategyCourseData[cIdx] = {};
    Object.keys(c.holes || {}).forEach(function(hKey) {
      strategyCourseData[cIdx][parseInt(hKey)] = c.holes[hKey].shots || [];
    });
  });

  strategyGcIdx = null;  // JSONはgcIdx不明のためnull（コース名で照合）
  strategyRoundId = r.id;
  strategySource  = 'json';
  strategyActive  = true;

  clearMeasure();
  clearPending();
  updateInfo();
  updateRecBanner();
  updateCupBtn();
  renderStrategyLayer();
  saveStrategyState();
  _updateStrategyUI();
  if (closePanel) closeStrategySelector();
}

function deactivateStrategy() {
  strategyActive = false;
  strategyCourseData = {};
  strategyGcIdx = null;
  clearStrategyLayer();
  saveStrategyState();
  _updateStrategyUI();
  // 測定モードに戻す
  setMode('measure');
}

// ============================================================
// レイヤー描画（過去記録オーバーレイが有効なとき）
// ============================================================
function renderStrategyLayer() {
  clearStrategyLayer();

  if (!strategyActive || !map) return;

  var h = hole();
  if (!h || !hasData(h)) { _updateStrategyUI(); return; }

  // gcIdxが一致しないコースでは表示しない
  if (strategyGcIdx !== null && strategyGcIdx !== st.gcIdx) {
    _updateStrategyUI();
    return;
  }
  // 現在のコース(st.cIdx)のホール(st.hIdx)のデータを取得
  var cData = strategyCourseData[st.cIdx] || {};
  var shots = cData[st.hIdx] || [];
  var validShots = shots.filter(function(s){ return s.lat && s.lng; });

  if (!validShots.length) { _updateStrategyUI(); return; }

  // ライン（ティーから各ショットへ）
  var path = [{ lat: h.tee.lat, lng: h.tee.lng }];
  validShots.forEach(function(s){ path.push({ lat: s.lat, lng: s.lng }); });
  var line = new google.maps.Polyline({
    path: path, map: map,
    strokeColor: '#f59e0b', strokeOpacity: .8, strokeWeight: 2.5,
    icons: [{
      icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 2.5 },
      offset: '100%', repeat: '70px'
    }],
    zIndex: 45
  });
  strategyLines.push(line);

  // マーカー
  validShots.forEach(function(s) {
    var lbl  = (s.club || '?') + ' ' + s.carry + 'yd';
    var w    = Math.max(80, lbl.length * 7 + 14);
    var half = Math.round(w / 2);
    var svg  = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="52">'
      + '<circle cx="' + half + '" cy="14" r="12" fill="#1a0800" stroke="#f59e0b" stroke-width="2.5"/>'
      + '<text x="' + half + '" y="19" text-anchor="middle" fill="#f59e0b" font-size="12"'
      + ' font-weight="bold" font-family="Arial,sans-serif">' + s.no + '</text>'
      + '<rect x="1" y="30" width="' + (w-2) + '" height="20" rx="5"'
      + ' fill="rgba(26,8,0,0.9)" stroke="#f59e0b" stroke-width="0.8"/>'
      + '<text x="' + half + '" y="44" text-anchor="middle" fill="#e8c84a" font-size="10"'
      + ' font-family="Arial,sans-serif">' + lbl + '</text>'
      + '</svg>';
    var marker = new google.maps.Marker({
      position: { lat: s.lat, lng: s.lng },
      map: map,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(w, 52),
        anchor: new google.maps.Point(half, 14)
      },
      zIndex: 40, clickable: false
    });
    strategyMarkers.push(marker);
  });
  _updateStrategyUI();
}

function clearStrategyLayer() {
  strategyMarkers.forEach(function(m){ m.setMap(null); }); strategyMarkers = [];
  strategyLines.forEach(function(l){ l.setMap(null); });   strategyLines = [];
}

// ============================================================
// UI 更新
// ============================================================
function _updateStrategyUI() {
  var banner = document.getElementById('strategyBanner');
  if (!banner) return;

  if (!strategyActive) {
    banner.style.display = 'none';
    return;
  }

  // gcIdx不一致のゴルフ場ではバナーを出さない
  if (strategyGcIdx !== null && strategyGcIdx !== st.gcIdx) {
    banner.style.display = 'none';
    return;
  }
  var cData = strategyCourseData[st.cIdx] || {};
  var shots = cData[st.hIdx] || [];
  // ショットがない場合はバナー非表示（「記録なし」表示をしない）
  if (!shots.length) {
    banner.style.display = 'none';
    return;
  }
  var h = hole();
  var hName = h ? ('H' + h.no + ' PAR' + h.par) : '';
  banner.textContent = '📍 ' + hName + ' — 過去' + shots.length + '打の記録を表示中';
  banner.style.display = 'block';
}

function updateStrategyNavBtns() {
  var wrap = document.getElementById('stratNavWrap');
  if (wrap) wrap.style.display = 'none';
}

// ============================================================
// setMode パッチ：モード切替時にレイヤーを制御
// ============================================================
(function() {
  var _origSetMode = setMode;
  setMode = function(m) {
    _origSetMode.apply(this, arguments);
    if (strategyActive) {
      renderStrategyLayer();
      _updateStrategyUI();
    }
    updateStrategyNavBtns();
  };
})();

// ============================================================
// loadHole パッチ：ホール切替時に戦略レイヤーを再描画
// ============================================================
(function() {
  var _origLoadHole = loadHole;
  loadHole = function() {
    _origLoadHole.apply(this, arguments);
    if (strategyActive) {
      renderStrategyLayer();
    }
    updateStrategyNavBtns();
    _updateStrategyUI();
  };
})();
