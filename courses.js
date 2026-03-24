/**
 * =====================================================
 *  courses.js — ゴルフ場・コースデータ
 * =====================================================
 *
 *  ★ このファイルだけ編集すればコースを追加・修正できます ★
 *
 *  【座標の取得方法】
 *  1. Google Maps を衛星写真で開く
 *  2. 各地点を右クリック（スマホは長押し）
 *  3. 表示された緯度, 経度をコピーして貼り付ける
 *
 *  【各ホールのデータ構造】
 *  {
 *    no:     ホール番号（1〜9）
 *    par:    パー数
 *    tee:    { lat: XX.XXXXX, lng: XXX.XXXXX }  ← ティーグラウンド
 *    front:  { lat: XX.XXXXX, lng: XXX.XXXXX }  ← フロントエッジ（赤F）
 *    center: { lat: XX.XXXXX, lng: XXX.XXXXX }  ← グリーン中央（紫C）
 *    back:   { lat: XX.XXXXX, lng: XXX.XXXXX }  ← バックエッジ（黄B）
 *  }
 *
 *  【座標未登録のホールは null のままでOK】
 *  tee: null, front: null, center: null, back: null
 */

const COURSES = [

  // =====================================================
  //  ローズゴルフクラブ（滋賀県）
  // =====================================================
  {
    name:  'ローズゴルフクラブ',
    pref:  '滋賀県',
    gcid:  970,             // ShotNavi ゴルフ場ID
    lat:   34.8924,         // コース中心（地図初期表示用）
    lng:   136.0535,
    courses: [

      // ── アウト ──────────────────────────
      {
        name: 'アウト',
        cid:  1312,         // ShotNavi コースID
        holes: [
          {
            no: 1, par: 5,
            tee:    { lat: 34.892567, lng: 136.051814 },
            front:  { lat: 34.892015, lng: 136.056338 },
            center: { lat: 34.892025, lng: 136.056534 },
            back:   { lat: 34.892010, lng: 136.056733 },
          },
          {
            no: 2, par: 4,
            tee:    { lat: 34.892468, lng: 136.057524 },
            front:  { lat: 34.893836, lng: 136.055347 },
            center: { lat: 34.893976, lng: 136.055313 },
            back:   { lat: 34.894094, lng: 136.055283 },
          },
          {
            no: 3, par: 3,
            tee:    { lat: 34.894491, lng: 136.055709 },
            front:  { lat: 34.893656, lng: 136.056758 },
            center: { lat: 34.893573, lng: 136.056885 },
            back:   { lat: 34.893475, lng: 136.056991 },
          },
          {
            no: 4, par: 4,
            tee:    { lat: 34.894440, lng: 136.057040 },
            front:  { lat: 34.892230, lng: 136.059981 },
            center: { lat: 34.892151, lng: 136.060141 },
            back:   { lat: 34.892084, lng: 136.060289 },
          },
          { no: 5, par: 4, tee: null, front: null, center: null, back: null },
          { no: 6, par: 4, tee: null, front: null, center: null, back: null },
          { no: 7, par: 5, tee: null, front: null, center: null, back: null },
          { no: 8, par: 3, tee: null, front: null, center: null, back: null },
          { no: 9, par: 4, tee: null, front: null, center: null, back: null },
        ],
      },

      // ── イン ────────────────────────────
      {
        name: 'イン',
        cid:  1313,
        holes: [
          { no: 1, par: 4, tee: null, front: null, center: null, back: null },
          { no: 2, par: 4, tee: null, front: null, center: null, back: null },
          { no: 3, par: 4, tee: null, front: null, center: null, back: null },
          { no: 4, par: 4, tee: null, front: null, center: null, back: null },
          { no: 5, par: 4, tee: null, front: null, center: null, back: null },
          { no: 6, par: 4, tee: null, front: null, center: null, back: null },
          { no: 7, par: 4, tee: null, front: null, center: null, back: null },
          { no: 8, par: 4, tee: null, front: null, center: null, back: null },
          { no: 9, par: 4, tee: null, front: null, center: null, back: null },
        ],
      },

    ],
  },

  // =====================================================
  //  ゴルフ場を追加する場合はここにコピーして貼り付ける
  // =====================================================
  // {
  //   name:  'ゴルフ場名',
  //   pref:  '○○県',
  //   gcid:  XXXX,
  //   lat:   XX.XXXX,
  //   lng:   XXX.XXXX,
  //   courses: [
  //     {
  //       name: 'アウト',
  //       cid:  XXXX,
  //       holes: [
  //         { no:1, par:4, tee:null, front:null, center:null, back:null },
  //         // ... 9ホール分
  //       ],
  //     },
  //   ],
  // },

];
