# 狀態

- Vue 2 地圖元件 `src/components/WLeafletVue.vue`(Leaflet 1.9、vue2-leaflet 2.7):底圖、點、線、面、等值線、影像等圖層與面板.
- 測試:
  - `test/all.test.mjs` 只有佔位案.
  - `test/unit-zoom.test.mjs`(24 條):層級正規化(`src/js/normalizeZoom.mjs`)與地圖層級範圍接線,對應規則帳本 Z1～Z3.以 `npm test` 執行.
  - 無行為層(真瀏覽器)之自動回歸測試;縮放行為以真瀏覽器手動探測驗證,探測腳本未保留於 repo.
- 層級(zoom):
  - 可用範圍 1～18,唯一出處為 `src/js/normalizeZoom.mjs` 之 `zoomRange`;同一份範圍同時給地圖(`l-map` 之 `min-zoom`、`max-zoom`)與 `changeOpt` 之正規化.使用者縮放(按鈕、滾輪)到達 1 或 18 即停止,縮放按鈕呈 disabled,不被拉回.
  - `opt.zoom`、`opt.center` 由地圖事件寫回(`updateZoom`、`updateCenter`),寫回行為未變;`opt.zoom` 非正整數取預設 7,超出範圍夾至邊界.
- 已知缺口:
  - 未防護之同家族入口(讀碼推論,未實測):外部以 `getMapObject()` 取得地圖後改成可達非正整數層級(如 `zoomSnap` 設小數、`setMinZoom(0)`),`updateZoom` 仍會原樣寫回 `opt.zoom`,再被正規化拉回.不在已修範圍.
- 最近一次驗證:`package.json` 版本 1.1.15 之工作樹(未發布);`npm test` 全綠,縮放行為以真瀏覽器驗證(下限停 1、上限停 18、無彈回).
