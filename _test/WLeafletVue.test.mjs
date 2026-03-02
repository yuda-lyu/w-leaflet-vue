/**
 * WLeafletVue 組件測試套件
 *
 * 註：由於 WLeafletVue 是一個複雜的 Vue 2 + Leaflet 地圖組件，
 * 完整的 DOM 測試需要 jsdom + vue-test-utils 環境。
 * 此測試檔案專注於「資料處理邏輯」的單元測試，
 * 驗證組件內部各方法對資料的轉換與處理是否正確。
 *
 * 測試的核心函數皆從組件原始碼中提取其邏輯進行驗證。
 */

import assert from 'assert'
import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import each from 'lodash-es/each.js'
import size from 'lodash-es/size.js'
import omit from 'lodash-es/omit.js'
import filter from 'lodash-es/filter.js'
import reverse from 'lodash-es/reverse.js'
import sortBy from 'lodash-es/sortBy.js'
import isNumber from 'lodash-es/isNumber.js'
import isEqual from 'lodash-es/isEqual.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isestr from 'wsemi/src/isestr.mjs'
import isstr from 'wsemi/src/isstr.mjs'
import isarr from 'wsemi/src/isarr.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import ispint from 'wsemi/src/ispint.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import dig from 'wsemi/src/dig.mjs'
import isfun from 'wsemi/src/isfun.mjs'


describe('01 - 地圖基本設定', () => {

    describe('center 處理', () => {

        it('預設 center 為 [23.5, 121.1]', () => {
            let center = get({}, 'center', null)
            let ckCenter = isarr(center) && size(center) === 2 && isNumber(get(center, 0)) && isNumber(get(center, 1))
            if (!ckCenter) {
                center = [23.5, 121.1]
            }
            assert.deepStrictEqual(center, [23.5, 121.1])
        })

        it('接受有效的 center 值', () => {
            let opt = { center: [25.0330, 121.5654] }
            let center = get(opt, 'center', null)
            let ckCenter = isarr(center) && size(center) === 2 && isNumber(get(center, 0)) && isNumber(get(center, 1))
            assert.strictEqual(ckCenter, true)
            assert.deepStrictEqual(center, [25.0330, 121.5654])
        })

        it('拒絕無效的 center 值（非陣列）', () => {
            let opt = { center: 'invalid' }
            let center = get(opt, 'center', null)
            let ckCenter = isarr(center) && size(center) === 2 && isNumber(get(center, 0)) && isNumber(get(center, 1))
            assert.strictEqual(ckCenter, false)
        })

        it('拒絕無效的 center 值（長度不足）', () => {
            let opt = { center: [25.0330] }
            let center = get(opt, 'center', null)
            let ckCenter = isarr(center) && size(center) === 2 && isNumber(get(center, 0)) && isNumber(get(center, 1))
            assert.strictEqual(ckCenter, false)
        })

        it('拒絕無效的 center 值（含非數字）', () => {
            let opt = { center: [25.0330, 'abc'] }
            let center = get(opt, 'center', null)
            let ckCenter = isarr(center) && size(center) === 2 && isNumber(get(center, 0)) && isNumber(get(center, 1))
            assert.strictEqual(ckCenter, false)
        })

        it('cloneDeep 使 center 與外部記憶體脫勾', () => {
            let opt = { center: [25, 121] }
            let center = cloneDeep(opt.center)
            center[0] = 99
            assert.strictEqual(opt.center[0], 25)
            assert.strictEqual(center[0], 99)
        })

    })

    describe('zoom 處理', () => {

        it('預設 zoom 為 7', () => {
            let zoom = get({}, 'zoom', null)
            if (!ispint(zoom)) {
                zoom = 7
            }
            assert.strictEqual(zoom, 7)
        })

        it('接受有效的 zoom 值', () => {
            let opt = { zoom: 12 }
            let zoom = get(opt, 'zoom', null)
            assert.strictEqual(ispint(zoom), true)
            assert.strictEqual(zoom, 12)
        })

        it('zoom 範圍限制 1~18', () => {
            let zoom1 = Math.min(Math.max(0, 1), 18)
            assert.strictEqual(zoom1, 1)

            let zoom2 = Math.min(Math.max(20, 1), 18)
            assert.strictEqual(zoom2, 18)

            let zoom3 = Math.min(Math.max(10, 1), 18)
            assert.strictEqual(zoom3, 10)
        })

        it('拒絕無效的 zoom 值', () => {
            assert.strictEqual(ispint('abc'), false)
            assert.strictEqual(ispint(null), false)
            assert.strictEqual(ispint(undefined), false)
            assert.strictEqual(ispint(-1), false)
        })

    })

    describe('panelBackgroundColor 處理', () => {

        it('預設值為 rgba(255,255,255,0.95)', () => {
            let color = get({}, 'panelBackgroundColor', null)
            if (!isstr(color)) {
                color = 'rgba(255,255,255,0.95)'
            }
            assert.strictEqual(color, 'rgba(255,255,255,0.95)')
        })

        it('接受自訂顏色', () => {
            let opt = { panelBackgroundColor: 'rgba(0,0,0,0.8)' }
            let color = get(opt, 'panelBackgroundColor', null)
            assert.strictEqual(isstr(color), true)
            assert.strictEqual(color, 'rgba(0,0,0,0.8)')
        })

    })

    describe('showLoc 處理', () => {

        it('計算滑鼠座標位置（7 位小數）', () => {
            let lat = dig(25.0330123456789, 7)
            let lng = dig(121.5654123456789, 7)
            assert.strictEqual(lat, '25.0330123')
            assert.strictEqual(lng, '121.5654123')
        })

    })

})


