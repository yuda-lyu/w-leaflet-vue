<template>
    <div>

        <div style="padding:20px;">
            <div style="font-size:1.5rem;">contourSet.legendTextFormater</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppCTRContourSetLegendTextFormater.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppCTRContourSetLegendTextFormater.html" target="_blank" class="item-link">code</a>
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
                        legendTextFormater: function(msg) {
                            console.log('legendTextFormater', msg)
                            let low = msg.low
                            let up = msg.up
                            function aWidth(v, w) {
                                return '<div style="display:inline-block; width:' + w + 'px;">' + v + '</div>'
                            }
                            function aPaddingH(v, pleft, pright) {
                                return '<div style="display:inline-block; padding:0px ' + pright + 'px 0px ' + pleft + 'px;">' + v + '</div>'
                            }
                            function aStar() {
                                return '<div style="display:inline-block; position:relative;"><div style="position:absolute; transform:translateY(-50%);">*</div></div>'
                            }
                            let t = aWidth(low, 15) + aPaddingH('-', 3, 3) + aWidth(up, 15) + aPaddingH('(ppm)', 3, 0)
                            let color = ''
                            let w = ''
                            if (low >= 50 && up >= 50) {
                                w = aStar()
                                color = 'color:red;'
                            }
                            return '<div style="display:flex; align-items:center; text-align:right; ' + color + '">' + t + w + '</div>'
                        },
                        visible: true,
                    },
                ],
                pointSets: [
                    {
                        title: 'points',
                        points: [
                            [24.325, 120.786, 4], [23.944, 120.968, 15], [24.884, 121.234, 20], [24.579, 121.345, 66], [24.664, 121.761, 35], [23.803, 121.397, 30]
                        ],
                        visible: false,
                        order: 3,
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
