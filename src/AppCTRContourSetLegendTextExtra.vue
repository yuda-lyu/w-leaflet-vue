<template>
    <div>

        <div style="padding:20px;">
            <div style="font-size:1.5rem;">contourSet.legendTextExtra</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppCTRContourSetOrder.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppCTRContourSetOrder.html" target="_blank" class="item-link">code</a>
        </div>

        <div style="display:flex; padding-bottom:20px;">

            <div style="padding:0px 20px;">
                <WLeafletVue
                    style="width:800px; height:500px;"
                    :opt="opt"
                ></WLeafletVue>
            </div>

            <div style="width:600px; padding:0px 20px 0px 0px; position:relative;">

                <div class="option-label">
                    opt example
                </div>

                <div style="border:1px solid #ddd;">
                    <div style="padding-left:5px; overflow-y:auto; height:500px;">
                        <div id="optjson" style="font-size:10pt;"></div>
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
                center: [24.4, 121.239],
                zoom: 9,
                contourSets: [
                    {
                        title: 'contourSet A',
                        msg: 'msg from contourSet A',
                        points: [
                            [24.325, 120.786, 4], [23.944, 120.968, 15], [24.884, 121.234, 20], [24.579, 121.345, 62], [24.664, 121.761, 35], [23.803, 121.397, 30],
                        ],
                        legendTextExtra: (msg) => {
                            console.log('contourSet A: legendTextExtra', msg)
                            let v = (msg.polygonSet.range.low + msg.polygonSet.range.up) / 2
                            if (v <= 25) {
                                return '<div style="color:#439c30;">(low)</div>'
                            }
                            else if (v <= 50) {
                                return '<div style="color:#91830b;">(middle)</div>'
                            }
                            return '<div style="color:#f26;">(high)</div>'
                        },
                        visible: true,
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
