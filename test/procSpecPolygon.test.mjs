import assert from 'assert'
import procSpecPolygon from '../src/components/procSpecPolygon.mjs'


/**
 * 計算 ring 有號面積（正=CCW，負=CW）
 */
function calcSignedArea(ring) {
    let area = 0
    for (let i = 0; i < ring.length; i++) {
        let j = (i + 1) % ring.length
        area += ring[i][0] * ring[j][1]
        area -= ring[j][0] * ring[i][1]
    }
    return area / 2
}

function isCCW(ring) { return calcSignedArea(ring) > 0 }
function isCW(ring) { return calcSignedArea(ring) < 0 }

/**
 * 驗證 geometry 的所有 ring winding order 正確
 */
function assertWindingOrder(geom) {
    if (geom.type === 'Polygon') {
        assert.ok(isCCW(geom.coordinates[0]), '外環應為 CCW')
        for (let i = 1; i < geom.coordinates.length; i++) {
            assert.ok(isCW(geom.coordinates[i]), '洞環應為 CW')
        }
    }
    else if (geom.type === 'MultiPolygon') {
        for (let pg of geom.coordinates) {
            assert.ok(isCCW(pg[0]), '外環應為 CCW')
            for (let i = 1; i < pg.length; i++) {
                assert.ok(isCW(pg[i]), '洞環應為 CW')
            }
        }
    }
}

/**
 * 驗證所有 ring 閉合
 */
function assertAllRingsClosed(geom) {
    let rings = []
    if (geom.type === 'Polygon') {
        rings = geom.coordinates
    }
    else if (geom.type === 'MultiPolygon') {
        for (let pg of geom.coordinates) {
            rings.push(...pg)
        }
    }
    for (let ring of rings) {
        if (ring.length >= 2) {
            let first = ring[0]
            let last = ring[ring.length - 1]
            assert.strict.deepEqual(first, last, 'ring 應閉合')
        }
    }
}


