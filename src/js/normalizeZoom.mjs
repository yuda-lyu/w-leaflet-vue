import ispint from 'wsemi/src/ispint.mjs'


//預設顯示層級(內部用, 不用JSDoc以免被併入對外文件)
let zoomDef = 7


//顯示層級可用範圍(含邊界), 凍結避免被Vue data觀察與被誤改
//地圖與元件內部正規化皆取自此處, 範圍只有一個出處: 地圖(l-map)以此限制使用者可達之層級, normalizeZoom以此夾值外部給予之層級
let zoomRange = Object.freeze({
    min: 1,
    max: 18,
})


//正規化顯示層級(內部用)
//v: 輸入層級
//range: 可用範圍物件, 欄位min為最小層級, max為最大層級, 預設zoomRange
//回傳介於range.min~range.max之層級, 非正整數時取zoomDef(再夾於range)
function normalizeZoom(v, range = zoomRange) {

    //非正整數取預設值
    if (!ispint(v)) {
        v = zoomDef
    }

    //夾於可用範圍
    return Math.min(Math.max(v, range.min), range.max)
}


export { zoomDef, zoomRange }
export default normalizeZoom