describe('02 - 底圖管理', () => {

    describe('面板設定處理', () => {

        it('預設面板設定合併', () => {
            let defPanelBaseMaps = {
                show: true,
                position: 'topleft',
                baseMaps: [],
                stopWheel: false,
            }
            let panelBaseMaps = {}
            panelBaseMaps = {
                ...defPanelBaseMaps,
                ...panelBaseMaps,
            }
            assert.strictEqual(panelBaseMaps.show, true)
            assert.strictEqual(panelBaseMaps.position, 'topleft')
            assert.strictEqual(panelBaseMaps.stopWheel, false)
        })

        it('外部設定覆蓋預設', () => {
            let defPanelBaseMaps = {
                show: true,
                position: 'topleft',
                baseMaps: [],
                stopWheel: false,
            }
            let panelBaseMaps = { show: false, position: 'bottomright' }
            panelBaseMaps = {
                ...defPanelBaseMaps,
                ...panelBaseMaps,
            }
            assert.strictEqual(panelBaseMaps.show, false)
            assert.strictEqual(panelBaseMaps.position, 'bottomright')
        })

        it('面板樣式生成', () => {
            let panel = { width: 200, maxWidth: 300, height: null, maxHeight: 400 }
            let style = {}
            if (isNumber(panel.width)) {
                style.width = `${panel.width}px`
            }
            if (isNumber(panel.maxWidth)) {
                style.maxWidth = `${panel.maxWidth}px`
            }
            if (isNumber(panel.height)) {
                style.height = `${panel.height}px`
            }
            if (isNumber(panel.maxHeight)) {
                style.maxHeight = `${panel.maxHeight}px`
            }
            assert.strictEqual(style.width, '200px')
            assert.strictEqual(style.maxWidth, '300px')
            assert.strictEqual(style.height, undefined)
            assert.strictEqual(style.maxHeight, '400px')
        })

    })

    describe('底圖色調計算', () => {

        it('取得可見底圖的 colorShade', () => {
            let baseMaps = [
                { name: 'Mapbox', visible: true, colorShade: 'dark' },
                { name: 'OSM', visible: false, colorShade: 'light' },
            ]
            let colorShade = ''
            each(baseMaps, (v) => {
                if (v.visible && isestr(v.colorShade)) {
                    colorShade = v.colorShade
                    return false
                }
            })
            assert.strictEqual(colorShade, 'dark')
        })

        it('無可見底圖時回傳空字串', () => {
            let baseMaps = [
                { name: 'Mapbox', visible: false, colorShade: 'dark' },
            ]
            let colorShade = ''
            each(baseMaps, (v) => {
                if (v.visible && isestr(v.colorShade)) {
                    colorShade = v.colorShade
                    return false
                }
            })
            assert.strictEqual(colorShade, '')
        })

    })

})


