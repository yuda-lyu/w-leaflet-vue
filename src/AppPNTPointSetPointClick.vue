<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">pointSet.point.click</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppPNTPointSetPointClick.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppPNTPointSetPointClick.html" target="_blank" class="item-link">code</a>
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
                defPointSetsClick: function(v) {
                    console.log('defPointSetsClick', v)
                },
                pointSets: [
                    {
                        title: 'pointSet A',
                        msg: 'msg from pointSet A',
                        points: [
                            {
                                title: 'point A-1',
                                msg: 'msg from data A-1',
                                latLng: [24.20, 121.27],
                                click: function(msg) {
                                    console.log('pointSet[0].point[0] click', msg)
                                },
                            },
                            {
                                title: 'point A-2',
                                msg: 'msg from data A-2',
                                latLng: [23.90, 120.97],
                                click: function(msg) {
                                    console.log('pointSet[0].point[1] click', msg)
                                },
                            },
                        ],
                        visible: true,
                        click: function(msg) {
                            console.log('pointSet[0] click', msg)
                        },
                    },
                    {
                        title: 'pointSet B',
                        msg: 'msg from pointSet B',
                        points: [
                            {
                                title: 'point B-1',
                                msg: 'msg from data B-1',
                                latLng: [23.30, 120.57],
                                click: function(msg) {
                                    console.log('pointSet[1].point[0] click', msg)
                                },
                            },
                            {
                                title: 'point B-2',
                                msg: 'msg from data B-2',
                                latLng: [23.00, 120.87],
                                click: function(msg) {
                                    console.log('pointSet[1].point[1] click', msg)
                                },
                            },
                        ],
                        visible: false,
                        click: function(msg) {
                            console.log('pointSet[1] click', msg)
                        },
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
