/* eslint-disable @typescript-eslint/no-explicit-any */
import { COURSES } from '@/data/courses'
import {
  gs, st,
  DEFAULT_CLUBS, SCORE_DEFS, CLUB_PRESETS, CLUB_ORDER, TEE_TYPES,
} from './state'

// ============================================================
// Google Maps callback（script タグの callback=initMap に対応）
// ============================================================
export function initMap() {
  gs.mapsLoaded = true
  if (gs.appInitialized) loadHole()
}

// ============================================================
// クラブ
// ============================================================
export function loadClubs(): string[] {
  try {
    const saved = localStorage.getItem('golfClubSet')
    if (saved) return Array.from({length:14}, (_,i) => JSON.parse(saved)[i] || '')
  } catch {}
  return [...DEFAULT_CLUBS]
}
export function saveClubs(arr: string[]) { localStorage.setItem('golfClubSet', JSON.stringify(arr)) }
export function sortClubs(arr: string[]): string[] {
  const filled = arr.filter(c => c !== '')
  filled.sort((a,b) => {
    const ia = CLUB_ORDER.indexOf(a), ib = CLUB_ORDER.indexOf(b)
    if (ia===-1&&ib===-1) return 0; if (ia===-1) return 1; if (ib===-1) return -1
    return ia - ib
  })
  return Array.from({length:14}, (_,i) => filled[i] || '')
}

// ============================================================
// ヘルパー
// ============================================================
export function scoreDef(diff: number) {
  return SCORE_DEFS.find(d => d.diff === diff) || { diff, name: '+'+diff, cls: 'other' }
}
export const gc = () => st.gcIdx !== null ? COURSES[st.gcIdx] : null
export const course = () => gc() && st.cIdx !== null ? gc()!.courses[st.cIdx!] : null
export function isPairRound(): boolean {
  if (st.gcIdx===null||st.cIdx===null) return false
  const g = COURSES[st.gcIdx]; if (!g?.courses) return false
  const c2 = st.cIdx2
  if (typeof c2!=='number'||c2<0||c2>=g.courses.length) return false
  return !!(g.courses[st.cIdx]?.holes && g.courses[c2]?.holes)
}
export function sanitizeRoundState() {
  if (st.gcIdx===null||st.cIdx===null) return
  const g = COURSES[st.gcIdx]
  if (!g?.courses||st.cIdx<0||st.cIdx>=g.courses.length||!g.courses[st.cIdx]) {
    st.gcIdx=null; st.cIdx=null; st.cIdx2=null; st.hIdx=0; return
  }
  const c2=st.cIdx2
  if (!(typeof c2==='number'&&c2>=0&&c2<g.courses.length&&g.courses[c2]?.holes)) {
    st.cIdx2=null; if (st.hIdx>8) st.hIdx=Math.min(st.hIdx,8)
  }
}
export function totalHoles() { return isPairRound() ? 18 : 9 }
export const hole = () => {
  if (st.gcIdx===null||st.cIdx===null) return null
  const gcData = COURSES[st.gcIdx]; if (!gcData) return null
  if (isPairRound()&&st.hIdx>=9) { const c2=gcData.courses[st.cIdx2!]; return c2?c2.holes[st.hIdx-9]:null }
  const c=gcData.courses[st.cIdx]; return c?c.holes[st.hIdx]:null
}
export function activeTee(h: any) {
  if (!h) return null
  if (h.tees&&st.teeType&&h.tees[st.teeType]) return h.tees[st.teeType]
  return h.tee
}
export const hasData = (h: any) => h&&activeTee(h)&&h.front
export const holeKey = () => {
  const pair=isPairRound()
  const eCIdx=pair&&st.hIdx>=9?st.cIdx2:st.cIdx
  const eHIdx=pair&&st.hIdx>=9?st.hIdx-9:st.hIdx
  return `${st.gcIdx}_${eCIdx}_${eHIdx}`
}
export const curShots = () => gs.roundShots[holeKey()]||[]
export function haversine(la1:number,lo1:number,la2:number,lo2:number) {
  const R=6371000,r=Math.PI/180,dL=(la2-la1)*r,dN=(lo2-lo1)*r
  const a=Math.sin(dL/2)**2+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin(dN/2)**2
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}
export function calcBearing(lat1:number,lng1:number,lat2:number,lng2:number) {
  const r=Math.PI/180,dLng=(lng2-lng1)*r
  const y=Math.sin(dLng)*Math.cos(lat2*r)
  const x=Math.cos(lat1*r)*Math.sin(lat2*r)-Math.sin(lat1*r)*Math.cos(lat2*r)*Math.cos(dLng)
  return (Math.atan2(y,x)*180/Math.PI+360)%360
}

// ============================================================
// ラウンド保存
// ============================================================
export function saveRound() {
  if (!gc()||!course()||!gs.roundId) return
  const all:any[]=JSON.parse(localStorage.getItem('golfRounds')||'[]')
  const idx=all.findIndex((r:any)=>r.id===gs.roundId)
  const c2name=isPairRound()&&gc()!.courses[st.cIdx2!]?'＋'+gc()!.courses[st.cIdx2!].name:''
  const data={id:gs.roundId,date:new Date().toLocaleDateString('ja-JP'),gcName:gc()!.name,courseName:course()!.name+c2name,shots:gs.roundShots,updatedAt:Date.now()}
  if (idx>=0) all[idx]=data; else all.unshift(data)
  localStorage.setItem('golfRounds',JSON.stringify(all.slice(0,30)))
  updateBadge()
}
export function updateBadge() {
  const all:any[]=JSON.parse(localStorage.getItem('golfRounds')||'[]')
  const b=document.getElementById('histBadge')
  if (b){b.textContent=String(all.length);b.style.display=all.length?'block':'none'}
}

// ============================================================
// 初期化
// ============================================================
export function initSelects() {
  const s=document.getElementById('gcSel') as HTMLSelectElement; if(!s) return
  COURSES.forEach((c,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=`${c.name}（${c.pref}）`;s.appendChild(o)})
}
export function initEmSelector() {
  const prefs:string[]=[]; COURSES.forEach(c=>{if(!prefs.includes(c.pref))prefs.push(c.pref)})
  const el=document.getElementById('emPrefBtns')
  if(el) el.innerHTML=prefs.map(p=>`<button class="em-pref-btn" onclick="emSelectPref('${p}')">${p}</button>`).join('')
}
export function initApp() {
  gs.CLUBS = sortClubs(loadClubs())
  gs.roundId = 'round_' + Date.now()
  initSelects()
  initEmSelector()
  updateBadge()
  gs.appInitialized = true
  if (gs.mapsLoaded) {
    loadHole()
    restoreStrategyState()
  }
}

// ============================================================
// ヤード情報
// ============================================================
export function toggleYardageInfo() {
  gs.yardageInfoOpen=!gs.yardageInfoOpen
  const el=document.getElementById('yardageInfo'),btn=document.getElementById('yiToggleBtn')
  if(el) el.style.display=gs.yardageInfoOpen?'block':'none'
  if(btn) btn.classList.toggle('open',gs.yardageInfoOpen)
}
export function showLegend(){const el=document.getElementById('legend');if(el)el.style.display='block'}
export function hideLegend(){const el=document.getElementById('legend');if(el)el.style.display='none'}
export function renderYardageInfo(h:any){
  const el=document.getElementById('yardageInfo'),mapBtns=document.getElementById('mapBtns')
  if(!h||!hasData(h)){if(el)el.style.display='none';if(mapBtns)mapBtns.style.display='none';return}
  if(mapBtns)mapBtns.style.display='flex'; showLegend(); updateYardagePanel(h)
  if(el) el.style.display=gs.yardageInfoOpen?'block':'none'
}
export function updateYardagePanel(h?:any) {
  if(!h) h=hole(); if(!h||!hasData(h)) return
  const shots=curShots(),nextNo=shots.length+1
  let fromLat:number,fromLng:number
  if(shots.length===0){const tee=activeTee(h);fromLat=tee.lat;fromLng=tee.lng}
  else{fromLat=shots[shots.length-1].lat;fromLng=shots[shots.length-1].lng}
  const tF=Math.round(haversine(fromLat,fromLng,h.front.lat,h.front.lng)*1.09361)
  const tC=Math.round(haversine(fromLat,fromLng,h.center.lat,h.center.lng)*1.09361)
  const tB=Math.round(haversine(fromLat,fromLng,h.back.lat,h.back.lng)*1.09361)
  const el=document.getElementById('yardageInfo')
  if(el) el.innerHTML=`<div class="yi-horiz"><span class="yi-badge">H${h.no}</span><span class="yi-par">PAR${h.par}</span><span class="yi-sep">|</span><div class="yi-item"><div class="yi-label">第${nextNo}打→F</div><div class="yi-val blue">${tF}<span>yd</span></div></div><span class="yi-sep">|</span><div class="yi-item"><div class="yi-label">→C</div><div class="yi-val green">${tC}<span>yd</span></div></div><span class="yi-sep">|</span><div class="yi-item"><div class="yi-label">→B</div><div class="yi-val yellow">${tB}<span>yd</span></div></div></div><div id="yiMeasure" class="yi-measure-row"></div>`
}
export function updateYardageMeasure(fromLabel:string,fromYd:number,toName:string,toYd:number){
  const el=document.getElementById('yiMeasure')
  if(el) el.innerHTML=`<div class="yi-item"><div class="yi-label">${fromLabel}</div><div class="yi-val blue">${fromYd}<span>yd</span></div></div><span class="yi-sep">→</span><div class="yi-item"><div class="yi-label">${toName}まで</div><div class="yi-val yellow">${toYd}<span>yd</span></div></div>`
}

