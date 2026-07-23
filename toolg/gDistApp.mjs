import rollupVueToHtml from 'w-package-tools/src/rollupVueToHtml.mjs'


let opt = {
    title: `w-leaflet-vue`,
    head: `

    <!-- rollupVueToHtml已自動添加@babel/polyfill與vue -->

    <!-- leaflet已包入 -->
    <script _src="https://cdn.jsdelivr.net/npm/leaflet/dist/leaflet.min.js"></script>

    <!-- vue2-leaflet已包入 -->
    <script _src="https://cdn.jsdelivr.net/npm/vue2-leaflet/dist/vue2-leaflet.min.js"></script>

    <!-- lodash -->
    <script src="https://cdn.jsdelivr.net/npm/lodash/lodash.min.js"></script>

    <!-- wsemi -->
    <script src="https://cdn.jsdelivr.net/npm/wsemi/dist/wsemi.umd.min.js"></script>

    <!-- w-gis -->
    <script _src="https://cdn.jsdelivr.net/npm/w-gis@latest/dist/w-gis.umd.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-gis@latest/dist/interp2.wk.umd.js"></script>

    <!-- data -->
    <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataRain.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataRainClip.js"></script>

    `,
    newVue: ``,
    globals: {
        // 'leaflet': 'leaflet',
        // 'vue2-leaflet': 'vue2-leaflet',
    },
    external: [
        // 'leaflet',
        // 'vue2-leaflet',
    ],
}
rollupVueToHtml('./src/App.vue', './docs/examples/app.html', opt)

