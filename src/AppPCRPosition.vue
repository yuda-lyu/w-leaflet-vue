<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">panelCompassRose.position</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppPCRPosition.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppPCRPosition.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div>
                <button style="margin:0px 3px 3px 0px;" @click="opt.panelCompassRose.position='topleft'">topleft</button>
                <button style="margin:0px 3px 3px 0px;" @click="opt.panelCompassRose.position='topright'">topright(default)</button>
                <button style="margin:0px 3px 3px 0px;" @click="opt.panelCompassRose.position='bottomleft'">bottomleft</button>
                <button style="margin:0px 3px 3px 0px;" @click="opt.panelCompassRose.position='bottomright'">bottomright</button>
            </div>

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
                panelLabels: {
                    show: false,
                },
                panelCompassRose: {
                    show: true,
                    position: 'topright',
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