describe('procSpecPolygon', function () {

    // ========================================
    // 一、空輸入 / 無效輸入
    // ========================================
    describe('空輸入與無效輸入', function () {

        it('null 輸入應回傳空 FeatureCollection', function () {
            let r = procSpecPolygon(null)
            assert.strictEqual(r.type, 'FeatureCollection')
            assert.strict.deepEqual(r.features, [])
        })

        it('undefined 輸入應回傳空結果', function () {
            let r = procSpecPolygon(undefined)
            assert.strict.deepEqual(r.features, [])
        })

        it('空 FeatureCollection 應回傳空結果', function () {
            let r = procSpecPolygon({ type: 'FeatureCollection', features: [] })
            assert.strict.deepEqual(r.features, [])
        })

        it('features 不是陣列時應回傳空結果', function () {
            let r = procSpecPolygon({ type: 'FeatureCollection', features: 'abc' })
            assert.strict.deepEqual(r.features, [])
        })

        it('數字輸入應回傳空結果', function () {
            let r = procSpecPolygon(123)
            assert.strict.deepEqual(r.features, [])
        })

        it('字串輸入應回傳空結果', function () {
            let r = procSpecPolygon('hello')
            assert.strict.deepEqual(r.features, [])
        })

        it('空物件應回傳空結果', function () {
            let r = procSpecPolygon({})
            assert.strict.deepEqual(r.features, [])
        })

        it('陣列輸入應回傳空結果', function () {
            let r = procSpecPolygon([1, 2, 3])
            assert.strict.deepEqual(r.features, [])
        })

        it('布林值輸入應回傳空結果', function () {
            let r = procSpecPolygon(true)
            assert.strict.deepEqual(r.features, [])
        })

    })


    // ========================================
    // 二、簡單 Polygon（只有外環）
    // ========================================
    describe('簡單 Polygon', function () {

        it('CCW 外環應保持不變', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: '簡單' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features.length, 1)
            assert.strictEqual(r.features[0].geometry.type, 'Polygon')
            assertWindingOrder(r.features[0].geometry)
        })

        it('CW 外環應被修正為 CCW', function () {
            // [0,0]→[0,10]→[10,10]→[10,0] 為 CW
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: 'CW外環' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let ring = r.features[0].geometry.coordinates[0]
            assert.ok(isCCW(ring), '外環應被修正為 CCW')
        })

        it('三角形 Polygon 應正確處理', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [10, 0], [5, 10], [0, 0]]],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features.length, 1)
            assertWindingOrder(r.features[0].geometry)
            assertAllRingsClosed(r.features[0].geometry)
        })

        it('細長條狀 Polygon 應正確處理', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [100, 0], [100, 1], [0, 1], [0, 0]]],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assertWindingOrder(r.features[0].geometry)
        })

        it('非常小的 Polygon 應正確處理', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [0.001, 0], [0.001, 0.001], [0, 0.001], [0, 0]]],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assertWindingOrder(r.features[0].geometry)
        })

    })


    // ========================================
    // 三、Polygon 帶洞
    // ========================================
    describe('Polygon 帶洞', function () {

        it('標準 Polygon（外環+洞）winding order 應正確', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: '帶洞' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],   // 外環 CCW
                            [[2, 2], [8, 2], [8, 8], [2, 8], [2, 2]],       // 洞 CCW（需修正為 CW）
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assert.ok(geom.type === 'Polygon' || geom.type === 'MultiPolygon')
            assertWindingOrder(geom)
        })

        it('外環 CW + 洞 CW 的 Polygon 應修正 winding order', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]],   // CW 外環
                            [[2, 2], [2, 8], [8, 8], [8, 2], [2, 2]],       // CW 洞
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assertWindingOrder(r.features[0].geometry)
        })

        it('帶小洞的大 Polygon 應正確處理', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]],
                            [[49, 49], [51, 49], [51, 51], [49, 51], [49, 49]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assertWindingOrder(r.features[0].geometry)
            assertAllRingsClosed(r.features[0].geometry)
        })

    })


    // ========================================
    // 四、三層套疊 Polygon（核心場景）
    // ========================================
    describe('三層套疊 Polygon', function () {

        it('三個巢狀 ring 應拆為 MultiPolygon', function () {
            // Ring A 包含 Ring B 包含 Ring C（Leaflet evenodd 風格）
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: '三層套疊' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]],     // Ring A 最外層
                            [[4, 4], [16, 4], [16, 16], [4, 16], [4, 4]],     // Ring B 第二層
                            [[8, 8], [12, 8], [12, 12], [8, 12], [8, 8]],     // Ring C 第三層
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry

            // 三層套疊應被拆為 MultiPolygon（至少 2 個 polygon）
            assert.strictEqual(geom.type, 'MultiPolygon', '應為 MultiPolygon')
            assert.ok(geom.coordinates.length >= 2, '應至少有 2 個 polygon')
            assertWindingOrder(geom)
            assertAllRingsClosed(geom)
        })

        it('properties 應完整保留', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: '保留', style: { fillColor: 'red' } },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]],
                            [[4, 4], [16, 4], [16, 16], [4, 16], [4, 4]],
                            [[8, 8], [12, 8], [12, 12], [8, 12], [8, 8]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features[0].properties.name, '保留')
            assert.strictEqual(r.features[0].properties.style.fillColor, 'red')
        })

        it('三層套疊- 非對稱 ring 尺寸', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [30, 0], [30, 30], [0, 30], [0, 0]],
                            [[2, 2], [28, 2], [28, 28], [2, 28], [2, 2]],
                            [[10, 10], [20, 10], [20, 20], [10, 20], [10, 10]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assert.strictEqual(geom.type, 'MultiPolygon')
            assertWindingOrder(geom)
            assertAllRingsClosed(geom)
        })

    })


    // ========================================
    // 五、四層及更多層套疊 Polygon
    // ========================================
    describe('四層及更多層套疊 Polygon', function () {

        it('四層套疊應正確處理為 MultiPolygon', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: '四層' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [40, 0], [40, 40], [0, 40], [0, 0]],
                            [[4, 4], [36, 4], [36, 36], [4, 36], [4, 4]],
                            [[8, 8], [32, 8], [32, 32], [8, 32], [8, 8]],
                            [[12, 12], [28, 12], [28, 28], [12, 28], [12, 12]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assert.strictEqual(geom.type, 'MultiPolygon')
            assertWindingOrder(geom)
            assertAllRingsClosed(geom)
        })

        it('五層套疊應正確處理為 MultiPolygon', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: '五層' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [50, 0], [50, 50], [0, 50], [0, 0]],
                            [[5, 5], [45, 5], [45, 45], [5, 45], [5, 5]],
                            [[10, 10], [40, 10], [40, 40], [10, 40], [10, 10]],
                            [[15, 15], [35, 15], [35, 35], [15, 35], [15, 15]],
                            [[20, 20], [30, 20], [30, 30], [20, 30], [20, 20]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assert.strictEqual(geom.type, 'MultiPolygon')
            assertWindingOrder(geom)
            assertAllRingsClosed(geom)
        })

        it('四層套疊 winding order 全部正確', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [30, 0], [30, 30], [0, 30], [0, 0]],
                            [[3, 3], [27, 3], [27, 27], [3, 27], [3, 3]],
                            [[6, 6], [24, 6], [24, 24], [6, 24], [6, 6]],
                            [[9, 9], [21, 9], [21, 21], [9, 21], [9, 9]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            // 四層套疊：外環-洞-外環-洞 → 應為 MultiPolygon（2 個 polygon，各帶洞）
            assert.strictEqual(geom.type, 'MultiPolygon')
            for (let pg of geom.coordinates) {
                assert.ok(isCCW(pg[0]), '每個 polygon 外環應為 CCW')
                for (let i = 1; i < pg.length; i++) {
                    assert.ok(isCW(pg[i]), '每個 polygon 洞環應為 CW')
                }
            }
        })

    })


    // ========================================
    // 六、MultiPolygon 處理
    // ========================================
    describe('MultiPolygon 處理', function () {

        it('兩個獨立 Polygon 的 MultiPolygon 應保持結構', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: '兩獨立' },
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [
                            [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]],
                            [[[10, 10], [14, 10], [14, 14], [10, 14], [10, 10]]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assert.strictEqual(geom.type, 'MultiPolygon')
            assert.strictEqual(geom.coordinates.length, 2)
            assertWindingOrder(geom)
        })

        it('單一 Polygon 的 MultiPolygon 應降級為 Polygon', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [[[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features[0].geometry.type, 'Polygon')
        })

        it('MultiPolygon 中含套疊 ring 應正確處理', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: 'MP套疊' },
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [
                            [
                                [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]],
                                [[4, 4], [16, 4], [16, 16], [4, 16], [4, 4]],
                            ],
                            [[[30, 30], [40, 30], [40, 40], [30, 40], [30, 30]]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assertWindingOrder(geom)
        })

        it('三個獨立 Polygon 的 MultiPolygon', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [
                            [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]],
                            [[[10, 10], [14, 10], [14, 14], [10, 14], [10, 10]]],
                            [[[20, 20], [24, 20], [24, 24], [20, 24], [20, 20]]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assert.strictEqual(geom.type, 'MultiPolygon')
            assert.strictEqual(geom.coordinates.length, 3)
            assertWindingOrder(geom)
        })

        it('MultiPolygon 每個子 polygon 含三層套疊', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: 'MP雙套疊' },
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [
                            [
                                [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]],
                                [[4, 4], [16, 4], [16, 16], [4, 16], [4, 4]],
                                [[8, 8], [12, 8], [12, 12], [8, 12], [8, 8]],
                            ],
                            [
                                [[30, 30], [50, 30], [50, 50], [30, 50], [30, 30]],
                                [[34, 34], [46, 34], [46, 46], [34, 46], [34, 34]],
                                [[38, 38], [42, 38], [42, 42], [38, 42], [38, 38]],
                            ],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assert.strictEqual(geom.type, 'MultiPolygon')
            assertWindingOrder(geom)
            assertAllRingsClosed(geom)
        })

        it('MultiPolygon 混合：一個簡單 + 一個帶洞 + 一個三層套疊', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [
                            // 簡單
                            [[[0, 0], [5, 0], [5, 5], [0, 5], [0, 0]]],
                            // 帶洞
                            [
                                [[10, 10], [20, 10], [20, 20], [10, 20], [10, 10]],
                                [[12, 12], [18, 12], [18, 18], [12, 18], [12, 12]],
                            ],
                            // 三層套疊
                            [
                                [[30, 30], [50, 30], [50, 50], [30, 50], [30, 30]],
                                [[34, 34], [46, 34], [46, 46], [34, 46], [34, 34]],
                                [[38, 38], [42, 38], [42, 42], [38, 42], [38, 38]],
                            ],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assert.strictEqual(geom.type, 'MultiPolygon')
            assertWindingOrder(geom)
            assertAllRingsClosed(geom)
        })

    })


    // ========================================
    // 七、深拷貝驗證
    // ========================================
    describe('深拷貝驗證', function () {

        it('修改輸出不應影響原始輸入', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: 'original' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            r.features[0].properties.name = 'modified'
            assert.strictEqual(input.features[0].properties.name, 'original')
        })

        it('修改輸出座標不應影響原始輸入座標', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
                    },
                }],
            }
            let originalCoord0 = input.features[0].geometry.coordinates[0][0][0]
            let r = procSpecPolygon(input)
            // 修改輸出座標
            if (r.features[0].geometry.coordinates[0]) {
                r.features[0].geometry.coordinates[0][0][0] = 999
            }
            assert.strictEqual(input.features[0].geometry.coordinates[0][0][0], originalCoord0)
        })

    })


    // ========================================
    // 八、ring 閉合驗證
    // ========================================
    describe('ring 閉合驗證', function () {

        it('簡單 Polygon 處理後所有 ring 應閉合', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assertAllRingsClosed(r.features[0].geometry)
        })

        it('三層套疊處理後所有 ring 應閉合', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]],
                            [[4, 4], [16, 4], [16, 16], [4, 16], [4, 4]],
                            [[8, 8], [12, 8], [12, 12], [8, 12], [8, 8]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assertAllRingsClosed(r.features[0].geometry)
        })

        it('MultiPolygon 處理後所有 ring 應閉合', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [
                            [
                                [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]],
                                [[4, 4], [16, 4], [16, 16], [4, 16], [4, 4]],
                            ],
                            [[[30, 30], [40, 30], [40, 40], [30, 40], [30, 30]]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assertAllRingsClosed(r.features[0].geometry)
        })

    })


    // ========================================
    // 九、多個 Feature 混合處理
    // ========================================
    describe('多個 Feature 混合', function () {

        it('同時含簡單與套疊 Polygon 應各自正確處理', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: { name: '簡單' },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [[[0, 0], [5, 0], [5, 5], [0, 5], [0, 0]]],
                        },
                    },
                    {
                        type: 'Feature',
                        properties: { name: '套疊' },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]],
                                [[4, 4], [16, 4], [16, 16], [4, 16], [4, 4]],
                                [[8, 8], [12, 8], [12, 12], [8, 12], [8, 8]],
                            ],
                        },
                    },
                ],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features.length, 2)
            // 簡單 polygon 維持 Polygon
            assert.strictEqual(r.features[0].geometry.type, 'Polygon')
            assert.strictEqual(r.features[0].properties.name, '簡單')
            // 套疊 polygon 應變 MultiPolygon
            assert.strictEqual(r.features[1].geometry.type, 'MultiPolygon')
            assert.strictEqual(r.features[1].properties.name, '套疊')
        })

        it('多個不同結構的 Feature 混合', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    // 簡單 Polygon
                    {
                        type: 'Feature',
                        properties: { idx: 0 },
                        geometry: { type: 'Polygon', coordinates: [[[0, 0], [5, 0], [5, 5], [0, 5], [0, 0]]] },
                    },
                    // 帶洞 Polygon
                    {
                        type: 'Feature',
                        properties: { idx: 1 },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [[10, 10], [20, 10], [20, 20], [10, 20], [10, 10]],
                                [[12, 12], [18, 12], [18, 18], [12, 18], [12, 12]],
                            ],
                        },
                    },
                    // 三層套疊
                    {
                        type: 'Feature',
                        properties: { idx: 2 },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]],
                                [[4, 4], [16, 4], [16, 16], [4, 16], [4, 4]],
                                [[8, 8], [12, 8], [12, 12], [8, 12], [8, 8]],
                            ],
                        },
                    },
                    // MultiPolygon
                    {
                        type: 'Feature',
                        properties: { idx: 3 },
                        geometry: {
                            type: 'MultiPolygon',
                            coordinates: [
                                [[[50, 50], [60, 50], [60, 60], [50, 60], [50, 50]]],
                                [[[70, 70], [80, 70], [80, 80], [70, 80], [70, 70]]],
                            ],
                        },
                    },
                    // 四層套疊
                    {
                        type: 'Feature',
                        properties: { idx: 4 },
                        geometry: {
                            type: 'Polygon',
                            coordinates: [
                                [[0, 0], [40, 0], [40, 40], [0, 40], [0, 0]],
                                [[4, 4], [36, 4], [36, 36], [4, 36], [4, 4]],
                                [[8, 8], [32, 8], [32, 32], [8, 32], [8, 8]],
                                [[12, 12], [28, 12], [28, 28], [12, 28], [12, 12]],
                            ],
                        },
                    },
                ],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features.length, 5)
            // 每個 feature 的 winding order 都應正確
            for (let f of r.features) {
                assertWindingOrder(f.geometry)
                assertAllRingsClosed(f.geometry)
            }
            // 驗證 idx 保留
            for (let i = 0; i < 5; i++) {
                assert.strictEqual(r.features[i].properties.idx, i)
            }
            // 三層套疊與四層套疊應為 MultiPolygon
            assert.strictEqual(r.features[2].geometry.type, 'MultiPolygon')
            assert.strictEqual(r.features[4].geometry.type, 'MultiPolygon')
        })

    })


    // ========================================
    // 十、Feature 缺少 geometry
    // ========================================
    describe('Feature 缺少 geometry', function () {

        it('無 geometry 的 Feature 應原樣保留', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'no-geom' } },
                ],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features.length, 1)
            assert.strictEqual(r.features[0].properties.name, 'no-geom')
        })

        it('geometry 為 null 的 Feature 應原樣保留', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'null-geom' }, geometry: null },
                ],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features.length, 1)
            assert.strictEqual(r.features[0].properties.name, 'null-geom')
        })

    })


    // ========================================
    // 十一、實際數據場景
    // ========================================
    describe('實際數據場景', function () {

        it('等高線填色數據（多重 MultiPolygon）應正確處理', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: { style: { fillColor: 'rgba(255,255,255,1)' } },
                        geometry: {
                            type: 'MultiPolygon',
                            coordinates: [[[[121.247, 23.162], [120.984, 23.171], [121.073, 23.191], [121.247, 23.162]]]],
                        },
                    },
                    {
                        type: 'Feature',
                        properties: { style: { fillColor: 'rgba(254,200,127,1)' } },
                        geometry: {
                            type: 'MultiPolygon',
                            coordinates: [
                                [[[120.984, 23.171], [120.355, 23.193], [120.459, 23.189], [120.984, 23.171]]],
                                [[[121.115, 23.627], [120.968, 23.944], [121.009, 24.604], [121.115, 23.627]]],
                            ],
                        },
                    },
                ],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features.length, 2)
            assert.strictEqual(r.features[0].properties.style.fillColor, 'rgba(255,255,255,1)')
            assert.strictEqual(r.features[1].properties.style.fillColor, 'rgba(254,200,127,1)')
        })

        it('模擬行政區域帶飛地的 MultiPolygon', function () {
            // 主要行政區 + 飛地
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: '行政區', code: '10001' },
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [
                            // 主要區域
                            [[[121.4, 25.0], [121.6, 25.0], [121.6, 25.1], [121.4, 25.1], [121.4, 25.0]]],
                            // 飛地
                            [[[121.8, 25.3], [121.9, 25.3], [121.9, 25.4], [121.8, 25.4], [121.8, 25.3]]],
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            assertWindingOrder(r.features[0].geometry)
            assert.strictEqual(r.features[0].properties.name, '行政區')
            assert.strictEqual(r.features[0].properties.code, '10001')
        })

        it('模擬建物帶中庭的 Polygon（三層套疊）', function () {
            // 建物外牆 → 中庭空洞 → 中庭內的小建物
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: { name: '建物', type: 'building' },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [100, 0], [100, 100], [0, 100], [0, 0]],     // 建物外牆
                            [[20, 20], [80, 20], [80, 80], [20, 80], [20, 20]],   // 中庭空洞
                            [[40, 40], [60, 40], [60, 60], [40, 60], [40, 40]],   // 中庭內小建物
                        ],
                    },
                }],
            }
            let r = procSpecPolygon(input)
            let geom = r.features[0].geometry
            assert.strictEqual(geom.type, 'MultiPolygon')
            assertWindingOrder(geom)
            assertAllRingsClosed(geom)
        })

    })


    // ========================================
    // 十二、回傳結構驗證
    // ========================================
    describe('回傳結構驗證', function () {

        it('回傳物件的 type 應為 FeatureCollection', function () {
            let r = procSpecPolygon(null)
            assert.strictEqual(r.type, 'FeatureCollection')
        })

        it('回傳物件應包含 features 陣列', function () {
            let r = procSpecPolygon(null)
            assert.ok(Array.isArray(r.features))
        })

        it('有效輸入後 features 類型應為 Feature', function () {
            let input = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] },
                }],
            }
            let r = procSpecPolygon(input)
            assert.strictEqual(r.features[0].type, 'Feature')
        })

    })

})
