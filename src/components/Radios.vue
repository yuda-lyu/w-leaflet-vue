<template>
    <div :changeItems="changeItems">
        <template
            v-for="(item,kitem) in itemsTrans"
        >
            <div
                style="display:flex; align-items:center; margin:3px 0px;"
                :key="kitem"
                @click="clickItem(item)"
            >
                <input
                    style="margin:0px 5px 0px 0px; padding:0px; cursor:pointer;"
                    type="radio"
                    :value="item[keyTitle]"
                    v-model="select"
                >
                <span style="cursor:pointer;"> {{item[keyTitle]}}</span>
            </div>
        </template>
    </div>
</template>

<script>
import each from 'lodash/each'
import cloneDeep from 'lodash/cloneDeep'


export default {
    components: {
    },
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        keyValue: {
            type: String,
            default: 'value',
        },
        keyTitle: {
            type: String,
            default: 'title',
        },
    },
    data: function() {
        return {
            select: null,
            itemsTrans: [],
        }
    },
    computed: {

        changeItems: function() {
            //console.log('computed changeItems')

            let vo = this

            //itemsTrans
            vo.itemsTrans = cloneDeep(vo.items)

            //getSelect
            vo.getSelect()

            return ''
        },

    },
    methods: {

        getSelect: function() {
            //console.log('methods getSelect')

            let vo = this

            //nextTick, 使用nextTick中斷computed偵測, 否則更改vo.itemsTrans會再觸發changeItems
            vo.$nextTick(() => {

                //select
                let select = null
                each(vo.itemsTrans, (v) => {
                    if (select === null && v[vo.keyValue] === true) {
                        select = v[vo.keyTitle]
                    }
                })
                vo.select = select

            })

        },

        clickItem: function(item) {
            // console.log('methods clickItem', item)

            let vo = this

            //change
            each(vo.itemsTrans, (v) => {
                if (v[vo.keyTitle] === item[vo.keyTitle]) {
                    v[vo.keyValue] = true
                }
                else {
                    v[vo.keyValue] = false
                }
            })

            //nextTick
            vo.$nextTick(() => {

                //emit
                vo.$emit('update:items', cloneDeep(vo.itemsTrans))

            })

        },

    }
}
</script>

<style>
</style>