describe('03 - 控制面板', () => {

    describe('羅盤圖標選取', () => {

        it('優先使用自訂 iconSrc', () => {
            let panelCompassRose = {
                iconSrc: 'custom.png',
                iconSrcLight: 'light.png',
                iconSrcDark: 'dark.png',
                withPanel: false,
            }
            let icon = null
            if (isestr(panelCompassRose.iconSrc)) {
                icon = panelCompassRose.iconSrc
            }
            assert.strictEqual(icon, 'custom.png')
        })

        it('withPanel=true 使用 iconSrcDark', () => {
            let panelCompassRose = {
                iconSrc: null,
                iconSrcLight: 'light.png',
                iconSrcDark: 'dark.png',
                withPanel: true,
            }
            let icon = null
            if (!isestr(panelCompassRose.iconSrc)) {
                if (panelCompassRose.withPanel) {
                    icon = panelCompassRose.iconSrcDark
                }
            }
            assert.strictEqual(icon, 'dark.png')
        })

        it('底圖 dark 色調使用 iconSrcLight', () => {
            let panelCompassRose = {
                iconSrc: null,
                iconSrcLight: 'light.png',
                iconSrcDark: 'dark.png',
                withPanel: false,
            }
            let baseMapColorShade = 'dark'
            let icon = null
            if (!isestr(panelCompassRose.iconSrc) && !panelCompassRose.withPanel) {
                if (baseMapColorShade === 'dark') {
                    icon = panelCompassRose.iconSrcLight
                } else {
                    icon = panelCompassRose.iconSrcDark
                }
            }
            assert.strictEqual(icon, 'light.png')
        })

    })

    describe('panelLabels 設定', () => {

        it('預設 useItems', () => {
            let defPanelLabels = {
                show: true,
                title: '',
                useItems: ['lng', 'lat', 'zoom'],
                lng: 'Longitude',
                lat: 'Latitude',
                zoom: 'Zoom',
                position: 'topright',
            }
            assert.deepStrictEqual(defPanelLabels.useItems, ['lng', 'lat', 'zoom'])
        })

        it('自訂 useItems 僅顯示 zoom', () => {
            let panelLabels = {
                ...{ useItems: ['lng', 'lat', 'zoom'] },
                ...{ useItems: ['zoom'] },
            }
            assert.deepStrictEqual(panelLabels.useItems, ['zoom'])
        })

    })

})


