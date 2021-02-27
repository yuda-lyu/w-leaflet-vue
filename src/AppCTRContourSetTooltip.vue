<template>
    <div>

        <div style="padding:20px;">
            <div style="font-size:1.5rem;">contourSet.tooltip</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppCTRContourSetTooltip.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppCTRContourSetTooltip.html" target="_blank" class="item-link">code</a>
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
                center: [24.084, 121.068],
                zoom: 8,
                defContourSetsTooltip: function(v) {
                    console.log('defContourSetsTooltip', v)
                    let c = ''
                    c += '<div style="padding:5px 10px;">'
                    c += '<div style="color:#222; font-size:0.9rem; white-space:nowrap;"><span style="color:#62f;">[Popup>contourSets]</span> ' + v.contourSet.title + '</div>'
                    c += '<div style="color:#aaa; white-space:normal;">' + v.contourSet.msg + '</div>'
                    c += '</div>'
                    return c
                },
                contourSets: [
                    {
                        title: 'contourSet A',
                        msg: 'msg from contourSet A',
                        points: [
                            [24.325, 120.786, 0], [23.944, 120.968, 10], [24.884, 121.234, 20], [24.579, 121.345, 80], [24.664, 121.761, 40], [23.803, 121.397, 30],
                            [23.727, 120.772, 0], [23.539, 120.975, 0], [23.612, 121.434, 0],
                            [23.193, 120.355, 22], [23.456, 120.890, 42], [23.280, 120.551, 25], [23.162, 121.247, 5],
                        ],
                        visible: true,
                        tooltip: function(v) {
                            console.log('contourSets[0] tooltip', v)
                            let c = ''
                            c += '<div style="padding:5px 10px;">'
                            c += '<div style="color:#222; font-size:0.9rem; white-space:nowrap;"><span style="color:#f26;">[Tooltip>polygonSet]</span> ' + v.contourSet.title + '</div>'
                            c += '<div style="color:#aaa; white-space:normal;">' + v.contourSet.msg + '</div>'
                            c += '</div>'
                            return c
                        },
                    },
                    {
                        title: 'contourSet B',
                        msg: 'msg from contourSet B',
                        points: [
                            [22.607, 120.416, 0], [22.967, 120.663, 15], [22.592, 120.922, 20], [22.717, 120.644, 45],
                        ],
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
