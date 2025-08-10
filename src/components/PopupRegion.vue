<template>
    <l-popup
        :options="{
            maxWidth: 'auto',
        }"
        v-if="eff($slots.default)"
    >
        <slot></slot>
    </l-popup>
</template>

<script>
import isearr from 'wsemi/src/isearr.mjs'
import { LPopup } from 'vue2-leaflet'


export default {
    components: {
        LPopup,
    },
    props: {
    },
    data: function() {
        return {
        }
    },
    computed: {

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
