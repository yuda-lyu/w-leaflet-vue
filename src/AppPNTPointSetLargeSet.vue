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
                center: [25.087, 121.54],
                zoom: 11,
                defPointSetsPopup: function(v) {
                    console.log('defPointSetsPopup', v)
                    let c = `
                        <div style="padding:20px 20px 15px 15px;">

                            <div style="color:#c1409d; font-size:0.9rem; margin-bottom:5px; white-space:nowrap;">
                                ${v.point.title}
                            </div>

                            <div style="padding-top:5px;">
                                <span style="color:#777; font-size:0.75rem;">目前 / 總共車輛: </span>
                                <span style="color:#ef8f30; font-size:0.85rem;">${v.point.sbi} / ${v.point.tot}</span>
                            </div>

                            <div style="padding-top:8px;">
                                <span style="color:#777; font-size:0.75rem;">地址: </span>
                                <span style="color:#777; font-size:0.75rem;">${v.point.msg}</span>
                            </div>

                        </div>
                    `
                    return c
                },
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
                        latLng: [v.lat, v.lng],
                        sbi: v.sbi,
                        tot: v.tot,
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
