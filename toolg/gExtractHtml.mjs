import fs from 'fs'
import _ from 'lodash'
import w from 'wsemi'
import getFiles from 'w-package-tools/src/getFiles.mjs'
import cleanFolder from 'w-package-tools/src/cleanFolder.mjs'
import parseVueCode from 'w-package-tools/src/parseVueCode.mjs'
import extractHtml from 'w-package-tools/src/extractHtml.mjs'


let fdSrc = './src/'
let fdTestHtml = './test-html/'
let fdTestSrc = './test-action/'


function writeHtml(v) {

    function getAppTmp() {
        return v.tmp
    }

    function procHtml(h) {

        //change cmp name
        h = w.replace(h, 'WLeafletVue', 'w-leaflet-vue')

        return h
    }

    //opt
    let opt = {
        title: `example for ${v.casename}`,
        head: `
    
        <!-- extractHtml已自動添加@babel/polyfill與vue -->
    
        <!-- leaflet已包入 -->
        <script _src="https://cdn.jsdelivr.net/npm/leaflet/dist/leaflet.min.js"></script>
    
        <!-- vue2-leaflet已包入 -->
        <script _src="https://cdn.jsdelivr.net/npm/vue2-leaflet/dist/vue2-leaflet.min.js"></script>
    
        <!-- w-leaflet-vue -->
        <script src="../dist/w-leaflet-vue.umd.js"></script>
    
        <!-- w-gis -->
        <script _src="https://cdn.jsdelivr.net/npm/w-gis@1.0.25/dist/w-gis.umd.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/w-gis@1.0.25/dist/interp2.wk.umd.js"></script>
  
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
    
        `,
        appTag: `div`,
        appStyle: `padding:0px 30px;`,
        appTmp: getAppTmp(),
        installVue: `Vue.component('w-leaflet-vue', window['w-leaflet-vue'])`,
        newVue: ``,
        data: v.data,
        mounted: v.mounted,
        computed: v.computed,
        methods: v.methods,
        action: v.action,
        procHtml,
        fpHtml: `${fdTestHtml}${v.fn}.html`,
        fpAction: `${fdTestSrc}${v.fn}.action.json`,
    }

    //extractHtml
    extractHtml(opt)

}


function extractApp(fn) {

    //casename
    let casename = fn.replace('.vue', '')

    //read
    let hh = fs.readFileSync(fdSrc + fn, 'utf8')

    // //取代example與code
    // hh = w.replace(hh, '{filename}', casename)

    // //複寫回去, 因開發階段懶得手動改全部, 故得用程式改
    // fs.writeFileSync(fdSrc + fn, hh, 'utf8')

    //parseVueCode
    let { tmp, mounted, data, computed, methods, action } = parseVueCode(hh)

    //writeHtml
    writeHtml({
        fn: `ex-${casename}`,
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
