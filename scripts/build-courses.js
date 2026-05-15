/**
 * courses/regions/*.js を結合し、ルートの courses.js と shotty の courses データを生成する。
 * 使い方: リポジトリルートで node scripts/build-courses.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REG = path.join(ROOT, 'courses', 'regions');

function loadOrderedCourses() {
  const kansai = require(path.join(REG, 'kansai.js'));
  const kanto = require(path.join(REG, 'kanto.js'));
  const tokai = require(path.join(REG, 'tokai.js'));
  const kyushu = require(path.join(REG, 'kyushu-okinawa.js'));
  // ドロップダウン順（従来の courses.js と同一）
  return [
    kansai[0],
    tokai[0],
    kyushu[0],
    kansai[1],
    kansai[2],
    kansai[3],
    kansai[4],
    kansai[5],
    kanto[0],
    kansai[6],
    kansai[7],
    kansai[8],
    kansai[9],
    kanto[1],
  ];
}

function main() {
  const courses = loadOrderedCourses();

  const header = `/**
 * =====================================================
 *  courses.js — ゴルフ場・コースデータ（自動生成）
 * =====================================================
 *
 *  ★ 編集は courses/regions/ 内の kanto.js / kansai.js / tokai.js / kyushu-okinawa.js を変更 ★
 *  ★ 変更後に必ず実行: node scripts/build-courses.js（または npm run build:courses）★
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

`;

  const template = `
  // =====================================================
  //  ゴルフ場を追加する場合
  //  courses/regions/<エリア>.js の module.exports 配列にオブジェクトを追加し、
  //  node scripts/build-courses.js を実行して再生成する。
  // =====================================================
  // コピー用テンプレート例:
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

`;

  const json = JSON.stringify(courses, null, 2);
  const body = `${header}const COURSES = ${json};\n${template}`;
  fs.writeFileSync(path.join(ROOT, 'courses.js'), body, 'utf8');

  const shottyPath = path.join(ROOT, 'shotty', 'src', 'data', 'courses.ts');
  const shottyHead = `import type { GolfCourse } from '@/types'

/** 自動生成 — courses/regions を編集後にルートで node scripts/build-courses.js */
export const COURSES: GolfCourse[] = `;
  const shottyTail = ` as GolfCourse[]\n`;
  fs.writeFileSync(shottyPath, shottyHead + json + shottyTail, 'utf8');

  console.log('Wrote courses.js and shotty/src/data/courses.ts (' + courses.length + ' ゴルフ場)');
}

main();
