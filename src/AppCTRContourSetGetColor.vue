<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">contourSet.getColor</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppCTRContourSetGetColor.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppCTRContourSetGetColor.html" target="_blank" class="item-link">code</a>
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
                center: [24.084, 121.068],
                zoom: 8,
                contourSets: [
                    {
                        title: 'contourSet A',
                        msg: 'msg from contourSet A',
                        points: [
                            [24.325, 120.786, 0], [23.944, 120.968, 10], [24.884, 121.234, 20], [24.579, 121.345, 80], [24.664, 121.761, 40], [23.803, 121.397, 30],
                            [23.727, 120.772, 0], [23.539, 120.975, 0], [23.612, 121.434, 0],
                            [23.193, 120.355, 22], [23.456, 120.890, 42], [23.280, 120.551, 25], [23.162, 121.247, 5],
                        ],
                        thresholds: [0, 5, 10, 20, 30, 40, 55, 70, 85],
                        getColor: (msg) => {
                            console.log('contourSet A: getColor', msg)
                            let v = (msg.polygonSet.range.low + msg.polygonSet.range.up) / 2
                            if (v <= 15) {
                                return '#6e7'
                            }
                            else if (v <= 50) {
                                return '#f92'
                            }
                            return '#e23'
                        },
                        visible: true,
                    },
                    {
                        title: 'contourSet B',
                        msg: 'msg from contourSet B',
                        points: [
                            [22.607, 120.416, 0], [22.967, 120.663, 15], [22.592, 120.922, 20], [22.717, 120.644, 45],
                        ],
                        thresholds: [0, 15, 30, 35, 40, 45, 50],
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
