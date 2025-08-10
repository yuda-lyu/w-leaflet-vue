<template>
    <l-tooltip
        :options="{
            maxWidth: 'auto',
        }"
        v-if="eff($slots.default)"
    >
        <slot></slot>
    </l-tooltip>
</template>

<script>
import isearr from 'wsemi/src/isearr.mjs'
import { LTooltip } from 'vue2-leaflet'


export default {
    components: {
        LTooltip,
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