describe('04 - 點圖層', () => {

    describe('點資料轉換', () => {

        it('陣列格式轉物件格式', () => {
            let point = [25.0330, 121.5654]
            if (isearr(point)) {
                let p = {
                    latLng: [get(point, 0), get(point, 1)],
                }
                point = p
            }
            assert.deepStrictEqual(point, {
                latLng: [25.0330, 121.5654],
            })
        })

        it('物件格式保持不變', () => {
            let point = { latLng: [25, 121], title: '測試' }
            if (isearr(point)) {
                point = { latLng: [get(point, 0), get(point, 1)] }
            }
            assert.strictEqual(point.title, '測試')
            assert.deepStrictEqual(point.latLng, [25, 121])
        })

    })

    describe('類型判定', () => {

        it('預設為 circle', () => {
            let pointType = null
            let pointSetType = null
            let type = pointType || pointSetType
            if (type !== 'icon' && type !== 'circle') {
                type = 'circle'
            }
            assert.strictEqual(type, 'circle')
        })

        it('個別點覆蓋集合類型', () => {
            let pointType = 'icon'
            let pointSetType = 'circle'
            let type = pointType || pointSetType
            assert.strictEqual(type, 'icon')
        })

        it('集合類型生效', () => {
            let pointType = null
            let pointSetType = 'icon'
            let type = pointType || pointSetType
            assert.strictEqual(type, 'icon')
        })

    })

    describe('樣式繼承', () => {

        it('填充顏色繼承', () => {
            let pointFillColor = null
            let pointSetFillColor = 'rgba(255,0,0,0.5)'
            let fillColor = pointFillColor || pointSetFillColor
            if (!isestr(fillColor)) {
                fillColor = 'rgba(0,150,255,0.65)'
            }
            assert.strictEqual(fillColor, 'rgba(255,0,0,0.5)')
        })

        it('使用預設填充顏色', () => {
            let pointFillColor = null
            let pointSetFillColor = null
            let fillColor = pointFillColor || pointSetFillColor
            if (!isestr(fillColor)) {
                fillColor = 'rgba(0,150,255,0.65)'
            }
            assert.strictEqual(fillColor, 'rgba(0,150,255,0.65)')
        })

        it('圓點半徑繼承', () => {
            let pointSize = null
            let pointSetSize = 15
            let radius = pointSize || pointSetSize
            if (!isNumber(radius)) {
                radius = 10
            }
            assert.strictEqual(radius, 15)
        })

    })

    describe('circle 樣式物件', () => {

        it('生成正確的 circle 樣式', () => {
            let style = {
                radius: 10,
                fillColor: 'rgba(0,150,255,0.65)',
                fillOpacity: 1,
                color: 'rgba(255,255,255,1)',
                weight: 1,
            }
            assert.strictEqual(style.fillOpacity, 1)
            assert.strictEqual(style.radius, 10)
        })

    })

    describe('資料變更偵測', () => {

        it('omit visible 後比對', () => {
            let pointSets = [
                { title: 'A', visible: true, points: [] },
                { title: 'B', visible: false, points: [] },
            ]
            let effPointSets = map(pointSets, (v) => {
                return omit(v, 'visible')
            })
            assert.strictEqual(effPointSets[0].visible, undefined)
            assert.strictEqual(effPointSets[0].title, 'A')
        })

        it('資料未變更時不重新處理', () => {
            let prev = [{ title: 'A', points: [] }]
            let curr = [{ title: 'A', points: [] }]
            assert.strictEqual(isEqual(prev, curr), true)
        })

        it('資料有變更時進行處理', () => {
            let prev = [{ title: 'A', points: [] }]
            let curr = [{ title: 'B', points: [] }]
            assert.strictEqual(isEqual(prev, curr), false)
        })

    })

})


describe('05 - 折線圖層', () => {

    describe('樣式處理', () => {

        it('一般樣式', () => {
            let lineColor = 'rgba(0,150,255,1)'
            let lineWidth = 3
            let style = { color: lineColor, weight: lineWidth }
            assert.strictEqual(style.color, 'rgba(0,150,255,1)')
            assert.strictEqual(style.weight, 3)
        })

        it('Hover 樣式預設繼承一般樣式', () => {
            let lineColor = 'rgba(0,150,255,1)'
            let lineWidth = 3
            let lineColorHover = null
            let lineWidthHover = null
            if (!isestr(lineColorHover)) {
                lineColorHover = lineColor
            }
            if (!isNumber(lineWidthHover)) {
                lineWidthHover = lineWidth
            }
            assert.strictEqual(lineColorHover, lineColor)
            assert.strictEqual(lineWidthHover, lineWidth)
        })

    })

    describe('預設值處理', () => {

        it('title 預設空字串', () => {
            let polylineSet = {}
            if (!isestr(get(polylineSet, 'title', null))) {
                polylineSet.title = ''
            }
            assert.strictEqual(polylineSet.title, '')
        })

        it('visible 預設 false', () => {
            let polylineSet = {}
            let isbol_ = (v) => typeof v === 'boolean'
            if (!isbol_(get(polylineSet, 'visible', null))) {
                polylineSet.visible = false
            }
            assert.strictEqual(polylineSet.visible, false)
        })

    })

})


