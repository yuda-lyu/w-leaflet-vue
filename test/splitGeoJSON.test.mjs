import assert from 'assert'
import splitGeoJSON from '../src/components/splitGeoJSON.mjs'


describe('splitGeoJSON', function () {


    // ========================================
    // 一、空輸入 / 無效輸入
    // ========================================
    describe('空輸入與無效輸入', function () {

        it('null 輸入應回傳空結果', function () {
            let r = splitGeoJSON(null)
            assert.strict.deepEqual(r.points.features, [])
            assert.strict.deepEqual(r.lines.features, [])
            assert.strict.deepEqual(r.polygons.features, [])
        })

        it('undefined 輸入應回傳空結果', function () {
            let r = splitGeoJSON(undefined)
            assert.strict.deepEqual(r.points.features, [])
            assert.strict.deepEqual(r.lines.features, [])
            assert.strict.deepEqual(r.polygons.features, [])
        })

        it('數字輸入應回傳空結果', function () {
            let r = splitGeoJSON(123)
            assert.strict.deepEqual(r.points.features, [])
        })

        it('布林值輸入應回傳空結果', function () {
            let r = splitGeoJSON(true)
            assert.strict.deepEqual(r.points.features, [])
        })

        it('空字串輸入應回傳空結果', function () {
            let r = splitGeoJSON('')
            assert.strict.deepEqual(r.points.features, [])
        })

        it('無效 JSON 字串輸入應回傳空結果', function () {
            let r = splitGeoJSON('{invalid json}')
            assert.strict.deepEqual(r.points.features, [])
        })

        it('空 FeatureCollection 應回傳空結果', function () {
            let r = splitGeoJSON({ type: 'FeatureCollection', features: [] })
            assert.strict.deepEqual(r.points.features, [])
            assert.strict.deepEqual(r.lines.features, [])
            assert.strict.deepEqual(r.polygons.features, [])
        })

        it('空陣列輸入應回傳空結果', function () {
            let r = splitGeoJSON([])
            assert.strict.deepEqual(r.points.features, [])
        })

        it('不認得的 type 應回傳空結果', function () {
            let r = splitGeoJSON({ type: 'UnknownType' })
            assert.strict.deepEqual(r.points.features, [])
        })

        it('FeatureCollection 的 features 不是陣列時應回傳空結果', function () {
            let r = splitGeoJSON({ type: 'FeatureCollection', features: 'not array' })
            assert.strict.deepEqual(r.points.features, [])
        })

    })


    // ========================================
    // 二、純單一幾何類型 FeatureCollection
    // ========================================
    describe('純單一幾何類型 FeatureCollection', function () {

        it('純 Point FeatureCollection', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'A' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                    { type: 'Feature', properties: { name: 'B' }, geometry: { type: 'Point', coordinates: [120, 24] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 2)
            assert.strictEqual(r.lines.features.length, 0)
            assert.strictEqual(r.polygons.features.length, 0)
            assert.strictEqual(r.points.features[0].properties.name, 'A')
            assert.strictEqual(r.points.features[1].properties.name, 'B')
        })

        it('純 MultiPoint FeatureCollection', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'mpt' }, geometry: { type: 'MultiPoint', coordinates: [[121, 25], [122, 26]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.points.features[0].properties.name, 'mpt')
            assert.strictEqual(r.points.features[0].geometry.type, 'MultiPoint')
        })

        it('純 LineString FeatureCollection', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'ls1' }, geometry: { type: 'LineString', coordinates: [[121, 25], [122, 26]] } },
                    { type: 'Feature', properties: { name: 'ls2' }, geometry: { type: 'LineString', coordinates: [[123, 27], [124, 28]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.lines.features.length, 2)
            assert.strictEqual(r.points.features.length, 0)
            assert.strictEqual(r.polygons.features.length, 0)
        })

        it('純 MultiLineString FeatureCollection', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'mls' }, geometry: { type: 'MultiLineString', coordinates: [[[121, 25], [122, 26]], [[123, 27], [124, 28]]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.lines.features.length, 1)
            assert.strictEqual(r.lines.features[0].geometry.type, 'MultiLineString')
        })

        it('純 Polygon FeatureCollection', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'pg' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.polygons.features.length, 1)
            assert.strictEqual(r.points.features.length, 0)
            assert.strictEqual(r.lines.features.length, 0)
        })

        it('純 MultiPolygon FeatureCollection', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'mpg' }, geometry: { type: 'MultiPolygon', coordinates: [[[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.polygons.features.length, 1)
            assert.strictEqual(r.polygons.features[0].geometry.type, 'MultiPolygon')
        })

    })


    // ========================================
    // 三、混合幾何類型 FeatureCollection
    // ========================================
    describe('混合幾何類型 FeatureCollection', function () {

        it('Point + LineString + Polygon 混合', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'pt' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                    { type: 'Feature', properties: { name: 'ls' }, geometry: { type: 'LineString', coordinates: [[121, 25], [122, 26]] } },
                    { type: 'Feature', properties: { name: 'pg' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.lines.features.length, 1)
            assert.strictEqual(r.polygons.features.length, 1)
            assert.strictEqual(r.points.features[0].properties.name, 'pt')
            assert.strictEqual(r.lines.features[0].properties.name, 'ls')
            assert.strictEqual(r.polygons.features[0].properties.name, 'pg')
        })

        it('MultiPoint + MultiLineString + MultiPolygon 混合', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'mpt' }, geometry: { type: 'MultiPoint', coordinates: [[121, 25], [122, 26]] } },
                    { type: 'Feature', properties: { name: 'mls' }, geometry: { type: 'MultiLineString', coordinates: [[[121, 25], [122, 26]], [[123, 27], [124, 28]]] } },
                    { type: 'Feature', properties: { name: 'mpg' }, geometry: { type: 'MultiPolygon', coordinates: [[[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.lines.features.length, 1)
            assert.strictEqual(r.polygons.features.length, 1)
        })

        it('所有 6 種幾何類型混合', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'pt' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                    { type: 'Feature', properties: { name: 'mpt' }, geometry: { type: 'MultiPoint', coordinates: [[121, 25], [122, 26]] } },
                    { type: 'Feature', properties: { name: 'ls' }, geometry: { type: 'LineString', coordinates: [[121, 25], [122, 26]] } },
                    { type: 'Feature', properties: { name: 'mls' }, geometry: { type: 'MultiLineString', coordinates: [[[121, 25], [122, 26]], [[123, 27], [124, 28]]] } },
                    { type: 'Feature', properties: { name: 'pg' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] } },
                    { type: 'Feature', properties: { name: 'mpg' }, geometry: { type: 'MultiPolygon', coordinates: [[[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 2)
            assert.strictEqual(r.lines.features.length, 2)
            assert.strictEqual(r.polygons.features.length, 2)
        })

    })


    // ========================================
    // 四、GeometryCollection 拆解
    // ========================================
    describe('GeometryCollection 拆解', function () {

        it('GeometryCollection 內含 Point + LineString + Polygon 應拆成獨立 Feature', function () {
            let input = {
                type: 'Feature',
                properties: { name: '混合幾何', color: 'red' },
                geometry: {
                    type: 'GeometryCollection',
                    geometries: [
                        { type: 'Point', coordinates: [121, 25] },
                        { type: 'LineString', coordinates: [[121, 25], [122, 26]] },
                        { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] },
                    ],
                },
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.lines.features.length, 1)
            assert.strictEqual(r.polygons.features.length, 1)
            // 驗證 properties 繼承
            assert.strictEqual(r.points.features[0].properties.name, '混合幾何')
            assert.strictEqual(r.points.features[0].properties.color, 'red')
            assert.strictEqual(r.lines.features[0].properties.name, '混合幾何')
            assert.strictEqual(r.polygons.features[0].properties.name, '混合幾何')
        })

        it('FeatureCollection 中的 GeometryCollection 也應正確拆解', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'normal' }, geometry: { type: 'Point', coordinates: [120, 24] } },
                    {
                        type: 'Feature',
                        properties: { name: 'gc' },
                        geometry: {
                            type: 'GeometryCollection',
                            geometries: [
                                { type: 'Point', coordinates: [121, 25] },
                                { type: 'LineString', coordinates: [[121, 25], [122, 26]] },
                            ],
                        },
                    },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 2)   // normal + gc 的 Point
            assert.strictEqual(r.lines.features.length, 1)    // gc 的 LineString
            assert.strictEqual(r.points.features[0].properties.name, 'normal')
            assert.strictEqual(r.points.features[1].properties.name, 'gc')
        })

        it('巢狀 GeometryCollection（GC 內含 GC）應遞迴拆解', function () {
            let input = {
                type: 'Feature',
                properties: { name: '巢狀' },
                geometry: {
                    type: 'GeometryCollection',
                    geometries: [
                        { type: 'Point', coordinates: [121, 25] },
                        {
                            type: 'GeometryCollection',
                            geometries: [
                                { type: 'LineString', coordinates: [[121, 25], [122, 26]] },
                                { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] },
                            ],
                        },
                    ],
                },
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.lines.features.length, 1)
            assert.strictEqual(r.polygons.features.length, 1)
            // 巢狀拆出來的 Feature 也繼承 properties
            assert.strictEqual(r.lines.features[0].properties.name, '巢狀')
            assert.strictEqual(r.polygons.features[0].properties.name, '巢狀')
        })

        it('空的 GeometryCollection 應不產生任何 Feature', function () {
            let input = {
                type: 'Feature',
                properties: { name: '空 GC' },
                geometry: {
                    type: 'GeometryCollection',
                    geometries: [],
                },
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 0)
            assert.strictEqual(r.lines.features.length, 0)
            assert.strictEqual(r.polygons.features.length, 0)
        })

    })


    // ========================================
    // 五、Polygon ring 閉合修復
    // ========================================
    describe('Polygon ring 閉合修復', function () {

        it('未閉合的 Polygon 應自動補上閉合座標', function () {
            let input = {
                type: 'Feature',
                properties: { name: '未閉合' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4]]], // 未閉合
                },
            }
            let r = splitGeoJSON(input)
            let ring = r.polygons.features[0].geometry.coordinates[0]
            let first = ring[0]
            let last = ring[ring.length - 1]
            assert.strict.deepEqual(first, last) // 首尾座標應相同
            assert.strictEqual(ring.length, 5)   // 4 + 1 閉合
        })

        it('已閉合的 Polygon 不應重複補上座標', function () {
            let input = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]], // 已閉合
                },
            }
            let r = splitGeoJSON(input)
            let ring = r.polygons.features[0].geometry.coordinates[0]
            assert.strictEqual(ring.length, 5) // 不應變成 6
        })

        it('Polygon 含洞（hole）的 ring 也應修復閉合', function () {
            let input = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [[0, 0], [10, 0], [10, 10], [0, 10]],       // 外環未閉合
                        [[2, 2], [8, 2], [8, 8], [2, 8]],           // 洞環未閉合
                    ],
                },
            }
            let r = splitGeoJSON(input)
            let coords = r.polygons.features[0].geometry.coordinates
            // 外環閉合
            assert.strict.deepEqual(coords[0][0], coords[0][coords[0].length - 1])
            assert.strictEqual(coords[0].length, 5)
            // 洞環閉合
            assert.strict.deepEqual(coords[1][0], coords[1][coords[1].length - 1])
            assert.strictEqual(coords[1].length, 5)
        })

        it('MultiPolygon 的所有 ring 也應修復閉合', function () {
            let input = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'MultiPolygon',
                    coordinates: [
                        [[[0, 0], [4, 0], [4, 4], [0, 4]]],            // 第一個 Polygon 未閉合
                        [[[10, 10], [14, 10], [14, 14], [10, 14]]],     // 第二個 Polygon 未閉合
                    ],
                },
            }
            let r = splitGeoJSON(input)
            let coords = r.polygons.features[0].geometry.coordinates
            // 第一個 Polygon 閉合
            assert.strict.deepEqual(coords[0][0][0], coords[0][0][coords[0][0].length - 1])
            assert.strictEqual(coords[0][0].length, 5)
            // 第二個 Polygon 閉合
            assert.strict.deepEqual(coords[1][0][0], coords[1][0][coords[1][0].length - 1])
            assert.strictEqual(coords[1][0].length, 5)
        })

    })


    // ========================================
    // 六、單一 Feature 輸入
    // ========================================
    describe('單一 Feature 輸入', function () {

        it('直接輸入 Feature（非 FeatureCollection）', function () {
            let input = {
                type: 'Feature',
                properties: { name: '單一' },
                geometry: { type: 'Point', coordinates: [121, 25] },
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.points.features[0].properties.name, '單一')
        })

        it('直接輸入 Feature（帶 id）', function () {
            let input = {
                type: 'Feature',
                id: 'feature-001',
                properties: { name: '帶 id' },
                geometry: { type: 'LineString', coordinates: [[121, 25], [122, 26]] },
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.lines.features.length, 1)
            assert.strictEqual(r.lines.features[0].id, 'feature-001')
        })

    })


    // ========================================
    // 七、裸 Geometry 輸入
    // ========================================
    describe('裸 Geometry 輸入', function () {

        it('直接輸入 Point Geometry', function () {
            let input = { type: 'Point', coordinates: [121.517, 25.048] }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.points.features[0].type, 'Feature')
            assert.strict.deepEqual(r.points.features[0].geometry.coordinates, [121.517, 25.048])
            assert.strict.deepEqual(r.points.features[0].properties, {})
        })

        it('直接輸入 LineString Geometry', function () {
            let input = { type: 'LineString', coordinates: [[121, 25], [122, 26]] }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.lines.features.length, 1)
        })

        it('直接輸入 Polygon Geometry', function () {
            let input = { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.polygons.features.length, 1)
        })

        it('直接輸入 MultiPolygon Geometry', function () {
            let input = { type: 'MultiPolygon', coordinates: [[[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]]] }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.polygons.features.length, 1)
        })

        it('直接輸入 GeometryCollection Geometry', function () {
            let input = {
                type: 'GeometryCollection',
                geometries: [
                    { type: 'Point', coordinates: [1, 2] },
                    { type: 'LineString', coordinates: [[3, 4], [5, 6]] },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.lines.features.length, 1)
        })

    })


    // ========================================
    // 八、JSON 字串輸入
    // ========================================
    describe('JSON 字串輸入', function () {

        it('FeatureCollection JSON 字串', function () {
            let input = JSON.stringify({
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'str-pt' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                    { type: 'Feature', properties: { name: 'str-ls' }, geometry: { type: 'LineString', coordinates: [[121, 25], [122, 26]] } },
                ],
            })
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.lines.features.length, 1)
            assert.strictEqual(r.points.features[0].properties.name, 'str-pt')
        })

        it('Feature JSON 字串', function () {
            let input = JSON.stringify({
                type: 'Feature',
                properties: { name: 'str-feature' },
                geometry: { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] },
            })
            let r = splitGeoJSON(input)
            assert.strictEqual(r.polygons.features.length, 1)
            assert.strictEqual(r.polygons.features[0].properties.name, 'str-feature')
        })

        it('裸 Geometry JSON 字串', function () {
            let input = JSON.stringify({ type: 'Point', coordinates: [121, 25] })
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
        })

    })


    // ========================================
    // 九、深拷貝驗證（不汙染原始資料）
    // ========================================
    describe('深拷貝驗證', function () {

        it('修改輸出不應影響原始輸入', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'original' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                ],
            }
            let r = splitGeoJSON(input)
            r.points.features[0].properties.name = 'modified'
            assert.strictEqual(input.features[0].properties.name, 'original')
        })

        it('修改輸出座標不應影響原始輸入座標', function () {
            let input = {
                type: 'Feature',
                properties: {},
                geometry: { type: 'Point', coordinates: [121, 25] },
            }
            let r = splitGeoJSON(input)
            r.points.features[0].geometry.coordinates[0] = 999
            assert.strictEqual(input.geometry.coordinates[0], 121)
        })

        it('Polygon ring 修復閉合不應影響原始輸入', function () {
            let input = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4]]], // 未閉合
                },
            }
            let r = splitGeoJSON(input)
            // 輸出已閉合
            assert.strictEqual(r.polygons.features[0].geometry.coordinates[0].length, 5)
            // 原始未被修改
            assert.strictEqual(input.geometry.coordinates[0].length, 4)
        })

    })


    // ========================================
    // 十、properties 保持完整
    // ========================================
    describe('properties 保持完整', function () {

        it('巢狀 properties（style 物件）應完整保留', function () {
            let input = {
                type: 'Feature',
                properties: {
                    name: 'styled',
                    style: {
                        fillColor: 'rgba(255, 0, 0, 0.5)',
                        strokeColor: '#000',
                        weight: 2,
                    },
                },
                geometry: { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] },
            }
            let r = splitGeoJSON(input)
            let props = r.polygons.features[0].properties
            assert.strictEqual(props.name, 'styled')
            assert.strictEqual(props.style.fillColor, 'rgba(255, 0, 0, 0.5)')
            assert.strictEqual(props.style.strokeColor, '#000')
            assert.strictEqual(props.style.weight, 2)
        })

        it('null properties 應保留為空物件', function () {
            let input = {
                type: 'Feature',
                properties: null,
                geometry: { type: 'Point', coordinates: [121, 25] },
            }
            let r = splitGeoJSON(input)
            assert.strict.deepEqual(r.points.features[0].properties, {})
        })

        it('缺少 properties 欄位應保留為空物件', function () {
            let input = {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [121, 25] },
            }
            let r = splitGeoJSON(input)
            assert.strict.deepEqual(r.points.features[0].properties, {})
        })

    })


    // ========================================
    // 十一、回傳結構驗證
    // ========================================
    describe('回傳結構驗證', function () {

        it('回傳物件應包含 points、lines、polygons 三個 FeatureCollection', function () {
            let r = splitGeoJSON(null)
            assert.strictEqual(r.points.type, 'FeatureCollection')
            assert.strictEqual(r.lines.type, 'FeatureCollection')
            assert.strictEqual(r.polygons.type, 'FeatureCollection')
            assert.ok(Array.isArray(r.points.features))
            assert.ok(Array.isArray(r.lines.features))
            assert.ok(Array.isArray(r.polygons.features))
        })

        it('輸出的每個 Feature 應包含 type、properties、geometry', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'pt' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                ],
            }
            let r = splitGeoJSON(input)
            let f = r.points.features[0]
            assert.strictEqual(f.type, 'Feature')
            assert.ok(f.properties !== undefined)
            assert.ok(f.geometry !== undefined)
            assert.strictEqual(f.geometry.type, 'Point')
        })

    })


    // ========================================
    // 十二、實際 GeoJSON 數據場景
    // ========================================
    describe('實際 GeoJSON 數據場景', function () {

        it('多重 MultiPolygon（模擬等高線填色）', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: { style: { fillColor: 'rgba(255, 255, 255, 1)' } },
                        geometry: {
                            type: 'MultiPolygon',
                            coordinates: [[[[121.247, 23.162], [120.984, 23.171], [121.073, 23.191], [121.247, 23.162]]]],
                        },
                    },
                    {
                        type: 'Feature',
                        properties: { style: { fillColor: 'rgba(254, 200, 127, 1)' } },
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
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 0)
            assert.strictEqual(r.lines.features.length, 0)
            assert.strictEqual(r.polygons.features.length, 2)
            assert.strictEqual(r.polygons.features[0].properties.style.fillColor, 'rgba(255, 255, 255, 1)')
            assert.strictEqual(r.polygons.features[1].properties.style.fillColor, 'rgba(254, 200, 127, 1)')
        })

        it('模擬地圖標記 + 路線 + 區域混合', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    // 地圖標記
                    { type: 'Feature', properties: { name: '台北車站', icon: 'station' }, geometry: { type: 'Point', coordinates: [121.517, 25.048] } },
                    { type: 'Feature', properties: { name: '高雄車站', icon: 'station' }, geometry: { type: 'Point', coordinates: [120.302, 22.639] } },
                    // 路線
                    { type: 'Feature', properties: { name: '高鐵路線', color: 'orange' }, geometry: { type: 'LineString', coordinates: [[121.517, 25.048], [120.686, 24.145], [120.302, 22.639]] } },
                    // 區域
                    { type: 'Feature', properties: { name: '台北市', color: 'blue' }, geometry: { type: 'Polygon', coordinates: [[[121.4, 25.0], [121.6, 25.0], [121.6, 25.1], [121.4, 25.1], [121.4, 25.0]]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 2)
            assert.strictEqual(r.lines.features.length, 1)
            assert.strictEqual(r.polygons.features.length, 1)
            assert.strictEqual(r.points.features[0].properties.name, '台北車站')
            assert.strictEqual(r.lines.features[0].properties.name, '高鐵路線')
            assert.strictEqual(r.polygons.features[0].properties.name, '台北市')
        })

        it('Polygon 帶洞（donut polygon）', function () {
            let input = {
                type: 'Feature',
                properties: { name: '帶洞多邊形' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],   // 外環
                        [[2, 2], [8, 2], [8, 8], [2, 8], [2, 2]],       // 洞
                    ],
                },
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.polygons.features.length, 1)
            assert.strictEqual(r.polygons.features[0].geometry.coordinates.length, 2) // 1 外環 + 1 洞
        })

        it('三層套疊 MultiPolygon', function () {
            // Ring A (最外層 10x10) → 填色
            // Ring B (第二層 8x8, 在 A 內) → 挖洞
            // Ring C (第三層 4x4, 在 B 內) → 填色
            // 正規化後為 MultiPolygon：Polygon1(A+B洞), Polygon2(C)
            let input = {
                type: 'Feature',
                properties: { name: '三層套疊' },
                geometry: {
                    type: 'MultiPolygon',
                    coordinates: [
                        [
                            [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],   // Ring A 外環
                            [[1, 1], [9, 1], [9, 9], [1, 9], [1, 1]],       // Ring B 洞
                        ],
                        [
                            [[3, 3], [7, 3], [7, 7], [3, 7], [3, 3]],       // Ring C 外環（獨立填色）
                        ],
                    ],
                },
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.polygons.features.length, 1)
            assert.strictEqual(r.polygons.features[0].geometry.type, 'MultiPolygon')
            assert.strictEqual(r.polygons.features[0].geometry.coordinates.length, 2) // 2 個 Polygon
            assert.strictEqual(r.polygons.features[0].geometry.coordinates[0].length, 2) // 第一個有外環+洞
            assert.strictEqual(r.polygons.features[0].geometry.coordinates[1].length, 1) // 第二個只有外環
        })

    })


    // ========================================
    // 十三、Feature 缺少 geometry 或 geometry 無效
    // ========================================
    describe('Feature 缺少 geometry 或 geometry 無效', function () {

        it('Feature 無 geometry 應被跳過', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'no-geom' } },
                    { type: 'Feature', properties: { name: 'has-geom' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.points.features[0].properties.name, 'has-geom')
        })

        it('Feature geometry 為 null 應被跳過', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'null-geom' }, geometry: null },
                    { type: 'Feature', properties: { name: 'ok' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.points.features[0].properties.name, 'ok')
        })

        it('Feature geometry type 為未知類型應被跳過', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', properties: { name: 'unknown' }, geometry: { type: 'Mesh', coordinates: [] } },
                    { type: 'Feature', properties: { name: 'ok' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 1)
            assert.strictEqual(r.points.features[0].properties.name, 'ok')
        })

    })


    // ========================================
    // 十四、大量 Feature 效能邊界
    // ========================================
    describe('大量 Feature', function () {

        it('100 個 Feature 混合類型應正確分類', function () {
            let features = []
            for (let i = 0; i < 100; i++) {
                if (i % 3 === 0) {
                    features.push({ type: 'Feature', properties: { idx: i }, geometry: { type: 'Point', coordinates: [121 + i * 0.001, 25 + i * 0.001] } })
                }
                else if (i % 3 === 1) {
                    features.push({ type: 'Feature', properties: { idx: i }, geometry: { type: 'LineString', coordinates: [[121, 25], [122, 26]] } })
                }
                else {
                    features.push({ type: 'Feature', properties: { idx: i }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] } })
                }
            }
            let input = { type: 'FeatureCollection', features }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features.length, 34)      // 0,3,6,...,99 → 34 個
            assert.strictEqual(r.lines.features.length, 33)       // 1,4,7,...,97 → 33 個
            assert.strictEqual(r.polygons.features.length, 33)    // 2,5,8,...,98 → 33 個
        })

    })


    // ========================================
    // 十五、Feature 帶 id 屬性
    // ========================================
    describe('Feature 帶 id 屬性', function () {

        it('Feature 的 id 應被保留', function () {
            let input = {
                type: 'FeatureCollection',
                features: [
                    { type: 'Feature', id: 'f1', properties: { name: 'A' }, geometry: { type: 'Point', coordinates: [121, 25] } },
                    { type: 'Feature', id: 42, properties: { name: 'B' }, geometry: { type: 'LineString', coordinates: [[121, 25], [122, 26]] } },
                    { type: 'Feature', properties: { name: 'C' }, geometry: { type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]] } },
                ],
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features[0].id, 'f1')
            assert.strictEqual(r.lines.features[0].id, 42)
            assert.strictEqual(r.polygons.features[0].id, undefined)
        })

        it('GeometryCollection 拆解後 id 應繼承', function () {
            let input = {
                type: 'Feature',
                id: 'gc-001',
                properties: { name: 'gc-with-id' },
                geometry: {
                    type: 'GeometryCollection',
                    geometries: [
                        { type: 'Point', coordinates: [121, 25] },
                        { type: 'LineString', coordinates: [[121, 25], [122, 26]] },
                    ],
                },
            }
            let r = splitGeoJSON(input)
            assert.strictEqual(r.points.features[0].id, 'gc-001')
            assert.strictEqual(r.lines.features[0].id, 'gc-001')
        })

    })


    // ========================================
    // 十六、座標完整性驗證
    // ========================================
    describe('座標完整性驗證', function () {

        it('Point 座標應完整保留', function () {
            let input = { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [121.517, 25.048] } }
            let r = splitGeoJSON(input)
            assert.strict.deepEqual(r.points.features[0].geometry.coordinates, [121.517, 25.048])
        })

        it('含高程的 3D 座標應完整保留', function () {
            let input = { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [121.517, 25.048, 100] } }
            let r = splitGeoJSON(input)
            assert.strict.deepEqual(r.points.features[0].geometry.coordinates, [121.517, 25.048, 100])
        })

        it('LineString 座標應完整保留', function () {
            let coords = [[121.0, 25.0], [121.5, 25.5], [122.0, 26.0]]
            let input = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
            let r = splitGeoJSON(input)
            assert.strict.deepEqual(r.lines.features[0].geometry.coordinates, coords)
        })

        it('MultiPolygon 多個 Polygon 座標應完整保留', function () {
            let coords = [
                [[[0, 0], [4, 0], [4, 4], [0, 4], [0, 0]]],
                [[[10, 10], [14, 10], [14, 14], [10, 14], [10, 10]]],
            ]
            let input = { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: coords } }
            let r = splitGeoJSON(input)
            assert.strict.deepEqual(r.polygons.features[0].geometry.coordinates, coords)
        })

    })


})
