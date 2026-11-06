import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import normalizeZoom, { zoomDef, zoomRange } from '../src/js/normalizeZoom.mjs'


//元件原始碼, 供取出地圖(l-map)實際被給予之層級範圍; 先剝除模板註解以免註解內文字造成誤判
let dirRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let srcVue = fs.readFileSync(path.join(dirRoot, 'src/components/WLeafletVue.vue'), 'utf8')
let srcVueNoComment = srcVue.replace(/<!--[\s\S]*?-->/g, '')

//Leaflet未指定map之minZoom/maxZoom時, 範圍取自圖層: 圖層minZoom預設0, TileLayer之maxZoom預設18(真瀏覽器實測map.getMinZoom()=0, map.getMaxZoom()=18)
let leafletDefault = { min: 0, max: 18 }

//取出l-map開頭標籤全文: 自"<l-map"起至第一個位於雙引號外之">"止
function getMapTag() {
    let i = srcVueNoComment.search(/<l-map(\s|>)/)
    assert.ok(i >= 0, '找不到l-map開頭標籤')
    let inQuote = false
    for (let j = i; j < srcVueNoComment.length; j++) {
        let c = srcVueNoComment[j]
        if (c === '"') {
            inQuote = !inQuote
        }
        else if (c === '>' && !inQuote) {
            return srcVueNoComment.slice(i, j + 1)
        }
    }
    assert.fail('l-map開頭標籤未結束')
}

//取出l-map開頭標籤內minZoom/maxZoom之綁定運算式, 未綁定者為null
function getMapBinding() {
    let tag = getMapTag()
    let pick = (name) => {
        let r = tag.match(new RegExp(`\\s(?::|v-bind:)${name}\\s*=\\s*"([^"]*)"`))
        return r ? r[1].trim() : null
    }
    return {
        min: pick('min-zoom'),
        max: pick('max-zoom'),
    }
}

//地圖實際可達之層級範圍: 有綁定且運算式為zoomRange.min/zoomRange.max者取zoomRange, 其餘取Leaflet預設
function getMapReachableRange() {
    let b = getMapBinding()
    return {
        min: b.min === 'zoomRange.min' ? zoomRange.min : leafletDefault.min,
        max: b.max === 'zoomRange.max' ? zoomRange.max : leafletDefault.max,
    }
}


describe('unit-zoom', function() {

    //既有行為: opt.zoom非正整數時取預設值7
    describe('normalizeZoom: 非正整數取預設值', function() {

        it('預設值為7', function() {
            assert.strictEqual(zoomDef, 7)
        })

        let invalids = [
            ['null', null],
            ['undefined', undefined],
            ['空字串', ''],
            ['非數字字串', 'abc'],
            ['NaN', NaN],
            ['0', 0],
            ['負整數', -1],
            ['小數0.5', 0.5],
            ['小數1.5', 1.5],
            ['字串0', '0'],
            ['空物件', {}],
            ['空陣列', []],
            ['布林', true],
        ]
        invalids.forEach(([name, v]) => {
            it(`${name} -> 7`, function() {
                assert.strictEqual(normalizeZoom(v), 7)
            })
        })

    })

    //既有行為: opt.zoom超出可用範圍時夾至邊界, 可用範圍為1~18
    describe('normalizeZoom: 夾於可用範圍', function() {

        it('可用範圍為1~18', function() {
            assert.deepStrictEqual({ ...zoomRange }, { min: 1, max: 18 })
        })

        it('超過上限夾至18', function() {
            assert.strictEqual(normalizeZoom(19), 18)
            assert.strictEqual(normalizeZoom(100), 18)
        })

        it('範圍內整數維持原值', function() {
            for (let z = zoomRange.min; z <= zoomRange.max; z++) {
                assert.strictEqual(normalizeZoom(z), z)
            }
        })

        it('依傳入範圍夾值: 低於下限夾至下限, 高於上限夾至上限', function() {
            let range = { min: 3, max: 10 }
            assert.strictEqual(normalizeZoom(2, range), 3)
            assert.strictEqual(normalizeZoom(1, range), 3)
            assert.strictEqual(normalizeZoom(3, range), 3)
            assert.strictEqual(normalizeZoom(10, range), 10)
            assert.strictEqual(normalizeZoom(11, range), 10)
        })

        it('非正整數仍取預設值7(預設值再依傳入範圍夾值)', function() {
            assert.strictEqual(normalizeZoom(null, { min: 1, max: 18 }), 7)
            assert.strictEqual(normalizeZoom(null, { min: 8, max: 18 }), 8)
            assert.strictEqual(normalizeZoom(null, { min: 1, max: 5 }), 5)
        })

    })

    //需求: 地圖與元件對層級範圍只有一個說法(地圖可達之層級, 元件須原樣接受, 使用者縮放不被拉回)
    //以下依原始碼文字檢查接線(盤點性質), 實際行為以真瀏覽器操作驗證
    describe('地圖可達層級與元件正規化一致', function() {

        it('l-map之minZoom/maxZoom取自zoomRange(地圖可達範圍=zoomRange)', function() {
            let b = getMapBinding()
            assert.strictEqual(b.min, 'zoomRange.min', 'l-map之:min-zoom未綁定zoomRange.min')
            assert.strictEqual(b.max, 'zoomRange.max', 'l-map之:max-zoom未綁定zoomRange.max')
            assert.deepStrictEqual(getMapReachableRange(), { ...zoomRange })
        })

        it('元件匯入zoomRange並置於data供模板綁定', function() {
            assert.ok(/import\s+normalizeZoom\s*,\s*\{[^}]*\bzoomRange\b[^}]*\}\s*from\s*['"]\.\.\/js\/normalizeZoom\.mjs['"]/.test(srcVue), '元件未匯入zoomRange')
            assert.ok(/^\s*zoomRange\s*:\s*zoomRange\s*,?/m.test(srcVue), '元件data未提供zoomRange')
        })

        it('changeOpt以normalizeZoom正規化opt.zoom(非正整數取預設, 夾於範圍)', function() {
            assert.ok(/(?:let|const)\s+zoom\s*=\s*normalizeZoom\(\s*get\(\s*vo\s*,\s*['"]opt\.zoom['"]\s*,\s*null\s*\)\s*\)/.test(srcVue), 'changeOpt未以normalizeZoom正規化opt.zoom')
        })

        it('zoomRange為凍結物件(避免被Vue data觀察與被誤改)', function() {
            assert.ok(Object.isFrozen(zoomRange))
        })

        it('地圖可達之每一層級, 寫回opt.zoom後經正規化仍為原值(縮放不被拉回)', function() {
            let r = getMapReachableRange()
            let bads = []
            for (let z = r.min; z <= r.max; z++) {
                let v = normalizeZoom(z) //updateZoom寫回opt.zoom=z, changeOpt再以此值正規化並套回地圖
                if (v !== z) {
                    bads.push(`${z}->${v}`)
                }
            }
            assert.deepStrictEqual(bads, [], `地圖可達範圍${r.min}~${r.max}內有層級被正規化改值: ${bads.join(', ')}`)
        })

    })

})