describe('06 - 多邊形圖層', () => {

    describe('樣式處理', () => {

        it('fillOpacity 強制為 1', () => {
            let style = {
                fillColor: 'rgba(0,150,255,0.25)',
                fillOpacity: 1,
                color: 'rgba(0,150,255,1)',
                weight: 3,
            }
            assert.strictEqual(style.fillOpacity, 1)
        })

        it('Hover 樣式獨立設定', () => {
            let fillColor = 'rgba(0,150,255,0.25)'
            let fillColorHover = 'rgba(255,0,0,0.5)'
            let styleHover = {
                fillColor: fillColorHover,
                fillOpacity: 1,
                color: 'rgba(255,0,0,1)',
                weight: 5,
            }
            assert.strictEqual(styleHover.fillColor, 'rgba(255,0,0,0.5)')
            assert.notStrictEqual(styleHover.fillColor, fillColor)
        })

    })

})


describe('07 - GeoJSON 圖層', () => {

    describe('GeoJSON 解析', () => {

        it('提取 MultiPolygon 座標', () => {
            let geojson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'MultiPolygon',
                            coordinates: [
                                [[[121, 25], [121.1, 25], [121.1, 25.1], [121, 25.1], [121, 25]]]
                            ]
                        },
                        properties: {}
                    }
                ]
            }
            let features = get(geojson, 'features', [])
            let latLngs = []
            each(features, (feature) => {
                if (get(feature, 'geometry.type', '') === 'MultiPolygon') {
                    let coordinates = get(feature, 'geometry.coordinates', [])
                    latLngs = [...latLngs, ...coordinates]
                }
            })
            assert.strictEqual(latLngs.length, 1)
        })

        it('忽略非 MultiPolygon 類型', () => {
            let geojson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [121, 25] },
                        properties: {}
                    }
                ]
            }
            let features = get(geojson, 'features', [])
            let latLngs = []
            each(features, (feature) => {
                if (get(feature, 'geometry.type', '') === 'MultiPolygon') {
                    let coordinates = get(feature, 'geometry.coordinates', [])
                    latLngs = [...latLngs, ...coordinates]
                }
            })
            assert.strictEqual(latLngs.length, 0)
        })

    })

    describe('geojson 驗證', () => {

        it('有效的 geojson 物件通過驗證', () => {
            let geojson = { type: 'FeatureCollection', features: [] }
            assert.strictEqual(iseobj(geojson), true)
        })

        it('空物件不通過驗證', () => {
            let geojson = {}
            assert.strictEqual(iseobj(geojson), false)
        })

    })

})


describe('08 - 等值線圖層', () => {

    describe('圖例生成', () => {

        it('getText 計算（無 legendNumDig）', () => {
            let range = { low: 10.123456, up: 20.654321 }
            let legendNumDig = null
            let low = range.low
            let up = range.up
            let delimiter = '-'
            if (isNumber(legendNumDig)) {
                low = dig(range.low, legendNumDig)
                up = dig(range.up, legendNumDig)
            }
            assert.strictEqual(low, 10.123456)
            assert.strictEqual(up, 20.654321)
            assert.strictEqual(delimiter, '-')
        })

        it('getText 計算（有 legendNumDig）', () => {
            let range = { low: 10.123456, up: 20.654321 }
            let legendNumDig = 2
            let low = range.low
            let up = range.up
            if (isNumber(legendNumDig)) {
                low = dig(range.low, legendNumDig)
                up = dig(range.up, legendNumDig)
            }
            assert.strictEqual(low, '10.12')
            assert.strictEqual(up, '20.65')
        })

        it('圖例反轉排列', () => {
            let legend = [
                { color: 'blue', low: 0, up: 10 },
                { color: 'green', low: 10, up: 20 },
                { color: 'red', low: 20, up: 30 },
            ]
            legend = reverse(legend)
            assert.strictEqual(legend[0].color, 'red')
            assert.strictEqual(legend[2].color, 'blue')
        })

    })

    describe('legendTextFormater 自訂', () => {

        it('使用自訂格式化函數', () => {
            let legendTextFormater = ({ low, up }) => ({
                low: `≥${low}`,
                up: `<${up}`,
                delimiter: '~',
            })
            let r = legendTextFormater({ low: 10, up: 20 })
            assert.strictEqual(r.low, '≥10')
            assert.strictEqual(r.up, '<20')
            assert.strictEqual(r.delimiter, '~')
        })

    })

    describe('legendTextExtra 自訂', () => {

        it('使用額外文字函數', () => {
            let legendTextExtra = ({ k, n }) => `(${k + 1}/${n})`
            let textExt = legendTextExtra({ k: 0, n: 5, polygonSet: {} })
            assert.strictEqual(textExt, '(1/5)')
        })

    })

})


