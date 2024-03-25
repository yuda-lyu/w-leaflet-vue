<template>
    <div :changeItems="changeItems">
        <template
            v-for="(item,kitem) in itemsTrans"
        >
            <div
                style="display:flex; margin:3px 0px; cursor:pointer;"
                :key="kitem"
                @click="clickItem(item)"
            >
                <input
                    style="margin:0px 5px 0px 0px; padding:0px; height:20px;"
                    type="checkbox"
                    :value="item[keyTitle]"
                    v-model="selects"
                >
                <div>
                    <div style="">{{item[keyTitle]}}</div>
                    <div style="font-size:0.6rem; opacity:0.6;" v-if="item[keyMsg]!==''">{{item[keyMsg]}}</div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import each from 'lodash-es/each.js'
import cloneDeep from 'lodash-es/cloneDeep.js'


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
        keyMsg: {
            type: String,
            default: 'msg',
        },
    },
    data: function() {
        return {
            selects: null,
            itemsTrans: [],
        }
    },
    computed: {

        changeItems: function() {
            //console.log('computed changeItems')

            let vo = this

            //itemsTrans
            vo.itemsTrans = cloneDeep(vo.items)

            //select, 得要獨立出computed, 否則更改vo.itemsTrans會再觸發changeItems
            vo.getSelect()

            return ''
        },

    },
    methods: {

        getSelect: function() {
            //console.log('methods getSelect')

            let vo = this

            //nextTick
            vo.$nextTick(() => {

                //selects
                let selects = []
                each(vo.itemsTrans, (v) => {
                    if (v[vo.keyValue] === true) {
                        selects.push(v[vo.keyTitle])
                    }
                })
                vo.selects = selects

            })

        },

        clickItem: function(item) {
            // console.log('methods clickItem', item)

            let vo = this

            //change
            each(vo.itemsTrans, (v) => {
                if (v[vo.keyTitle] === item[vo.keyTitle]) {
                    v[vo.keyValue] = !v[vo.keyValue]
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
