<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">contourSet.largeSet</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppCTRContourSetLargeSet.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppCTRContourSetLargeSet.html" target="_blank" class="item-link">code</a>
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
        let ptsStation = window.dataRain
        let ptsContour = []
        for (let i = 0; i < ptsStation.length; i++) {
            let v = ptsStation[i]
            ptsContour.push([v.latLng[0], v.latLng[1], v.rain])
        }
        let ptsClip = window.dataRainClip
        return {
            'opt': {
                center: [24.084, 121.068],
                zoom: 8,
                contourSets: [
                    {
                        title: 'Rain contour',
                        msg: 'data from CWB',
                        points: ptsContour,
                        polygonClipOuter: ptsClip,
                        //放大後瀏覽時移動滑鼠於0-10會比較閃
                        // changeStyleWhenHover: false, //關閉hover的高亮效果
                        gradient: {
                            0: 'rgba(255, 255, 255, 0)', //將0-10區間改為全透明
                            0.2: 'rgb(254, 178, 76)',
                            0.4: 'rgb(252, 78, 42)',
                            0.6: 'rgb(220, 58, 38)',
                            0.8: 'rgb(200, 40, 23)',
                            1: 'rgb(180, 30, 60)',
                        },
                        visible: true,
                        order: 0,
                    },
                ],
                pointSets: [
                    {
                        title: 'Rain point',
                        msg: 'data from CWB',
                        points: ptsStation,
                        visible: false,
                        order: 1,
                        tooltip: function(v) {
                            console.log('tooltip v', v)
                            let c = ''
                            c += '<div style="padding:5px 10px;">'
                            c += '<div style="width:150px; color:#222; margin-bottom:5px; white-space:nowrap;"><span style="font-size:0.9rem; color:#f26;">[' + v.point.title + ']</span> <span style="font-size:0.8rem; ">' + v.point.msg + '</span></div>'
                            c += '<div style="font-size:0.7rem; color:#666; white-space:normal;">降雨量 ' + v.point.rain + ' cm</div>'
                            c += '</div>'
                            return c
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