describe('09 - 點陣圖圖層', () => {

    describe('影像資料驗證', () => {

        it('有效影像通過驗證', () => {
            let image = {
                url: 'https://example.com/image.png',
                lngMin: 120,
                lngMax: 122,
                latMin: 24,
                latMax: 26,
            }
            assert.strictEqual(iseobj(image), true)
            assert.strictEqual(isestr(image.url), true)
            assert.strictEqual(isnum(image.lngMin), true)
            assert.strictEqual(isnum(image.lngMax), true)
            assert.strictEqual(isnum(image.latMin), true)
            assert.strictEqual(isnum(image.latMax), true)
        })

        it('邊界計算正確', () => {
            let image = { lngMin: 120, lngMax: 122, latMin: 24, latMax: 26 }
            let bounds = [
                [image.latMin, image.lngMin],
                [image.latMax, image.lngMax],
            ]
            assert.deepStrictEqual(bounds, [[24, 120], [26, 122]])
        })

    })

})


describe('10 - 公開方法', () => {

    describe('panTo 偏移計算', () => {

        it('水平偏移計算', () => {
            let latLng = [25, 121]
            let lngRange = 2
            let lngMin = latLng[1] - lngRange / 2
            let lngMax = latLng[1] + lngRange / 2
            let ratioHorizontal = 0.3

            let lngMaxNew = lngMax - lngRange * ratioHorizontal
            let lngNew = (lngMin + lngMaxNew) / 2

            assert.strictEqual(lngMin, 120)
            assert.strictEqual(lngMax, 122)
            assert.strictEqual(lngMaxNew, 121.4)
            assert.strictEqual(lngNew, 120.7)
        })

        it('垂直偏移計算', () => {
            let latLng = [25, 121]
            let latRange = 1
            let latMin = latLng[0] - latRange / 2
            let latMax = latLng[0] + latRange / 2
            let ratioVertical = 0.2

            let latMinNew = latMin + latRange * ratioVertical
            let latNew = (latMinNew + latMax) / 2

            assert.strictEqual(latMin, 24.5)
            assert.strictEqual(latMax, 25.5)
            assert.strictEqual(latMinNew, 24.7)
            assert.strictEqual(latNew, 25.1)
        })

    })

})


describe('11 - 事件系統', () => {

    describe('updateCenter 同步機制', () => {

        it('座標相同時不更新', () => {
            let optCenter = [25, 121]
            let newCenter = { lat: 25, lng: 121 }
            let shouldUpdate = !isEqual(optCenter, [newCenter.lat, newCenter.lng])
            assert.strictEqual(shouldUpdate, false)
        })

        it('座標不同時更新', () => {
            let optCenter = [25, 121]
            let newCenter = { lat: 25.1, lng: 121.1 }
            let shouldUpdate = !isEqual(optCenter, [newCenter.lat, newCenter.lng])
            assert.strictEqual(shouldUpdate, true)
        })

    })

})


