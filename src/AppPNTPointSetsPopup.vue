<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">pointSetsPopup</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppPNTPointSetsPopup.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppPNTPointSetsPopup.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">
                    <WLeafletVue
                        style="width:800px; height:500px;"
                        :opt="opt"
                    >
                        <template v-slot:point-popup="props">
                            <div style="padding:15px; width:300px;">
                                <div style="padding-bottom:8px;">
                                    <div style="font-size:0.90rem; color:#f26;">[Popup]</div>
                                </div>
                                <div style="padding-bottom:5px;">
                                    <div style="font-size:0.80rem; color:#aa2df4;">[PointSet: {{ props.pointSet.title }}]</div>
                                    <div style="font-size:0.70rem; color:#777;">{{ props.pointSet.msg }}</div>
                                </div>
                                <div style="">
                                    <div style="font-size:0.70rem;color:#4347de;">[Point: {{ props.point.title }}]</div>
                                    <div style="font-size:0.70rem;color:#777;">{{ props.point.msg }}</div>
                                </div>
                            </div>
                        </template>
                    </WLeafletVue>
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
                    {
                        title: 'pointSet B',
                        msg: 'msg from pointSet B',
                        points: [
                            {
                                title: 'point B-1',
                                msg: 'msg from data B-1',
                                latLng: [22.80, 120.37],
                            },
                            {
                                title: 'point B-2',
                                msg: 'msg from data B-2',
                                latLng: [22.40, 120.67],
                            },
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
