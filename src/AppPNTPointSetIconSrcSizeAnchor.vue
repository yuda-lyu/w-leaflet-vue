<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">pointSet.iconSrc,iconSize,iconAnchor,popupAnchor,tooltipAnchor</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppPNTPointSetIconSrcSizeAnchor.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppPNTPointSetIconSrcSizeAnchor.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">
                    <WLeafletVue
                        style="width:800px; height:500px;"
                        :opt="opt"
                    ></WLeafletVue>
                </div>

                <div style="width:600px; min-width:600px; padding:0px 20px;">

                    <div style="border:1px solid #ddd;">
                        <div style="padding-left:5px; overflow-y:auto; height:500px;">
                            <div id="optjson" style="font-size:10pt;"></div>
                        </div>
                    </div>

                </div>

            </div>

        </div>

    </div>
</template>

<script>
import WLeafletVue from './components/WLeafletVue.vue'
import jv from 'w-jsonview-tree'

export default {
    components: {
        WLeafletVue,
    },
    data: function() {
        return {
            'opt': {
                pointSets: [
                    {
                        title: 'pointSet A',
                        msg: 'msg from pointSet A',
                        type: 'icon',
                        points: [
                            {
                                title: 'point A-1',
                                msg: 'msg from data A-1',
                                // latLng: [24.20, 121.27],
                                latLng: [24.6508143, 121.4716748],
                                zIndexOffset: 100, //位於上方
                                // click: function click(msg) {
                                //     console.log('click', msg)
                                // },
                            },
                            {
                                title: 'point A-2',
                                msg: 'msg from data A-2',
                                latLng: [23.90, 120.97],
                                zIndexOffset: 0, //位於下方
                                // click: function click(msg) {
                                //     console.log('click', msg)
                                // },
                            },
                        ],
                        //red
                        iconSrc: 'data:image/png;base64,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',
                        iconSize: [38, 95],
                        iconAnchor: [22, 94],
                        popupAnchor: [0, -80], //葉子上緣, 此範例用不到
                        tooltipAnchor: [0, -80], //葉子上緣, 此範例用不到
                        visible: true,
                    },
                    {
                        title: 'pointSet B',
                        msg: 'msg from pointSet B',
                        type: 'icon',
                        points: [
                            {
                                title: 'point B-1',
                                msg: 'msg from data B-1',
                                latLng: [23.30, 120.57],
                            },
                            {
                                title: 'point B-2',
                                msg: 'msg from data B-2',
                                latLng: [23.00, 120.87],
                            },
                        ],
                        //orange
                        // iconSrc: 'data:image/png;base64,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',
                        // iconSize: [38, 95],
                        // iconAnchor: [22, 94],
                        // popupAnchor: [0, -80], //葉子上緣, 此範例用不到
                        // tooltipAnchor: [0, -80], //葉子上緣, 此範例用不到
                        visible: false,
                    },
                ],
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this
        vo.showOptJson()
    },
    watch: {
        opt: {
            handler: function() {
                let vo = this
                vo.showOptJson()
            },
            deep: true,
        },
    },
    methods: {
        showOptJson: function() {
            let vo = this
            jv(vo.opt, document.querySelector('#optjson'), { expanded: true })
        },
    },
}
</script>

<style>
</style>