// ============================================================
// ホール読み込み
// ============================================================
export function loadHole() {
  sanitizeRoundState(); const h=hole()
  const reviewBtn=document.getElementById('reviewBtn'); if(reviewBtn) reviewBtn.style.display='none'
  updateCupBtn()
  if(!h||!hasData(h)){
    const mapEl=document.getElementById('map'),emptyEl=document.getElementById('emptyMap')
    if(mapEl) mapEl.style.display='none'
    if(emptyEl){emptyEl.style.display='flex';const p=emptyEl.querySelector('p');if(p)p.textContent=h?`${(h as any).no}番ホールの座標はまだ登録されていません`:'コースを選択してください'}
    const rb=document.getElementById('recBanner');if(rb)rb.style.display='none'
    const mb=document.getElementById('mapBtns');if(mb)mb.style.display='none'
    clearMeasure();clearPending();clearShotLayer();updateInfo();updateGpsRecordBtn();return
  }
  const mapEl=document.getElementById('map'),emptyEl=document.getElementById('emptyMap')
  if(emptyEl) emptyEl.style.display='none'; if(mapEl) mapEl.style.display='block'
  if(reviewBtn) reviewBtn.style.display='flex'
  renderYardageInfo(h); clearMeasure(); clearPending()
  if(!gs.mapsLoaded) return
  const tee=activeTee(h)
  const bearing=calcBearing(tee.lat,tee.lng,h.center.lat,h.center.lng)
  const midLat=(tee.lat+h.center.lat)/2,midLng=(tee.lng+h.center.lng)/2
  const holeDistM=haversine(tee.lat,tee.lng,h.center.lat,h.center.lng)
  const zoom=holeDistM>400?16:holeDistM>250?17:18
  const G=(window as any).google.maps
  if(!gs.map){
    gs.map=new G.Map(document.getElementById('map'),{center:{lat:midLat,lng:midLng},zoom,mapTypeId:'hybrid',mapId:'c041c97b58243474e5cf18cb',disableDefaultUI:true,zoomControl:true,gestureHandling:'greedy',rotateControl:false,zoomControlOptions:{position:G.ControlPosition.RIGHT_CENTER}})
    gs.map.addListener('click',onMapClick)
  } else { gs.map.setZoom(zoom); gs.map.panTo({lat:midLat,lng:midLng}) }
  window._currentBearing=bearing
  placePins(h); renderShotLayer(); renderStrategyLayer(); updateInfo(); updateRecBanner(); updateGpsRecordBtn()
}

// ============================================================
// ピン配置
// ============================================================
export function placePins(h:any){
  if(window._pins) window._pins.forEach((m:any)=>m.setMap(null)); window._pins=[]
  const showFB=curShots().length>=1
  const G=(window as any).google.maps
  const mk=(pos:any,color:string,lbl:string,title:string,pinKey:string|null,fbPin:boolean)=>{
    if(fbPin&&!showFB) return null
    const m=new G.Marker({position:pos,map:gs.map,title,icon:{path:G.SymbolPath.CIRCLE,scale:11,fillColor:color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2},label:{text:lbl,color:'#fff',fontSize:'11px',fontWeight:'bold'}})
    m.addListener('click',()=>{if(gs.appMode==='measure'&&pinKey){gs.measureSelectedPin=pinKey;if(gs.measureClick)showDists(gs.measureClick.getPosition())}})
    return m
  }
  window._pins=[mk(activeTee(h),'#4a9fd4','T','ティー',null,false),mk(h.front,'#e05252','F','フロント','front',true),mk(h.center,'#a78bfa','C','センター','center',false),mk(h.back,'#e8c84a','B','バック','back',true)].filter(Boolean)
}

// ============================================================
// 回転
// ============================================================
export function rotateToHole(){
  if(!gs.map||window._currentBearing===undefined) return
  const btn=document.getElementById('rotateBtn'),cur=gs.map.getHeading()||0,tgt=window._currentBearing
  const diff=Math.min(Math.abs(cur-tgt),360-Math.abs(cur-tgt))
  if(diff<10){gs.map.setHeading(0);if(btn){btn.textContent='⛳↑';btn.title='ホール方向に回転'}}
  else{gs.map.setHeading(tgt);if(btn){btn.textContent='🧭N';btn.title='北向きに戻す'}}
}

// ============================================================
// 地図タップ
// ============================================================
export function onMapClick(e:any){
  hideLegend()
  if(gs.appMode==='measure'){handleMeasure(e.latLng);return}
  updatePendingPos(e.latLng)
  const sp=document.getElementById('shotPanel');if(sp&&!sp.classList.contains('open'))openShotPanelUI()
}

// ============================================================
// 測定モード
// ============================================================
export function handleMeasure(pos:any){
  if(gs.measureClick)gs.measureClick.setMap(null)
  if(gs.teeLine){gs.teeLine.setMap(null);gs.teeLine=null};if(gs.pinLine){gs.pinLine.setMap(null);gs.pinLine=null}
  const G=(window as any).google.maps
  gs.measureClick=new G.Marker({position:pos,map:gs.map,icon:{path:G.SymbolPath.CIRCLE,scale:8,fillColor:'#fff',fillOpacity:.9,strokeColor:'#4a9fd4',strokeWeight:2.5},zIndex:99})
  showDists(pos)
}
export function showDists(pos:any){
  const h=hole();if(!h||!hasData(h))return
  const shots=curShots(),prevIsTee=shots.length===0
  const origin=prevIsTee?activeTee(h):{lat:shots[shots.length-1].lat,lng:shots[shots.length-1].lng}
  const originLabel=prevIsTee?'ティーから':`第${shots.length+1}打から`
  const originYd=Math.round(haversine(origin.lat,origin.lng,pos.lat(),pos.lng())*1.09361)
  const pinMap:Record<string,any>={front:h.front,center:h.center,back:h.back}
  const pinNameMap:Record<string,string>={front:'フロント',center:'センター',back:'バック'}
  const targetKey=gs.measureSelectedPin&&pinMap[gs.measureSelectedPin]?gs.measureSelectedPin:'center'
  const targetPos=pinMap[targetKey],targetName=pinNameMap[targetKey]
  const pinYd=Math.round(haversine(pos.lat(),pos.lng(),targetPos.lat,targetPos.lng)*1.09361)
  updateYardageMeasure(originLabel,originYd,targetName,pinYd)
  const G=(window as any).google.maps
  if(gs.teeLine)gs.teeLine.setMap(null)
  gs.teeLine=new G.Polyline({path:[origin,pos],map:gs.map,strokeColor:'#4a9fd4',strokeOpacity:.7,strokeWeight:2,icons:[{icon:{path:G.SymbolPath.FORWARD_CLOSED_ARROW,scale:2.5},offset:'100%'}]})
  if(gs.pinLine)gs.pinLine.setMap(null)
  gs.pinLine=new G.Polyline({path:[pos,{lat:targetPos.lat,lng:targetPos.lng}],map:gs.map,strokeColor:'#e8c84a',strokeOpacity:.85,strokeWeight:2,icons:[{icon:{path:G.SymbolPath.FORWARD_CLOSED_ARROW,scale:2.5},offset:'100%'}]})
  if(gs.measureFromLabel)gs.measureFromLabel.setMap(null)
  gs.measureFromLabel=makeLabel({lat:(origin.lat+pos.lat())/2,lng:(origin.lng+pos.lng())/2},`${originYd}yd`,'#000','#4a9fd4')
  if(gs.measureToLabel)gs.measureToLabel.setMap(null)
  gs.measureToLabel=makeLabel({lat:(pos.lat()+targetPos.lat)/2,lng:(pos.lng()+targetPos.lng)/2},`残${pinYd}yd`,'#000','#e8c84a')
}
export function clearMeasure(){
  if(gs.measureClick){gs.measureClick.setMap(null);gs.measureClick=null}
  if(gs.teeLine){gs.teeLine.setMap(null);gs.teeLine=null};if(gs.pinLine){gs.pinLine.setMap(null);gs.pinLine=null}
  if(gs.measureFromLabel){gs.measureFromLabel.setMap(null);gs.measureFromLabel=null}
  if(gs.measureToLabel){gs.measureToLabel.setMap(null);gs.measureToLabel=null}
  gs.measureSelectedPin=null
  const mEl=document.getElementById('yiMeasure');if(mEl)mEl.innerHTML=''
}

