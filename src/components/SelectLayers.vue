<template>
    <div
        class="AccentColor"
        :style="`padding:7px; overflow-y:auto;`"
        :changeMapLayers="changeMapLayers"
    >

        <template>

            <div :style="`padding:2px 0px 7px 0px; font-size:0.7rem; color:#999;`">
                {{ titleMain }}
            </div>

            <div :style="`padding:0px 5px;`">

                <WInputRadio
                    :items="mapLayersBaseNames"
                    v-model="mapLayersBaseNamePick"
                    :paddingStyle="{top:0,right:0,bottom:5,left:0}"
                    :textFontSize="'0.75rem'"
                    @input="modifyMapLayersBase"
                ></WInputRadio>

            </div>

        </template>

        <template>

            <div :style="`padding:2px 0px 7px 0px; font-size:0.7rem; color:#999;`">
                {{ titleCover }}
            </div>

            <div :style="`padding:0px 4px;`">

                <div
                    :key="'km-'+km"
                    v-for="(m,km) in mapLayersCoverNames"
                >

                    <WCheckbox
                        :iconSize="20"
                        :textFontSize="'0.75rem'"
                        :uncheckedIconColor="'#888'"
                        :uncheckedIconColorHover="'#888'"
                        :verticalAlign="'top'"
                        :text="m"
                        :value="mapLayersCoverNamePicks.indexOf(m)>=0"
                        @input="(b)=>{modifyMapLayersCover(m,b)}"
                    ></WCheckbox>

                    <div
                        style="padding:0px 5px 0px 18px;"
                        v-if="mapLayersCoverNamePicks.indexOf(m)>=0"
                    >

                        <WSlider
                            :sliderSize="14"
                            :tooltipTextFontSize="'0.75rem'"
                            :progColor="'#cde'"
                            :valueDecimal="2"
                            :valueMin="0"
                            :valueMax="1"
                            :valueStep="0.02"
                            :value="getMapLayersCoverOpacity(m)"
                            @input="(opacity)=>{modifyMapLayersCoverOpacity(m,opacity)}"
                        ></WSlider>

                    </div>

                    <div
                        style="padding-top:5px;"
                        v-if="km<mapLayersCoverNames.length-1"
                    ></div>

                </div>

            </div>

        </template>

    </div>
</template>

<script>
import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import each from 'lodash-es/each.js'
import keys from 'lodash-es/keys.js'
import filter from 'lodash-es/filter.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isestr from 'wsemi/src/isestr.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import WInputRadio from 'w-component-vue/src/components/WInputRadio.vue'
import WCheckbox from 'w-component-vue/src/components/WCheckbox.vue'
import WSlider from 'w-component-vue/src/components/WSlider.vue'


export default {
    components: {
        WInputRadio,
        WCheckbox,
        WSlider,
    },
    props: {
        mapLayers: {
            type: Array,
            default: () => [],
        },
        titleMain: {
            type: String,
            default: '主要底圖',
        },
        titleCover: {
            type: String,
            default: '套疊圖資',
        },
    },
    data: function() {
        return {

            kpMapLayersOpacity: {},
            mapLayersBase: [],
            mapLayersCover: [],

            mapLayersBaseNamePick: 'Mapbox',
            mapLayersCoverNamePicks: [],

        }
    },
    computed: {

        changeMapLayers: function() {
            let vo = this

            //mapLayers
            let mapLayers = cloneDeep(vo.mapLayers)

            //kpMapLayersOpacity
            let kpMapLayersOpacity = {}
            each(mapLayers, (v) => {
                kpMapLayersOpacity[v.name] = 1
            })

            //mapLayersBase
            let mapLayersBase = filter(mapLayers, (v) => {
                return isestr(v.colorShade)
            })

            //mapLayersCover
            let mapLayersCover = filter(mapLayers, (v) => {
                return !isestr(v.colorShade)
            })

            //baseMap
            let baseMap = cloneDeep(mapLayersBase[0])

            //emit
            vo.$emit('ini-base-maps', [baseMap])
            // console.log('emit ini-base-maps')

            //update
            vo.kpMapLayersOpacity = kpMapLayersOpacity
            vo.mapLayersBase = mapLayersBase
            vo.mapLayersCover = mapLayersCover

            return ''
        },

        mapLayersBaseNames: function() {
            let vo = this

            let rs = map(vo.mapLayersBase, 'name')

            return rs
        },

        mapLayersCoverNames: function() {
            let vo = this

            let rs = map(vo.mapLayersCover, 'name')

            return rs
        },

    },
    methods: {

        modifyMapLayersBase: function() {
            // console.log('modifyMapLayersBase')

            let vo = this

            //kp
            let kp = {}
            kp[vo.mapLayersBaseNamePick] = true
            each(vo.mapLayersCoverNamePicks, (k) => {
                kp[k] = true
            })
            // console.log('kp', kp)

            //_baseMaps
            let _baseMaps = cloneDeep(vo.mapLayers)

            //baseMaps
            let baseMaps = []
            each(_baseMaps, (v, k) => {
                if (haskey(kp, v.name)) {
                    v.opacity = vo.kpMapLayersOpacity[v.name]
                    v.visible = true
                    baseMaps.push(v)
                }
            })
            // console.log('baseMaps', cloneDeep(baseMaps))

            //emit
            vo.$emit('change-base-maps', baseMaps)
            // console.log('emit change-base-maps')

        },

        modifyMapLayersCover: function(name, visible) {
            // console.log('modifyMapLayersCover', name, visible)

            let vo = this

            //kp
            let kp = {}
            each(vo.mapLayersCoverNamePicks, (k) => {
                kp[k] = true
            })

            //visible
            if (visible) {
                kp[name] = true
            }
            else {
                if (haskey(kp, name)) {
                    delete kp[name]
                }
            }

            //update
            vo.mapLayersCoverNamePicks = keys(kp)
            // console.log('mapLayersCoverNamePicks', vo.mapLayersCoverNamePicks)

            //modifyMapLayersBase
            vo.modifyMapLayersBase()

        },

        getMapLayersCoverOpacity: function(name) {
            // console.log('getMapLayersCoverOpacity', name)

            let vo = this

            //opacity
            let opacity = get(vo.kpMapLayersOpacity, name)
            // console.log('name', name, 'opacity', opacity)

            return opacity
        },

        modifyMapLayersCoverOpacity: function(name, opacity) {
            // console.log('modifyMapLayersCover', name, opacity)

            let vo = this

            //update
            vo.kpMapLayersOpacity[name] = opacity

            //modifyMapLayersBase
            vo.modifyMapLayersBase()

        },

    }
}
</script>

<style scoped>

.AccentColor {
    accent-color: #1565C0;
}
.AccentColor input[type="checkbox"]:hover, .AccentColor input[type="radio"]:hover {
    accent-color: #1976D2;
}

</style>
