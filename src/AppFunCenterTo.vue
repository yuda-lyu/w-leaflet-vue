<template>
    <div>

        <div style="padding:20px;">
            <div style="font-size:1.5rem;">function-centerTo</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppFunCenterTo.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppFunCenterTo.html" target="_blank" class="item-link">code</a>
        </div>

        <div style="display:flex; padding-bottom:20px;">

            <div style="padding:0px 20px;">
                <div>
                    <button style="margin:0px 3px 3px 0px;" @click="centerTo([24.6508143, 121.4716748])">centerTo(24.6508143, 121.4716748)</button>
                    <button style="margin:0px 3px 3px 0px;" @click="centerTo([23.6508143, 120.4716748])">centerTo(23.6508143, 120.4716748)</button>
                </div>
                <WLeafletVue
                    ref="wlf"
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
                pointSets: [
                    {
                        title: 'Lakes',
                        msg: 'tears of the mountains',
                        points: [
                            {
                                title: 'Ming Chi(明池)',
                                msg: 'Yingshi Village, Datong Township, Yilan County, Taiwan(台灣宜蘭縣大同鄉英士村)',
                                latLng: [24.6508143, 121.4716748],
                            },
                            {
                                title: 'Jiaming Lake(嘉明湖)',
                                msg: 'Haiduan Township, Taitung County, Taiwan(台灣台東縣海端鄉)',
                                latLng: [23.2933843, 121.0341861],
                            },
                        ],
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
        centerTo: function(latLng) {
            let vo = this

            //centerTo
            vo.$refs.wlf.centerTo(latLng)

        },
    },
}
</script>

<style>
</style>
