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
        </l-polygon>
    </div>
</template>

<script>
import map from 'lodash/map'
import { LPolygon } from 'vue2-leaflet'
import { interpColor, rgba2rgb, calcContours } from '../js/gis.mjs'


export default {
    components: {
        LPolygon,
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
        gradient: {
            type: Object,
            default: () => {
                return {
                    0: 'rgba(255, 255, 255, 0.5)',
                    0.2: 'rgba(254, 178, 76, 0.5)',
                    0.4: 'rgba(252, 78, 42, 0.5)',
                    0.6: 'rgba(220, 58, 38, 0.5)',
                    0.8: 'rgba(200, 40, 23, 0.5)',
                    1: 'rgba(180, 30, 60, 0.5)',
                }
            },
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
            let fun = interpColor(vo.gradient)

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
            }
            let polygonSets = calcContours(points, opt)
            // console.log('polygonSets',  cloneDeep(polygonSets))

            //add style and event
            polygonSets = map(polygonSets, (polygonSet, k) => {

                //color, colorLegend
                let color = vo.getColor(k, polygonSets.length - 1)
                let colorLegend = rgba2rgb(color)

                //lineColor
                let lineColor = color

                //fillColor
                let fillColor = color

                //lineWidth
                let lineWidth = 1

                //fillOpacity
                let fillOpacity = 0.2

                //style
                let style = {
                    color: lineColor,
                    weight: lineWidth,
                    fillColor,
                    fillOpacity,
                }

                //lineColorHover
                let lineColorHover = color

                //fillColorHover
                let fillColorHover = color

                //lineWidthHover
                let lineWidthHover = 3

                //fillOpacityHover
                let fillOpacityHover = 0.5

                //styleHover
                let styleHover = {
                    color: lineColorHover,
                    weight: lineWidthHover,
                    fillColor: fillColorHover,
                    fillOpacity: fillOpacityHover,
                }

                return {
                    ...polygonSet,
                    colorLegend, //給外部legend使用無透明度顏色
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

        getColor: function (k, n) {
            // console.log('methods getColor', k, n)

            let vo = this

            let c
            if (n > 0) {
                c = vo.funColor(k / n)
            }
            else {
                c = vo.funColor(1)
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