// ============================================================
// ショット記録
// ============================================================
export function makeLabel(pos:any,text:string,tc:string,bg:string){
  const w=text.length*8+14
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20"><rect width="${w}" height="20" rx="4" fill="${bg}" opacity=".85"/><text x="${w/2}" y="14" font-size="11" fill="${tc}" text-anchor="middle" font-family="sans-serif">${text}</text></svg>`
  const G=(window as any).google.maps
  return new G.Marker({position:pos,map:gs.map,icon:{url:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg),scaledSize:new G.Size(w,20),anchor:new G.Point(w/2,10)},zIndex:55,clickable:false})
}
export function updatePendingPos(pos:any){
  const h=hole();if(!h||!hasData(h))return
  gs.pendingPos=pos
  const shots=curShots(),holeOff=gs.roundShots[holeKey()+'_offset']||0,prevIsTee=shots.length===0
  const prevPos=prevIsTee?activeTee(h):{lat:shots[shots.length-1].lat,lng:shots[shots.length-1].lng}
  const carryYd=Math.round(haversine(prevPos.lat,prevPos.lng,pos.lat(),pos.lng())*1.09361)
  const remYd=Math.round(haversine(pos.lat(),pos.lng(),h.center.lat,h.center.lng)*1.09361)
  const fromLabel=prevIsTee?'ティーから':`${shots[shots.length-1].no}打目から`
  const nextNo=shots.length+1+holeOff
  updateSpDistTab(carryYd,remYd,fromLabel)
  const G=(window as any).google.maps
  if(gs.pendingMarker) gs.pendingMarker.setPosition(pos)
  else gs.pendingMarker=new G.Marker({position:pos,map:gs.map,icon:{path:G.SymbolPath.CIRCLE,scale:13,fillColor:'#f59e0b',fillOpacity:.85,strokeColor:'#fff',strokeWeight:2},label:{text:String(nextNo),color:'#000',fontSize:'11px',fontWeight:'bold'},zIndex:100})
  if(gs.pendingCarryLine)gs.pendingCarryLine.setMap(null)
  gs.pendingCarryLine=new G.Polyline({path:[prevPos,{lat:pos.lat(),lng:pos.lng()}],map:gs.map,strokeColor:'#4a9fd4',strokeOpacity:.75,strokeWeight:2.5,icons:[{icon:{path:G.SymbolPath.FORWARD_CLOSED_ARROW,scale:3},offset:'100%'}]})
  if(gs.pendingPinLine)gs.pendingPinLine.setMap(null)
  gs.pendingPinLine=new G.Polyline({path:[{lat:pos.lat(),lng:pos.lng()},{lat:h.center.lat,lng:h.center.lng}],map:gs.map,strokeColor:'#e8c84a',strokeOpacity:.8,strokeWeight:2,icons:[{icon:{path:G.SymbolPath.FORWARD_CLOSED_ARROW,scale:2.5},offset:'100%'}]})
  if(gs.pendingCarryLabel)gs.pendingCarryLabel.setMap(null)
  gs.pendingCarryLabel=makeLabel({lat:(prevPos.lat+pos.lat())/2,lng:(prevPos.lng+pos.lng())/2},`${carryYd}yd`,'#000','#4a9fd4')
  if(gs.pendingPinLabel)gs.pendingPinLabel.setMap(null)
  gs.pendingPinLabel=makeLabel({lat:(pos.lat()+h.center.lat)/2,lng:(pos.lng()+h.center.lng)/2},`残${remYd}yd`,'#000','#e8c84a')
}
export function clearPending(){
  [gs.pendingMarker,gs.pendingCarryLine,gs.pendingPinLine,gs.pendingCarryLabel,gs.pendingPinLabel].forEach(x=>{if(x)x.setMap(null)})
  gs.pendingMarker=gs.pendingCarryLine=gs.pendingPinLine=gs.pendingCarryLabel=gs.pendingPinLabel=null
}
export function openShotPanelUI(){
  const key=holeKey(),shots=curShots(),holeOff=gs.roundShots[key+'_offset']||0,n=shots.length+1+holeOff
  const el=document.getElementById('spShotNo');if(el)el.textContent=n+'打目を登録'
  const cg=document.getElementById('clubGrid')
  if(cg) cg.innerHTML=gs.CLUBS.map(c=>c?`<button class="cb" onclick="selectClub('${c}')">${c}</button>`:`<span class="cb-empty"></span>`).join('')
  const ob=document.getElementById('spOkBtn') as HTMLButtonElement;if(ob)ob.disabled=true
  gs.selectedClub=null;gs.selectedResult=null
  document.querySelectorAll('.rb').forEach(b=>b.classList.remove('sel'))
  gs.shotObType=null
  document.querySelectorAll('.sp-ob-btn').forEach(b=>b.classList.remove('sel'))
  document.querySelectorAll('.pb').forEach(b=>b.classList.remove('sel'))
  const isTeeShot=shots.length===0
  const ts=document.getElementById('spPenaltyTeeSection'),hs=document.getElementById('spPenaltyHazardSection'),st2=document.getElementById('spPenaltyStatus')
  if(ts) ts.style.display=isTeeShot?'block':'none'
  if(hs) hs.style.display=isTeeShot?'none':'block'
  if(st2) st2.textContent=isTeeShot?'OBの場合: 次の打数を選択 → 登録':'ドロップ地点が選択されました（1打罰を加算）'
  const pob=document.getElementById('spPenaltyOkBtn') as HTMLButtonElement;if(pob)pob.disabled=isTeeShot
  switchSpTab('record')
  const sp=document.getElementById('shotPanel');if(sp)sp.classList.add('open')
  const rb=document.getElementById('recBanner');if(rb)rb.style.display='none'
}
export function selectShotObType(btn:any,type:string){
  if(gs.shotObType===type){gs.shotObType=null;document.querySelectorAll('.sp-ob-btn').forEach(b=>b.classList.remove('sel'))}
  else{gs.shotObType=type;document.querySelectorAll('.sp-ob-btn').forEach(b=>{(b as HTMLElement).classList.toggle('sel',(b as HTMLElement).dataset.type===type)})}
}
export function switchSpTab(tab:string){
  ['record','dist','penalty'].forEach(t=>{
    const tabEl=document.getElementById('spTab'+t.charAt(0).toUpperCase()+t.slice(1))
    const bodyEl=document.getElementById('spBody'+t.charAt(0).toUpperCase()+t.slice(1))
    if(tabEl)tabEl.classList.toggle('active',t===tab)
    if(bodyEl)bodyEl.style.display=t===tab?'block':'none'
  })
}
export function updateSpDistTab(carryYd:number,remYd:number,fromLabel:string){
  const el=document.getElementById('spBodyDist')
  if(el) el.innerHTML=`<div class="sp-dists"><div class="sp-dist-card carry"><div class="sdc-label">carry</div><div class="sdc-from">${fromLabel}</div><div class="sdc-val blue">${carryYd}<span>yd</span></div></div><div class="sp-dist-card remain"><div class="sdc-label">remaining</div><div class="sdc-from">センターまで</div><div class="sdc-val yellow">${remYd}<span>yd</span></div></div></div>`
}
export function selectClub(c:string){
  console.log('[selectClub]', c)
  gs.selectedClub=c
  document.querySelectorAll('.cb').forEach(b=>(b as HTMLElement).classList.toggle('sel',b.textContent===c))
  const ob=document.getElementById('spOkBtn') as HTMLButtonElement;if(ob)ob.disabled=false
}
export function selectResult(r:string){
  if(gs.selectedResult===r){gs.selectedResult=null;document.querySelectorAll('.rb').forEach(b=>b.classList.remove('sel'))}
  else{gs.selectedResult=r;document.querySelectorAll('.rb').forEach(b=>(b as HTMLElement).classList.toggle('sel',(b as HTMLElement).dataset.key===r))}
}
export function selectPenalty(n:number){
  console.log('[selectPenalty]', n)
  const key=holeKey(),shots=curShots(),holeOff=gs.roundShots[key+'_offset']||0,cur=shots.length+1+holeOff
  if(n<cur){ console.warn('[selectPenalty] n < cur, ignored', n, cur); return }
  gs.roundShots[key+'_pendingPenalty']=n
  const el=document.getElementById('spShotNo');if(el)el.textContent='プレ'+n+' → 次は'+n+'打目から'
  const st2=document.getElementById('spPenaltyStatus');if(st2)st2.textContent='✅ プレ'+n+' 選択済 → 「ここに登録する」を押してください'
  document.querySelectorAll('.pb').forEach(b=>(b as HTMLElement).classList.toggle('sel',parseInt((b as HTMLElement).id.replace('pbBtn',''))===n))
  const ob=document.getElementById('spPenaltyOkBtn') as HTMLButtonElement;if(ob)ob.disabled=false
}
export function confirmPenaltyDrop(){
  console.log('[confirmPenaltyDrop] called', {pendingPos: gs.pendingPos})
  const h=hole()
  if(!h){ console.warn('[confirmPenaltyDrop] abort: hole() is null'); return }
  try {
    const key=holeKey();if(!gs.roundShots[key])gs.roundShots[key]=[]
    const shots=gs.roundShots[key],holeOff=gs.roundShots[key+'_offset']||0,prevIsTee=shots.length===0
    const pendingN=gs.roundShots[key+'_pendingPenalty']

    // ティーショットOBは pendingPos 不要 — プレN が選択されていればティー位置で自動登録
    if(!gs.pendingPos){
      if(prevIsTee && pendingN){
        const tee=activeTee(h)
        if(tee){
          const G=(window as any).google.maps
          gs.pendingPos=new G.LatLng(tee.lat,tee.lng)
        }
      }
      if(!gs.pendingPos){
        if(prevIsTee) alert('プレ3/プレ4/プレ5 をまず選択してください。')
        else alert('ドロップ地点を地図上でタップしてから登録してください。')
        console.warn('[confirmPenaltyDrop] abort: pendingPos is null')
        return
      }
    }

    const prevPos=prevIsTee?activeTee(h):{lat:shots[shots.length-1].lat,lng:shots[shots.length-1].lng}
    const carryYd=Math.round(haversine(prevPos.lat,prevPos.lng,gs.pendingPos.lat(),gs.pendingPos.lng())*1.09361)
    const remYd=Math.round(haversine(gs.pendingPos.lat(),gs.pendingPos.lng(),h.center.lat,h.center.lng)*1.09361)
    const fromLabel=prevIsTee?'ティー':shots[shots.length-1].no+'打目地点'
    const dropNo=shots.length+1+holeOff
    const n=pendingN||(shots.length+3+holeOff)
    console.log('[confirmPenaltyDrop] pendingPenalty:', pendingN, 'n:', n, 'dropNo:', dropNo)
    shots.push({no:dropNo,lat:gs.pendingPos.lat(),lng:gs.pendingPos.lng(),club:null,carry:carryYd,remaining:remYd,fromLabel,isPenalty:true,penaltyTarget:n,obType:gs.shotObType||null})
    const newOffset=n-(shots.length+1)
    if(newOffset>0)gs.roundShots[key+'_offset']=newOffset; else delete gs.roundShots[key+'_offset']
    delete gs.roundShots[key+'_pendingPenalty']
    saveRound();cancelShot();renderShotLayer();renderStrip();updateInfo();updateRecBanner();placePins(hole())
    console.log('[confirmPenaltyDrop] success, shots:', gs.roundShots[key]?.length)
  } catch(e) {
    console.error('[confirmPenaltyDrop] error:', e)
    alert('ペナルティ登録エラー: ' + (e instanceof Error ? e.message : String(e)))
  }
}
export function cancelPenalty(){
  const key=holeKey(); delete gs.roundShots[key+'_offset']; delete gs.roundShots[key+'_pendingPenalty']
  saveRound(); gs.shotObType=null
  document.querySelectorAll('.sp-ob-btn').forEach(b=>b.classList.remove('sel'))
  document.querySelectorAll('.pb').forEach(b=>b.classList.remove('sel'))
  const el=document.getElementById('spShotNo');if(el)el.textContent=(curShots().length+1)+'打目を登録'
  const ob=document.getElementById('spPenaltyOkBtn') as HTMLButtonElement;if(ob)ob.disabled=true
  switchSpTab('record')
}

