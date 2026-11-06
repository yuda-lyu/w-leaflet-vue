# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.過長時抽出舊者為`experience_<年月日>.md`,並於本檔註明何時抽出.

## 層級(zoom)

- **地圖層級範圍取自圖層**:`l-map` 未給 `minZoom`、`maxZoom` 時,Leaflet 的 `getMinZoom()`/`getMaxZoom()` 取自圖層(圖層 `minZoom` 預設 0,`TileLayer` 的 `maxZoom` 預設 18);沒有任何底圖時 `getMaxZoom()` 為 `Infinity`.真瀏覽器實測有底圖時為 0～18.一旦 `options.minZoom`/`options.maxZoom` 有值,即覆蓋圖層值.
- **寫回迴路**:vue2-leaflet 於 `moveend` 後(debounce 100ms)發出 `update:zoom`;元件在 `updateZoom` 寫回 `opt.zoom` 與內部 `zoom`,`changeOpt` 再正規化後套回地圖.地圖與正規化的範圍任何不一致,都會讓使用者縮放被拉回(實測:自第 1 級再縮小一次,地圖落在第 7 級而非第 0 級,`opt.zoom` 同為 7).上限不受影響:地圖上限 18 與正規化上限 18 一致,放大到 18 後再放大停在 18.
- **wsemi `ispint` 是「正整數」**:`ispint(0)` 為假,`ispint(Infinity)` 為真(不建議鎖進測試,屬套件實作細節).
- **真瀏覽器取元件實例**:`document.querySelector('.leaflet-container').__vue__` 為 `LMap`(其 `mapObject` 即 Leaflet 地圖),其 `parentElement.__vue__` 為 `WLeafletVue`(可讀 `opt`、`zoom`).縮放按鈕為 `.leaflet-control-zoom-in`/`-out`,到達邊界時帶 `leaflet-disabled`(Playwright 以 `force: true` 點擊).每步等待約 900ms 讓動畫與 debounce 結束再取值.
- **以 Playwright 探測時**:擋掉非本機請求(底圖磁磚)即可,層級邊界取自圖層設定而非磁磚載入;`vue-cli-service serve --port <≥8000> --host 127.0.0.1` 以 detached 背景行程啟動,結束時以 `taskkill /F /T /PID` 終止並以 `netstat` 回驗埠已釋放.
- **共用單例放進 Vue 2 `data`**:會被 Vue 加上響應式 getter/setter(多個實例共用);模組層級的常數物件先 `Object.freeze`(Vue 2 的 `observe` 跳過不可擴充物件).
- **變異測試不動 repo**:於 `./tmp/<案名>/mut/<編號>/` 複製被測檔與測試檔,在副本上套用字串變異並以 mocha 跑副本測試(`wsemi` 等依賴由 repo 根 `node_modules` 向上解析);變異字串須恰出現一次,否則腳本報錯.
- **接線以原始碼文字比對的測試**:脆弱處為標籤截斷、引號與逗號寫法;擷取 `l-map` 開頭標籤時以「雙引號外的第一個 `>`」截斷,並先剝除模板註解.改寫模板屬性寫法時需同步檢查此測試.
