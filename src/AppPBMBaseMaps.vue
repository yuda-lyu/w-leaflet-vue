<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">panelBaseMaps.baseMaps</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppPBMBaseMaps.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppPBMBaseMaps.html" target="_blank" class="item-link">code</a>
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
                panelBaseMaps: {
                    baseMaps: [
                        {
                            name: 'Mapbox',
                            url: '//api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VtaXNwaGVyZSIsImEiOiJja2s1anBrZzMwN3NkMndsOGt6MHo5ajI5In0._vUKnQ57n7UcWsWgOPIEgQ',
                            visible: true,
                        },
                        {
                            name: 'OpenStreetMap',
                            url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            visible: false,
                        },
                        {
                            name: 'OpenTopoMap',
                            url: '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                            visible: false,
                        },
                    ],
                },
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
