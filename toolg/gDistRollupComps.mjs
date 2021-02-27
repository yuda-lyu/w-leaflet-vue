import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src/components/'
let fdTar = './dist'


rollupFiles({
    fns: 'WLeafletVue.vue',
    fdSrc,
    fdTar,
    format: 'umd',
    //nameDistType: 'kebabCase',
    hookNameDist: () => {
        return 'w-leaflet-vue'
    },
    globals: {
        // 'leaflet': 'leaflet',
        // 'vue2-leaflet': 'vue2-leaflet',
    },
    external: [
        // 'leaflet',
        // 'vue2-leaflet',
    ],
})

