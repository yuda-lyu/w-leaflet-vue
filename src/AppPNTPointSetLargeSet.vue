<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">pointSet.largeSet</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppPNTPointSetLargeSet.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppPNTPointSetLargeSet.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">
                    <WLeafletVue
                        style="width:800px; height:500px;"
                        :opt="opt"
                    >
                        <template v-slot:point-popup="props">
                            <div style="width:300px;">

                                <div style="padding:15px;">
                                    <div style="_white-space:nowrap; padding-bottom:5px;">
                                        <div style="font-size:0.90rem; color:#f26;">[PointSet: {{ props.pointSet.title }}]</div>
                                        <div style="font-size:0.70rem; color:#777;">{{ props.pointSet.msg }}</div>
                                    </div>
                                    <div style="_white-space:nowrap;">
                                        <div style="font-size:0.80rem;color:#aa2df4;">[Point: {{ props.point.title }}]</div>
                                        <div style="font-size:0.70rem;color:#777;">{{ props.point.msg }}</div>
                                    </div>
                                </div>

                                <div style="padding:15px; border-top:1px solid #ddd;">

                                    <div style="color:#454bbc; font-size:0.9rem; white-space:nowrap;">
                                        {{ props.point.title }}
                                    </div>

                                    <div style="padding-top:2px;">

                                        <div style="display:inline-block; padding-right:7px;">
                                            <span style="color:#777; font-size:0.75rem;">目前:</span>
                                            <span style="color:#ef8f30; font-size:0.85rem;">{{ props.point.available_rent_bikes }}</span>
                                        </div>

                                        <div style="display:inline-block; padding-right:7px;">
                                            <span style="color:#777; font-size:0.75rem;">總共:</span>
                                            <span style="color:#ef8f30; font-size:0.85rem;">{{ props.point.Quantity }}</span>
                                        </div>

                                    </div>

                                    <div style="padding-top:0px;">
                                        <span style="color:#777; font-size:0.75rem;">地址: </span>
                                        <span style="color:#777; font-size:0.75rem;">{{ props.point.msg }}</span>
                                    </div>

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
                center: [25.087, 121.54],
                zoom: 11,
                pointSets: [],
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this

        vo.showOptJson()

        let _ = window._

        fetch('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json')
            .then(function (response) {
                return response.json()
            })
            .then(function (res) {
                console.log(res)

                let points = _.map(res, (v) => {
                    let p = {
                        title: v.sna,
                        msg: v.ar,
                        latLng: [v.latitude, v.longitude],
                        available_rent_bikes: v.available_rent_bikes, //可租借
                        available_return_bikes: v.available_return_bikes, //可歸還位置
                        Quantity: v.Quantity, //總共
                    }
                    return p
                })

                let pointSet = {
                    title: 'YouBike2.0',
                    msg: 'YouBike2.0臺北市公共自行車即時資訊',
                    points,
                    visible: true,
                }

                vo.opt.pointSets = [pointSet]

            })
            .catch(function(err) {
                console.log(err)
            })

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
