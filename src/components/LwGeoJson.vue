<template>
    <div>

        <!-- map的preferCanvas須為false, 才有辦法觸發mouseout -->
        <!-- geojson初始化樣式有問題, 故只能先用optionsStyle設定原始wrapStyle, 再通過mouseover視為滑鼠移入改樣式為wrapStyleHover -->
        <!-- 但因geojson的滑鼠進入出偵測不夠平滑, 會過多觸發導致閃爍, 故geojson預設滑鼠進入與離開樣式皆相同, preferCanvas可給true -->
        <l-geo-json
            :geojson="geojson"
            :optionsStyle="(feature)=>{
                return wrapStyle
            }"
            @mouseover="(ev)=>{funMouseEnter(ev)}"
            @mouseout="(ev)=>{funMouseLeave(ev)}"
            @click="(ev)=>{funClick(ev);$emit('click',ev)}"
        ></l-geo-json>

        <l-layer-group ref="refTooltip">
            <TooltipRegion>
                <template v-slot>
                    <slot name="tooltip"></slot>
                </template>
            </TooltipRegion>
        </l-layer-group>

        <l-layer-group ref="refPopup">
            <PopupRegion>
                <template v-slot>
                    <slot name="popup"></slot>
                </template>
            </PopupRegion>
        </l-layer-group>

    </div>
</template>

<script>
import iseobj from 'wsemi/src/iseobj.mjs'
import { LGeoJson, LLayerGroup } from 'vue2-leaflet'
import PopupRegion from './PopupRegion.vue'
import TooltipRegion from './TooltipRegion.vue'


export default {
    components: {
        LGeoJson,
        LLayerGroup,
        PopupRegion,
        TooltipRegion,
    },
    props: {
        geojson: {
            type: Object,
            default: () => {},
        },
        wrapStyle: {
            type: Object,
            default: () => {},
        },
        wrapStyleHover: {
            type: Object,
            default: () => {},
        },
    },
    data: function() {
        return {

            mouseIn: false,
            latLngPopup: [],

        }
    },
    computed: {

    },
    methods: {

        funClick: function(ev) {
            // console.log('methods funClick', ev)

            let vo = this

            //latLng
            let ll = ev.latlng
            let latLng = [ll.lat, ll.lng]
            // console.log('latLng', latLng)

            //openPopup
            try {
                vo.$refs.refPopup.mapObject.openPopup(latLng)
            }
            catch (err) {
                // console.log(err)
            }

        },

        funMouseEnter: function(ev) {
            // console.log('methods funMouseEnter', ev)

            let vo = this

            vo.mouseIn = true
            if (iseobj(vo.wrapStyleHover)) {
                let layer = ev.target
                layer.setStyle(vo.wrapStyleHover)
                // console.log('funMouseEnter wrapStyleHover', vo.wrapStyleHover)
            }

            //openTooltip
            try {
                vo.$refs.refTooltip.mapObject.openTooltip(ev.latlng)
            }
            catch (err) {
                console.log(err)
            }

        },

        funMouseLeave: function(ev) {
            // console.log('methods funMouseLeave', ev)

            let vo = this

            vo.mouseIn = false
            if (iseobj(vo.wrapStyle)) {
                let layer = ev.target
                layer.setStyle(vo.wrapStyle)
                // console.log('funMouseLeave wrapStyle', vo.wrapStyle)
            }

            //closeTooltip
            try {
                vo.$refs.refTooltip.mapObject.closeTooltip()
            }
            catch (err) {
                console.log(err)
            }

        },

    },
}
</script>