export function useReteePosition(){
  const h=hole();if(!h||!hasData(h))return
  const shots=curShots()
  const prevPos=shots.length===0?activeTee(h):{lat:shots[shots.length-1].lat,lng:shots[shots.length-1].lng}
  if(!prevPos)return
  const G=(window as any).google.maps
  const latLng=new G.LatLng(prevPos.lat,prevPos.lng)
  updatePendingPos(latLng)
  const info=document.getElementById('spPenaltyStatus')
  if(info)info.textContent='打ち直し：前の打点に戻って記録します（1打罰）'
}
export function confirmShot(){
  console.log('[confirmShot] called', {pendingPos: gs.pendingPos, selectedClub: gs.selectedClub})
  if(!gs.pendingPos){ console.warn('[confirmShot] abort: pendingPos is null'); return }
  if(!gs.selectedClub){ console.warn('[confirmShot] abort: selectedClub is null'); return }
  const h=hole()
  if(!h){ console.warn('[confirmShot] abort: hole() is null'); return }
  try {
    const key=holeKey();if(!gs.roundShots[key])gs.roundShots[key]=[]
    const shots=gs.roundShots[key]; delete gs.roundShots[key+'_pendingPenalty']
    const holeOff=gs.roundShots[key+'_offset']||0,prevIsTee=shots.length===0
    const prevPos=prevIsTee?activeTee(h):{lat:shots[shots.length-1].lat,lng:shots[shots.length-1].lng}
    const no=shots.length+1+holeOff
    const carryYd=Math.round(haversine(prevPos.lat,prevPos.lng,gs.pendingPos.lat(),gs.pendingPos.lng())*1.09361)
    const remYd=Math.round(haversine(gs.pendingPos.lat(),gs.pendingPos.lng(),h.center.lat,h.center.lng)*1.09361)
    const fromLabel=prevIsTee?'ティー':`${shots[shots.length-1].no}打目地点`
    shots.push({no,lat:gs.pendingPos.lat(),lng:gs.pendingPos.lng(),club:gs.selectedClub,carry:carryYd,remaining:remYd,fromLabel,result:gs.selectedResult||null})
    saveRound();cancelShot();renderShotLayer();renderStrip();updateInfo();updateRecBanner();updateYardagePanel();placePins(hole())
    console.log('[confirmShot] success, shots:', gs.roundShots[key]?.length)
  } catch(e) {
    console.error('[confirmShot] error:', e)
    alert('ショット登録エラー: ' + (e instanceof Error ? e.message : String(e)))
  }
}
export function cancelShot(){
  gs.pendingPos=null;gs.selectedClub=null;gs.selectedResult=null; clearPending()
  const sp=document.getElementById('shotPanel');if(sp)sp.classList.remove('open')
  updateRecBanner()
}

// ============================================================
// カップインパネル
// ============================================================
export function openCupPanel(){
  const h=hole();if(!h)return
  const key=holeKey(),shots=curShots(),holeOff=gs.roundShots[key+'_offset']||0
  gs.cpStrokePenalty=0;gs.cpObType=null;gs.cpPutts=null
  document.querySelectorAll('.cup-stroke-pen-btn').forEach(b=>(b as HTMLElement).classList.toggle('sel',(b as HTMLElement).dataset.pen==='0'))
  document.querySelectorAll('.cup-ob-btn,.cup-putts-btn').forEach(b=>b.classList.remove('sel'))
  const recPen=shots.filter((s:any)=>s.isPenalty).reduce((sum:number,s:any)=>sum+Math.max(0,(s.penaltyTarget||0)-s.no-1),0)
  const badge=document.getElementById('cpRecordedPenaltyBadge')
  if(badge){badge.textContent=recPen>0?'ラウンド中: '+recPen+'打罰記録済み（打数に含む）':'';badge.style.display=recPen>0?'inline':'none'}
  const defaultTotal=shots.length+1+holeOff,diff=defaultTotal-h.par
  gs.cpSelectedDiff=diff; const sd=scoreDef(diff)
  const hi=document.getElementById('cpHoleInfo');if(hi)hi.textContent=`H${h.no} PAR${h.par}`
  const cs=document.getElementById('cpShots');if(cs)cs.textContent=shots.length>0?String(defaultTotal):'—'
  const lbl=document.getElementById('cpScoreLabel')
  if(lbl){lbl.textContent=shots.length>0?`${sd.name}（${diff>0?'+':''}${diff}）`:'（打数未記録）';lbl.className=`cup-score-label ${sd.cls}`;lbl.style.background=shots.length>0?'':'transparent'}
  const cb=document.getElementById('cpScoreBtns')
  if(cb){
    const mainRow=SCORE_DEFS.map(d=>{const l=d.diff===0?'E':d.diff>0?'+'+d.diff:String(d.diff);return `<button class="score-btn ${d.cls}" data-diff="${d.diff}" onclick="selectCupScore(${d.diff})">${d.name}<br><small>${l}</small></button>`}).join('')
    const extRow=[8,9,10,11,12,13].map(n=>{const diff=n-h.par;const l=diff>0?'+'+diff:String(diff);return `<button class="score-btn score-btn-ext other" data-diff="${diff}" onclick="selectCupScore(${diff})">${n}打<br><small>${l}</small></button>`}).join('')
    cb.innerHTML=mainRow+`<div class="score-btn-ext-row">${extRow}</div>`
  }
  const cp=document.getElementById('cupPanel');if(cp)cp.classList.add('open')
  const rb=document.getElementById('recBanner');if(rb)rb.style.display='none'
}
export function selectCupScore(diff:number){
  gs.cpSelectedDiff=diff; const h=hole()
  if(h){const cs=document.getElementById('cpShots');if(cs)cs.textContent=String(h.par+diff);const sd=scoreDef(diff);const lbl=document.getElementById('cpScoreLabel');if(lbl){lbl.textContent=`${sd.name}（${diff>0?'+':''}${diff}）`;lbl.className=`cup-score-label ${sd.cls}`}}
  document.querySelectorAll('.score-btn').forEach(b=>(b as HTMLElement).classList.toggle('sel',(b as HTMLElement).dataset.diff===String(diff)))
}
export function selectCupStrokePenalty(btn:HTMLElement,n:number){
  gs.cpStrokePenalty=n
  document.querySelectorAll('.cup-stroke-pen-btn').forEach(b=>(b as HTMLElement).classList.remove('sel'))
  btn.classList.add('sel')
  const h=hole();if(!h)return
  const total=h.par+gs.cpSelectedDiff+n,diff=total-h.par,sd=scoreDef(diff)
  const cs=document.getElementById('cpShots');if(cs)cs.textContent=String(total)
  const lbl=document.getElementById('cpScoreLabel');if(lbl){lbl.textContent=sd.name+'（'+(diff>0?'+':'')+diff+'）';lbl.className='cup-score-label '+sd.cls}
}
export function selectCupObType(btn:HTMLElement,type:string){
  if(gs.cpObType===type){gs.cpObType=null;document.querySelectorAll('.cup-ob-btn').forEach(b=>b.classList.remove('sel'))}
  else{gs.cpObType=type;document.querySelectorAll('.cup-ob-btn').forEach(b=>(b as HTMLElement).classList.toggle('sel',(b as HTMLElement).dataset.type===type))}
}
export function selectCupPutts(btn:HTMLElement,n:number){
  if(gs.cpPutts===n){gs.cpPutts=null;document.querySelectorAll('.cup-putts-btn').forEach(b=>b.classList.remove('sel'))}
  else{gs.cpPutts=n;document.querySelectorAll('.cup-putts-btn').forEach(b=>(b as HTMLElement).classList.toggle('sel',(b as HTMLElement).dataset.putts===String(n)))}
}
export function confirmCupIn(){
  const h=hole();if(!h)return
  const key=holeKey()
  if(!gs.roundShots[key])gs.roundShots[key]=[]
  const totalShots=h.par+gs.cpSelectedDiff
  const finalTotal=totalShots+gs.cpStrokePenalty
  const finalDiff=finalTotal-h.par
  const metaKey=key+'_meta'
  gs.roundShots[metaKey]={cupIn:true,par:h.par,scoreDiff:finalDiff,totalShots:finalTotal,strokePenalty:gs.cpStrokePenalty>0?gs.cpStrokePenalty:null,obType:gs.cpObType||null,putts:gs.cpPutts}
  saveRound(); closeCupPanel(); renderStrip(); updateInfo(); updateRecBanner()
  openHoleSummary()
}
export function closeCupPanel(){
  const cp=document.getElementById('cupPanel');if(cp)cp.classList.remove('open')
  updateRecBanner()
}

