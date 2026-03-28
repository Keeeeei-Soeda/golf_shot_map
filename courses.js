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
  //  大熱海国際ゴルフクラブ 熱海コース（静岡）
  //  楽天GORA: https://booking.gora.golf.rakuten.co.jp/guide/course_info/disp/c_id/220043
  //  熱海OUT PAR36 / 熱海IN PAR36 / 合計PAR72（36Hコース・2グリーン）
  // =====================================================
  {
    name: '大熱海国際ゴルフクラブ',
    pref: '静岡',
    gcid: 0,
    lat:  35.0279,
    lng:  139.0401,
    courses: [
      {
        name: '熱海OUT',
        cid:  0,
        holes: [
          {
            no:1, par:4,
            yards: { back:309, reg:297, ladies:297 },
            tee:    { lat: 35.023048, lng: 139.035756 },
            front:  { lat: 35.024731, lng: 139.037626 },
            center: { lat: 35.024814, lng: 139.037717 },
            back:   { lat: 35.024885, lng: 139.037798 },
          },
          {
            no:2, par:5,
            yards: { back:470, reg:451, ladies:433 },
            tee:    { lat: 35.025088, lng: 139.038282 },
            front:  { lat: 35.027609, lng: 139.041427 },
            center: { lat: 35.027690, lng: 139.041504 },
            back:   { lat: 35.027767, lng: 139.041582 },
          },
          {
            no:3, par:3,
            yards: { back:185, reg:171, ladies:145 },
            tee:    { lat: 35.027437, lng: 139.041816 },
            front:  { lat: 35.026433, lng: 139.041389 },
            center: { lat: 35.026354, lng: 139.041354 },
            back:   { lat: 35.026257, lng: 139.041328 },
          },
          {
            no:4, par:5,
            yards: { back:462, reg:448, ladies:436 },
            tee:    { lat: 35.026937, lng: 139.041941 },
            front:  { lat: 35.028487, lng: 139.044767 },
            center: { lat: 35.028478, lng: 139.044855 },
            back:   { lat: 35.028469, lng: 139.044955 },
          },
          {
            no:5, par:4,
            yards: { back:322, reg:307, ladies:294 },
            tee:    { lat: 35.028743, lng: 139.045463 },
            front:  { lat: 35.029455, lng: 139.042838 },
            center: { lat: 35.029500, lng: 139.042714 },
            back:   { lat: 35.029532, lng: 139.042580 },
          },
          {
            no:6, par:4,
            yards: { back:327, reg:318, ladies:313 },
            tee:    { lat: 35.029251, lng: 139.042015 },
            front:  { lat: 35.030771, lng: 139.039661 },
            center: { lat: 35.030861, lng: 139.039586 },
            back:   { lat: 35.030940, lng: 139.039503 },
          },
          {
            no:7, par:3,
            yards: { back:171, reg:154, ladies:138 },
            tee:    { lat: 35.031267, lng: 139.039664 },
            front:  { lat: 35.031089, lng: 139.041171 },
            center: { lat: 35.031098, lng: 139.041289 },
            back:   { lat: 35.031105, lng: 139.041391 },
          },
          {
            no:8, par:4,
            yards: { back:319, reg:298, ladies:268 },
            tee:    { lat: 35.030670, lng: 139.041080 },
            front:  { lat: 35.031263, lng: 139.043849 },
            center: { lat: 35.031303, lng: 139.043964 },
            back:   { lat: 35.031358, lng: 139.044063 },
          },
          {
            no:9, par:4,
            yards: { back:375, reg:356, ladies:286 },
            tee:    { lat: 35.031504, lng: 139.044192 },
            front:  { lat: 35.029659, lng: 139.046731 },
            center: { lat: 35.029655, lng: 139.046868 },
            back:   { lat: 35.029655, lng: 139.047015 },
          },
        ],
      },
      {
        name: '熱海IN',
        cid:  0,
        holes: [
          {
            no:1, par:5,
            yards: { back:458, reg:444, ladies:410 },
            tee:    { lat: 35.029123, lng: 139.045809 },
            front:  { lat: 35.030182, lng: 139.041708 },
            center: { lat: 35.030230, lng: 139.041569 },
            back:   { lat: 35.030261, lng: 139.041432 },
          },
          {
            no:2, par:4,
            yards: { back:289, reg:280, ladies:273 },
            tee:    { lat: 35.029018, lng: 139.042297 },
            front:  { lat: 35.027430, lng: 139.040503 },
            center: { lat: 35.027359, lng: 139.040413 },
            back:   { lat: 35.027290, lng: 139.040315 },
          },
          {
            no:3, par:5,
            yards: { back:449, reg:434, ladies:330 },
            tee:    { lat: 35.027167, lng: 139.039720 },
            front:  { lat: 35.029967, lng: 139.038009 },
            center: { lat: 35.030014, lng: 139.037891 },
            back:   { lat: 35.030059, lng: 139.037776 },
          },
          {
            no:4, par:4,
            yards: { back:387, reg:373, ladies:349 },
            tee:    { lat: 35.030121, lng: 139.037374 },
            front:  { lat: 35.027226, lng: 139.037245 },
            center: { lat: 35.027110, lng: 139.037280 },
            back:   { lat: 35.027015, lng: 139.037304 },
          },
          {
            no:5, par:3,
            yards: { back:152, reg:142, ladies:134 },
            tee:    { lat: 35.026739, lng: 139.036884 },
            front:  { lat: 35.027576, lng: 139.036190 },
            center: { lat: 35.027684, lng: 139.036067 },
            back:   { lat: 35.027774, lng: 139.035926 },
          },
          {
            no:6, par:4,
            yards: { back:415, reg:356, ladies:342 },
            tee:    { lat: 35.026805, lng: 139.035448 },
            front:  { lat: 35.026133, lng: 139.038046 },
            center: { lat: 35.026189, lng: 139.038123 },
            back:   { lat: 35.026257, lng: 139.038184 },
          },
          {
            no:7, par:3,
            yards: { back:192, reg:183, ladies:153 },
            tee:    { lat: 35.026556, lng: 139.037785 },
            front:  { lat: 35.027294, lng: 139.039252 },
            center: { lat: 35.027358, lng: 139.039343 },
            back:   { lat: 35.027415, lng: 139.039419 },
          },
          {
            no:8, par:4,
            yards: { back:350, reg:331, ladies:253 },
            tee:    { lat: 35.026783, lng: 139.039355 },
            front:  { lat: 35.025024, lng: 139.036881 },
            center: { lat: 35.024959, lng: 139.036747 },
            back:   { lat: 35.024893, lng: 139.036623 },
          },
          {
            no:9, par:4,
            yards: { back:351, reg:339, ladies:339 },
            tee:    { lat: 35.024826, lng: 139.036241 },
            front:  { lat: 35.022468, lng: 139.035051 },
            center: { lat: 35.022358, lng: 139.034979 },
            back:   { lat: 35.022241, lng: 139.034912 },
          },
        ],
      },
    ],
  },

  // =====================================================
  //  ベルビーチゴルフクラブ（沖縄）アウト・イン
  //  楽天GORA: https://booking.gora.golf.rakuten.co.jp/guide/course_info/disp/c_id/470017
  //  OUT PAR36 / IN PAR36 / 合計PAR72（宮里三兄弟のホームコース）
  //  ShotNavi GCID: 250
  // =====================================================
  {
    name: 'ベルビーチゴルフクラブ',
    pref: '沖縄',
    gcid: 250,
    lat:  26.6418,
    lng:  127.8898,
    courses: [
      {
        name: 'アウト',
        cid:  0,
        holes: [
          {
            no:1, par:4,
            yards: { back:387, reg:357, ladies:309 },
            tee:    { lat: 26.637482, lng: 127.894702 },
            front:  { lat: 26.637855, lng: 127.891825 },
            center: { lat: 26.637762, lng: 127.891756 },
            back:   { lat: 26.637801, lng: 127.891565 },
          },
          {
            no:2, par:3,
            yards: { back:200, reg:183, ladies:152 },
            tee:    { lat: 26.638546, lng: 127.890772 },
            front:  { lat: 26.639261, lng: 127.889478 },
            center: { lat: 26.639343, lng: 127.889390 },
            back:   { lat: 26.639415, lng: 127.889304 },
          },
          {
            no:3, par:5,
            yards: { back:485, reg:473, ladies:431 },
            tee:    { lat: 26.641195, lng: 127.888232 },
            front:  { lat: 26.643794, lng: 127.890687 },
            center: { lat: 26.643850, lng: 127.890754 },
            back:   { lat: 26.643900, lng: 127.890798 },
          },
          {
            no:4, par:4,
            yards: { back:329, reg:312, ladies:280 },
            tee:    { lat: 26.644088, lng: 127.891331 },
            front:  { lat: 26.646268, lng: 127.890190 },
            center: { lat: 26.646390, lng: 127.890139 },
            back:   { lat: 26.646505, lng: 127.890072 },
          },
          {
            no:5, par:5,
            yards: { back:503, reg:488, ladies:446 },
            tee:    { lat: 26.647699, lng: 127.890569 },
            front:  { lat: 26.650499, lng: 127.892540 },
            center: { lat: 26.650594, lng: 127.892662 },
            back:   { lat: 26.650706, lng: 127.892796 },
          },
          {
            no:6, par:4,
            yards: { back:367, reg:354, ladies:338 },
            tee:    { lat: 26.651127, lng: 127.893678 },
            front:  { lat: 26.650620, lng: 127.890629 },
            center: { lat: 26.650587, lng: 127.890540 },
            back:   { lat: 26.650555, lng: 127.890451 },
          },
          {
            no:7, par:4,
            yards: { back:437, reg:411, ladies:376 },
            tee:    { lat: 26.649960, lng: 127.891037 },
            front:  { lat: 26.647101, lng: 127.889349 },
            center: { lat: 26.647012, lng: 127.889312 },
            back:   { lat: 26.646911, lng: 127.889279 },
          },
          {
            no:8, par:4,
            yards: { back:330, reg:310, ladies:269 },
            tee:    { lat: 26.646523, lng: 127.888997 },
            front:  { lat: 26.644270, lng: 127.889658 },
            center: { lat: 26.644184, lng: 127.889623 },
            back:   { lat: 26.644086, lng: 127.889585 },
          },
          {
            no:9, par:3,
            yards: { back:151, reg:133, ladies:117 },
            tee:    { lat: 26.643536, lng: 127.888370 },
            front:  { lat: 26.644638, lng: 127.888426 },
            center: { lat: 26.644759, lng: 127.888432 },
            back:   { lat: 26.644876, lng: 127.888438 },
          },
        ],
      },
      {
        name: 'イン',
        cid:  0,
        holes: [
          {
            no:1, par:4,
            yards: { back:450, reg:438, ladies:358 },
            tee:    { lat: 26.644724, lng: 127.887712 },
            front:  { lat: 26.641603, lng: 127.886820 },
            center: { lat: 26.641506, lng: 127.886773 },
            back:   { lat: 26.641388, lng: 127.886725 },
          },
          {
            no:2, par:4,
            yards: { back:384, reg:370, ladies:317 },
            tee:    { lat: 26.640867, lng: 127.886699 },
            front:  { lat: 26.638309, lng: 127.885257 },
            center: { lat: 26.638231, lng: 127.885116 },
            back:   { lat: 26.638150, lng: 127.884996 },
          },
          {
            no:3, par:4,
            yards: { back:378, reg:358, ladies:310 },
            tee:    { lat: 26.637829, lng: 127.884361 },
            front:  { lat: 26.636093, lng: 127.886711 },
            center: { lat: 26.636015, lng: 127.886814 },
            back:   { lat: 26.635918, lng: 127.886921 },
          },
          {
            no:4, par:4,
            yards: { back:370, reg:352, ladies:312 },
            tee:    { lat: 26.636948, lng: 127.887293 },
            front:  { lat: 26.639683, lng: 127.887158 },
            center: { lat: 26.639819, lng: 127.887185 },
            back:   { lat: 26.639949, lng: 127.887222 },
          },
          {
            no:5, par:5,
            yards: { back:538, reg:509, ladies:460 },
            tee:    { lat: 26.639549, lng: 127.887697 },
            front:  { lat: 26.636304, lng: 127.890020 },
            center: { lat: 26.636233, lng: 127.890126 },
            back:   { lat: 26.636147, lng: 127.890217 },
          },
          {
            no:6, par:3,
            yards: { back:165, reg:151, ladies:110 },
            tee:    { lat: 26.636525, lng: 127.891712 },
            front:  { lat: 26.636748, lng: 127.892894 },
            center: { lat: 26.636784, lng: 127.893025 },
            back:   { lat: 26.636819, lng: 127.893147 },
          },
          {
            no:7, par:5,
            yards: { back:507, reg:475, ladies:415 },
            tee:    { lat: 26.637079, lng: 127.892486 },
            front:  { lat: 26.638288, lng: 127.888903 },
            center: { lat: 26.638415, lng: 127.888835 },
            back:   { lat: 26.638586, lng: 127.888764 },
          },
          {
            no:8, par:3,
            yards: { back:167, reg:135, ladies:110 },
            tee:    { lat: 26.638561, lng: 127.889617 },
            front:  { lat: 26.637937, lng: 127.890469 },
            center: { lat: 26.637874, lng: 127.890603 },
            back:   { lat: 26.637810, lng: 127.890746 },
          },
          {
            no:9, par:4,
            yards: { back:399, reg:388, ladies:347 },
            tee:    { lat: 26.638546, lng: 127.891417 },
            front:  { lat: 26.638314, lng: 127.894780 },
            center: { lat: 26.638333, lng: 127.894926 },
            back:   { lat: 26.638343, lng: 127.895067 },
          },
        ],
      },
    ],
  },

  // =====================================================
  //  高槻ゴルフ倶楽部（大阪）アウト・イン
  //  楽天GORA: https://booking.gora.golf.rakuten.co.jp/guide/course_info/disp/c_id/270028
  //  OUT PAR35 / IN PAR35 / 合計PAR70（河川敷コース）
  //  ShotNavi GCID: 1430
  // =====================================================
  {
    name: '高槻ゴルフ倶楽部',
    pref: '大阪',
    gcid: 1430,
    lat:  34.8151,
    lng:  135.6248,
    courses: [
      {
        name: 'アウト',
        cid:  0,
        holes: [
          {
            no:1, par:5,
            yards: { back:485, reg:475, ladies:435 },
            tee:    { lat: 34.816494, lng: 135.630789 },
            front:  { lat: 34.815728, lng: 135.626832 },
            center: { lat: 34.815673, lng: 135.626712 },
            back:   { lat: 34.815617, lng: 135.626582 },
          },
          {
            no:2, par:3,
            yards: { back:140, reg:130, ladies:110 },
            tee:    { lat: 34.816268, lng: 135.626049 },
            front:  { lat: 34.816130, lng: 135.624889 },
            center: { lat: 34.816124, lng: 135.624712 },
            back:   { lat: 34.816108, lng: 135.624542 },
          },
          {
            no:3, par:4,
            yards: { back:325, reg:305, ladies:275 },
            tee:    { lat: 34.815867, lng: 135.625027 },
            front:  { lat: 34.815787, lng: 135.622439 },
            center: { lat: 34.815781, lng: 135.622274 },
            back:   { lat: 34.815780, lng: 135.622114 },
          },
          {
            no:4, par:4,
            yards: { back:275, reg:260, ladies:260 },
            tee:    { lat: 34.816081, lng: 135.622366 },
            front:  { lat: 34.815897, lng: 135.619806 },
            center: { lat: 34.815894, lng: 135.619621 },
            back:   { lat: 34.815867, lng: 135.619433 },
          },
          {
            no:5, par:4,
            yards: { back:240, reg:240, ladies:240 },
            tee:    { lat: 34.815176, lng: 135.619411 },
            front:  { lat: 34.815518, lng: 135.621601 },
            center: { lat: 34.815558, lng: 135.621731 },
            back:   { lat: 34.815588, lng: 135.621849 },
          },
          {
            no:6, par:3,
            yards: { back:185, reg:175, ladies:135 },
            tee:    { lat: 34.815286, lng: 135.621930 },
            front:  { lat: 34.814427, lng: 135.620814 },
            center: { lat: 34.814350, lng: 135.620709 },
            back:   { lat: 34.814269, lng: 135.620605 },
          },
          {
            no:7, par:3,
            yards: { back:155, reg:145, ladies:125 },
            tee:    { lat: 34.813967, lng: 135.621033 },
            front:  { lat: 34.814686, lng: 135.622033 },
            center: { lat: 34.814754, lng: 135.622165 },
            back:   { lat: 34.814810, lng: 135.622285 },
          },
          {
            no:8, par:5,
            yards: { back:490, reg:480, ladies:415 },
            tee:    { lat: 34.815158, lng: 135.622224 },
            front:  { lat: 34.815738, lng: 135.626023 },
            center: { lat: 34.815789, lng: 135.626166 },
            back:   { lat: 34.815869, lng: 135.626312 },
          },
          {
            no:9, par:4,
            yards: { back:365, reg:355, ladies:310 },
            tee:    { lat: 34.816477, lng: 135.627302 },
            front:  { lat: 34.816777, lng: 135.630495 },
            center: { lat: 34.816782, lng: 135.630672 },
            back:   { lat: 34.816793, lng: 135.630843 },
          },
        ],
      },
      {
        name: 'イン',
        cid:  0,
        holes: [
          {
            no:1, par:5,
            yards: { back:485, reg:475, ladies:425 },
            tee:    { lat: 34.816157, lng: 135.630754 },
            front:  { lat: 34.815107, lng: 135.626799 },
            center: { lat: 34.815089, lng: 135.626630 },
            back:   { lat: 34.815093, lng: 135.626456 },
          },
          {
            no:2, par:3,
            yards: { back:130, reg:120, ladies:120 },
            tee:    { lat: 34.815407, lng: 135.626391 },
            front:  { lat: 34.814886, lng: 135.625678 },
            center: { lat: 34.814794, lng: 135.625573 },
            back:   { lat: 34.814708, lng: 135.625487 },
          },
          {
            no:3, par:5,
            yards: { back:490, reg:480, ladies:400 },
            tee:    { lat: 34.815421, lng: 135.626065 },
            front:  { lat: 34.814085, lng: 135.622151 },
            center: { lat: 34.814042, lng: 135.622006 },
            back:   { lat: 34.813966, lng: 135.621903 },
          },
          {
            no:4, par:3,
            yards: { back:162, reg:135, ladies:115 },
            tee:    { lat: 34.813658, lng: 135.621913 },
            front:  { lat: 34.813340, lng: 135.622866 },
            center: { lat: 34.813268, lng: 135.623110 },
            back:   { lat: 34.813208, lng: 135.623322 },
          },
          {
            no:5, par:4,
            yards: { back:360, reg:345, ladies:300 },
            tee:    { lat: 34.813732, lng: 135.622616 },
            front:  { lat: 34.814397, lng: 135.624902 },
            center: { lat: 34.814433, lng: 135.625104 },
            back:   { lat: 34.814474, lng: 135.625302 },
          },
          {
            no:6, par:3,
            yards: { back:195, reg:180, ladies:130 },
            tee:    { lat: 34.814277, lng: 135.625541 },
            front:  { lat: 34.813648, lng: 135.624121 },
            center: { lat: 34.813583, lng: 135.623971 },
            back:   { lat: 34.813530, lng: 135.623828 },
          },
          {
            no:7, par:4,
            yards: { back:285, reg:280, ladies:280 },
            tee:    { lat: 34.813135, lng: 135.623563 },
            front:  { lat: 34.814179, lng: 135.626246 },
            center: { lat: 34.814219, lng: 135.626407 },
            back:   { lat: 34.814273, lng: 135.626552 },
          },
          {
            no:8, par:4,
            yards: { back:270, reg:260, ladies:260 },
            tee:    { lat: 34.814405, lng: 135.625630 },
            front:  { lat: 34.815121, lng: 135.627916 },
            center: { lat: 34.815117, lng: 135.628095 },
            back:   { lat: 34.815099, lng: 135.628268 },
          },
          {
            no:9, par:4,
            yards: { back:400, reg:385, ladies:285 },
            tee:    { lat: 34.814352, lng: 135.627532 },
            front:  { lat: 34.815716, lng: 135.630504 },
            center: { lat: 34.815762, lng: 135.630649 },
            back:   { lat: 34.815815, lng: 135.630784 },
          },
        ],
      },
    ],
  },

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
