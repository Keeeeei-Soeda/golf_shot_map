'use client'

/**
 * 旧マップ上の方位磁石／T／ヤードパネル用のDOMプレースホルダ。
 * 表示はしない（下部 HoleBar に移設済み）。IDだけ残して logic 互換を保つ。
 */
export default function YardageBar() {
  return (
    <>
      <div id="mapBtns" className="map-btns" style={{ display: 'none' }} aria-hidden />
      <div id="yardageInfo" style={{ display: 'none' }} suppressHydrationWarning aria-hidden />
    </>
  )
}
