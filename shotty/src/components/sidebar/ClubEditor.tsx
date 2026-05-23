'use client'

import { closeClubEditor, saveClubEditor, resetClubEditor, addOtherClub } from '@/app/golf/logic'

export default function ClubEditor() {
  return (
    <div id="clubEditorPanel">
      <div className="ce-header">
        <button className="ce-back" onClick={closeClubEditor}>← 戻る</button>
        <span className="ce-title">クラブセット編集</span>
        <button className="ce-save" onClick={saveClubEditor}>保存</button>
      </div>
      <div className="ce-body">
        <div className="ce-count-wrap">
          <div className="ce-count-bar-bg"><div id="ceCountBar" className="ce-count-bar"></div></div>
          <div id="ceCount" className="ce-count">0 / 14本</div>
        </div>
        <div className="ce-slots-label">現在のセット（タップで削除）</div>
        <div id="ceSlots" className="ce-slots" suppressHydrationWarning></div>
        <div style={{marginTop:'12px',marginBottom:'6px',fontSize:'10px',color:'var(--gr)',letterSpacing:'1px'}}>クラブを選択（タップで追加/削除）</div>
        <div id="cePresets" suppressHydrationWarning></div>
        <div className="ce-other-wrap">
          <input id="ceOtherInput" className="ce-other-input" type="text" placeholder="その他" />
          <button className="ce-other-add" onClick={addOtherClub}>追加</button>
        </div>
        <button className="ce-reset" onClick={resetClubEditor}>デフォルトに戻す</button>
      </div>
    </div>
  )
}
