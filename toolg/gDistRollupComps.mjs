import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src/components/'
let fdTar = './dist'


rollupFiles({
    fns: 'WLeafletVue.vue',
    fdSrc,
    fdTar,
    format: 'umd',
    nameDistType: 'kebabCase',
    globals: {
    },
    external: [
    ],
})

