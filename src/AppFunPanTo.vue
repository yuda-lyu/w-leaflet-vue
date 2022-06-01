<template>
    <div>

        <div style="padding:20px;">
            <div style="font-size:1.5rem;">function-panTo</div>
            <a href="//yuda-lyu.github.io/w-leaflet-vue/examples/ex-AppFunPanTo.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-leaflet-vue/blob/master/docs/examples/ex-AppFunPanTo.html" target="_blank" class="item-link">code</a>
        </div>

        <div style="display:flex; padding-bottom:20px;">

            <div style="padding:0px 20px;">
                <div>
                    <button style="margin:0px 3px 3px 0px;" @click="panTo()">panTo()</button>
                    <button style="margin:0px 3px 3px 0px;" @click="panToSX()">panTo(shift x)</button>
                    <button style="margin:0px 3px 3px 0px;" @click="panToSXY()">panTo(shift x,y)</button>
                    <button style="margin:0px 3px 3px 0px;" @click="panToSXYFun()">panTo(shift x,y,funLatLng)</button>
                </div>

                <div style="position:relative; width:800px; height:500px;">

                    <WLeafletVue
                        ref="wlf"
                        style="width:800px; height:500px;"
                        :opt="opt"
                    ></WLeafletVue>

                    <div style="position:absolute; left:5px; top:5px; z-index:1000; width:190px; height:490px; background:rgba(255,255,255,0.3);">
                        <div style="padding:10px; color:#fff;">
                            Menu area
                        </div>
                    </div>

                </div>

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
                panelBaseMaps: {
                    show: false,
                },
                panelZoom: {
                    position: 'bottomright',
                },
                panelItems: {
                    position: 'bottomright',
                },
                pointSets: [
                    {
                        title: 'Lakes',
                        msg: 'tears of the mountains',
                        points: [
                            {
                                title: 'Ming Chi(明池)',
                                msg: 'Yingshi Village, Datong Township, Yilan County, Taiwan(台灣宜蘭縣大同鄉英士村)',
                                latLng: [24.6508143, 121.4716748],
                                popup: function(v) {
                                    console.log('pointSet[0].point[0] popup', v)
                                    let c = ''
                                    c += '<div style="padding:15px;">'
                                    c += '<div style="color:#222; font-size:0.9rem; white-space:nowrap;"><span style="color:#f83;">[Popup>point]</span> ' + v.point.title + '</div>'
                                    c += '<div style="color:#aaa;">' + v.point.msg + '</div>'
                                    c += '</div>'
                                    return c
                                },
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
        panTo: function() {
            let vo = this

            //latLng
            let latLng = [24.6508143, 121.4716748]

            //panTo
            vo.$refs.wlf.panTo(latLng)

        },
        panToSX: function() {
            let vo = this

            //latLng
            let latLng = [24.6508143, 121.4716748]

            //opt
            let opt = {
                ratioHorizontal: 200 / 800,
                ratioVertical: 0,
            }

            //panTo
            vo.$refs.wlf.panTo(latLng, opt)

        },
        panToSXY: function() {
            let vo = this

            //latLng
            let latLng = [24.6508143, 121.4716748]

            //opt
            let opt = {
                ratioHorizontal: 200 / 800,
                ratioVertical: 0.5,
            }

            //panTo
            vo.$refs.wlf.panTo(latLng, opt)

        },
        panToSXYFun: function() {
            let vo = this

            //latLng
            let latLng = [24.6508143, 121.4716748]

            //opt
            let opt = {
                ratioHorizontal: 200 / 800,
                ratioVertical: 0.5,
                funLatLng: function(latLng, params) {
                    console.log('funLatLng', latLng, params)
                    return params.latLngNew
                },
            }

            //panTo
            vo.$refs.wlf.panTo(latLng, opt)

        },
    },
}
</script>

<style>
</style>