// ============================================================
// レビュー・サマリー
// ============================================================
function _resultCls(r:string|null){return r==='ナイスショット'?'nice':r==='ミスショット'?'miss':r==='ダフり'?'duff':r==='スライス'?'slice':r==='フック'?'hook':''}
function _resultIcon(r:string|null){return r==='ナイスショット'?'👍':r==='ミスショット'?'😤':r==='ダフり'?'⛏':r==='スライス'?'↗':r==='フック'?'↙':''}
export function openHoleSummary(){
  const h=hole();if(!h)return
  const key=holeKey(),shots=curShots(),meta=gs.roundShots[key+'_meta']||{}
  const sd=meta.cupIn?scoreDef(meta.scoreDiff):null
  const totalShots=meta.totalShots||shots.length
  const sc=document.getElementById('hsScore')
  if(sc){if(sd){sc.textContent=sd.name;sc.className=`hs-score-badge ${sd.cls}`}else{sc.textContent='';sc.className='hs-score-badge'}}
  if(sd){
    const puttsText=meta.putts?`　${meta.putts}パット`:''
    const hn=document.getElementById('hsHoleInfo');if(hn)hn.textContent=`H${(h as any).no} PAR${h.par}　${totalShots}打${puttsText}`
  } else {
    const hn=document.getElementById('hsHoleInfo');if(hn)hn.textContent=`H${(h as any).no} PAR${h.par}`
  }
  const sl=document.getElementById('hsShotList')
  if(sl){if(shots.length===0){sl.innerHTML='<div class="hs-no-shots">ショットが記録されていません</div>'}else{sl.innerHTML=shots.map((s:any,i:number)=>{const isPen=s.isPenalty;const nextShot=shots[i+1];const carry=nextShot?Math.round(haversine(s.lat,s.lng,nextShot.lat,nextShot.lng)*1.09361):null;return `<div class="hs-shot-row${isPen?' penalty':''}"><div class="hs-shot-no">${s.no}</div><div class="hs-shot-info"><div class="hs-club">${s.club||'—'} ${s.result?`<span class="hs-result ${_resultCls(s.result)}">${_resultIcon(s.result)} ${s.result}</span>`:''}</div><div class="hs-dists">carry ${s.carry}yd → 残${s.remaining}yd${carry!==null?` → 次まで${carry}yd`:''}</div>${isPen?`<div class="hs-pen-note">⚠️ ペナルティ（→${s.penaltyTarget}打目）${s.obType?' '+s.obType:''}</div>`:''}</div></div>`}).join('')}}
  const scoreKey=key+'_meta',cardData=buildScoreCard(scoreKey)
  const hsCard=document.getElementById('hsScoreCard');if(hsCard)hsCard.innerHTML=cardData
  const p=document.getElementById('holeSummaryPanel');if(p)p.classList.add('open')
}
export function closeHoleSummary(){
  const p=document.getElementById('holeSummaryPanel');if(p)p.classList.remove('open')
  const nextIdx=st.hIdx+1
  if(course()&&nextIdx<totalHoles())selectHole(nextIdx)
}
function buildScoreCard(metaKey:string){
  if(st.gcIdx===null||st.cIdx===null) return ''
  const g=COURSES[st.gcIdx],pairs=isPairRound()
  const coursesToShow=pairs?[{c:g.courses[st.cIdx!],ci:st.cIdx!},{c:g.courses[st.cIdx2!],ci:st.cIdx2!}]:g.courses.map((c,ci)=>({c,ci}))
  const cols=coursesToShow.map(({c,ci})=>{
    const rows=c.holes.map((h,hi)=>{const mk=st.gcIdx+'_'+ci+'_'+hi+'_meta',meta=gs.roundShots[mk]||{};if(meta.cupIn){const sd=scoreDef(meta.scoreDiff);const lbl=meta.scoreDiff===0?'E':meta.scoreDiff>0?`+${meta.scoreDiff}`:String(meta.scoreDiff);return `<tr${mk===metaKey?' class="hs-current-hole"':''}><td class="scp-hole-no">${h.no}H</td><td class="scp-par-val">${h.par}</td><td class="scp-score-cell ${sd.cls}">${meta.totalShots} <small>${lbl}</small></td></tr>`}return `<tr${mk===metaKey?' class="hs-current-hole"':''}><td class="scp-hole-no">${h.no}H</td><td class="scp-par-val">${h.par}</td><td class="scp-score-cell empty">—</td></tr>`}).join('')
    return `<div class="scp-course-col"><div class="scp-course-name">${c.name}</div><table class="scp-table"><thead><tr><th>H</th><th>PAR</th><th>Score</th></tr></thead><tbody>${rows}</tbody></table></div>`
  }).join('')
  return `<div class="scp-courses-wrap">${cols}</div>`
}
export function makeShotIcon(s:any){
  const G=(window as any).google.maps
  // バブル(42px) + 下向き三角ポインター(16px) = 58px
  // アンカーを三角の先端(y=58)に設定 → バルーン吹き出し型
  if(s.isPenalty){
    const label=`→${s.penaltyTarget}打目`
    const w=Math.max(92,label.length*9+24)
    const half=Math.round(w/2)
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="58"><rect x="1" y="1" width="${w-2}" height="42" rx="9" fill="#f59e0b" stroke="#fff" stroke-width="1.5" stroke-dasharray="5 2"/><text x="${half}" y="18" font-size="12" fill="#000" text-anchor="middle" font-family="sans-serif" font-weight="bold">OB（${s.no}打目）</text><text x="${half}" y="34" font-size="12" fill="#000" text-anchor="middle" font-family="sans-serif">${label}</text><polygon points="${half-8},43 ${half+8},43 ${half},58" fill="#f59e0b"/></svg>`
    return {url:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg),scaledSize:new G.Size(w,58),anchor:new G.Point(half,58)}
  }
  const label=`${s.carry}yd→${s.remaining}yd`
  const w=Math.max(96,label.length*8+20)
  const half=Math.round(w/2)
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="58"><rect x="1" y="1" width="${w-2}" height="42" rx="9" fill="#60a5fa" stroke="#fff" stroke-width="1.5"/><text x="${half}" y="18" font-size="14" fill="#000" text-anchor="middle" font-family="sans-serif" font-weight="bold">${s.no}</text><text x="${half}" y="34" font-size="12" fill="#000" text-anchor="middle" font-family="sans-serif">${label}</text><polygon points="${half-8},43 ${half+8},43 ${half},58" fill="#60a5fa"/></svg>`
  return {url:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg),scaledSize:new G.Size(w,58),anchor:new G.Point(half,58)}
}
export function renderShotLayer(){
  clearShotLayer()
  const shots=curShots();if(!shots.length)return
  const h=hole();if(!h)return
  const G=(window as any).google.maps
  const tee=activeTee(h)
  const path=[{lat:tee.lat,lng:tee.lng},...shots.map((s:any)=>({lat:s.lat,lng:s.lng}))]
  gs.shotLines.push(new G.Polyline({path,map:gs.map,strokeColor:'#4caf50',strokeOpacity:.6,strokeWeight:2,icons:[{icon:{path:G.SymbolPath.FORWARD_CLOSED_ARROW,scale:2.5},offset:'100%',repeat:'70px'}]}))
  shots.forEach((s:any)=>{
    const icon=makeShotIcon(s)
    const m=new G.Marker({position:{lat:s.lat,lng:s.lng},map:gs.map,icon,zIndex:50})
    m.addListener('click',openReview)
    gs.shotMarkers.push(m)
  })
}
export function clearShotLayer(){gs.shotMarkers.forEach(m=>m.setMap(null));gs.shotMarkers=[];gs.shotLines.forEach(l=>l.setMap(null));gs.shotLines=[]}
export function toggleReview(){
  const p=document.getElementById('reviewPanel')
  if(p?.classList.contains('open')) closeReview(); else openReview()
}
export function openReview(){
  const h=hole(),key=holeKey(),shots=curShots()
  const meta=gs.roundShots[key+'_meta']||{}
  let titleHtml=h?`H${(h as any)?.no||'?'} PAR${h.par}　${shots.length}打`:'ショット履歴'
  if(meta.cupIn){const sd=scoreDef(meta.scoreDiff);titleHtml+=` <span class="rv-score-badge ${sd.cls}">${sd.name}</span>`}
  const t=document.getElementById('rvTitle');if(t)t.innerHTML=titleHtml
  const rl=document.getElementById('rvList')
  if(rl){if(shots.length===0){rl.innerHTML='<div class="rv-empty">まだショットが記録されていません</div>'}else{rl.innerHTML=shots.map((s:any,i:number)=>`<div class="rv-row"><div class="rv-no">${s.no}</div><div class="rv-info"><div class="rv-club">${s.club||'—'}${s.result?' '+_resultIcon(s.result)+' '+s.result:''}</div><div class="rv-dist">carry ${s.carry}yd 残${s.remaining}yd</div></div><button class="rv-del" onclick="deleteShot(${i})">✕</button></div>`).join('')}}
  const p=document.getElementById('reviewPanel'),o=document.getElementById('reviewOverlay')
  if(p)p.classList.add('open');if(o)o.classList.add('show')
}
export function closeReview(){
  document.getElementById('reviewPanel')?.classList.remove('open')
  document.getElementById('reviewOverlay')?.classList.remove('show')
}
export function deleteShot(i:number){
  const key=holeKey();if(!gs.roundShots[key])return
  gs.roundShots[key].splice(i,1)
  const holeOff=gs.roundShots[key+'_offset']||0
  gs.roundShots[key].forEach((s:any,j:number)=>{s.no=j+1+holeOff})
  if(!gs.roundShots[key].length)delete gs.roundShots[key]
  saveRound();renderShotLayer();renderStrip();openReview();updateInfo();updateRecBanner()
}
export function clearHoleShots(){
  const key=holeKey()
  delete gs.roundShots[key];delete gs.roundShots[key+'_meta']
  delete gs.roundShots[key+'_offset'];delete gs.roundShots[key+'_pendingPenalty']
  saveRound();clearShotLayer();renderStrip();closeReview();updateInfo();updateRecBanner()
}

// ============================================================
// GPS
// ============================================================
export function onGpsBtn(){
  if(gs.gpsActive) stopGPS(); else startGPS()
}
export function recordCurrentGps(){
  if(!navigator.geolocation){alert('GPS非対応');return}
  const btn=document.getElementById('gpsRecBtn');if(btn)btn.textContent='⌛'
  navigator.geolocation.getCurrentPosition(pos=>{
    if(btn)btn.textContent='✏️'
    const ll={lat:pos.coords.latitude,lng:pos.coords.longitude};if(!gs.map)return
    const G=(window as any).google.maps
    if(!gs.gpsMarker)gs.gpsMarker=new G.Marker({position:ll,map:gs.map,title:'現在地',icon:{path:G.SymbolPath.CIRCLE,scale:9,fillColor:'#4a9fd4',fillOpacity:.9,strokeColor:'#fff',strokeWeight:2.5}})
    else gs.gpsMarker.setPosition(ll)
    if(!gs.gpsActive)startGPS()
    updatePendingPos(gs.gpsMarker.getPosition())
    const sp=document.getElementById('shotPanel');if(sp&&!sp.classList.contains('open'))openShotPanelUI()
  },err=>{const b=document.getElementById('gpsRecBtn');if(b)b.textContent='✏️';alert('GPS取得失敗: '+err.message)},{enableHighAccuracy:true,timeout:10000})
}
export function updateGpsRecordBtn(){
  const btn=document.getElementById('gpsRecBtn');if(!btn)return
  const show=!!(hole()&&hasData(hole()));btn.classList.toggle('visible',show)
  if(show&&btn.textContent!=='✏️')btn.textContent='✏️'
}
export function startGPS(){
  if(!navigator.geolocation){alert('GPS非対応');return}
  gs.gpsActive=true; const gb=document.getElementById('gpsBtn');if(gb)gb.classList.add('active')
  const G=(window as any).google.maps
  gs.gpsWatch=navigator.geolocation.watchPosition(pos=>{
    const ll={lat:pos.coords.latitude,lng:pos.coords.longitude};if(!gs.map)return
    if(!gs.gpsMarker)gs.gpsMarker=new G.Marker({position:ll,map:gs.map,title:'現在地',icon:{path:G.SymbolPath.CIRCLE,scale:9,fillColor:'#4a9fd4',fillOpacity:.9,strokeColor:'#fff',strokeWeight:2.5}})
    else gs.gpsMarker.setPosition(ll)
  },err=>{alert('GPS取得失敗: '+err.message);stopGPS()},{enableHighAccuracy:true,maximumAge:3000})
  updateGpsRecordBtn()
}
export function stopGPS(){
  gs.gpsActive=false; const gb=document.getElementById('gpsBtn');if(gb)gb.classList.remove('active')
  if(gs.gpsWatch!==null){navigator.geolocation.clearWatch(gs.gpsWatch);gs.gpsWatch=null}
  if(gs.gpsMarker){gs.gpsMarker.setMap(null);gs.gpsMarker=null};updateGpsRecordBtn()
}

