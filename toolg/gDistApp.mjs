import rollupVueToHtml from 'w-package-tools/src/rollupVueToHtml.mjs'


let opt = {
    title: `w-leaflet-vue`,
    head: `

    <!-- rollupVueToHtml已自動添加@babel/polyfill與vue -->

    <!-- leaflet已包入 -->
    <script _src="https://cdn.jsdelivr.net/npm/leaflet/dist/leaflet.min.js"></script>

    <!-- vue2-leaflet已包入 -->
    <script _src="https://cdn.jsdelivr.net/npm/vue2-leaflet/dist/vue2-leaflet.min.js"></script>

    <!-- data -->
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.12/res/data/dataRain.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.12/res/data/dataRainClip.js"></script>
    <script>
        //save in window
        window.dataRain=dataRain
        window.dataRainClip=dataRainClip
    </script>

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

