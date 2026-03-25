/**
 * =====================================================
 *  courses.js — ゴルフ場・コースデータ
 * =====================================================
 *
 *  ★ このファイルだけ編集すればコースを追加・修正できます ★
 *
 *  【各ホールのデータ構造】
 *  {
 *    no:     ホール番号（1〜9）
 *    par:    パー数
 *    yards:  { back: X, reg: X, ladies: X }  ← ShotNaviのヤード数
 *    tee:    { lat: XX.XXXXX, lng: XXX.XXXXX }  ← ティーグラウンド
 *    front:  { lat: XX.XXXXX, lng: XXX.XXXXX }  ← フロントエッジ（赤F）
 *    center: { lat: XX.XXXXX, lng: XXX.XXXXX }  ← グリーン中央（紫C）
 *    back:   { lat: XX.XXXXX, lng: XXX.XXXXX }  ← バックエッジ（黄B）
 *  }
 */

const COURSES = [

  // =====================================================
  //  ローズゴルフクラブ（滋賀県）
  //  OUT: 5-4-3-4-4-4-5-3-4 PAR36 / Back:3396 Reg:3215
  //  IN:  5-4-3-5-4-4-4-3-4 PAR36 / Back:3431 Reg:3183
  //  合計: PAR72 / Back:6827 Reg:6398
  //  ※ヤード数はShotNavi調査済み
  // =====================================================
  {
    name:  'ローズゴルフクラブ',
    pref:  '滋賀県',
    gcid:  970,
    lat:   34.8923,
    lng:   136.0564,
    courses: [

      // ── アウト ──────────────────────────────────────
      {
        name: 'アウト',
        cid:  1312,
        holes: [
          {
            no: 1, par: 5,
            yards: { back: 518, reg: 491, ladies: 418 },
            tee:    { lat: 34.892557, lng: 136.051814 },
            front:  { lat: 34.892008, lng: 136.056338 },
            center: { lat: 34.892022, lng: 136.056532 },
            back:   { lat: 34.892032, lng: 136.056728 },
          },
          {
            no: 2, par: 4,
            yards: { back: 348, reg: 330, ladies: 242 },
            tee:    { lat: 34.892543, lng: 136.057726 },
            front:  { lat: 34.893847, lng: 136.055354 },
            center: { lat: 34.893971, lng: 136.055291 },
            back:   { lat: 34.894094, lng: 136.055260 },
          },
          {
            no: 3, par: 3,
            yards: { back: 178, reg: 155, ladies: 133 },
            tee:    { lat: 34.894512, lng: 136.055679 },
            front:  { lat: 34.893665, lng: 136.056761 },
            center: { lat: 34.893575, lng: 136.056880 },
            back:   { lat: 34.893478, lng: 136.056976 },
          },
          {
            no: 4, par: 4,
            yards: { back: 430, reg: 410, ladies: 286 },
            tee:    { lat: 34.894447, lng: 136.057011 },
            front:  { lat: 34.892226, lng: 136.059990 },
            center: { lat: 34.892155, lng: 136.060135 },
            back:   { lat: 34.892067, lng: 136.060277 },
          },
          {
            no: 5, par: 4,
            yards: { back: 408, reg: 390, ladies: 257 },
            tee:    { lat: 34.891890, lng: 136.061297 },
            front:  { lat: 34.890125, lng: 136.058121 },
            center: { lat: 34.890034, lng: 136.058003 },
            back:   { lat: 34.889974, lng: 136.057874 },
          },
          {
            no: 6, par: 4,
            yards: { back: 343, reg: 325, ladies: 295 },
            tee:    { lat: 34.890077, lng: 136.056992 },
            front:  { lat: 34.892050, lng: 136.059078 },
            center: { lat: 34.892202, lng: 136.059070 },
            back:   { lat: 34.892338, lng: 136.059022 },
          },
          {
            no: 7, par: 5,
            yards: { back: 602, reg: 584, ladies: 450 },
            tee:    { lat: 34.892221, lng: 136.058293 },
            front:  { lat: 34.890505, lng: 136.053527 },
            center: { lat: 34.890527, lng: 136.053323 },
            back:   { lat: 34.890534, lng: 136.053092 },
          },
          {
            no: 8, par: 3,
            yards: { back: 184, reg: 170, ladies: 138 },
            tee:    { lat: 34.890849, lng: 136.053551 },
            front:  { lat: 34.891159, lng: 136.055181 },
            center: { lat: 34.891176, lng: 136.055344 },
            back:   { lat: 34.891177, lng: 136.055495 },
          },
          {
            no: 9, par: 4,
            yards: { back: 385, reg: 360, ladies: 308 },
            tee:    { lat: 34.891551, lng: 136.054928 },
            front:  { lat: 34.891654, lng: 136.051545 },
            center: { lat: 34.891749, lng: 136.051414 },
            back:   { lat: 34.891817, lng: 136.051274 },
          },
        ],
      },

      // ── イン ────────────────────────────────────────
      // 実際の番号: 10〜18番
      {
        name: 'イン',
        cid:  1313,
        holes: [
          {
            no: 1, par: 5,  // 10番
            yards: { back: 503, reg: 477, ladies: 461 },
            tee:    { lat: 34.891497, lng: 136.049818 },
            front:  { lat: 34.889098, lng: 136.053927 },
            center: { lat: 34.889071, lng: 136.054099 },
            back:   { lat: 34.889027, lng: 136.054260 },
          },
          {
            no: 2, par: 4,  // 11番
            yards: { back: 395, reg: 371, ladies: 251 },
            tee:    { lat: 34.888578, lng: 136.053366 },
            front:  { lat: 34.888191, lng: 136.057051 },
            center: { lat: 34.888173, lng: 136.057228 },
            back:   { lat: 34.888160, lng: 136.057392 },
          },
          {
            no: 3, par: 3,  // 12番
            yards: { back: 165, reg: 149, ladies: 135 },
            tee:    { lat: 34.887904, lng: 136.057766 },
            front:  { lat: 34.887502, lng: 136.056390 },
            center: { lat: 34.887462, lng: 136.056224 },
            back:   { lat: 34.887422, lng: 136.056090 },
          },
          {
            no: 4, par: 5,  // 13番（600yd超）
            yards: { back: 632, reg: 558, ladies: 409 },
            tee:    { lat: 34.887833, lng: 136.056068 },
            front:  { lat: 34.889143, lng: 136.050440 },
            center: { lat: 34.889211, lng: 136.050279 },
            back:   { lat: 34.889286, lng: 136.050121 },
          },
          {
            no: 5, par: 4,  // 14番
            yards: { back: 379, reg: 354, ladies: 303 },
            tee:    { lat: 34.888639, lng: 136.050067 },
            front:  { lat: 34.887209, lng: 136.052943 },
            center: { lat: 34.887209, lng: 136.053066 },
            back:   { lat: 34.887227, lng: 136.053190 },
          },
          {
            no: 6, par: 4,  // 15番
            yards: { back: 425, reg: 400, ladies: 277 },
            tee:    { lat: 34.886664, lng: 136.052720 },
            front:  { lat: 34.886536, lng: 136.049019 },
            center: { lat: 34.886474, lng: 136.048858 },
            back:   { lat: 34.886430, lng: 136.048718 },
          },
          {
            no: 7, par: 4,  // 16番
            yards: { back: 345, reg: 325, ladies: 219 },
            tee:    { lat: 34.887119, lng: 136.049261 },
            front:  { lat: 34.889816, lng: 136.049019 },
            center: { lat: 34.889918, lng: 136.048955 },
            back:   { lat: 34.890032, lng: 136.048880 },
          },
          {
            no: 8, par: 3,  // 17番
            yards: { back: 175, reg: 157, ladies: 126 },
            tee:    { lat: 34.889819, lng: 136.048171 },
            front:  { lat: 34.888569, lng: 136.048117 },
            center: { lat: 34.888433, lng: 136.048144 },
            back:   { lat: 34.888296, lng: 136.048176 },
          },
          {
            no: 9, par: 4,  // 18番
            yards: { back: 412, reg: 392, ladies: 329 },
            tee:    { lat: 34.888768, lng: 136.047432 },
            front:  { lat: 34.891525, lng: 136.048747 },
            center: { lat: 34.891662, lng: 136.048752 },
            back:   { lat: 34.891772, lng: 136.048741 },
          },
        ],
      },

    ],
  },

  // =====================================================
  //  ゴルフ場を追加する場合はここにコピー
  // =====================================================
  // {
  //   name: 'ゴルフ場名', pref: '○○県', gcid: XXXX,
  //   lat: XX.XXXX, lng: XXX.XXXX,
  //   courses: [
  //     {
  //       name: 'アウト', cid: XXXX,
  //       holes: [
  //         { no:1, par:4, yards:{back:400,reg:380,ladies:280},
  //           tee:null, front:null, center:null, back:null },
  //       ],
  //     },
  //   ],
  // },

  // =====================================================
  // =====================================================
  //  れいせんゴルフ倶楽部（京都）アウト・イン
  //  楽天GORA: https://booking.gora.golf.rakuten.co.jp/guide/course_info/disp/c_id/260008
  //  OUT PAR36 / IN PAR36 / 合計PAR72
  // =====================================================
  {
    name: 'れいせんゴルフ倶楽部',
    pref: '京都',
    gcid: 459,
    lat:  34.9867,
    lng:  135.5139,
    courses: [
      {
        name: 'アウト',
        cid:  0,
        holes: [
          {
            no:1, par:5,
            yards: { back:485, reg:460, ladies:415 },
            tee:    { lat: 34.986029, lng: 135.514295 },
            front:  { lat: 34.988938, lng: 135.516448 },
            center: { lat: 34.988997, lng: 135.516539 },
            back:   { lat: 34.989054, lng: 135.516609 },
          },
          {
            no:2, par:4,
            yards: { back:415, reg:400, ladies:365 },
            tee:    { lat: 34.988542, lng: 135.516949 },
            front:  { lat: 34.986002, lng: 135.515010 },
            center: { lat: 34.985951, lng: 135.514926 },
            back:   { lat: 34.985802, lng: 135.514857 },
          },
          {
            no:3, par:4,
            yards: { back:360, reg:335, ladies:290 },
            tee:    { lat: 34.986082, lng: 135.516098 },
            front:  { lat: 34.988161, lng: 135.517792 },
            center: { lat: 34.988286, lng: 135.517800 },
            back:   { lat: 34.988380, lng: 135.517786 },
          },
          {
            no:4, par:4,
            yards: { back:365, reg:350, ladies:310 },
            tee:    { lat: 34.988104, lng: 135.518559 },
            front:  { lat: 34.985678, lng: 135.517393 },
            center: { lat: 34.985557, lng: 135.517388 },
            back:   { lat: 34.985456, lng: 135.517385 },
          },
          {
            no:5, par:3,
            yards: { back:200, reg:185, ladies:135 },
            tee:    { lat: 34.986576, lng: 135.518453 },
            front:  { lat: 34.987682, lng: 135.519202 },
            center: { lat: 34.987766, lng: 135.519287 },
            back:   { lat: 34.987841, lng: 135.519379 },
          },
          {
            no:6, par:4,
            yards: { back:445, reg:430, ladies:380 },
            tee:    { lat: 34.988338, lng: 135.519315 },
            front:  { lat: 34.990241, lng: 135.516443 },
            center: { lat: 34.990338, lng: 135.516346 },
            back:   { lat: 34.990375, lng: 135.516284 },
          },
          {
            no:7, par:4,
            yards: { back:395, reg:355, ladies:300 },
            tee:    { lat: 34.990641, lng: 135.515811 },
            front:  { lat: 34.990676, lng: 135.512640 },
            center: { lat: 34.990738, lng: 135.512587 },
            back:   { lat: 34.990768, lng: 135.512487 },
          },
          {
            no:8, par:3,
            yards: { back:215, reg:130, ladies:85 },
            tee:    { lat: 34.989558, lng: 135.513305 },
            front:  { lat: 34.989235, lng: 135.514329 },
            center: { lat: 34.989206, lng: 135.514493 },
            back:   { lat: 34.989213, lng: 135.514649 },
          },
          {
            no:9, par:5,
            yards: { back:495, reg:470, ladies:420 },
            tee:    { lat: 34.989400, lng: 135.515430 },
            front:  { lat: 34.986267, lng: 135.513439 },
            center: { lat: 34.986172, lng: 135.513396 },
            back:   { lat: 34.986071, lng: 135.513337 },
          },
        ],
      },
      {
        name: 'イン',
        cid:  0,
        holes: [
          {
            no:1, par:5,
            yards: { back:490, reg:475, ladies:440 },
            tee:    { lat: 34.984587, lng: 135.513798 },
            front:  { lat: 34.982262, lng: 135.510787 },
            center: { lat: 34.982209, lng: 135.510707 },
            back:   { lat: 34.982152, lng: 135.510621 },
          },
          {
            no:2, par:4,
            yards: { back:315, reg:300, ladies:275 },
            tee:    { lat: 34.982652, lng: 135.510388 },
            front:  { lat: 34.983514, lng: 135.508196 },
            center: { lat: 34.983589, lng: 135.508029 },
            back:   { lat: 34.983681, lng: 135.507890 },
          },
          {
            no:3, par:3,
            yards: { back:165, reg:130, ladies:100 },
            tee:    { lat: 34.983905, lng: 135.508711 },
            front:  { lat: 34.984711, lng: 135.509955 },
            center: { lat: 34.984764, lng: 135.510089 },
            back:   { lat: 34.984815, lng: 135.510226 },
          },
          {
            no:4, par:4,
            yards: { back:380, reg:370, ladies:330 },
            tee:    { lat: 34.985509, lng: 135.509753 },
            front:  { lat: 34.987899, lng: 135.510522 },
            center: { lat: 34.988008, lng: 135.510570 },
            back:   { lat: 34.988114, lng: 135.510640 },
          },
          {
            no:5, par:4,
            yards: { back:445, reg:420, ladies:350 },
            tee:    { lat: 34.988224, lng: 135.511310 },
            front:  { lat: 34.985310, lng: 135.510829 },
            center: { lat: 34.985205, lng: 135.510829 },
            back:   { lat: 34.985080, lng: 135.510819 },
          },
          {
            no:6, par:4,
            yards: { back:440, reg:425, ladies:370 },
            tee:    { lat: 34.985625, lng: 135.511361 },
            front:  { lat: 34.988619, lng: 135.512384 },
            center: { lat: 34.988707, lng: 135.512454 },
            back:   { lat: 34.988773, lng: 135.512502 },
          },
          {
            no:7, par:5,
            yards: { back:535, reg:515, ladies:470 },
            tee:    { lat: 34.988711, lng: 135.513736 },
            front:  { lat: 34.985077, lng: 135.511848 },
            center: { lat: 34.984950, lng: 135.511764 },
            back:   { lat: 34.984831, lng: 135.511691 },
          },
          {
            no:8, par:3,
            yards: { back:200, reg:185, ladies:150 },
            tee:    { lat: 34.984523, lng: 135.512009 },
            front:  { lat: 34.983985, lng: 135.510408 },
            center: { lat: 34.983986, lng: 135.510231 },
            back:   { lat: 34.983991, lng: 135.510056 },
          },
          {
            no:9, par:4,
            yards: { back:390, reg:370, ladies:325 },
            tee:    { lat: 34.983609, lng: 135.510187 },
            front:  { lat: 34.984450, lng: 135.512844 },
            center: { lat: 34.984608, lng: 135.512930 },
            back:   { lat: 34.984729, lng: 135.513027 },
          },
        ],
      },
    ],
  },

  // =====================================================
  //  亀岡ゴルフクラブ【アコーディア・ゴルフ】（京都）アウト・イン
  //  公式サイト: https://reserve.accordiagolf.com/golfCourse/kyoto/kameoka/layout
  // =====================================================
  {
    name: '亀岡ゴルフクラブ【アコーディア・ゴルフ】',
    pref: '京都',
    gcid: 456,
    lat:  34.9570,
    lng:  135.4929,
    courses: [
      {
        name: 'アウト',
        cid:  1312,
        holes: [
          {
            no:1, par:4,
            yards: { back:423, reg:401, ladies:285 },
            tee:    { lat: 34.956265, lng: 135.492658 },
            front:  { lat: 34.958945, lng: 135.494446 },
            center: { lat: 34.959077, lng: 135.494468 },
            back:   { lat: 34.959196, lng: 135.494468 },
          },
          {
            no:2, par:4,
            yards: { back:393, reg:363, ladies:270 },
            tee:    { lat: 34.959391, lng: 135.495517 },
            front:  { lat: 34.956790, lng: 135.494708 },
            center: { lat: 34.956684, lng: 135.494702 },
            back:   { lat: 34.956574, lng: 135.494702 },
          },
          {
            no:3, par:3,
            yards: { back:141, reg:124, ladies:115 },
            tee:    { lat: 34.956308, lng: 135.495131 },
            front:  { lat: 34.956339, lng: 135.496210 },
            center: { lat: 34.956385, lng: 135.496365 },
            back:   { lat: 34.956434, lng: 135.496534 },
          },
          {
            no:4, par:5,
            yards: { back:561, reg:543, ladies:462 },
            tee:    { lat: 34.956893, lng: 135.495295 },
            front:  { lat: 34.960564, lng: 135.497204 },
            center: { lat: 34.960656, lng: 135.497296 },
            back:   { lat: 34.960747, lng: 135.497390 },
          },
          {
            no:5, par:3,
            yards: { back:147, reg:120, ladies:110 },
            tee:    { lat: 34.960292, lng: 135.497974 },
            front:  { lat: 34.961044, lng: 135.498283 },
            center: { lat: 34.961154, lng: 135.498296 },
            back:   { lat: 34.961255, lng: 135.498308 },
          },
          {
            no:6, par:4,
            yards: { back:347, reg:321, ladies:277 },
            tee:    { lat: 34.961068, lng: 135.497400 },
            front:  { lat: 34.959707, lng: 135.495014 },
            center: { lat: 34.959604, lng: 135.494907 },
            back:   { lat: 34.959496, lng: 135.494840 },
          },
          {
            no:7, par:4,
            yards: { back:383, reg:356, ladies:243 },
            tee:    { lat: 34.960080, lng: 135.494350 },
            front:  { lat: 34.961414, lng: 135.497270 },
            center: { lat: 34.961411, lng: 135.497442 },
            back:   { lat: 34.961418, lng: 135.497632 },
          },
          {
            no:8, par:4,
            yards: { back:389, reg:344, ladies:272 },
            tee:    { lat: 34.961482, lng: 135.496224 },
            front:  { lat: 34.960471, lng: 135.493387 },
            center: { lat: 34.960405, lng: 135.493323 },
            back:   { lat: 34.960308, lng: 135.493141 },
          },
          {
            no:9, par:5,
            yards: { back:485, reg:462, ladies:370 },
            tee:    { lat: 34.959430, lng: 135.494119 },
            front:  { lat: 34.956397, lng: 135.492062 },
            center: { lat: 34.956283, lng: 135.492011 },
            back:   { lat: 34.956155, lng: 135.491928 },
          },
        ],
      },
      {
        name: 'イン',
        cid:  1313,
        holes: [
          {
            no:1, par:5,
            yards: { back:503, reg:468, ladies:380 },
            tee:    { lat: 34.956341, lng: 135.491107 },
            front:  { lat: 34.959428, lng: 135.493467 },
            center: { lat: 34.959542, lng: 135.493576 },
            back:   { lat: 34.959655, lng: 135.493744 },
          },
          {
            no:2, par:4,
            yards: { back:428, reg:403, ladies:288 },
            tee:    { lat: 34.959526, lng: 135.492855 },
            front:  { lat: 34.957394, lng: 135.490672 },
            center: { lat: 34.957297, lng: 135.490527 },
            back:   { lat: 34.957174, lng: 135.490409 },
          },
          {
            no:3, par:4,
            yards: { back:375, reg:311, ladies:246 },
            tee:    { lat: 34.956232, lng: 135.489522 },
            front:  { lat: 34.954940, lng: 135.487274 },
            center: { lat: 34.954892, lng: 135.487087 },
            back:   { lat: 34.954839, lng: 135.486936 },
          },
          {
            no:4, par:3,
            yards: { back:162, reg:140, ladies:107 },
            tee:    { lat: 34.954946, lng: 135.488104 },
            front:  { lat: 34.954304, lng: 135.487245 },
            center: { lat: 34.954208, lng: 135.487095 },
            back:   { lat: 34.954098, lng: 135.486967 },
          },
          {
            no:5, par:4,
            yards: { back:315, reg:280, ladies:235 },
            tee:    { lat: 34.954356, lng: 135.488034 },
            front:  { lat: 34.955570, lng: 135.489949 },
            center: { lat: 34.955662, lng: 135.490110 },
            back:   { lat: 34.955750, lng: 135.490266 },
          },
          {
            no:6, par:4,
            yards: { back:385, reg:370, ladies:262 },
            tee:    { lat: 34.954638, lng: 135.489593 },
            front:  { lat: 34.951879, lng: 135.489947 },
            center: { lat: 34.951752, lng: 135.489974 },
            back:   { lat: 34.951638, lng: 135.489984 },
          },
          {
            no:7, par:5,
            yards: { back:529, reg:490, ladies:418 },
            tee:    { lat: 34.951171, lng: 135.491112 },
            front:  { lat: 34.954898, lng: 135.490234 },
            center: { lat: 34.955039, lng: 135.490165 },
            back:   { lat: 34.955184, lng: 135.490111 },
          },
          {
            no:8, par:3,
            yards: { back:238, reg:200, ladies:121 },
            tee:    { lat: 34.954152, lng: 135.491163 },
            front:  { lat: 34.952983, lng: 135.491624 },
            center: { lat: 34.952851, lng: 135.491667 },
            back:   { lat: 34.952706, lng: 135.491715 },
          },
          {
            no:9, par:4,
            yards: { back:381, reg:355, ladies:285 },
            tee:    { lat: 34.952983, lng: 135.492488 },
            front:  { lat: 34.955492, lng: 135.491451 },
            center: { lat: 34.955615, lng: 135.491333 },
            back:   { lat: 34.955717, lng: 135.491226 },
          },
        ],
      },
    ],
  },

];