// ============================================================
// 履歴パネル
// ============================================================
export function openHistory(){
  const all:any[]=JSON.parse(localStorage.getItem('golfRounds')||'[]')
  const hl=document.getElementById('histList');if(!hl)return
  hl.innerHTML=all.length?all.map((r:any)=>{
    const hc=Object.keys(r.shots).filter((k:string)=>!k.includes('_meta')).length
    const sc=Object.entries(r.shots).filter(([k])=>!k.includes('_meta')).reduce((a:number,[,v])=>a+(v as any[]).length,0)
    let totalDiff=0,completedHoles=0
    const cells=Array.from({length:9},(_,i)=>{
      const baseKey=Object.keys(r.shots).find((k:string)=>!k.includes('_meta')&&k.endsWith('_'+i))
      const parts=baseKey?baseKey.split('_'):[]
      const metaKey=parts.length>=3?`${parts[0]}_${parts[1]}_${i}_meta`:null
      const meta=metaKey?(r.shots[metaKey]||{}):{}
      if(meta.cupIn){totalDiff+=meta.scoreDiff||0;completedHoles++}
      const sd=meta.cupIn?scoreDef(meta.scoreDiff):null
      const label=sd?(meta.scoreDiff===0?'E':meta.scoreDiff>0?`+${meta.scoreDiff}`:String(meta.scoreDiff)):'—'
      const cellCls=sd?sd.cls:''
      return `<div class="hr-score-cell ${cellCls}"><div class="hn">${i+1}</div><div class="sv">${label}</div></div>`
    }).join('')
    const totalLabel=completedHoles>0?(totalDiff===0?'Even':totalDiff>0?`+${totalDiff}`:String(totalDiff)):'—'
    return `<div class="hist-round" onclick="loadRound('${r.id}')"><div class="hr-title">${r.gcName} ${r.courseName}</div><div class="hr-sub">${r.date}</div><div class="hr-badges"><span class="hr-badge ${hc>0?'has':''}">${hc}ホール</span><span class="hr-badge ${sc>0?'has':''}">${sc}打</span></div><div class="hr-score-grid">${cells}</div><div class="hr-total">合計スコア <strong>${totalLabel}</strong></div></div>`
  }).join('')+'<button class="sp-cancel" style="width:100%;margin-top:10px" onclick="clearAllHistory()">すべて削除</button>'
  :'<div class="hist-empty">まだラウンド記録がありません</div>'
  const p=document.getElementById('histPanel');if(p)p.classList.add('open')
}
export function closeHistory(){const p=document.getElementById('histPanel');if(p)p.classList.remove('open')}
export function loadRound(id:string){
  const all:any[]=JSON.parse(localStorage.getItem('golfRounds')||'[]')
  const r=all.find((x:any)=>x.id===id);if(!r)return
  gs.roundId=r.id;gs.roundShots=r.shots
  closeHistory();renderStrip();renderShotLayer();updateInfo();updateRecBanner()
}
export function clearAllHistory(){if(!confirm('すべての履歴を削除しますか？'))return;localStorage.removeItem('golfRounds');updateBadge();closeHistory()}
export function exportCaddyNotes(){
  const all:any[]=JSON.parse(localStorage.getItem('golfRounds')||'[]')
  if(!all.length){alert('エクスポートするデータがありません');return}
  const json=JSON.stringify({exportedAt:new Date().toISOString(),rounds:all},null,2)
  const blob=new Blob([json],{type:'application/json'}),url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download='caddy_notes.json';a.click();URL.revokeObjectURL(url)
}

// ============================================================
// クラブエディタ
// ============================================================
export function openClubEditor(){
  gs.editingClubs=[...gs.CLUBS]; closeMenu()
  setTimeout(()=>{renderClubEditor();const p=document.getElementById('clubEditorPanel');if(p)p.classList.add('open')},280)
}
export function closeClubEditor(){const p=document.getElementById('clubEditorPanel');if(p)p.classList.remove('open')}
export function renderClubEditor(){
  const count=gs.editingClubs.filter(c=>c!=='').length
  const cc=document.getElementById('ceCount');if(cc)cc.textContent=`${count} / 14本`
  const cb=document.getElementById('ceCountBar') as HTMLElement
  if(cb){cb.style.width=`${(count/14)*100}%`;cb.style.background=count>14?'var(--red)':'var(--gv)'}
  const cs=document.getElementById('ceSlots')
  if(cs) cs.innerHTML=gs.editingClubs.map((c,i)=>c?`<div class="ce-slot filled" onclick="removeClubSlot(${i})">${c}<span class="ce-rm">✕</span></div>`:`<div class="ce-slot empty">—</div>`).join('')
  const cp=document.getElementById('cePresets')
  if(cp) cp.innerHTML=Object.entries(CLUB_PRESETS).map(([cat,clubs])=>`<div class="ce-cat"><div class="ce-cat-label">${cat}</div><div class="ce-cat-clubs">${clubs.map(c=>`<button class="ce-club-btn ${gs.editingClubs.includes(c)?'sel':''}" onclick="toggleClubPreset('${c}')">${c}</button>`).join('')}</div></div>`).join('')
  const ci=document.getElementById('ceOtherInput') as HTMLInputElement;if(ci)ci.value=''
}
export function toggleClubPreset(club:string){
  const idx=gs.editingClubs.findIndex(c=>c===club)
  if(idx!==-1)gs.editingClubs[idx]=''
  else{const ei=gs.editingClubs.findIndex(c=>c==='');if(ei===-1)return;gs.editingClubs[ei]=club}
  gs.editingClubs=sortClubs(gs.editingClubs);renderClubEditor()
}
export function removeClubSlot(i:number){gs.editingClubs[i]='';gs.editingClubs=sortClubs(gs.editingClubs);renderClubEditor()}
export function addOtherClub(){
  const inp=document.getElementById('ceOtherInput') as HTMLInputElement,val=inp?.value.trim()
  if(!val)return; const ei=gs.editingClubs.findIndex(c=>c==='');if(ei===-1){alert('14本が上限です');return}
  gs.editingClubs[ei]=val;gs.editingClubs=sortClubs(gs.editingClubs);renderClubEditor()
}
export function saveClubEditor(){
  if(gs.editingClubs.filter(c=>c!=='').length<1){alert('最低1本は選択してください');return}
  gs.CLUBS=sortClubs([...gs.editingClubs]);saveClubs(gs.CLUBS);closeClubEditor()
}
export function resetClubEditor(){gs.editingClubs=sortClubs([...DEFAULT_CLUBS]);renderClubEditor()}

// ============================================================
// サイドバー
// ============================================================
export function toggleMenu(){
  const p=document.getElementById('menuPanel'),o=document.getElementById('menuOverlay'),b=document.getElementById('hbgBtn')
  const isOpen=p?.classList.contains('open')
  p?.classList.toggle('open',!isOpen);o?.classList.toggle('show',!isOpen);b?.classList.toggle('open',!isOpen)
  if(!isOpen)refreshMenuCourseUI()
}
export function closeMenu(){
  document.getElementById('menuPanel')?.classList.remove('open')
  document.getElementById('menuOverlay')?.classList.remove('show')
  document.getElementById('hbgBtn')?.classList.remove('open')
}
export function buildCourseComboButtonHtml(gcIdx:number,highlight:boolean):string{
  const g=COURSES[gcIdx],n=g.courses.length;if(n<3)return ''
  let html=''
  const pair=(i:number,j:number)=>{
    const sel=highlight&&st.gcIdx===gcIdx&&st.cIdx===i&&st.cIdx2===j?' menu-combo-btn-active':''
    html+=`<button class="menu-combo-btn${sel}" onclick="selectSidebarCourseCombo(${gcIdx},${i},${j})">${g.courses[i].name}×${g.courses[j].name}</button>`
  }
  if(n===3){pair(0,1);pair(1,2);pair(2,0)}
  else{for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)pair(i,j)}
  return html
}
export function refreshMenuCourseUI(){
  if(!gc()){const cw=document.getElementById('courseComboWrap'),cs=document.getElementById('courseSel');if(cw)cw.style.display='none';if(cs)cs.style.display='block';return}
  const n=gc()!.courses.length,cw=document.getElementById('courseComboWrap'),cs=document.getElementById('courseSel')
  if(n>=3){if(cs)cs.style.display='none';if(cw)cw.style.display='block';const btn=document.getElementById('courseComboBtns');if(btn)btn.innerHTML=buildCourseComboButtonHtml(st.gcIdx!,true)}
  else{if(cw)cw.style.display='none';if(cs)cs.style.display='block'}
}
export function roundHasLadiesTeeData(gcIdx:number,cIdx:number,cIdx2:number|null):boolean{
  const h1=COURSES[gcIdx].courses[cIdx].holes,h2=cIdx2!==null?COURSES[gcIdx].courses[cIdx2].holes:[]
  return [...h1,...h2].some(h=>(h as any).tees?.ladies)
}
export function applyRoundCourseState(gcIdx:number,cIdx:number,cIdx2?:number){
  st.gcIdx=gcIdx;st.cIdx=cIdx;st.cIdx2=(typeof cIdx2==='number'&&!isNaN(cIdx2))?cIdx2:null;st.hIdx=0
  gs.roundShots={};gs.roundId='round_'+Date.now()
  const gs2=document.getElementById('gcSel') as HTMLSelectElement;if(gs2)gs2.value=String(gcIdx)
  const cs=document.getElementById('courseSel') as HTMLSelectElement
  if(cs){cs.innerHTML='<option value="">-- コース --</option>';COURSES[gcIdx].courses.forEach((c,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=c.name;cs.appendChild(o)});cs.value=String(cIdx)}
}
export function onGCSel(){
  const s=document.getElementById('gcSel') as HTMLSelectElement;st.gcIdx=s.value===''?null:parseInt(s.value);st.cIdx=null;st.cIdx2=null;st.hIdx=0
  const cs=document.getElementById('courseSel') as HTMLSelectElement,cw=document.getElementById('courseComboWrap'),tr=document.getElementById('sidebarTeeRow')
  if(tr)tr.style.display='none';if(cs)cs.innerHTML='<option value="">-- コース --</option>'
  if(!gc()){if(cw)cw.style.display='none';if(cs)cs.style.display='block';gs.roundShots={};gs.roundId='round_'+Date.now();renderStrip();loadHole();updateHoleNavBtns();return}
  const n=gc()!.courses.length
  if(n>=3){if(cs)cs.style.display='none';if(cw)cw.style.display='block';const btn=document.getElementById('courseComboBtns');if(btn)btn.innerHTML=buildCourseComboButtonHtml(st.gcIdx!,true)}
  else{if(cw)cw.style.display='none';if(cs)cs.style.display='block';gc()!.courses.forEach((c,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=c.name;cs!.appendChild(o)})}
  gs.roundShots={};gs.roundId='round_'+Date.now();renderStrip();loadHole();updateHoleNavBtns()
}
export function onCourseSel(){
  const s=document.getElementById('courseSel') as HTMLSelectElement;st.cIdx=s.value===''?null:parseInt(s.value);st.cIdx2=null;st.hIdx=0
  const tr=document.getElementById('sidebarTeeRow');if(tr)tr.style.display='none'
  if(st.gcIdx!==null&&st.cIdx!==null&&roundHasLadiesTeeData(st.gcIdx,st.cIdx,null)){if(tr)tr.style.display='block';renderStrip();loadHole();updateHoleNavBtns();return}
  st.teeType='regular';renderStrip();loadHole();updateHoleNavBtns();closeMenu()
}
export function selectSidebarCourseCombo(gcIdx:number,cIdx:number,cIdx2:number){
  applyRoundCourseState(gcIdx,cIdx,cIdx2)
  const btn=document.getElementById('courseComboBtns');if(btn)btn.innerHTML=buildCourseComboButtonHtml(gcIdx,true)
  const tr=document.getElementById('sidebarTeeRow');if(tr)tr.style.display='none'
  if(roundHasLadiesTeeData(gcIdx,cIdx,cIdx2)){if(tr)tr.style.display='block';renderStrip();loadHole();updateHoleNavBtns();return}
  st.teeType='regular';renderStrip();loadHole();updateHoleNavBtns();closeMenu()
}
export function sidebarSelectTee(teeType:string){
  st.teeType=teeType; const tr=document.getElementById('sidebarTeeRow');if(tr)tr.style.display='none'
  renderStrip();loadHole();updateHoleNavBtns();closeMenu()
}

