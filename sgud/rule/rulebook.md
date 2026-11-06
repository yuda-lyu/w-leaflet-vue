# 規則帳本

本檔為套件設計與開發階段之規則帳本(藍圖),為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.當前已做到哪些記於`sgud/state/state.md`.過長時依類型拆為`rulebook_<類型>.md`,本檔只留索引.

## 層級(zoom)

### Z1 層級範圍只有一個出處

- 規則:地圖可達之層級範圍與元件對 `opt.zoom` 之正規化範圍,皆取自 `src/js/normalizeZoom.mjs` 之 `zoomRange`(凍結物件,目前 1～18).`l-map` 以 `:min-zoom="zoomRange.min"`、`:max-zoom="zoomRange.max"` 取得範圍,`changeOpt` 以 `normalizeZoom` 夾值;不得在他處另寫層級範圍字面值或另行夾值.
- 理由:地圖事件會把層級寫回 `opt.zoom`,`changeOpt` 再正規化並套回地圖;若地圖可達之層級落在正規化範圍外,使用者縮放會被拉回(例:地圖可到第 0 級,而 `ispint(0)` 為假,第 0 級被改成預設 7).不變式:地圖可達之每一層級 z,`normalizeZoom(z) === z`.
- 盤點指令:`Grep "min-zoom|max-zoom|minZoom|maxZoom|normalizeZoom|zoomRange" src`(站點全集如下);另 `Grep "mapObject\.(setView|setZoom|fitBounds|flyTo|setMinZoom|setMaxZoom)" src` 確認程式內無改變層級範圍之呼叫(判準:僅 `changeOpt` 內已註解停用之 `mapObject.setZoom` 一處,其餘應無命中).
- 站點與判準:

| 站點 | 判準 |
|---|---|
| `WLeafletVue.vue` 之 `l-map` 屬性 `:min-zoom`、`:max-zoom` | 已套(綁 `zoomRange`) |
| `WLeafletVue.vue` 之 `changeOpt` 層級段 | 已套(`normalizeZoom`) |
| `WLeafletVue.vue` 之 `updateZoom` | 刻意不夾:寫回地圖實際層級,範圍由地圖限制 |
| `WLeafletVue.vue` 之 `mapObject.panTo` | 刻意不套:不改層級 |

- 對應測試:`test/unit-zoom.test.mjs` 之「地圖可達層級與元件正規化一致」(接線以原始碼文字比對,屬盤點性質);指令 `node node_modules/mocha/bin/mocha.js --no-parallel test/unit-zoom.test.mjs --timeout 60000`.行為層以真瀏覽器驗證:自第 1 級縮小、自第 18 級放大(按鈕與滾輪各一)皆不改變層級.

### Z2 `opt.zoom` 非正整數取預設 7

- 規則:`opt.zoom` 非正整數(含 0、負數、小數、`null`、非數值)取預設 7(`zoomDef`).
- 對應測試:`test/unit-zoom.test.mjs` 之「normalizeZoom: 非正整數取預設值」.

### Z3 `opt.zoom` 超出範圍夾至邊界

- 規則:`opt.zoom` 為正整數且超出 `zoomRange` 時夾至邊界(如 25 → 18).
- 對應測試:`test/unit-zoom.test.mjs` 之「normalizeZoom: 夾於可用範圍」.

### 已知限制

- 層級範圍改動須同步調整本節與測試;`zoomRange` 為凍結物件,改範圍只改 `normalizeZoom.mjs` 一處.
- `src/js/normalizeZoom.mjs` 為內部模組,註解不用 JSDoc 形式(`.jsdoc` 之 `includePattern` 含 `.mjs`,JSDoc 會被併入對外文件).