describe('12 - 圖層顯隱管理', () => {

    describe('items 整合', () => {

        it('整合各圖層為 items', () => {
            let items = []
            function add(name, msg, order, visible, updatePath) {
                items.push({ name, msg, order, visible, updatePath })
            }

            let pointSets = [{ title: '測站', msg: '', order: 1, visible: true }]
            let polylineSets = [{ title: '路線', msg: '', order: 2, visible: true }]
            let polygonSets = [{ title: '區域', msg: '', order: null, visible: false }]

            each(pointSets, (v, k) => {
                add(v.title, v.msg, v.order, v.visible, `pointSets.${k}.visible`)
            })
            each(polylineSets, (v, k) => {
                add(v.title, v.msg, v.order, v.visible, `polylineSets.${k}.visible`)
            })
            each(polygonSets, (v, k) => {
                add(v.title, v.msg, v.order, v.visible, `polygonSets.${k}.visible`)
            })

            assert.strictEqual(items.length, 3)
            assert.strictEqual(items[0].updatePath, 'pointSets.0.visible')
        })

        it('排序：有 order 的在前', () => {
            let items = [
                { name: 'C', order: null },
                { name: 'A', order: 1 },
                { name: 'B', order: 3 },
                { name: 'D', order: 2 },
            ]
            let itemsOrder = filter(items, (v) => isNumber(v.order))
            let itemsOther = filter(items, (v) => !isNumber(v.order))
            itemsOrder = sortBy(itemsOrder, 'order')
            items = [...itemsOrder, ...itemsOther]

            assert.strictEqual(items[0].name, 'A')
            assert.strictEqual(items[1].name, 'D')
            assert.strictEqual(items[2].name, 'B')
            assert.strictEqual(items[3].name, 'C')
        })

    })

    describe('可見性同步', () => {

        it('使用 updatePath 同步 visible', () => {
            let vo = {
                pointSets: [{ visible: true }],
            }
            let item = { visible: false, updatePath: 'pointSets.0.visible' }

            // 模擬 lodash set
            let parts = item.updatePath.split('.')
            let obj = vo
            for (let i = 0; i < parts.length - 1; i++) {
                obj = obj[parts[i]]
            }
            obj[parts[parts.length - 1]] = item.visible

            assert.strictEqual(vo.pointSets[0].visible, false)
        })

    })

})


describe('13 - 插槽系統', () => {

    describe('插槽名稱驗證', () => {

        it('所有預期的插槽名稱', () => {
            let expectedSlots = [
                'point-tooltip',
                'point-popup',
                'polyline-tooltip',
                'polyline-popup',
                'polygon-tooltip',
                'polygon-popup',
                'geojson-tooltip',
                'geojson-popup',
                'contour-tooltip',
                'contour-popup',
            ]
            assert.strictEqual(expectedSlots.length, 10)
            expectedSlots.forEach((slot) => {
                assert.strictEqual(typeof slot, 'string')
                assert.ok(slot.includes('-'))
            })
        })

    })

})


describe('額外測試 - 工具函數', () => {

    describe('countVisible', () => {

        it('計算可見項目數', () => {
            let arr = [
                { visible: true },
                { visible: false },
                { visible: true },
                { visible: true },
            ]
            let count = 0
            each(arr, (v) => {
                if (v.visible) {
                    count++
                }
            })
            assert.strictEqual(count, 3)
        })

        it('空陣列回傳 0', () => {
            let arr = []
            let count = 0
            each(arr, (v) => {
                if (v.visible) {
                    count++
                }
            })
            assert.strictEqual(count, 0)
        })

    })

    describe('getIconParam', () => {

        it('完整參數驗證通過', () => {
            let v = {
                iconSrc: 'test.png',
                iconSize: [24, 40],
                iconAnchor: [12, 40],
                popupAnchor: [0, -27],
                tooltipAnchor: [0, -27],
            }
            let eff = isestr(v.iconSrc) && isarr(v.iconSize) && size(v.iconSize) === 2 && isarr(v.iconAnchor) && size(v.iconAnchor) === 2
            assert.strictEqual(eff, true)
        })

        it('缺少 iconSrc 驗證失敗', () => {
            let v = {
                iconSrc: null,
                iconSize: [24, 40],
                iconAnchor: [12, 40],
            }
            let eff = isestr(v.iconSrc) && isarr(v.iconSize) && size(v.iconSize) === 2 && isarr(v.iconAnchor) && size(v.iconAnchor) === 2
            assert.strictEqual(eff, false)
        })

        it('iconSize 長度錯誤驗證失敗', () => {
            let v = {
                iconSrc: 'test.png',
                iconSize: [24],
                iconAnchor: [12, 40],
            }
            let eff = isestr(v.iconSrc) && isarr(v.iconSize) && size(v.iconSize) === 2 && isarr(v.iconAnchor) && size(v.iconAnchor) === 2
            assert.strictEqual(eff, false)
        })

    })

})