// ============================================================
// ホールストリップ
// ============================================================
export function renderStrip(){
  sanitizeRoundState(); const strip=document.getElementById('holeStrip');if(!strip)return
  if(!course()){strip.innerHTML='';updateHoleNavBtns();return}
  const total=totalHoles(); let html=''
  for(let i=0;i<total;i++){
    const pair=isPairRound(),eCIdx=pair&&i>=9?st.cIdx2!:st.cIdx!,eHIdx=pair&&i>=9?i-9:i
    const h=COURSES[st.gcIdx!].courses[eCIdx].holes[eHIdx],key=st.gcIdx+'_'+eCIdx+'_'+eHIdx
    const shots=gs.roundShots[key]||[],meta=gs.roundShots[key+'_meta']||{}
    let badge=''
    if(meta.cupIn){const s=meta.totalShots||(meta.par+(meta.scoreDiff||0)),diff=s-meta.par,sd=scoreDef(diff),lbl=diff===0?'E':diff>0?'+'+diff:String(diff);badge=`<span class="sbadge ${sd.cls}">${lbl}</span>`}
    else if(shots.length)badge=`<span class="sbadge cupin">${shots.length}打</span>`
    const active=i===st.hIdx?'active':'',nodata=!hasData(h)?'no-data':'',dn=pair?(i+1):(h as any).no
    html+=`<button class="h-btn ${active} ${nodata}" onclick="selectHole(${i})">${dn}H<span class="par">PAR${h.par}</span>${badge}</button>`
  }
  strip.innerHTML=html; updateHoleNavBtns()
}
export function selectHole(i:number){closeMenu();st.hIdx=i;renderStrip();loadHole();closeReview()}
export function prevHole(){if(!course()||st.hIdx<=0)return;selectHole(st.hIdx-1)}
export function nextHole(){if(!course()||st.hIdx>=totalHoles()-1)return;selectHole(st.hIdx+1)}
export function updateHoleNavBtns(){
  const nav=document.getElementById('holeNavBtns');if(!nav)return
  if(!course()){nav.style.display='none';return}
  nav.style.display='flex'
  const prev=document.getElementById('prevHoleBtn') as HTMLButtonElement,next=document.getElementById('nextHoleBtn') as HTMLButtonElement
  if(prev)prev.disabled=st.hIdx<=0; if(next)next.disabled=st.hIdx>=totalHoles()-1
}

// ============================================================
// モード
// ============================================================
export function setMode(m:string){
  gs.appMode=m
  document.getElementById('tabMeasure')?.classList.toggle('active',m==='measure')
  document.getElementById('tabRecord')?.classList.toggle('active',m==='record')
  clearMeasure();clearPending();updateInfo();updateRecBanner();updateCupBtn();updateGpsRecordBtn()
  if(gs.strategyActive){renderStrategyLayer();_updateStrategyUI()}
}
export function updateInfo(){
  const h=hole(),n=curShots().length+1
  const teeDef=TEE_TYPES.find(t=>t.key===st.teeType)||TEE_TYPES[0]
  let courseTag=''
  if(isPairRound()&&st.gcIdx!==null){const eCIdx=st.hIdx>=9?st.cIdx2!:st.cIdx!;courseTag=` <span style="color:var(--gr);font-size:9px">[${COURSES[st.gcIdx].courses[eCIdx].name}]</span>`}
  const el=document.getElementById('modeInfo');if(!el)return
  if(gs.appMode==='measure')el.innerHTML=h&&hasData(h)?`<strong>H${(h as any).no} PAR${h.par}</strong> ${teeDef.icon}${courseTag} タップ → ティーからの距離＋残り距離`:'コースを選択'
  else el.innerHTML=h&&hasData(h)?`<strong class="rec">🏌️ 記録</strong> ${teeDef.icon}${courseTag} ${n}打目 — 落下地点をタップ`:'座標未登録'
}
export function updateRecBanner(){
  const banner=document.getElementById('recBanner');if(!banner)return
  if(gs.appMode!=='record'||!hole()||!hasData(hole())||document.getElementById('shotPanel')?.classList.contains('open')){banner.style.display='none';return}
  const shots=curShots(),holeOff=gs.roundShots[holeKey()+'_offset']||0,n=shots.length+1+holeOff
  const from=shots.length===0?'ティーから':shots[shots.length-1].no+'打目から'
  banner.textContent=n+'打目 — '+from+'の落下地点をタップ'; banner.style.display='block'
}
export function updateCupBtn(){
  const btn=document.getElementById('cupBtn');if(btn)btn.style.display=(gs.appMode==='record'&&hole()&&hasData(hole()))?'block':'none'
}

// ============================================================
// スコアカードパネル
// ============================================================
export function openScorecard(){
  const body=document.getElementById('scpBody');if(body)body.innerHTML=gc()?buildFullScorecard():'<div class="scp-no-course">コースを選択してください</div>'
  const p=document.getElementById('scorecardPanel');if(p)p.classList.add('open'); closeMenu()
}
export function closeScorecard(){const p=document.getElementById('scorecardPanel');if(p)p.classList.remove('open')}
export function buildFullScorecard():string{
  const g=gc()!
  const coursesToShow=isPairRound()?[{c:g.courses[st.cIdx!],ci:st.cIdx!},{c:g.courses[st.cIdx2!],ci:st.cIdx2!}]:g.courses.map((c,ci)=>({c,ci}))
  let grandTotalPar=0,grandTotalScore=0,grandTotalDiff=0,grandAny=false
  const cols=coursesToShow.map(({c,ci})=>{
    const holes=c.holes; let totalPar=0,totalScore=0,totalDiff=0,anyScore=false
    const rows=holes.map((h,hi)=>{
      const metaKey=st.gcIdx+'_'+ci+'_'+hi+'_meta',meta=gs.roundShots[metaKey]||{}
      totalPar+=h.par
      if(meta.cupIn){anyScore=true;const s=meta.totalShots||(meta.par+(meta.scoreDiff||0)),diff=s-meta.par,sd=scoreDef(diff),lbl=diff===0?'E':diff>0?`+${diff}`:String(diff);totalScore+=s;totalDiff+=diff;return `<tr><td class="scp-hole-no">${h.no}H</td><td class="scp-par-val">${h.par}</td><td class="scp-score-cell ${sd.cls}">${s} <small>${lbl}</small></td></tr>`}
      return `<tr><td class="scp-hole-no">${h.no}H</td><td class="scp-par-val">${h.par}</td><td class="scp-score-cell empty">—</td></tr>`
    }).join('')
    grandTotalPar+=totalPar; if(anyScore){grandAny=true;grandTotalScore+=totalScore;grandTotalDiff+=totalDiff}
    const totLbl=totalDiff===0?'E':totalDiff>0?`+${totalDiff}`:String(totalDiff)
    const totCell=anyScore?`${totalScore} <small>${totLbl}</small>`:'—'
    return `<div class="scp-course-col"><div class="scp-course-name">${c.name}</div><table class="scp-table"><thead><tr><th>H</th><th>PAR</th><th>Score</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="scp-total-row"><td>合計</td><td>${totalPar}</td><td>${totCell}</td></tr></tfoot></table></div>`
  }).join('')
  const grandLbl=grandTotalDiff===0?'E':grandTotalDiff>0?`+${grandTotalDiff}`:String(grandTotalDiff)
  const diffCls=grandTotalDiff===0?'even':grandTotalDiff>0?'plus':'minus'
  const grandHtml=coursesToShow.length>=2?`<div class="scp-grand"><div class="scp-grand-label">🏆 トータル<br>PAR ${grandTotalPar}</div><div><span class="scp-grand-val">${grandAny?grandTotalScore:'—'}</span>${grandAny?`<span class="scp-grand-diff ${diffCls}">${grandLbl}</span>`:''}</div></div>`:''
  return `<div class="scp-gc-name">⛳ ${g.name}</div><div class="scp-courses-wrap">${cols}</div>${grandHtml}`
}

