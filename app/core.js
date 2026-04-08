/* =====================================================
   core.js — 状態・定数・ヘルパー
   ===================================================== */

// ============================================================
// クラブ
// ============================================================
const DEFAULT_CLUBS = ['1W','3W','5I','6I','7I','8I','9I','56°','PW','SW','PT','','',''];

function loadClubs() {
  try {
    const saved = localStorage.getItem('golfClubSet');
    if (saved) {
      const arr = JSON.parse(saved);
      const normalized = Array.from({length:14}, (_, i) => arr[i] || '');
      // clubs.jsのsortClumsが読み込まれる前なのでここではソートしない
      return normalized;
    }
  } catch(e) {}
  return [...DEFAULT_CLUBS];
}

function saveClubs(arr) {
  localStorage.setItem('golfClubSet', JSON.stringify(arr));
}

let CLUBS = loadClubs();

// ============================================================
// スコア定義
// ============================================================
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
// グローバル状態
// ============================================================
let map = null, mapsLoaded = false;
let st = { gcIdx: null, cIdx: null, hIdx: 0, teeType: 'regular' };
let appMode = 'measure';

// 測定モード
let measureClick = null, teeLine = null, pinLine = null;
let measureFromLabel = null, measureToLabel = null;
let measureSelectedPin = null;

// ショットレイヤー
let shotMarkers = [], shotLines = [];

// ペンディング
let pendingPos = null, selectedClub = null;
let pendingMarker = null, pendingCarryLine = null, pendingPinLine = null;
let pendingCarryLabel = null, pendingPinLabel = null;

// ショット評価（任意）
let selectedResult = null;

// GPS
let gpsMarker = null, gpsWatch = null, gpsActive = false;

// ラウンドデータ
let roundShots = {}, roundId = null;

// カップイン
let cpSelectedDiff = null;

// ヤードパネル
let yardageInfoOpen = false;

// ============================================================
// ティー種別
// ============================================================
const TEE_TYPES = [
  { key: 'regular', name: 'レギュラーティー', color: '#4a9fd4', icon: '⛳' },
  { key: 'ladies',  name: 'レディースティー',  color: '#f472b6', icon: '🌸' },
];

// ============================================================
// ヘルパー
// ============================================================
const gc       = () => st.gcIdx !== null ? COURSES[st.gcIdx] : null;
const course   = () => gc() && st.cIdx !== null ? gc().courses[st.cIdx] : null;
const hole     = () => course() ? course().holes[st.hIdx] : null;

// 選択中ティー種別の座標を返す（tees未定義ならh.teeにフォールバック）
function activeTee(h) {
  if (!h) return null;
  if (h.tees && st.teeType && h.tees[st.teeType]) return h.tees[st.teeType];
  return h.tee;
}
const hasData  = (h) => h && activeTee(h) && h.front;
const holeKey  = () => `${st.gcIdx}_${st.cIdx}_${st.hIdx}`;
const curShots = () => roundShots[holeKey()] || [];

function haversine(la1, lo1, la2, lo2) {
  const R = 6371000, r = Math.PI / 180;
  const dL = (la2 - la1) * r, dN = (lo2 - lo1) * r;
  const a = Math.sin(dL/2)**2 + Math.cos(la1*r) * Math.cos(la2*r) * Math.sin(dN/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calcBearing(lat1, lng1, lat2, lng2) {
  const r = Math.PI / 180;
  const dLng = (lng2 - lng1) * r;
  const y = Math.sin(dLng) * Math.cos(lat2 * r);
  const x = Math.cos(lat1 * r) * Math.sin(lat2 * r)
          - Math.sin(lat1 * r) * Math.cos(lat2 * r) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
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
// 初期化
// ============================================================
function initSelects() {
  const s = document.getElementById('gcSel');
  COURSES.forEach((c, i) => {
    const o = document.createElement('option');
    o.value = i; o.textContent = `${c.name}（${c.pref}）`; s.appendChild(o);
  });
}
