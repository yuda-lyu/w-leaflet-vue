<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">panelScale.position</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppPSCPosition.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppPSCPosition.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div>
                <button style="margin:0px 3px 3px 0px;" @click="opt.panelScale.position='topleft'">topleft</button>
                <button style="margin:0px 3px 3px 0px;" @click="opt.panelScale.position='topright'">topright</button>
                <button style="margin:0px 3px 3px 0px;" @click="opt.panelScale.position='bottomleft'">bottomleft</button>
                <button style="margin:0px 3px 3px 0px;" @click="opt.panelScale.position='bottomright'">bottomright(default)</button>
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
                panelScale: {
                    position: 'bottomright',
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