// ============================================================
// インラインコース選択
// ============================================================
export function emSelectPref(pref:string){
  const gcs:{name:string;idx:number}[]=[]; COURSES.forEach((c,i)=>{if(c.pref===pref)gcs.push({name:c.name,idx:i})})
  const el=document.getElementById('emGcBtns');if(el)el.innerHTML=gcs.map(g=>`<button class="em-gc-btn" onclick="emSelectGc(${g.idx})">${g.name}</button>`).join('')
  document.getElementById('emStepPref')!.style.display='none'; document.getElementById('emStepGc')!.style.display='flex'
}
export function emBackToPref(){document.getElementById('emStepGc')!.style.display='none';document.getElementById('emStepPref')!.style.display='flex'}
export function emSelectGc(gcIdx:number){
  gs._emSelectedGcIdx=gcIdx; const g=COURSES[gcIdx]; let html=''
  if(g.courses.length>=3){
    if(g.courses.length===3){([[0,1],[1,2],[2,0]] as [number,number][]).forEach(([i,j])=>{html+=`<button class="em-course-btn" onclick="emSelectCourse(${gcIdx},${i},${j})">${g.courses[i].name}×${g.courses[j].name}</button>`})}
    else{for(let i=0;i<g.courses.length;i++)for(let j=i+1;j<g.courses.length;j++)html+=`<button class="em-course-btn" onclick="emSelectCourse(${gcIdx},${i},${j})">${g.courses[i].name}×${g.courses[j].name}</button>`}
  }else html=g.courses.map((c,ci)=>`<button class="em-course-btn" onclick="emSelectCourse(${gcIdx},${ci})">${c.name}</button>`).join('')
  const el=document.getElementById('emCourseBtns');if(el)el.innerHTML=html
  document.getElementById('emStepGc')!.style.display='none'; document.getElementById('emStepCourse')!.style.display='flex'
}
export function emBackToGc(){document.getElementById('emStepCourse')!.style.display='none';document.getElementById('emStepGc')!.style.display='flex'}
export function emSelectCourse(gcIdx:number,cIdx:number,cIdx2?:number){
  applyRoundCourseState(gcIdx,cIdx,cIdx2)
  if(roundHasLadiesTeeData(gcIdx,cIdx,st.cIdx2)){document.getElementById('emStepCourse')!.style.display='none';document.getElementById('emStepTee')!.style.display='flex'}
  else{st.teeType='regular';emResetSelector();renderStrip();loadHole();updateHoleNavBtns()}
}
export function emBackToCourse(){document.getElementById('emStepTee')!.style.display='none';document.getElementById('emStepCourse')!.style.display='flex'}
export function emSelectTee(teeType:string){st.teeType=teeType;emResetSelector();renderStrip();loadHole();updateHoleNavBtns()}
export function emResetSelector(){
  document.getElementById('emStepPref')!.style.display='flex'
  document.getElementById('emStepGc')!.style.display='none'
  document.getElementById('emStepCourse')!.style.display='none'
  document.getElementById('emStepTee')!.style.display='none'
  gs._emSelectedGcIdx=null
}

// ============================================================
// 過去記録オーバーレイ（strategy）
// ============================================================
const ST_STATE_KEY = 'golfStrategyState'

export function openStrategySelector(){
  const wrap=document.getElementById('stDeactivateWrap')
  if(wrap)wrap.style.display=gs.strategyActive?'block':'none'
  document.getElementById('strategyPanel')?.classList.add('open')
  setStrategySourceTab(gs.strategySource)
  closeMenu()
}
export function closeStrategySelector(){
  document.getElementById('strategyPanel')?.classList.remove('open')
}
export function setStrategySourceTab(src:string){
  gs.strategySource=src
  document.getElementById('stTabLocal')?.classList.toggle('active',src==='local')
  document.getElementById('stTabJson')?.classList.toggle('active',src==='json')
  _populateStrategyRoundList()
}
function _populateStrategyRoundList(){
  const list=document.getElementById('stRoundList');if(!list)return
  list.innerHTML='<div class="st-loading">読み込み中...</div>'
  if(gs.strategySource==='local'){
    const all:any[]=JSON.parse(localStorage.getItem('golfRounds')||'[]')
    if(!all.length){list.innerHTML='<div class="st-empty">ローカル履歴がありません<br>先にラウンドを記録してください</div>';return}
    list.innerHTML=all.map((r:any)=>{
      const hc=Object.keys(r.shots).filter((k:string)=>k.indexOf('_meta')===-1&&(r.shots[k] as any[]).length>0).length
      const isOn=gs.strategyActive&&gs.strategyRoundId===r.id
      return `<div class="st-round-item${isOn?' active':''}" onclick="activateStrategyLocal('${r.id}')"><div class="st-round-title">${r.gcName}</div><div class="st-round-sub">${r.courseName}・${r.date}・${hc}H記録</div>${isOn?'<span class="st-on-badge">表示中</span>':''}</div>`
    }).join('')
  }
}
export function activateStrategyLocal(roundId:string){
  const all:any[]=JSON.parse(localStorage.getItem('golfRounds')||'[]')
  const r=all.find((x:any)=>x.id===roundId);if(!r)return
  _applyLocalRound(r,true)
}
function _applyLocalRound(r:any,closePanel:boolean){
  const shotKeys=Object.keys(r.shots).filter((k:string)=>k.indexOf('_meta')===-1)
  if(!shotKeys.length){alert('このラウンドにはショットデータがありません');return}
  gs.strategyCourseData={}
  shotKeys.forEach((k:string)=>{
    const parts=k.split('_');if(parts.length<3)return
    const cIdx=parseInt(parts[1]),hIdx=parseInt(parts[2])
    if(!gs.strategyCourseData[cIdx])gs.strategyCourseData[cIdx]={}
    gs.strategyCourseData[cIdx][hIdx]=r.shots[k]||[]
  })
  gs.strategyGcIdx=parseInt(shotKeys[0].split('_')[0])
  gs.strategyRoundId=r.id; gs.strategySource='local'; gs.strategyActive=true
  clearMeasure();clearPending();updateInfo();updateRecBanner();updateCupBtn()
  renderStrategyLayer(); _saveStrategyState(); _updateStrategyUI()
  if(closePanel)closeStrategySelector()
}
export function deactivateStrategy(){
  gs.strategyActive=false; gs.strategyCourseData={}; gs.strategyGcIdx=null
  clearStrategyLayer(); _saveStrategyState(); _updateStrategyUI(); setMode('measure')
}
function _saveStrategyState(){
  if(!gs.strategyActive){localStorage.removeItem(ST_STATE_KEY);return}
  localStorage.setItem(ST_STATE_KEY,JSON.stringify({active:true,source:gs.strategySource,roundId:gs.strategyRoundId}))
}
export function renderStrategyLayer(){
  clearStrategyLayer()
  if(!gs.strategyActive||!gs.map)return
  const h=hole();if(!h||!hasData(h)){_updateStrategyUI();return}
  if(gs.strategyGcIdx!==null&&gs.strategyGcIdx!==st.gcIdx){_updateStrategyUI();return}
  const cData=gs.strategyCourseData[st.cIdx!]||{}
  const shots=(cData[isPairRound()&&st.hIdx>=9?st.hIdx-9:st.hIdx])||[]
  const validShots=shots.filter((s:any)=>s.lat&&s.lng)
  if(!validShots.length){_updateStrategyUI();return}
  const G=(window as any).google.maps
  const teePos=activeTee(h)
  const path=[{lat:teePos.lat,lng:teePos.lng},...validShots.map((s:any)=>({lat:s.lat,lng:s.lng}))]
  const line=new G.Polyline({path,map:gs.map,strokeColor:'#f59e0b',strokeOpacity:.8,strokeWeight:2.5,icons:[{icon:{path:G.SymbolPath.FORWARD_CLOSED_ARROW,scale:2.5},offset:'100%',repeat:'70px'}],zIndex:45})
  gs.strategyLines.push(line)
  validShots.forEach((s:any)=>{
    const lbl=(s.club||'?')+' '+s.carry+'yd'
    const w=Math.max(80,lbl.length*7+14),half=Math.round(w/2)
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="52"><circle cx="${half}" cy="14" r="12" fill="#f59e0b" stroke="#fff" stroke-width="1.5"/><text x="${half}" y="18" font-size="11" fill="#000" text-anchor="middle" font-family="sans-serif" font-weight="bold">${s.no}</text><line x1="${half}" y1="26" x2="${half}" y2="52" stroke="#f59e0b" stroke-width="1.5"/><text x="${half}" y="47" font-size="9" fill="#f59e0b" text-anchor="middle" font-family="sans-serif">${lbl}</text></svg>`
    const marker=new G.Marker({position:{lat:s.lat,lng:s.lng},map:gs.map,icon:{url:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg),scaledSize:new G.Size(w,52),anchor:new G.Point(half,14)},zIndex:40,clickable:false})
    gs.strategyMarkers.push(marker)
  })
  _updateStrategyUI()
}
export function clearStrategyLayer(){
  gs.strategyMarkers.forEach(m=>m.setMap(null));gs.strategyMarkers=[]
  gs.strategyLines.forEach(l=>l.setMap(null));gs.strategyLines=[]
}
function _updateStrategyUI(){
  const banner=document.getElementById('strategyBanner');if(!banner)return
  if(!gs.strategyActive){banner.style.display='none';return}
  if(gs.strategyGcIdx!==null&&gs.strategyGcIdx!==st.gcIdx){banner.style.display='none';return}
  const cData=gs.strategyCourseData[st.cIdx!]||{}
  const shots=(cData[isPairRound()&&st.hIdx>=9?st.hIdx-9:st.hIdx])||[]
  if(!shots.length){banner.style.display='none';return}
  const h=hole(),hName=h?`H${(h as any).no} PAR${h.par}`:''
  banner.textContent=`📍 ${hName} — 過去${shots.length}打の記録を表示中`
  banner.style.display='block'
}
export function restoreStrategyState(){
  try{
    const saved=JSON.parse(localStorage.getItem(ST_STATE_KEY)||'null')
    if(!saved||!saved.active)return
    gs.strategySource=saved.source||'local'; gs.strategyRoundId=saved.roundId||null
    if(gs.strategySource==='local'){
      const all:any[]=JSON.parse(localStorage.getItem('golfRounds')||'[]')
      const r=all.find((x:any)=>x.id===gs.strategyRoundId)
      if(r)_applyLocalRound(r,false)
    }
  }catch{/* ignore corrupt localStorage */}
}
