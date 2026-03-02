# 07 - GeoJSON 圖層 (geojsonSets)

## 1. 資料結構

### GeoJSON 集合 (geojsonSet)

| 屬性 | 型別 | 預設值 | 說明 |
|------|------|--------|------|
| `title` | `String` | `''` | 集合標題 |
| `msg` | `String` | `''` | 集合說明 |
| `order` | `Number` | `null` | 排序用數字 |
| `lineColor` | `String` | `'rgba(0,150,255,1)'` | 框線顏色 |
| `lineColorHover` | `String` | 同 lineColor | 滑鼠移入框線顏色 |
| `lineWidth` | `Number` | `3` | 框線寬度 |
| `lineWidthHover` | `Number` | 同 lineWidth | 滑鼠移入框線寬度 |
| `fillColor` | `String` | `'rgba(0,150,255,0.25)'` | 填充顏色 |
| `fillColorHover` | `String` | 同 fillColor | 滑鼠移入填充顏色 |
| `geojson` | `Object` | `{}` | GeoJSON 資料物件 |
| `visible` | `Boolean` | `true` | 是否顯示 |

---

## 2. GeoJSON 解析

- 從 `geojson.features` 提取 MultiPolygon 的 coordinates
- 組合為 `latLngs` 陣列供後續使用

```js
each(features, (feature) => {
    if (feature.geometry.type === 'MultiPolygon') {
        latLngs = [...latLngs, ...feature.geometry.coordinates]
    }
})
```

---

## 3. 樣式

### 一般樣式

```js
{
    fillColor,
    fillOpacity: 1,
    color: lineColor,
    weight: lineWidth
}
```

### Hover 樣式（特殊處理）

由於 GeoJSON 的滑鼠進出偵測不夠平滑，會過多觸發導致閃爍，故 hover 樣式採用固定色：

```js
{
    ...style,
    fillColor: 'rgba(250,150,255,0.25)',
    color: 'rgba(250,150,255,1)'
}
```

---

## 4. 渲染

使用自訂子組件 `LwGeoJson`：

```html
<LwGeoJson
    :geojson="geojsonSet.geojson"
    :wrapStyle="geojsonSet.style"
    :wrapStyleHover="geojsonSet.styleHover"
    @click="clickGeojson"
/>
```

---

## 5. 事件

| 屬性 | 路徑 | 說明 |
|------|------|------|
| `geojsonSetsClick` | `opt.geojsonSetsClick` | 全域 GeoJSON 點擊回呼 |

回呼參數（透過 `parseGeojsonData`）：

```js
{
    ev,           // 原始事件
    lat,          // 點擊位置緯度
    lng,          // 點擊位置經度
    latLngs,      // GeoJSON 座標資料
    geojsonSet,   // 當前 GeoJSON 集合
    kgeojsonSet,  // 集合索引
    geojsonSets   // 所有集合
}
```

---

## 6. 插槽

| 插槽名稱 | 作用域 | 說明 |
|----------|--------|------|
| `geojson-tooltip` | `{ geojsonSet, geojsonSets }` | 自訂 Tooltip |
| `geojson-popup` | `{ geojsonSet, geojsonSets }` | 自訂 Popup |
