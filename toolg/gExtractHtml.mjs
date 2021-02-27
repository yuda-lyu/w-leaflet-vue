import fs from 'fs'
import prettyhtml from '@starptech/prettyhtml'
import _ from 'lodash'
import w from 'wsemi'
import getFiles from 'w-package-tools/src/getFiles.mjs'
import cleanFolder from 'w-package-tools/src/cleanFolder.mjs'
import parseVueCode from 'w-package-tools/src/parseVueCode.mjs'


let fdSrc = './src/'
let fdTestHtml = './test-html/'
//let fdTestSrc = './test-action/'


let h = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-tw">
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>example for {{casename}}</title>

    <!-- @babel/polyfill -->
    <script nomodule src="https://cdn.jsdelivr.net/npm/@babel/polyfill/dist/polyfill.min.js"></script>

    <!-- vue -->
    <script src="https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.min.js"></script>

    <!-- leaflet -->
    <script _src="https://cdn.jsdelivr.net/npm/leaflet/dist/leaflet.min.js"></script>

    <!-- vue2-leaflet -->
    <script _src="https://cdn.jsdelivr.net/npm/vue2-leaflet/dist/vue2-leaflet.min.js"></script>

    <!-- w-leaflet-vue -->
    <script src="../dist/w-leaflet-vue.umd.js"></script>

    <!-- data -->
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.12/res/data/dataRain.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.12/res/data/dataRainClip.js"></script>
    <script>
        //save in window
        window.dataRain=dataRain
        window.dataRainClip=dataRainClip
    </script>

    <!-- w-jsonview-tree -->
    <script src="https://cdn.jsdelivr.net/npm/w-jsonview-tree/dist/w-jsonview-tree.umd.js"></script>
    <script>
        let jv=window['w-jsonview-tree']
    </script>

    <style>
        .item-link {
            display: inline-block;
            margin: 10px 10px 5px 0px;
            padding: 5px 10px;
            font-size: 0.8rem;
            color: #fff;
            background-color: #443a65;
            cursor: pointer;
            text-decoration: none;
        }
        .option-label {
            position:absolute;
            left:10px;
            top:-33px;
            padding:4px 20px 7px 20px;
            border-left:1px solid #ddd;
            border-top:1px solid #ddd;
            border-right:1px solid #ddd;
            border-bottom:1px solid #f6f6f6;
            border-top-left-radius:15px;
            border-top-right-radius:15px;
            background:#f6f6f6;
        }
    </style>

</head>
<body style="font-family:'Microsoft JhengHei','Avenir','Helvetica'; padding:0px 30px; margin:0px;">

    <div id="app">

        {{tmp}}

    </div>

    <script>

        //install w-leaflet-vue
        Vue.component('w-leaflet-vue', window['w-leaflet-vue'])

        //initialize
        new Vue({
            el: '#app',
            data: {{data}},
            mounted: {{mounted}},
            computed: {{computed}},
            methods: {{methods}},
        })

    </script>

</body>
</html>
`


function writeHtml({ fn, casename, tmp, mounted, data, computed, methods, action }) {

    //c
    let c = h

    //replace casename
    c = c.replace('{{casename}}', casename)

    //replace tmp
    c = c.replace('{{tmp}}', tmp)

    //replace data
    c = c.replace('{{data}}', data)

    //replace mounted
    c = c.replace('{{mounted}}', mounted)

    //prettyhtml
    //replace computed
    c = c.replace('{{computed}}', computed)

    //replace methods
    c = c.replace('{{methods}}', methods)

    //prettyhtml
    c = prettyhtml(c, {
        tabWidth: 4,
    })
    c = c.contents //取contents
    //console.log('prettyhtml', c)

    //write
    // console.log(c)
    fs.writeFileSync(fn, c, 'utf8')

    // //write action
    // fs.writeFileSync(fdTestSrc + `${v.fn}.action.json`, v.action, 'utf8')

}


function extractApp(fn) {

    //casename
    let casename = fn.replace('.vue', '')

    //read
    let hh = fs.readFileSync(fdSrc + fn, 'utf8')

    //取代example與code
    hh = w.replace(hh, '{filename}', casename)

    // //複寫回去, 因開發階段懶得手動改全部, 故得用程式改
    // fs.writeFileSync(fdSrc + fn, hh, 'utf8')

    //parseVueCode
    let { tmp, mounted, data, computed, methods, action } = parseVueCode(hh)

    //tmp, change cmp name
    tmp = w.replace(tmp, 'WLeafletVue', 'w-leaflet-vue')

    //writeHtml
    writeHtml({
        fn: fdTestHtml + `ex-${casename}.html`,
        casename,
        tmp,
        mounted,
        data,
        computed,
        methods,
        action,
    })

}


function main() {
    //由jsdoc產製之wsemi.html, 自動添加將example轉換成codepen線上編輯功能

    //cleanFolder
    cleanFolder(fdTestHtml)
    //cleanFolder(fdTestSrc)

    //getFiles
    let ltfs = getFiles(fdSrc)

    //filter
    ltfs = _.filter(ltfs, function(v) {
        return v.indexOf('App') >= 0
    })
    _.pull(ltfs, 'App.vue')
    //console.log(ltfs)

    //extractApp
    _.each(ltfs, function(v) {
        console.log('extracting: ' + fdSrc + v)
        extractApp(v)
    })

}
main()
