<template>
    <div>
        <l-polygon
            :key="'l-contour-polygonSet:'+kpolygonSet"
            :lat-lngs="polygonSet.latLngs"
            v-bind="polygonSet.style"
            @mouseenter="polygonSet.mouseenter"
            @mouseleave="polygonSet.mouseleave"
            @click="(ev)=>{clickPolygon(ev,polygonSet,kpolygonSet)}"
            v-for="(polygonSet,kpolygonSet) in polygonSets"
        >

            <TooltipRegion>
                <template v-slot>
                    <slot name="tooltip"></slot>
                </template>
            </TooltipRegion>

            <PopupRegion>
                <template v-slot>
                    <slot name="popup"></slot>
                </template>
            </PopupRegion>

        </l-polygon>
    </div>
</template>

<script>
import map from 'lodash-es/map.js'
import isestr from 'wsemi/src/isestr.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import oc from 'wsemi/src/color.mjs'
import { LPolygon } from 'vue2-leaflet'
import calcContours from 'w-gis/src/calcContours.mjs'
import PopupRegion from './PopupRegion.vue'
import TooltipRegion from './TooltipRegion.vue'


export default {
    components: {
        LPolygon,
        PopupRegion,
        TooltipRegion,
    },
    props: {
        points: {
            type: Array,
            default: () => [],
        },
        polygonsContainInner: {
            type: Array,
            default: () => [],
        },
        polygonsClipInner: {
            type: Array,
            default: () => [],
        },
        polygonClipOuter: {
            type: Array,
            default: () => [],
        },
        thresholds: {
            type: Array,
            default: () => [],
        },
        gradient: {
            type: Object,
            default: () => {
                return {
                    0: 'rgb(255, 255, 255)',
                    0.2: 'rgb(254, 178, 76)',
                    0.4: 'rgb(252, 78, 42)',
                    0.6: 'rgb(220, 58, 38)',
                    0.8: 'rgb(200, 40, 23)',
                    1: 'rgb(180, 30, 60)',
                }
            },
        },
        funGetColor: {
            type: Function,
            default: null,
        },
        lineWidth: {
            type: Number,
            default: 1,
        },
        lineWidthHover: {
            type: Number,
            default: 3,
        },
        lineColor: {
            type: String,
            default: '',
        },
        lineColorHover: {
            type: String,
            default: '',
        },
        fillOpacity: {
            type: Number,
            default: 0.2,
        },
        fillOpacityHover: {
            type: Number,
            default: 0.5,
        },
        changeStyleWhenHover: {
            type: Boolean,
            default: true,
        },
    },
    data: function() {
        return {
        }
    },
    computed: {

        funColor: function() {
            //console.log('computed funColor')

            let vo = this

            //fun
            let fun = oc.interp(vo.gradient)

            return fun
        },

        polygonSets: function() {
            //console.log('computed polygonSets')

            let vo = this

            //points
            let points = vo.points

            //polygonSets
            let opt = {
                containInner: vo.polygonsContainInner,
                clipInner: vo.polygonsClipInner,
                clipOuter: vo.polygonClipOuter,
                thresholds: vo.thresholds,
            }
            let polygonSets = calcContours(points, opt)
            // console.log('polygonSets',  cloneDeep(polygonSets))

            //add style and event
            polygonSets = map(polygonSets, (polygonSet, k) => {
                // console.log(k, 'polygonSet', polygonSet)

                //color
                let color = vo.getColor(k, polygonSets.length - 1, polygonSet)
                // console.log('color', color)

                //lineColor
                let lineColor = color
                if (isestr(vo.lineColor)) {
                    lineColor = vo.lineColor
                }

                //fillColor
                let fillColor = color

                //lineWidth
                let lineWidth = vo.lineWidth

                //fillOpacity
                let fillOpacity = vo.fillOpacity

                //style
                let style = {
                    color: lineColor,
                    weight: lineWidth,
                    fillColor,
                    fillOpacity,
                }

                //lineColorHover
                let lineColorHover = color
                if (isestr(vo.lineColorHover)) {
                    lineColorHover = vo.lineColorHover
                }

                //fillColorHover
                let fillColorHover = color

                //lineWidthHover
                let lineWidthHover = vo.lineWidthHover

                //fillOpacityHover
                let fillOpacityHover = vo.fillOpacityHover

                //styleHover
                let styleHover = {
                    color: lineColorHover,
                    weight: lineWidthHover,
                    fillColor: fillColorHover,
                    fillOpacity: fillOpacityHover,
                }

                return {
                    ...polygonSet,
                    color,
                    style, //需給予, 才能通過v-bind給予初始樣式
                    mouseenter: (ev) => {
                        // console.log('mouseenter', ev)
                        let layer = ev.target

                        //reset style
                        if (vo.changeStyleWhenHover) {
                            layer.setStyle(styleHover)
                        }

                        //triggerEvent
                        vo.triggerEvent('mouseenter', {
                            ev,
                            polygonSet,
                            kpolygonSet: k,
                        })

                    },
                    mouseleave: (ev) => {
                        // console.log('mouseleave', ev)
                        let layer = ev.target

                        //change style
                        if (vo.changeStyleWhenHover) {
                            layer.setStyle(style)
                        }

                        //triggerEvent
                        vo.triggerEvent('mouseleave', {
                            ev,
                            polygonSet,
                            kpolygonSet: k,
                        })

                    },
                }

            })
            // polygonSets = [polygonSets[0]]
            // polygonSets = [polygonSets[1]]
            // console.log('polygonSets for use', cloneDeep(polygonSets))

            //triggerEvent
            vo.triggerEvent('refresh', { polygonSets })

            return polygonSets
        },

    },
    methods: {

        getColor: function (k, n, polygonSet) {
            // console.log('methods getColor', k, n, polygonSet)

            let vo = this

            //default
            let _c = ''
            if (n > 0) {
                _c = vo.funColor(k / n)
            }
            else {
                _c = vo.funColor(1)
            }

            //c
            let c = ''
            if (isfun(vo.funGetColor)) {
                c = vo.funGetColor({
                    defaultColor: _c,
                    k,
                    n,
                    polygonSet,
                    // thresholds: vo.thresholds,
                })
            }
            if (!isestr(c)) {
                c = _c
            }

            return c
        },

        clickPolygon: function(ev, polygonSet, kpolygonSet) {
            // console.log('methods clickPolygon', ev, polygonSet, kpolygonSet)

            let vo = this

            //triggerEvent
            vo.triggerEvent('click', {
                ev,
                polygonSet,
                kpolygonSet,
            })

        },

        triggerEvent: function(evname, data) {
            //console.log('methods triggerEvent', evname, data)

            let vo = this

            //nextTick
            vo.$nextTick(() => {

                //emit
                vo.$emit(evname, data)

            })

        },

    }
}
</script>

<style>
</style>
