<template>
    <l-popup
        :options="{
            offset: useOffset,
            maxWidth: 'auto',
        }"
        v-if="eff($slots.default)"
    >
        <slot></slot>
    </l-popup>
</template>

<script>
import get from 'lodash-es/get.js'
import isearr from 'wsemi/src/isearr.mjs'
import { LPopup } from 'vue2-leaflet'


export default {
    components: {
        LPopup,
    },
    props: {
        point: {
            type: Object,
            default: () => {},
        },
    },
    data: function() {
        return {
        }
    },
    computed: {

        useOffset: function() {
            let vo = this

            //obj
            let obj = get(vo, 'point')
            // console.log('point', obj)

            //offset
            let offset = null
            if (!isearr(offset)) {
                offset = get(obj, 'icon.options.popupAnchor', null) //由leaflet內部呼叫時, point或pointSet的popupAnchor已存入icon本身
                // console.log('offset(icon.options.popupAnchor)', offset, obj)
            }
            if (!isearr(offset)) {
                offset = get(obj, 'popupAnchor', null) //若無, 由leaflet外部呼叫時, popupAnchor由point提供
                // console.log('offset(popupAnchor)', offset, obj)
            }
            if (!isearr(offset)) {
                offset = [0, -(40 / 1.5)] //若point沒有提供popupAnchor則代表使用原先icon與其popupAnchor
                // console.log('offset(default)', offset, obj)
            }
            // console.log('offset', offset)

            return offset
        },

    },
    methods: {

        eff: function(v) {
            let b = isearr(v)
            // console.log('eff', v, b)
            return b
        },

    },
}
</script>
