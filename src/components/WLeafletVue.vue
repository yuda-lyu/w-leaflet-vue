<template>
    <div
        style="display:inline-block; position:relative;"
        v-domresize
        @domresize="resize"
    >


        <!-- 得要關閉zoomControl, 改由l-control-zoom處理才能改位置 -->
        <l-map
            ref="lmap"
            :zoom="zoom"
            :center="center"
            :options="{
                preferCanvas: true, //若開啟會導致geojson無法偵測mouseout事件, 但因geojson的滑鼠進入出偵測不夠平滑, 會過多觸發導致閃爍, 故geojson預設滑鼠進入與離開樣式皆相同
                zoomControl: false,
                attributionControl: false,
            }"
            @update:zoom="updateZoom"
            @update:center="updateCenter"
            @mousemove="updateLatLng"
        >

            <!-- 貢獻 -->
            <l-control-attribution
                position="bottomleft"
            ></l-control-attribution>

            <!-- 四向箭頭 -->
            <l-control
                :position="panelCompassRose.position"
                v-if="panelCompassRose.show"
            >
                <div
                    class="clsPanel"
                    :style="{
                        background:panelCompassRose.withPanel?panelBackgroundColor:'transparent',
                        boxShadow:panelCompassRose.withPanel?'0 0 15px rgba(0,0,0,0.2)':'none',
                    }"
                >
                    <img
                        :style="`width:${panelCompassRose.size}px; height:${panelCompassRose.size}px;`"
                        :src="useIconCompassRose"
                    />
                </div>
            </l-control>

            <!-- 比例尺 -->
            <l-control-scale
                :position="panelScale.position"
                :imperial="false"
                v-if="panelScale.show"
            ></l-control-scale>

            <!-- 縮放按鈕 -->
            <l-control-zoom
                :position="panelZoom.position"
                v-if="panelZoom.show"
            ></l-control-zoom>

            <!-- 控制底圖圖層 -->
            <l-control
                :position="panelBaseMaps.position"
                v-if="panelBaseMaps.show"
            >
                <div
                    class="clsPanel"
                    :style="{
                        background:panelBackgroundColor,
                        padding:'3px 8px',
                    }"
                >
                    <div
                        :style="{overflow:'auto',...panelBaseMaps.style}"
                        @wheel="handleWheelPanelBaseMaps"
                    >
                        <Radios
                            :items.sync="panelBaseMaps.baseMaps"
                            :keyValue="'visible'"
                            :keyTitle="'name'"
                        ></Radios>
                    </div>
                </div>
            </l-control>

            <!-- 控制數據圖層 -->
            <l-control
                :position="panelItems.position"
                v-if="panelItems.show && items.length>0"
            >
                <div
                    class="clsPanel"
                    :style="{
                        background:panelBackgroundColor,
                        padding:'3px 8px',
                    }"
                >
                    <div
                        :style="{overflow:'auto',...panelItems.style}"
                        @wheel="handleWheelPanelItems"
                    >
                        <Checkboxs
                            :style="``"
                            :items.sync="items"
                            :keyValue="'visible'"
                            :keyTitle="'name'"
                            @update:items="updateItems"
                        ></Checkboxs>
                    </div>
                </div>
            </l-control>

            <!-- 滑鼠座標顯示區 -->
            <l-control
                :position="panelLabels.position"
                v-if="panelLabels.show"
            >
                <div
                    class="clsPanel"
                    :style="{
                        background:panelBackgroundColor,
                        padding:'3px 6px',
                    }"
                >
                    <div :style="{overflow:'auto',...panelLabels.style}">

                        <template v-if="panelLabels.title!==''">

                            <div style="font-size:1.2rem; font-weight:bold; text-align:center;">
                                <span>{{panelLabels.title}}</span>
                            </div>

                            <div style="border-top:1px solid #b9b9b9; margin:5px 0px;"></div>

                        </template>

                        <table>
                            <tbody>
                                <tr :key="kitem" v-for="(item,kitem) in panelLabels.useItems">
                                    <td style="text-align:right;">{{panelLabels[item]}}</td>
                                    <td> : </td>
                                    <td>
                                        {{
                                            item==='lng' || item==='lat' ? showLoc[item] :
                                            item==='zoom' ? zoom :
                                            ''
                                        }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
            </l-control>

            <!-- 圖例區 -->
            <l-control
                :position="panelLegends.position"
                v-if="panelLegends.show && countVisible(contourSets)>0"
            >
                <div
                    class="clsPanel"
                    :style="{background:panelBackgroundColor}"
                >
                    <div
                        :style="{display:'flex',alignItems:'flex-start',overflow:'auto',...panelLegends.style}"
                        @wheel="handleWheelPanelLegends"
                    >

                        <template
                            v-for="(contourSet,kcontourSet) in contourSets"
                        >
                            <div
                                style="white-space:nowrap;"
                                :key="'contourSet:'+kcontourSet"
                                v-if="contourSet.visible"
                            >
                                <div style="padding:4px 6px;">

                                    <div style="margin-bottom:5px;">
                                        <div style="text-align:center;" v-html="contourSet.title"></div>
                                        <div style="font-size:0.85rem; text-align:center;" v-html="contourSet.legendMsg"></div>
                                    </div>

                                    <table style="border-collapse:collapse;">
                                        <tbody>
                                            <tr
                                                :key="'klegend:'+klegend"
                                                v-for="(legend,klegend) in contourSet.legend"
                                            >

                                                <td style="height:18px; line-height:18px;">
                                                    <span :style="`opacity:${legend.arrow?1:0};`">
                                                        ▶
                                                    </span>
                                                </td>

                                                <td :style="`background:${legend.color}; width:18px; height:18px;`">
                                                </td>

                                                <td style="padding-left:5px;"></td>

                                                <td style="text-align:right; font-size:0.7rem; height:18px; line-height:18px;">
                                                    <span v-html="legend.low"></span>
                                                </td>

                                                <td style="padding:0px 2px; text-align:center; font-size:0.7rem; height:18px; line-height:18px;">
                                                    <span v-html="legend.delimiter"></span>
                                                </td>

                                                <td style="text-align:left; font-size:0.7rem; height:18px; line-height:18px;">
                                                    <span v-html="legend.up"></span>
                                                </td>

                                                <td style="padding-left:3px;"></td>

                                                <td style="text-align:left; font-size:0.7rem; height:18px; line-height:18px;">
                                                    <span v-html="legend.textExt"></span>
                                                </td>

                                            </tr>
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                        </template>

                    </div>
                </div>
            </l-control>

            <!-- tooltip顯示區 -->
            <l-layer-group style="white-space:normal;" ref="refTooltip"></l-layer-group>

            <!-- 圖層 -->
            <l-layer-group
                :key="`baseMap:${kbaseMap}:${baseMap.name}`"
                v-for="(baseMap,kbaseMap) in panelBaseMaps.baseMaps"
            >

                <!-- wms圖層(LWMSTileLayer) -->
                <l-w-m-s-tile-layer
                    _layer-type="overlay"
                    _version="1.1.1"
                    format="image/png"
                    transparent
                    :baseUrl="baseMap.url"
                    :layers="baseMap.layers"
                    :opacity="baseMap.opacity"
                    :zIndex="1+kbaseMap"
                    _visible="baseMap.visible"
                    :options="{
                        CQL_FILTER: '',
                    }"
                    v-if="baseMap?.type==='wms' && baseMap.visible"
                ></l-w-m-s-tile-layer>

                <!-- wmts圖層 -->
                <l-tile-layer
                    _layer-type="base"
                    :name="baseMap.name"
                    :url="baseMap.url"
                    :opacity="baseMap.opacity"
                    :zIndex="1+kbaseMap"
                    :visible="baseMap.visible"
                    v-if="baseMap?.type!=='wms'"
                ></l-tile-layer>

            </l-layer-group>

            <!-- 點陣圖圖層 -->
            <l-layer-group
                :key="'imageSet:'+kimageSet"
                :name="imageSet.title"
                :visible.sync="imageSet.visible"
                v-for="(imageSet,kimageSet) in imageSets"
            >
                <l-image-overlay
                    :url="imageSet.image.url"
                    :bounds="imageSet.bounds"
                    _click="(ev)=>{clickImage(ev,imageSet,kimageSet,imageSets)}"
                ></l-image-overlay>
            </l-layer-group>

            <!-- 等值線圖層 -->
            <l-layer-group
                :key="'contourSet:'+kcontourSet"
                :name="contourSet.title"
                :visible.sync="contourSet.visible"
                v-for="(contourSet,kcontourSet) in contourSets"
            >
                <LwContour
                    :points="contourSet.points"
                    :polygonsContainInner="contourSet.polygonsContainInner"
                    :polygonsClipInner="contourSet.polygonsClipInner"
                    :polygonClipOuter="contourSet.polygonClipOuter"
                    :thresholds="contourSet.thresholds"
                    :gradient="contourSet.gradient"
                    :funGetColor="contourSet.getColor"
                    :lineWidth="contourSet.lineWidth"
                    :lineWidthHover="contourSet.lineWidthHover"
                    :lineColor="contourSet.lineColor"
                    :lineColorHover="contourSet.lineColorHover"
                    :fillOpacity="contourSet.fillOpacity"
                    :fillOpacityHover="contourSet.fillOpacityHover"
                    :changeStyleWhenHover="contourSet.changeStyleWhenHover"
                    @refresh="(v)=>{contourRefresh(v,contourSet,kcontourSet)}"
                    @click="(v)=>{clickContour(v,contourSet,kcontourSet,contourSets)}"
                >

                    <template v-slot:tooltip>
                        <slot
                            name="contour-tooltip"
                            :contourSet="contourSet"
                            :contourSets="contourSets"
                        ></slot>
                    </template>

                    <template v-slot:popup>
                        <slot
                            name="contour-popup"
                            :contourSet="contourSet"
                            :contourSets="contourSets"
                        ></slot>
                    </template>

                </LwContour>
            </l-layer-group>

            <!-- geojson圖層 -->
            <l-layer-group
                :key="'geojsonSet:'+kgeojsonSet"
                :name="geojsonSet.title"
                :visible.sync="geojsonSet.visible"
                v-for="(geojsonSet,kgeojsonSet) in geojsonSets"
            >

                <LwGeoJson
                    :geojson="geojsonSet.geojson"
                    :wrapStyle="geojsonSet.style"
                    :wrapStyleHover="geojsonSet.styleHover"
                    @click="(ev)=>{clickGeojson(ev,geojsonSet,kgeojsonSet,geojsonSets)}"
                >

                    <template v-slot:tooltip>
                        <slot
                            name="geojson-tooltip"
                            :geojsonSet="geojsonSet"
                            :geojsonSets="geojsonSets"
                        ></slot>
                    </template>

                    <template v-slot:popup>
                        <slot
                            name="geojson-popup"
                            :geojsonSet="geojsonSet"
                            :geojsonSets="geojsonSets"
                        ></slot>
                    </template>

                </LwGeoJson>

            </l-layer-group>

            <!-- 多邊形圖層 -->
            <l-layer-group
                :key="'polygonSet:'+kpolygonSet"
                :name="polygonSet.title"
                :visible.sync="polygonSet.visible"
                v-for="(polygonSet,kpolygonSet) in polygonSets"
            >
                <l-polygon
                    :ref="polygonSet.id"
                    :latLngs="polygonSet.latLngs"
                    v-bind="polygonSet.style"
                    @click="(ev)=>{clickPolygon(ev,polygonSet,kpolygonSet,polygonSets)}"
                >

                    <TooltipRegion>
                        <template v-slot>
                            <slot
                                name="polygon-tooltip"
                                :polygonSet="polygonSet"
                                :polygonSets="polygonSets"
                            ></slot>
                        </template>
                    </TooltipRegion>

                    <PopupRegion>
                        <template v-slot>
                            <slot
                                name="polygon-popup"
                                :polygonSet="polygonSet"
                                :polygonSets="polygonSets"
                            ></slot>
                        </template>
                    </PopupRegion>

                </l-polygon>
            </l-layer-group>

            <!-- 折線圖層 -->
            <l-layer-group
                :key="'polylineSet:'+kpolylineSet"
                :name="polylineSet.title"
                :visible.sync="polylineSet.visible"
                v-for="(polylineSet,kpolylineSet) in polylineSets"
            >
                <l-polyline
                    :ref="polylineSet.id"
                    :latLngs="polylineSet.latLngs"
                    v-bind="polylineSet.style"
                    @click="(ev)=>{clickPolyline(ev,polylineSet,kpolylineSet,polylineSets)}"
                >

                    <TooltipRegion>
                        <template v-slot>
                            <slot
                                name="polyline-tooltip"
                                :polylineSet="polylineSet"
                                :polylineSets="polylineSets"
                            ></slot>
                        </template>
                    </TooltipRegion>

                    <PopupRegion>
                        <template v-slot>
                            <slot
                                name="polyline-popup"
                                :polylineSet="polylineSet"
                                :polylineSets="polylineSets"
                            ></slot>
                        </template>
                    </PopupRegion>

                </l-polyline>
            </l-layer-group>

            <!-- 點圖層 -->
            <l-layer-group
                :key="'pointSet:'+kpointSet"
                :name="pointSet.title"
                :visible.sync="pointSet.visible"
                v-for="(pointSet,kpointSet) in pointSets"
            >

                <template
                    v-for="(point,kpoint) in pointSet.points"
                >

                    <!-- 沒有指定zIndexOffset時, l-marker會因為重繪而更換z-index, 不能保證數據順序為展示順據 -->
                    <l-marker
                        :ref="point.id"
                        :key="'point:'+kpoint"
                        :latLng="point.latLng"
                        :icon="point.icon"
                        :zIndexOffset="point.zIndexOffset"
                        @click="(ev)=>{clickPoint(ev,point,kpoint,pointSet,kpointSet,pointSets)}"
                        v-if="point.type==='icon'"
                    >

                        <TooltipPoint
                            :point="point"
                        >
                            <template v-slot>
                                <slot
                                    name="point-tooltip"
                                    :point="point"
                                    :pointSet="pointSet"
                                ></slot>
                            </template>
                        </TooltipPoint>

                        <PopupPoint
                            :point="point"
                        >
                            <template v-slot>
                                <slot
                                    name="point-popup"
                                    :point="point"
                                    :pointSet="pointSet"
                                ></slot>
                            </template>
                        </PopupPoint>

                    </l-marker>

                    <!-- l-circle-marker不支援zIndexOffset -->
                    <l-circle-marker
                        :ref="point.id"
                        :key="'point:'+kpoint"
                        :latLng="point.latLng"
                        v-bind="point.style"
                        @click="(ev)=>{clickPoint(ev,point,kpoint,pointSet,kpointSet,pointSets)}"
                        v-if="point.type==='circle'"
                    >

                        <TooltipPoint
                            :point="point"
                        >
                            <template v-slot>
                                <slot
                                    name="point-tooltip"
                                    :point="point"
                                    :pointSet="pointSet"
                                ></slot>
                            </template>
                        </TooltipPoint>

                        <PopupPoint
                            :point="point"
                        >
                            <template v-slot>
                                <slot
                                    name="point-popup"
                                    :point="point"
                                    :pointSet="pointSet"
                                ></slot>
                            </template>
                        </PopupPoint>

                    </l-circle-marker>

                </template>

            </l-layer-group>

        </l-map>

    </div>
</template>

<script>
import map from 'lodash-es/map.js'
import each from 'lodash-es/each.js'
import size from 'lodash-es/size.js'
import omit from 'lodash-es/omit.js'
import reverse from 'lodash-es/reverse.js'
import filter from 'lodash-es/filter.js'
import get from 'lodash-es/get.js'
import set from 'lodash-es/set.js'
import isNumber from 'lodash-es/isNumber.js'
import isEqual from 'lodash-es/isEqual.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import sortBy from 'lodash-es/sortBy.js'
import isfun from 'wsemi/src/isfun.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isstr from 'wsemi/src/isstr.mjs'
import isarr from 'wsemi/src/isarr.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import ispint from 'wsemi/src/ispint.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import dig from 'wsemi/src/dig.mjs'
import debounce from 'wsemi/src/debounce.mjs'
import domResize from 'w-component-vue/src/js/domResize.mjs'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { LMap, LTileLayer, LControl, LControlAttribution, LControlZoom, LControlScale, LLayerGroup, LMarker, LCircleMarker, LPolyline, LPolygon, LImageOverlay, LWMSTileLayer } from 'vue2-leaflet'
import LwGeoJson from './LwGeoJson.vue'
import LwContour from './LwContour.vue'
import Radios from './Radios.vue'
import Checkboxs from './Checkboxs.vue'
import PopupPoint from './PopupPoint.vue'
import PopupRegion from './PopupRegion.vue'
import TooltipPoint from './TooltipPoint.vue'
import TooltipRegion from './TooltipRegion.vue'
import uiRes from '../uiRes.mjs'
import defBaseMaps from '../defBaseMaps.mjs'


/**
 * @vue-prop {Object} opt 輸入資料設定物件
 * @vue-prop {Array} [opt.center=[23.5, 121.1]] 輸入地圖顯示中點陣列，陣列為WGS84[緯度,經度]，預設[23.5, 121.1]
 * @vue-prop {Number} [opt.zoom=7] 輸入地圖顯示層級整數，預設7
 * @vue-prop {Object} [opt.panelBackgroundColor='rgba(255,255,255,0.95)'] 輸入各顯示資訊區背景顏色字串，預設'rgba(255,255,255,0.95)'
 * @vue-prop {Boolean} [opt.panelBaseMaps.show=true] 輸入是否顯示底圖選擇區布林值，預設true
 * @vue-prop {Array} [opt.panelBaseMaps.baseMaps=詳見程式碼] 輸入底圖選擇清單陣列，各元素為底圖設定物件，需提供欄位為name(底圖名稱字串)、url(底圖連結字串)、visible(是否顯示布林值)，預設值詳見程式碼的defBaseMaps預設值
 * @vue-prop {String} [opt.panelBaseMaps.position='topleft'] 輸入底圖選擇區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'topleft'
 * @vue-prop {Number} [opt.panelBaseMaps.width=null] 輸入底圖選擇區寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelBaseMaps.maxWidth=null] 輸入底圖選擇區最大寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelBaseMaps.height=null] 輸入底圖選擇區高度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelBaseMaps.maxHeight=300] 輸入底圖選擇區最大高度數字，單位px，預設300
 * @vue-prop {Boolean} [opt.panelBaseMaps.stopWheel=false] 輸入底圖選擇區當過高出現垂直捲軸時，是否可接收捲軸布林值，預設false
 * @vue-prop {Boolean} [opt.panelLabels.show=true] 輸入是否顯示地圖資訊區布林值，預設true
 * @vue-prop {String} [opt.panelLabels.position='topright'] 輸入地圖資訊區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'topright'
 * @vue-prop {String} [opt.panelLabels.title=''] 輸入地圖資訊區內標題字串，預設''
 * @vue-prop {String} [opt.panelLabels.lng='Longitude'] 輸入地圖資訊區內標注經度字串，預設'Longitude'
 * @vue-prop {String} [opt.panelLabels.lat='Latitude'] 輸入地圖資訊區內標注緯度字串，預設'Latitude'
 * @vue-prop {String} [opt.panelLabels.zoom='Zoom'] 輸入地圖資訊區內標注顯示層級字串，預設'Zoom'
 * @vue-prop {Array} [opt.panelLabels.useItems=['lng','lat','zoom']] 輸入地圖資訊區內呈現項目陣列，各元素給字串，'lng'代表經度，'lat'代表緯度，'zoom'代表顯示層級，預設['lng','lat','zoom']
 * @vue-prop {Number} [opt.panelLabels.width=null] 輸入地圖資訊區寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelLabels.maxWidth=null] 輸入地圖資訊區最大寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelLabels.height=null] 輸入地圖資訊區高度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelLabels.maxHeight=null] 輸入地圖資訊區最大高度數字，單位px，預設null
 * @vue-prop {Boolean} [opt.panelCompassRose.show=false] 輸入是否顯示玫瑰羅盤區布林值，預設false
 * @vue-prop {String} [opt.panelCompassRose.position='topright'] 輸入玫瑰羅盤區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'topright'
 * @vue-prop {Number} [opt.panelCompassRose.size=120] 輸入玫瑰羅盤區尺寸(長寬)數字，單位px，預設120
 * @vue-prop {Boolean} [opt.panelCompassRose.withPanel=false] 輸入是否顯示玫瑰羅盤區底部面板布林值，預設false
 * @vue-prop {String} [opt.panelCompassRose.iconSrcLight=詳見程式碼] 輸入淺色系玫瑰羅盤圖標來源字串，可使用base64格式或網址，預設值詳見程式碼
 * @vue-prop {String} [opt.panelCompassRose.iconSrcDark=詳見程式碼] 輸入深色係玫瑰羅盤圖標來源字串，可使用base64格式或網址，預設值詳見程式碼
 * @vue-prop {String} [opt.panelCompassRose.iconSrc=null] 輸入玫瑰羅盤圖標來源字串，若有則直接使用，若為null，此時withPanel為true時使用iconSrcDark，若withPanel為false，再自動依照底圖colorShade決定，colorShade為空字串或'light'時使用iconSrcDark，若為'dark'則使用iconSrcLight。預設null
 * @vue-prop {Boolean} [opt.panelZoom.show=true] 輸入是否顯示縮放按鈕區布林值，預設true
 * @vue-prop {String} [opt.panelZoom.position='bottomleft'] 輸入縮放按鈕區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'bottomleft'
 * @vue-prop {Boolean} [opt.panelScale.show=true] 輸入是否顯示比例尺區布林值，預設true
 * @vue-prop {String} [opt.panelScale.position='bottomleft'] 輸入比例尺區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'bottomleft'
 * @vue-prop {Boolean} [opt.panelItems.show=true] 輸入圖層顯隱切換區是否顯示布林值，預設true
 * @vue-prop {String} [opt.panelItems.position='bottomright'] 輸入圖層顯隱切換區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'bottomright'
 * @vue-prop {Number} [opt.panelItems.width=null] 輸入圖層顯隱切換區寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelItems.maxWidth=null] 輸入圖層顯隱切換區最大寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelItems.height=null] 輸入圖層顯隱切換區高度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelItems.maxHeight=null] 輸入圖層顯隱切換區最大高度數字，單位px，預設null
 * @vue-prop {Boolean} [opt.panelItems.stopWheel=false] 輸入圖層顯隱切換區當過高出現垂直捲軸時，是否可接收捲軸布林值，預設false
 * @vue-prop {Boolean} [opt.panelLegends.show=true] 輸入是否顯示圖例區布林值，預設true
 * @vue-prop {String} [opt.panelLegends.position='bottomright'] 輸入圖例區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'bottomright'
 * @vue-prop {Number} [opt.panelLegends.width=null] 輸入圖例區寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelLegends.maxWidth=300] 輸入圖例區最大寬度數字，單位px，預設300
 * @vue-prop {Number} [opt.panelLegends.height=null] 輸入圖例區高度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelLegends.maxHeight=null] 輸入圖例區最大高度數字，單位px，預設null
 * @vue-prop {Array} [opt.pointSets=[]] 輸入點集合陣列，各元素為物件，預設[]
 * @vue-prop {String} [opt.pointSets[i].title=''] 輸入第i個點集合的標題字串，預設為''
 * @vue-prop {String} [opt.pointSets[i].msg=''] 輸入第i個點集合的說明字串，預設為''
 * @vue-prop {Number} [opt.pointSets[i].order=null] 輸入第i個點集合的排序用數字，預設null
 * @vue-prop {String} [opt.pointSets[i].lineColor='rgba(255,255,255,1)'] 輸入第i個點集合的框線顏色字串，預設為'rgba(255,255,255,1)'
 * @vue-prop {Number} [opt.pointSets[i].lineWidth=1] 輸入第i個點集合的框線寬度數字，預設為1
 * @vue-prop {String} [opt.pointSets[i].fillColor='rgba(0,150,255,0.65)'] 輸入第i個點集合的填充顏色字串，預設為'rgba(0,150,255,0.65)'
 * @vue-prop {Number} [opt.pointSets[i].size=10] 輸入第i個點集合的圖標尺寸數字，預設10
 * @vue-prop {String} [opt.pointSets[i].iconSrc=詳見程式碼] 輸入第i個點集合的顯示圖標來源字串，可使用base64格式或網址，預設為google map的點圖標，預設值詳見程式碼
 * @vue-prop {Array} [opt.pointSets[i].iconSize=[24,40]] 輸入第i個點集合的顯示圖標尺寸陣列，使用[寬,高]，長寬單位px，預設[24,40]
 * @vue-prop {Array} [opt.pointSets[i].iconAnchor=[iconSize[0]/2,iconSize[1]]] 輸入第i個點集合的顯示圖標的實際定位位置陣列，由圖標左上角代表實際定位點起算，往左移動為+x，往上移動為+y，x與y單位px，需給予[x,y]，預設[iconSize[0]/2,iconSize[1]]
 * @vue-prop {Array} [opt.pointSets[i].popupAnchor=[0,-iconSize[1]/1.5]] 輸入第i個點集合的顯示popup或tooltip時的指向位置陣列，由實際定位點起算，往右移動為+x，往下移動為+y，x與y單位px，需給予[x,y]，預設[0,-iconSize[1]/1.5]
 * @vue-prop {Boolean} [opt.pointSets[i].visible=true] 輸入是否顯示第i個點集合布林值，預設為true
 * @vue-prop {Array} [opt.pointSets[i].points=[]] 輸入第i個點集合的各點數據陣列，各元素為物件或為緯經度陣列，也就是[{p1},{p2},...]或是[[p1lat,p1lng],[p2lat,p2lng],...]，預設為[]
 * @vue-prop {String} [opt.pointSets[i].points[j].title=''] 輸入第i個點集合的第j個點的標題字串，預設為''
 * @vue-prop {String} [opt.pointSets[i].points[j].msg=''] 輸入第i個點集合的第j個點的說明字串，預設為''
 * @vue-prop {String} [opt.pointSets[i].points[j].lineColor='rgba(255,255,255,1)'] 輸入第i個點集合的第j個點的框線顏色字串，預設為'rgba(255,255,255,1)'
 * @vue-prop {Number} [opt.pointSets[i].points[j].lineWidth=1] 輸入第i個點集合的第j個點的框線寬度數字，預設為1
 * @vue-prop {String} [opt.pointSets[i].points[j].fillColor='rgba(0,150,255,0.65)'] 輸入第i個點集合的第j個點的填充顏色字串，預設為'rgba(0,150,255,0.65)'
 * @vue-prop {Number} [opt.pointSets[i].points[j].size=10] 輸入第i個點集合的第j個點的圖標尺寸數字，預設10
 * @vue-prop {Array} [opt.pointSets[i].points[j].latLng=[]] 輸入第i個點集合的第j個點的緯經度座標陣列，也就是給予[lat,lng]，預設[]
 * @vue-prop {String} [opt.pointSets[i].points[j].iconSrc=詳見程式碼] 輸入第i個點集合的第j個點的顯示圖標來源字串，可使用base64格式或網址，預設為google map的點圖標，預設值詳見程式碼
 * @vue-prop {Array} [opt.pointSets[i].points[j].iconSize=[24,40]] 輸入第i個點集合的第j個點的顯示圖標尺寸陣列，使用[寬,高]，長寬單位px，預設[24,40]
 * @vue-prop {Array} [opt.pointSets[i].points[j].iconAnchor=[iconSize[0]/2,iconSize[1]]] 輸入第i個點集合的第j個點的顯示圖標的實際定位位置陣列，由圖標左上角代表實際定位點起算，往左移動為+x，往上移動為+y，x與y單位px，需給予[x,y]，預設[iconSize[0]/2,iconSize[1]]
 * @vue-prop {Array} [opt.pointSets[i].points[j].popupAnchor=[0,-iconSize[1]/1.5]] 輸入第i個點集合的第j個點的顯示popup或tooltip時的指向位置陣列，由實際定位點起算，往右移動為+x，往下移動為+y，x與y單位px，需給予[x,y]，預設[0,-iconSize[1]/1.5]
 * @vue-prop {Function} [opt.pointSetsClick=function(){}] 輸入全域點集合的click呼叫函數，可給予函數接收點擊事件，預設為function(){}
 * @vue-prop {Array} [opt.polylineSets=[]] 輸入折線集合陣列，各元素為物件，預設[]
 * @vue-prop {String} [opt.polylineSets[i].title=''] 輸入第i個折線集合的標題字串，預設為''
 * @vue-prop {String} [opt.polylineSets[i].msg=''] 輸入第i個折線集合的說明字串，預設為''
 * @vue-prop {Number} [opt.polylineSets[i].order=null] 輸入第i個折線集合的排序用數字，預設null
 * @vue-prop {String} [opt.polylineSets[i].lineColor='rgba(0,150,255,1)'] 輸入第i個折線集合的框線顏色字串，預設為'rgba(0,150,255,1)'
 * @vue-prop {String} [opt.polylineSets[i].lineColorHover='rgba(0,150,255,1)'] 輸入滑鼠移入時第i個折線集合的框線顏色字串，預設為'rgba(0,150,255,1)'
 * @vue-prop {Number} [opt.polylineSets[i].lineWidth=3] 輸入第i個折線集合的框線寬度數字，預設為3
 * @vue-prop {Number} [opt.polylineSets[i].lineWidthHover=3] 輸入滑鼠移入時第i個折線集合的框線寬度數字，預設為3
 * @vue-prop {Array} [opt.polylineSets[i].latLngs=[]] 輸入第i個折線集合的數據陣列，可使用polyline或multiPolyline，各點座標為緯經度，預設[]
 * @vue-prop {Function} [opt.polylineSetsClick=function(){}] 輸入全域折線集合的click呼叫函數，可給予函數接收點擊事件，預設為function(){}
 * @vue-prop {Boolean} [opt.polylineSets[i].visible=true] 輸入是否顯示第i個折線集合布林值，預設為true
 * @vue-prop {Array} [opt.polygonSets=[]] 輸入多邊形集合陣列，各元素為物件，預設[]
 * @vue-prop {String} [opt.polygonSets[i].title=''] 輸入第i個多邊形集合的標題字串，預設為''
 * @vue-prop {String} [opt.polygonSets[i].msg=''] 輸入第i個多邊形集合的說明字串，預設為''
 * @vue-prop {Number} [opt.polygonSets[i].order=null] 輸入第i個多邊形集合的排序用數字，預設null
 * @vue-prop {String} [opt.polygonSets[i].lineColor='rgba(0,150,255,1)'] 輸入第i個多邊形集合的框線顏色字串，預設為'rgba(0,150,255,1)'
 * @vue-prop {String} [opt.polygonSets[i].lineColorHover='rgba(0,150,255,1)'] 輸入滑鼠移入時第i個多邊形集合的框線顏色字串，預設為'rgba(0,150,255,1)'
 * @vue-prop {Number} [opt.polygonSets[i].lineWidth=3] 輸入第i個多邊形集合的框線寬度數字，預設為3
 * @vue-prop {Number} [opt.polygonSets[i].lineWidthHover=3] 輸入滑鼠移入時第i個多邊形集合的框線寬度數字，預設為3
 * @vue-prop {String} [opt.polygonSets[i].fillColor='rgba(0,150,255,0.25)'] 輸入第i個多邊形集合的填充顏色字串，預設為'rgba(0,150,255,0.25)'
 * @vue-prop {String} [opt.polygonSets[i].fillColorHover='rgba(0,150,255,0.25)'] 輸入滑鼠移入時第i個多邊形集合的填充顏色字串，預設為'rgba(0,150,255,0.25)'
 * @vue-prop {Array} [opt.polygonSets[i].latLngs=[]] 輸入第i個多邊形集合的數據陣列，可使用polygon或multiPolygon，各點座標為緯經度，預設[]
 * @vue-prop {Function} [opt.polygonSetsClick=function(){}] 輸入全域多邊形集合的click呼叫函數，可給予函數接收點擊事件，預設為function(){}
 * @vue-prop {Boolean} [opt.polygonSets[i].visible=true] 輸入是否顯示第i個多邊形集合布林值，預設為true
 * @vue-prop {Array} [opt.geojsonSets=[]] 輸入geojson集合陣列，各元素為物件，預設[]
 * @vue-prop {String} [opt.geojsonSets[i].title=''] 輸入第i個geojson集合的標題字串，預設為''
 * @vue-prop {String} [opt.geojsonSets[i].msg=''] 輸入第i個geojson集合的說明字串，預設為''
 * @vue-prop {Number} [opt.geojsonSets[i].order=null] 輸入第i個geojson集合的排序用數字，預設null
 * @vue-prop {String} [opt.geojsonSets[i].lineColor='rgba(0,150,255,1)'] 輸入第i個geojson集合的框線顏色字串，預設為'rgba(0,150,255,1)'
 * @vue-prop {String} [opt.geojsonSets[i].lineColorHover='rgba(0,150,255,1)'] 輸入滑鼠移入時第i個geojson集合的框線顏色字串，預設為'rgba(0,150,255,1)'
 * @vue-prop {Number} [opt.geojsonSets[i].lineWidth=3] 輸入第i個geojson集合的框線寬度數字，預設為3
 * @vue-prop {Number} [opt.geojsonSets[i].lineWidthHover=3] 輸入滑鼠移入時第i個geojson集合的框線寬度數字，預設為3
 * @vue-prop {String} [opt.geojsonSets[i].fillColor='rgba(0,150,255,0.25)'] 輸入第i個geojson集合的填充顏色字串，預設為'rgba(0,150,255,0.25)'
 * @vue-prop {String} [opt.geojsonSets[i].fillColorHover='rgba(0,150,255,0.25)'] 輸入滑鼠移入時第i個geojson集合的填充顏色字串，預設為'rgba(0,150,255,0.25)'
 * @vue-prop {Object} [opt.geojsonSets[i].geojson={}] 輸入第i個geojson集合的數據物件，各點座標為緯經度，預設{}
 * @vue-prop {Function} [opt.geojsonSetsClick=function(){}] 輸入全域geojson集合的click呼叫函數，可給予函數接收點擊事件，預設為function(){}
 * @vue-prop {Boolean} [opt.geojsonSets[i].visible=true] 輸入是否顯示第i個geojson集合布林值，預設為true
 * @vue-prop {Array} [opt.contourSets=[]] 輸入等值線集合陣列，各元素為物件，預設[]
 * @vue-prop {Number} [opt.contourSets[i].order=null] 輸入第i個等值線集合的排序用數字，預設null
 * @vue-prop {Object} [opt.contourSets[i].gradient=詳見程式碼] 輸入第i個等值線集合的色階(color map)設定物件，鍵範圍0至1，值為對應之顏色，於各鍵之間則採用內插取色，預設值詳見程式碼
 * @vue-prop {Function} [opt.contourSets[i].getColor=null] 輸入第i個等值線集合的顏色函數，預設null
 * @vue-prop {String} [opt.contourSets[i].lineColor=''] 輸入第i個等值線集合的框線顏色字串，若不輸入則預設為gradient內插所得顏色，預設為''
 * @vue-prop {String} [opt.contourSets[i].lineColorHover=''] 輸入滑鼠移入時第i個等值線集合的框線顏色字串，若不輸入則預設為gradient內插所得顏色，預設為''
 * @vue-prop {Number} [opt.contourSets[i].lineWidth=1] 輸入第i個等值線集合的框線寬度數字，預設為1
 * @vue-prop {Number} [opt.contourSets[i].lineWidthHover=3] 輸入滑鼠移入時第i個等值線集合的框線寬度數字，預設為3
 * @vue-prop {Number} [opt.contourSets[i].fillOpacity=0.2] 輸入第i個等值線集合的填充透明度數字，預設為0.2
 * @vue-prop {Number} [opt.contourSets[i].fillOpacityHover=0.5] 輸入滑鼠移入時第i個等值線集合的填充透明度數字，預設為0.5
 * @vue-prop {Boolean} [opt.contourSets[i].changeStyleWhenHover=true] 輸入第i個等值線集合的是否使用滑鼠移入時切換style效果布林值，預設true
 * @vue-prop {Number} [opt.contourSets[i].legendNumDig=null] 輸入第i個等值線集合的對圖例內數字取小數位數，null代表不取，預設null
 * @vue-prop {Function} [opt.contourSets[i].legendTextFormater=null] 輸入第i個等值線集合的對圖例內各色階的文字內容產生函數，可基於傳入資料回傳顯示文字或html內容，null代表不取，預設null
 * @vue-prop {Function} [opt.contourSets[i].legendTextExtra=null] 輸入第i個等值線集合的對圖例內各色階的文字提供額外文字函數，預設null
 * @vue-prop {Array} [opt.contourSets[i].polygonClipOuter=[]] 輸入第i個等值線集合的剔除以外之多邊形(polygon，深度為2，例如[[p1lat,p1lng],[p2lat,p2lng],...])陣列，預設[]
 * @vue-prop {Array} [opt.contourSets[i].polygonsClipInner=[]] 輸入第i個等值線集合的剔除以內之複數多邊形(multi-polygon，深度為3，例如[[[p1lat,p1lng]],[[p2lat,p2lng]],...])陣列，預設[]
 * @vue-prop {Array} [opt.contourSets[i].polygonsContainInner=[]] 輸入第i個等值線集合的保留以內之複數多邊形(multi-polygon，深度為3，例如[[[p1lat,p1lng]],[[p2lat,p2lng]],...])陣列，預設[]
 * @vue-prop {Array} [opt.contourSets[i].thresholds=[]] 輸入第i個等值線集合的用等值線門檻值陣列，給予非有效陣列則使用自動計算各線門檻值，預設[]
 * @vue-prop {Array} [opt.contourSets[i].points=[]] 輸入第i個等值線集合的數據陣列，各點座標為緯經度，並自動基於三角網格技術計算等值線，預設[]
 * @vue-prop {Function} [opt.contourSetsClick=function(){}] 輸入全域等值線集合的click呼叫函數，可給予函數接收點擊事件，預設為function(){}
 * @vue-prop {Boolean} [opt.contourSets[i].visible=true] 輸入是否顯示第i個等值線集合布林值，預設為true
 */
export default {
    directives: {
        domresize: domResize(),
    },
    components: {
        LMap,
        LTileLayer,
        LControl,
        LControlAttribution,
        LControlZoom,
        LControlScale,
        LLayerGroup,
        LMarker,
        LCircleMarker,
        LPolyline,
        LPolygon,
        LImageOverlay,
        LWMSTileLayer,
        LwGeoJson,
        LwContour,
        Radios,
        Checkboxs,
        PopupPoint,
        PopupRegion,
        TooltipPoint,
        TooltipRegion,
    },
    props: {
        opt: {
            type: Object,
            default: () => {},
        },
    },
    data: function() {
        return {

            dbcChangePointSets: debounce(),
            dbcChangePolylineSets: debounce(),
            dbcChangePolygonSets: debounce(),
            dbcChangeGeojsonSets: debounce(),
            dbcChangeContourSets: debounce(),
            dbcChangeImageSets: debounce(),
            dbcChangeItems: debounce(),
            wats: [],

            center: [],
            zoom: null,
            panelBackgroundColor: '',
            panelCompassRose: {},
            panelCompassRoseTemp: {},
            panelZoom: {},
            panelZoomTemp: {},
            panelScale: {},
            panelScaleTemp: {},
            panelBaseMaps: {},
            panelBaseMapsTemp: {},
            panelItems: {},
            panelItemsTemp: {},
            panelLabels: {},
            panelLabelsTemp: {},
            panelLegends: {},
            panelLegendsTemp: {},
            showLoc: {
                lat: '',
                lng: '',
            },

            imageSets: [],
            effImageSetsTemp: [],

            pointSets: [],
            effPointSetsTemp: [],

            polylineSets: [],
            effPolylineSetsTemp: [],

            polygonSets: [],
            effPolygonSetsTemp: [],

            geojsonSets: [],
            effGeojsonSetsTemp: [],

            contourSets: [],
            effContourSetsTemp: [],

            items: [],
        }
    },
    mounted: function() {
        // console.log('mounted')

        let vo = this

        //wo
        let wo = {
            immediate: true,
            deep: true,
        }

        each(['imageSets', 'imageSetsPopup'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changeImageSetsDebounce, wo)
            vo.wats.push(wat)
        })

        each(['pointSets', 'pointSetsClick'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changePointSetsDebounce, wo)
            vo.wats.push(wat)
        })

        each(['polylineSets', 'polylineSetsClick'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changePolylineSetsDebounce, wo)
            vo.wats.push(wat)
        })

        each(['polygonSets', 'polygonSetsClick'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changePolygonSetsDebounce, wo)
            vo.wats.push(wat)
        })

        each(['geojsonSets', 'geojsonSetsClick'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changeGeojsonSetsDebounce, wo)
            vo.wats.push(wat)
        })

        each(['contourSets', 'contourSetsClick'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changeContourSetsDebounce, wo)
            vo.wats.push(wat)
        })

    },
    beforeDestroy: function() {
        // console.log('beforeDestroy')

        let vo = this

        //unwatch
        each(vo.wats, (wat) => {
            wat()
        })

    },
    watch: {
        'opt': {
            handler(value) {
                // console.log('opt handler', cloneDeep(value))

                let vo = this

                //changeOpt
                vo.changeOpt()

            },
            immediate: true,
            deep: true,
        }
    },
    computed: {

        baseMapColorShade: function() {
            let vo = this

            //baseMaps
            let baseMaps = get(vo, 'panelBaseMaps.baseMaps', [])
            // console.log('baseMaps', baseMaps)

            //colorShade
            let colorShade = ''
            each(baseMaps, (v) => {
                if (v.visible && isestr(v.colorShade)) {
                    colorShade = v.colorShade
                    return false //跳出
                }
            })
            // console.log('baseMapColorShade', colorShade)

            return colorShade
        },

        useIconCompassRose: function() {
            let vo = this

            //iconSrc
            if (isestr(vo.panelCompassRose.iconSrc)) {
                return vo.panelCompassRose.iconSrc
            }

            //withPanel
            if (vo.panelCompassRose.withPanel) {
                if (isestr(vo.panelCompassRose.iconSrcDark)) {
                    return vo.panelCompassRose.iconSrcDark
                }
                throw new Error(`invalid panelCompassRose.iconSrcDark`)
            }

            //baseMapColorShade
            if (vo.baseMapColorShade === 'dark') {
                if (isestr(vo.panelCompassRose.iconSrcLight)) {
                    return vo.panelCompassRose.iconSrcLight
                }
                throw new Error(`invalid panelCompassRose.iconSrcLight`)
            }
            else {
                if (isestr(vo.panelCompassRose.iconSrcDark)) {
                    return vo.panelCompassRose.iconSrcDark
                }
                throw new Error(`invalid panelCompassRose.iconSrcDark`)
            }
        },

    },
    methods: {

        resize: function(msg) {
            // console.log('methods resize', msg)

            let vo = this

            //mapObject
            let mapObject = vo.getMapObject()

            //check
            if (!iseobj(mapObject)) {
                return
            }

            //invalidateSize
            mapObject.invalidateSize()
            // console.log('invalidateSize')

        },

        handleWheelPanelBaseMaps: function(e) {
            // console.log('methods handleWheelPanelBaseMaps', e)

            let vo = this

            //禁止滾輪事件
            if (vo.panelBaseMaps.stopWheel) {
                e.stopPropagation()
                // e.preventDefault()
            }

        },

        handleWheelPanelItems: function(e) {
            // console.log('methods handleWheelPanelItems', e)

            let vo = this

            //禁止滾輪事件
            if (vo.panelItems.stopWheel) {
                e.stopPropagation()
                // e.preventDefault()
            }

        },

        handleWheelPanelLegends: function(e) {
            // console.log('methods handleWheelPanelLegends', e)

            let vo = this

            //禁止滾輪事件
            if (vo.panelLegends.stopWheel) {
                e.stopPropagation()
                // e.preventDefault()
            }

        },

        countVisible: function(arr) {
            let i = 0
            each(arr, (v) => {
                if (v.visible) {
                    i++
                }
            })
            return i
        },

        updateZoom: function(v) {
            // console.log('methods updateZoom', v)

            let vo = this

            vo.opt.zoom = v //強制修改外部opt數據, 否則因內部切換zoom而外部數據沒變更時, 會無法偵測zoom變動
            vo.zoom = v //要更新內部zoom使地圖zoom數字能變更

        },

        updateCenter: function(v) {
            // console.log('methods updateCenter', v)

            let vo = this

            //zoom與center常會同時設定, 但外部變更時可能僅只有一個如zoom, 若內部有先變更另一個如center, 但此時外部數據的center沒變更的話, 就會導致外部給予zoom時又重傳舊的center進來, 造成使用者平移的操作被重設, 故center也需要由內部同步變更至外部

            if (!isEqual(vo.opt.center, [v.lat, v.lng])) {
                vo.opt.center = [v.lat, v.lng] //強制修改外部opt數據, 否則因內部切換center而外部數據沒變更時, 會無法偵測center變動
                // vo.center = v //不修改內部center
            }

        },

        getIconParam: function(v) {
            // console.log('methods getIconParam', v)

            // let vo = this

            //param
            let iconSrc = get(v, 'iconSrc', null)
            let iconSize = get(v, 'iconSize', null)
            let iconAnchor = get(v, 'iconAnchor', null)
            let popupAnchor = get(v, 'popupAnchor', null)
            let tooltipAnchor = get(v, 'tooltipAnchor', null)

            //eff
            let eff = isestr(iconSrc) && isarr(iconSize) && size(iconSize) === 2 && isarr(iconAnchor) && size(iconAnchor) === 2 // && isarr(popupAnchor) && size(popupAnchor) === 2 && isarr(tooltipAnchor) && size(tooltipAnchor) === 2

            return {
                eff,
                iconSrc,
                iconSize,
                iconAnchor,
                popupAnchor,
                tooltipAnchor,
            }
        },

        getIcon: function(v) {
            // console.log('methods getIcon', v)

            let vo = this

            //getIconParam
            let r = vo.getIconParam(v)
            // console.log('getIconParam r', r)

            //check
            if (!r.eff) {
                let defIconSrc = uiRes.iconPoint
                r.iconSrc = defIconSrc
                r.iconSize = [24, 40]
                r.iconAnchor = [r.iconSize[0] / 2, r.iconSize[1]] //圖左上角相對座標
                r.popupAnchor = [0, -r.iconSize[1] / 1.5] //google預設icon
                r.tooltipAnchor = [0, -r.iconSize[1] / 1.5] //google預設icon
                // console.log('icon(default)', r)
            }

            //icon
            let icon = new Icon({
                iconUrl: r.iconSrc,
                iconSize: r.iconSize,
                iconAnchor: r.iconAnchor,
                popupAnchor: r.popupAnchor,
                tooltipAnchor: r.tooltipAnchor,
            })
            // console.log('icon', icon, r.eff)

            return {
                eff: r.eff,
                icon,
            }
        },

        changeOpt: function() {
            // console.log('methods changeOpt')

            let vo = this

            //mapObject
            let mapObject = vo.getMapObject()

            // //check //因初始化無mapObject不能事先檢測與跳出, 只能於用到再檢測
            // if (!iseobj(mapObject)) {
            //     return
            // }

            //panelBackgroundColor
            let panelBackgroundColor = get(vo, 'opt.panelBackgroundColor', null)
            if (!isstr(panelBackgroundColor)) {
                panelBackgroundColor = 'rgba(255,255,255,0.95)'
            }
            vo.panelBackgroundColor = panelBackgroundColor

            //zoom
            let zoom = get(vo, 'opt.zoom', null)
            if (!ispint(zoom)) {
                zoom = 7
            }
            zoom = Math.min(Math.max(zoom, 1), 18) //介於1~18

            //check
            if (!isEqual(vo.zoom, zoom)) {

                //update
                vo.zoom = zoom

                // //setZoom, 不會有像修改center的問題, 故不使用setZoom
                // if (iseobj(mapObject)) {
                //     mapObject.setZoom(zoom)
                // }

            }

            //center
            let center = get(vo, 'opt.center', null)
            let ckCenter = isarr(center) && size(center) === 2 && isNumber(get(center, 0)) && isNumber(get(center, 1))
            if (!ckCenter) {
                center = [23.5, 121.1]
            }
            center = cloneDeep(center) //一定要cloneDeep使陣列記憶體與外部拖勾, 要不然更新center時就會觸發外部opt記憶體變更而被watch到, 進而導致無限觸發事件

            //check
            if (!isEqual(vo.center, center)) {

                //update
                vo.center = center

                //panTo, 因為由外部更改center座標過近時, vue-leaflet會無法移動地圖, 故得呼叫原始leaflet事件panTo強制移動地圖至center
                if (iseobj(mapObject)) {
                    mapObject.panTo(center)
                }

            }

            //default showLoc
            vo.showLoc = {
                lat: dig(vo.center[0], 7),
                lng: dig(vo.center[1], 7),
            }

            //defPanelBaseMaps
            let defPanelBaseMaps = {
                show: true,
                position: 'topleft',
                baseMaps: [],
                // maxHeight: 300,
                stopWheel: false,
            }

            //panelBaseMaps
            let panelBaseMaps = get(vo, 'opt.panelBaseMaps', null)
            if (!isobj(panelBaseMaps)) {
                panelBaseMaps = {}
            }
            panelBaseMaps = { //merge
                ...defPanelBaseMaps,
                ...panelBaseMaps,
            }
            if (size(get(panelBaseMaps, 'baseMaps', [])) === 0) {
                if (size(get(vo, 'panelBaseMaps.baseMaps', [])) === 0) {
                    panelBaseMaps.baseMaps = cloneDeep(defBaseMaps) //無既有數據, 使用cloneDeep避免跨組件污染
                }
                else {
                    panelBaseMaps.baseMaps = cloneDeep(vo.panelBaseMaps.baseMaps) //有既有數據, 因baseMaps包含使用者已切換指定之底圖故得要優先使用, 使用cloneDeep避免污染外部數據
                }
            }
            panelBaseMaps = cloneDeep(panelBaseMaps) //一定要cloneDeep使陣列記憶體與外部拖勾, 要不然更新baseMaps時就會觸發外部opt記憶體變更而被watch到, 進而導致無限觸發事件
            panelBaseMaps.style = {}
            if (isNumber(panelBaseMaps.width)) {
                panelBaseMaps.style.width = `${panelBaseMaps.width}px`
            }
            if (isNumber(panelBaseMaps.maxWidth)) {
                panelBaseMaps.style.maxWidth = `${panelBaseMaps.maxWidth}px`
            }
            if (isNumber(panelBaseMaps.height)) {
                panelBaseMaps.style.height = `${panelBaseMaps.height}px`
            }
            if (isNumber(panelBaseMaps.maxHeight)) {
                panelBaseMaps.style.maxHeight = `${panelBaseMaps.maxHeight}px`
            }
            // console.log('panelBaseMaps', panelBaseMaps)

            //check
            if (!isEqual(vo.panelBaseMapsTemp, panelBaseMaps)) { //判斷外部給資料是否有變更
                vo.panelBaseMaps = panelBaseMaps
                vo.panelBaseMapsTemp = cloneDeep(panelBaseMaps)
            }

            //defPanelCompassRose
            let defPanelCompassRose = {
                show: false,
                position: 'topright',
                size: 120,
                withPanel: false,
                iconSrcLight: uiRes.iconCompassRoseLight,
                iconSrcDark: uiRes.iconCompassRoseDark,
                iconSrc: null,
            }

            //panelCompassRose
            let panelCompassRose = get(vo, 'opt.panelCompassRose', null)
            if (!isobj(panelCompassRose)) {
                panelCompassRose = {}
            }
            panelCompassRose = { //merge
                ...defPanelCompassRose,
                ...panelCompassRose,
            }
            //cloneDeep
            //style
            // console.log('panelCompassRose', panelCompassRose)

            //check
            if (!isEqual(vo.panelCompassRoseTemp, panelCompassRose)) { //判斷外部給資料是否有變更
                vo.panelCompassRose = panelCompassRose
                vo.panelCompassRoseTemp = cloneDeep(panelCompassRose)
            }

            //defPanelZoom
            let defPanelZoom = {
                show: true,
                position: 'bottomleft',
            }

            //panelZoom
            let panelZoom = get(vo, 'opt.panelZoom', null)
            if (!isobj(panelZoom)) {
                panelZoom = {}
            }
            panelZoom = { //merge
                ...defPanelZoom,
                ...panelZoom,
            }
            //cloneDeep
            //style
            // console.log('panelZoom', panelZoom)

            //check
            if (!isEqual(vo.panelZoomTemp, panelZoom)) { //判斷外部給資料是否有變更
                vo.panelZoom = panelZoom
                vo.panelZoomTemp = cloneDeep(panelZoom)
            }

            //defPanelScale
            let defPanelScale = {
                show: true,
                position: 'bottomright',
            }

            //panelScale
            let panelScale = get(vo, 'opt.panelScale', null)
            if (!isobj(panelScale)) {
                panelScale = {}
            }
            panelScale = { //merge
                ...defPanelScale,
                ...panelScale,
            }
            //cloneDeep
            //style
            // console.log('panelScale', panelScale)

            //check
            if (!isEqual(vo.panelScaleTemp, panelScale)) { //判斷外部給資料是否有變更
                vo.panelScale = panelScale
                vo.panelScaleTemp = cloneDeep(panelScale)
            }

            //panelLabels
            let defPanelLabels = {
                show: true,
                title: '',
                useItems: ['lng', 'lat', 'zoom'],
                lng: 'Longitude',
                lat: 'Latitude',
                zoom: 'Zoom',
                position: 'topright',
            }
            let panelLabels = get(vo, 'opt.panelLabels', null)
            if (!isobj(panelLabels)) {
                panelLabels = {}
            }
            panelLabels = { //merge
                ...defPanelLabels,
                ...panelLabels,
            }
            panelLabels = cloneDeep(panelLabels) //一定要cloneDeep使陣列記憶體與外部拖勾, 要不然添加style就會影響外部opt記憶體變更
            panelLabels.style = {}
            if (isNumber(panelLabels.width)) {
                panelLabels.style.width = `${panelLabels.width}px`
            }
            if (isNumber(panelLabels.maxWidth)) {
                panelLabels.style.maxWidth = `${panelLabels.maxWidth}px`
            }
            if (isNumber(panelLabels.height)) {
                panelLabels.style.height = `${panelLabels.height}px`
            }
            if (isNumber(panelLabels.maxHeight)) {
                panelLabels.style.maxHeight = `${panelLabels.maxHeight}px`
            }
            // console.log('panelLabels', panelLabels)

            //check
            if (!isEqual(vo.panelLabelsTemp, panelLabels)) { //判斷外部給資料是否有變更
                vo.panelLabels = panelLabels
                vo.panelLabelsTemp = cloneDeep(panelLabels)
            }

            //panelItems
            let defPanelItems = {
                show: true,
                position: 'topleft',
                // maxHeight: 300,
                stopWheel: false,
            }
            let panelItems = get(vo, 'opt.panelItems', null)
            if (!isobj(panelItems)) {
                panelItems = {}
            }
            panelItems = { //merge
                ...defPanelItems,
                ...panelItems,
            }
            panelItems = cloneDeep(panelItems) //一定要cloneDeep使陣列記憶體與外部拖勾, 要不然添加style就會影響外部opt記憶體變更
            panelItems.style = {}
            if (isNumber(panelItems.width)) {
                panelItems.style.width = `${panelItems.width}px`
            }
            if (isNumber(panelItems.maxWidth)) {
                panelItems.style.maxWidth = `${panelItems.maxWidth}px`
            }
            if (isNumber(panelItems.height)) {
                panelItems.style.height = `${panelItems.height}px`
            }
            if (isNumber(panelItems.maxHeight)) {
                panelItems.style.maxHeight = `${panelItems.maxHeight}px`
            }
            // console.log('panelItems', panelItems)

            //check
            if (!isEqual(vo.panelItemsTemp, panelItems)) { //判斷外部給資料是否有變更
                vo.panelItems = panelItems
                vo.panelItemsTemp = cloneDeep(panelItems)
            }

            //panelLegends
            let defPanelLegends = {
                show: true,
                position: 'bottomright',
                maxWidth: 300,
                stopWheel: false,
            }
            let panelLegends = get(vo, 'opt.panelLegends', null)
            if (!isobj(panelLegends)) {
                panelLegends = {}
            }
            panelLegends = { //merge
                ...defPanelLegends,
                ...panelLegends,
            }
            panelLegends = cloneDeep(panelLegends) //一定要cloneDeep使陣列記憶體與外部拖勾, 要不然添加style就會影響外部opt記憶體變更
            panelLegends.style = {}
            if (isNumber(panelLegends.width)) {
                panelLegends.style.width = `${panelLegends.width}px`
            }
            if (isNumber(panelLegends.maxWidth)) {
                panelLegends.style.maxWidth = `${panelLegends.maxWidth}px`
            }
            if (isNumber(panelLegends.height)) {
                panelLegends.style.height = `${panelLegends.height}px`
            }
            if (isNumber(panelLegends.maxHeight)) {
                panelLegends.style.maxHeight = `${panelLegends.maxHeight}px`
            }
            // console.log('panelLegends', panelLegends)

            //check
            if (!isEqual(vo.panelLegendsTemp, panelLegends)) { //判斷外部給資料是否有變更
                vo.panelLegends = panelLegends
                vo.panelLegendsTemp = cloneDeep(panelLegends)
            }

            //changeItemsDebounce
            vo.changeItemsDebounce('changeOpt')

        },

        changeImageSetsDebounce: function(v) {
            // console.log('methods changeImageSetsDebounce', v)

            let vo = this

            vo.dbcChangeImageSets(() => {
                vo.changeImageSets()
            })

        },

        changeImageSets: function() {
            // console.log('methods changeImageSets')

            let vo = this

            //imageSets
            let imageSets = get(vo, 'opt.imageSets', null)
            if (!isarr(imageSets)) {
                imageSets = []
            }
            imageSets = cloneDeep(imageSets) //cloneDeep, 後續map會直接修改設定物件記憶體故需脫勾, 但值為函數不會脫勾

            // //check, 不能檢查size為0跳出, 否則外部會無法清空數據
            // if (size(imageSets) === 0) {
            //     return
            // }

            //effImageSets
            let effImageSets = map(imageSets, (v) => {
                return omit(v, 'visible')
            })

            //check
            if (isEqual(vo.effImageSetsTemp, effImageSets)) {
                return
            }
            vo.effImageSetsTemp = effImageSets
            // console.log('call changeImageSets')

            //funSetsClick
            let funSetsClick = get(vo, 'opt.imageSetsClick', null)

            vo.imageSets = map(imageSets, (imageSet, kimageSet) => {

                //image
                let image = get(imageSet, 'image', {})
                // console.log('image', image)

                //check
                if (!iseobj(image)) {
                    throw new Error(`imageSet.image is not an effective object`)
                }

                //url
                let url = get(image, 'url', '')

                //check
                if (!isestr(url)) {
                    throw new Error(`imageSet.url is not an effective string`)
                }

                //lngMin
                let lngMin = get(image, 'lngMin', '')
                let lngMax = get(image, 'lngMax', '')
                let latMin = get(image, 'latMin', '')
                let latMax = get(image, 'latMax', '')

                //check
                if (!isnum(lngMin)) {
                    throw new Error(`imageSet.image.lngMin is not a number`)
                }
                if (!isnum(lngMax)) {
                    throw new Error(`imageSet.image.lngMax is not a number`)
                }
                if (!isnum(latMin)) {
                    throw new Error(`imageSet.image.latMin is not a number`)
                }
                if (!isnum(latMax)) {
                    throw new Error(`imageSet.image.latMax is not a number`)
                }

                //bounds
                let bounds = [
                    [latMin, lngMin],
                    [latMax, lngMax],
                ]

                //order
                let order = get(imageSet, 'order', null)

                // //lineColor
                // let lineColor = get(imageSet, 'lineColor', null)
                // if (!isestr(lineColor)) {
                //     lineColor = 'rgba(0,150,255,1)'
                // }

                // //lineWidth
                // let lineWidth = get(imageSet, 'lineWidth', null)
                // if (!isNumber(lineWidth)) {
                //     lineWidth = 3
                // }

                // //fillColor
                // let fillColor = get(imageSet, 'fillColor', null)
                // if (!isestr(fillColor)) {
                //     fillColor = 'rgba(0,150,255,0.25)'
                // }

                // //style
                // let style = {
                //     fillColor,
                //     fillOpacity: 1, //vue leaflet預設為0.2得還原
                //     color: lineColor,
                //     weight: lineWidth,
                // }

                // //lineColorHover
                // let lineColorHover = get(imageSet, 'lineColorHover', null)
                // if (!isestr(lineColorHover)) {
                //     lineColorHover = lineColor
                // }

                // //lineWidthHover
                // let lineWidthHover = get(imageSet, 'lineWidthHover', null)
                // if (!isNumber(lineWidthHover)) {
                //     lineWidthHover = lineWidth
                // }

                // //fillColorHover
                // let fillColorHover = get(imageSet, 'fillColorHover', null)
                // if (!isestr(fillColorHover)) {
                //     fillColorHover = fillColor
                // }

                // //styleHover
                // let styleHover = {
                //     fillColor: fillColorHover,
                //     fillOpacity: 1, //vue leaflet預設為0.2得還原
                //     color: lineColorHover,
                //     weight: lineWidthHover,
                // }

                //title
                if (!isestr(get(imageSet, 'title', null))) {
                    imageSet.title = ''
                }

                //msg
                if (!isestr(get(imageSet, 'msg', null))) {
                    imageSet.msg = ''
                }

                //order
                if (!isNumber(get(imageSet, 'order', null))) {
                    imageSet.order = null
                }

                //visible
                if (!isbol(get(imageSet, 'visible', null))) {
                    imageSet.visible = false
                }

                return {
                    ...imageSet,
                    bounds,
                    order,
                    // style,
                    // styleHover,
                    // mouseenter: (ev) => {
                    //     // console.log('mouseenter', ev)
                    //     let layer = ev.target
                    //     layer.setStyle(styleHover)
                    // },
                    // mouseleave: (ev) => {
                    //     // console.log('mouseleave', ev)
                    //     let layer = ev.target
                    //     layer.setStyle(style)
                    // },
                    funSetsClick,
                }
            })

            //changeItemsDebounce
            vo.changeItemsDebounce('changeImageSets')

        },

        changePointSetsDebounce: function(v) {
            // console.log('methods changePointSetsDebounce', v)

            let vo = this

            vo.dbcChangePointSets(() => {
                vo.changePointSets()
            })

        },

        changePointSets: function() {
            // console.log('methods changePointSets')

            let vo = this

            //pointSets
            let pointSets = get(vo, 'opt.pointSets', null)
            if (!isarr(pointSets)) {
                pointSets = []
            }
            pointSets = cloneDeep(pointSets) //cloneDeep, 後續map會直接修改設定物件記憶體故需脫勾, 但值為函數不會脫勾

            // //check, 不能檢查size為0跳出, 否則外部會無法清空數據
            // if (size(pointSets) === 0) {
            //     return
            // }

            //effPointSets
            let effPointSets = map(pointSets, (v) => {
                return omit(v, 'visible')
            })

            //check
            if (isEqual(vo.effPointSetsTemp, effPointSets)) {
                return
            }
            vo.effPointSetsTemp = effPointSets
            // console.log('call changePointSets')

            //funSetsClick
            let funSetsClick = get(vo, 'opt.pointSetsClick', null)

            //pointSets
            vo.pointSets = map(pointSets, (pointSet, kpointSet) => {

                //idPointSet
                let idPointSet = `pointSet-${kpointSet}`

                //order
                let order = get(pointSet, 'order', null)

                //pointSetType
                let pointSetType = get(pointSet, 'type', null)

                //pointSetSize
                let pointSetSize = get(pointSet, 'size', null)

                //pointSetIconPointSet
                let pointSetIconPointSet = vo.getIcon(pointSet).icon
                // console.log('pointSetIconPointSet', pointSetIconPointSet)

                //pointSetLineColor
                let pointSetLineColor = get(pointSet, 'lineColor', null)

                //pointSetLineWidth
                let pointSetLineWidth = get(pointSet, 'lineWidth', null)

                //pointSetFillColor
                let pointSetFillColor = get(pointSet, 'fillColor', null)

                //points
                pointSet.points = map(pointSet.points, (point, kpoint) => {

                    //idPoint
                    let idPoint = `pointSet-${kpointSet}-point-${kpoint}`

                    //point
                    if (isearr(point)) {
                        let p = {
                            latLng: [get(point, 0), get(point, 1)],
                        }
                        point = p
                    }

                    //pointType
                    let pointType = get(point, 'type', null)

                    //type
                    let type = pointType || pointSetType
                    if (type !== 'icon' && type !== 'circle') {
                        type = 'circle'
                    }

                    //pointSize
                    let pointSize = get(point, 'size', null)

                    //radius
                    let radius = pointSize || pointSetSize
                    if (!isNumber(radius)) {
                        radius = 10
                    }

                    //pointLineColor
                    let pointLineColor = get(point, 'point', null)

                    //lineColor
                    let lineColor = pointLineColor || pointSetLineColor
                    if (!isestr(lineColor)) {
                        lineColor = 'rgba(255,255,255,1)'
                    }

                    //pointLineWidth
                    let pointLineWidth = get(point, 'lineWidth', null)

                    //lineWidth
                    let lineWidth = pointLineWidth || pointSetLineWidth
                    if (!isNumber(lineWidth)) {
                        lineWidth = 1
                    }

                    //pointFillColor
                    let pointFillColor = get(point, 'fillColor', null)

                    //fillColor
                    let fillColor = pointFillColor || pointSetFillColor
                    if (!isestr(fillColor)) {
                        fillColor = 'rgba(0,150,255,0.65)'
                    }

                    //style
                    let style = {
                        radius,
                        fillColor,
                        fillOpacity: 1, //vue leaflet預設為0.2得還原
                        color: lineColor,
                        weight: lineWidth,
                    }

                    //pointTemp
                    let pointTemp = {
                        id: idPoint,
                        ...point,
                        type,
                        funSetsClick,
                    }
                    if (type === 'icon') {

                        //icon, 若各點有提供icon則優先使用
                        let icon = null
                        let r = vo.getIconParam(point)
                        if (r.eff) {
                            icon = new Icon({
                                iconUrl: r.iconSrc,
                                iconSize: r.iconSize,
                                iconAnchor: r.iconAnchor,
                                popupAnchor: r.popupAnchor,
                                tooltipAnchor: r.tooltipAnchor,
                            })
                            // console.log('各點有提供icon優先使用')
                        }
                        else {
                            icon = pointSetIconPointSet
                            // console.log('各點無提供icon, 改使用pointSet的icon')
                        }

                        //use icon
                        pointTemp.icon = icon

                    }
                    else {

                        //use style
                        pointTemp.style = style

                        //icon,
                        let icon = new Icon({
                            iconUrl: '',
                            iconSize: [0, 0],
                            iconAnchor: [0, 0],
                            popupAnchor: [0, -radius / 1.5],
                            tooltipAnchor: [0, 0],
                        })
                        // console.log('icon', icon)
                        // console.log('各點無提供icon, 改使用pointSet的icon')

                        //use icon
                        pointTemp.icon = icon

                    }
                    // console.log('pointTemp', pointTemp)

                    return pointTemp
                })
                // console.log('pointSet.points', pointSet.points)

                //title
                if (!isestr(get(pointSet, 'title', null))) {
                    pointSet.title = ''
                }

                //msg
                if (!isestr(get(pointSet, 'msg', null))) {
                    pointSet.msg = ''
                }

                //order
                if (!isNumber(get(pointSet, 'order', null))) {
                    pointSet.order = null
                }

                //visible
                if (!isbol(get(pointSet, 'visible', null))) {
                    pointSet.visible = false
                }

                //pointSetTemp
                let pointSetTemp = {
                    id: idPointSet,
                    ...pointSet,
                    order,
                }
                // console.log('pointSetTemp', pointSetTemp)

                return pointSetTemp
            })
            // console.log('vo.pointSets', vo.pointSets)

            //changeItemsDebounce
            vo.changeItemsDebounce('changePointSets')

        },

        changePolylineSetsDebounce: function(v) {
            // console.log('methods changePolylineSetsDebounce', v)

            let vo = this

            vo.dbcChangePolylineSets(() => {
                vo.changePolylineSets()
            })

        },

        changePolylineSets: function() {
            // console.log('methods changePolylineSets')

            let vo = this

            //polylineSets
            let polylineSets = get(vo, 'opt.polylineSets', null)
            if (!isarr(polylineSets)) {
                polylineSets = []
            }
            polylineSets = cloneDeep(polylineSets) //cloneDeep, 後續map會直接修改設定物件記憶體故需脫勾, 但值為函數不會脫勾

            // //check, 不能檢查size為0跳出, 否則外部會無法清空數據
            // if (size(polylineSets) === 0) {
            //     return
            // }

            //effPolylineSets
            let effPolylineSets = map(polylineSets, (v) => {
                return omit(v, 'visible')
            })

            //check
            if (isEqual(vo.effPolylineSetsTemp, effPolylineSets)) {
                return
            }
            vo.effPolylineSetsTemp = effPolylineSets
            // console.log('call changePolylineSets')

            //funSetsClick
            let funSetsClick = get(vo, 'opt.polylineSetsClick', null)

            vo.polylineSets = map(polylineSets, (polylineSet, kpolylineSet) => {

                //idPolylineSet
                let idPolylineSet = `polylineSet-${kpolylineSet}`

                //order
                let order = get(polylineSet, 'order', null)

                //lineColor
                let lineColor = get(polylineSet, 'lineColor', null)
                if (!isestr(lineColor)) {
                    lineColor = 'rgba(0,150,255,1)'
                }

                //lineWidth
                let lineWidth = get(polylineSet, 'lineWidth', null)
                if (!isNumber(lineWidth)) {
                    lineWidth = 3
                }

                //style
                let style = {
                    color: lineColor,
                    weight: lineWidth,
                }

                //lineColorHover
                let lineColorHover = get(polylineSet, 'lineColorHover', null)
                if (!isestr(lineColorHover)) {
                    lineColorHover = lineColor
                }

                //lineWidthHover
                let lineWidthHover = get(polylineSet, 'lineWidthHover', null)
                if (!isNumber(lineWidthHover)) {
                    lineWidthHover = lineWidth
                }

                //styleHover
                let styleHover = {
                    color: lineColorHover,
                    weight: lineWidthHover,
                }

                //title
                if (!isestr(get(polylineSet, 'title', null))) {
                    polylineSet.title = ''
                }

                //msg
                if (!isestr(get(polylineSet, 'msg', null))) {
                    polylineSet.msg = ''
                }

                //order
                if (!isNumber(get(polylineSet, 'order', null))) {
                    polylineSet.order = null
                }

                //visible
                if (!isbol(get(polylineSet, 'visible', null))) {
                    polylineSet.visible = false
                }

                return {
                    id: idPolylineSet,
                    ...polylineSet,
                    order,
                    style, //需給予, 才能通過v-bind給予初始樣式
                    styleHover,
                    // mouseenter: (ev) => {
                    //     // console.log('mouseenter', ev)
                    //     let layer = ev.target
                    //     layer.setStyle(styleHover)
                    // },
                    // mouseleave: (ev) => {
                    //     // console.log('mouseleave', ev)
                    //     let layer = ev.target
                    //     layer.setStyle(style)
                    // },
                    funSetsClick,
                }
            })

            //changeItemsDebounce
            vo.changeItemsDebounce('changePolylineSets')

        },

        changePolygonSetsDebounce: function(v) {
            // console.log('methods changePolygonSetsDebounce', v)

            let vo = this

            vo.dbcChangePolygonSets(() => {
                vo.changePolygonSets()
            })

        },

        changePolygonSets: function() {
            // console.log('methods changePolygonSets')

            let vo = this

            //polygonSets
            let polygonSets = get(vo, 'opt.polygonSets', null)
            if (!isarr(polygonSets)) {
                polygonSets = []
            }
            polygonSets = cloneDeep(polygonSets) //cloneDeep, 後續map會直接修改設定物件記憶體故需脫勾, 但值為函數不會脫勾

            // //check, 不能檢查size為0跳出, 否則外部會無法清空數據
            // if (size(polygonSets) === 0) {
            //     return
            // }

            //effPolygonSets
            let effPolygonSets = map(polygonSets, (v) => {
                return omit(v, 'visible')
            })

            //check
            if (isEqual(vo.effPolygonSetsTemp, effPolygonSets)) {
                return
            }
            vo.effPolygonSetsTemp = effPolygonSets
            // console.log('call changePolygonSets')

            //funSetsClick
            let funSetsClick = get(vo, 'opt.polygonSetsClick', null)

            vo.polygonSets = map(polygonSets, (polygonSet, kpolygonSet) => {

                //idPolygonSet
                let idPolygonSet = `polygonSet-${kpolygonSet}`

                //order
                let order = get(polygonSet, 'order', null)

                //lineColor
                let lineColor = get(polygonSet, 'lineColor', null)
                if (!isestr(lineColor)) {
                    lineColor = 'rgba(0,150,255,1)'
                }

                //lineWidth
                let lineWidth = get(polygonSet, 'lineWidth', null)
                if (!isNumber(lineWidth)) {
                    lineWidth = 3
                }

                //fillColor
                let fillColor = get(polygonSet, 'fillColor', null)
                if (!isestr(fillColor)) {
                    fillColor = 'rgba(0,150,255,0.25)'
                }

                //style
                let style = {
                    fillColor,
                    fillOpacity: 1, //vue leaflet預設為0.2得還原
                    color: lineColor,
                    weight: lineWidth,
                }

                //lineColorHover
                let lineColorHover = get(polygonSet, 'lineColorHover', null)
                if (!isestr(lineColorHover)) {
                    lineColorHover = lineColor
                }

                //lineWidthHover
                let lineWidthHover = get(polygonSet, 'lineWidthHover', null)
                if (!isNumber(lineWidthHover)) {
                    lineWidthHover = lineWidth
                }

                //fillColorHover
                let fillColorHover = get(polygonSet, 'fillColorHover', null)
                if (!isestr(fillColorHover)) {
                    fillColorHover = fillColor
                }

                //styleHover
                let styleHover = {
                    fillColor: fillColorHover,
                    fillOpacity: 1, //vue leaflet預設為0.2得還原
                    color: lineColorHover,
                    weight: lineWidthHover,
                }

                //title
                if (!isestr(get(polygonSet, 'title', null))) {
                    polygonSet.title = ''
                }

                //msg
                if (!isestr(get(polygonSet, 'msg', null))) {
                    polygonSet.msg = ''
                }

                //order
                if (!isNumber(get(polygonSet, 'order', null))) {
                    polygonSet.order = null
                }

                //visible
                if (!isbol(get(polygonSet, 'visible', null))) {
                    polygonSet.visible = false
                }

                return {
                    id: idPolygonSet,
                    ...polygonSet,
                    order,
                    style, //需給予, 才能通過v-bind給予初始樣式
                    styleHover,
                    // mouseenter: (ev) => {
                    //     // console.log('mouseenter', ev)
                    //     let layer = ev.target
                    //     layer.setStyle(styleHover)
                    // },
                    // mouseleave: (ev) => {
                    //     // console.log('mouseleave', ev)
                    //     let layer = ev.target
                    //     layer.setStyle(style)
                    // },
                    funSetsClick,
                }
            })

            //changeItemsDebounce
            vo.changeItemsDebounce('changePolygonSets')

        },

        changeGeojsonSetsDebounce: function(v) {
            // console.log('methods changeGeojsonSetsDebounce', v)

            let vo = this

            vo.dbcChangeGeojsonSets(() => {
                vo.changeGeojsonSets()
            })

        },

        changeGeojsonSets: function() {
            // console.log('methods changeGeojsonSets')

            let vo = this

            //geojsonSets
            let geojsonSets = get(vo, 'opt.geojsonSets', null)
            if (!isarr(geojsonSets)) {
                geojsonSets = []
            }
            geojsonSets = cloneDeep(geojsonSets) //cloneDeep, 後續map會直接修改設定物件記憶體故需脫勾, 但值為函數不會脫勾

            // //check, 不能檢查size為0跳出, 否則外部會無法清空數據
            // if (size(geojsonSets) === 0) {
            //     return
            // }

            //effGeojsonSets
            let effGeojsonSets = map(geojsonSets, (v) => {
                return omit(v, 'visible')
            })

            //check
            if (isEqual(vo.effGeojsonSetsTemp, effGeojsonSets)) {
                return
            }
            vo.effGeojsonSetsTemp = effGeojsonSets
            // console.log('call changeGeojsonSets')

            //funSetsClick
            let funSetsClick = get(vo, 'opt.geojsonSetsClick', null)

            vo.geojsonSets = map(geojsonSets, (geojsonSet, kgeojsonSet) => {

                //idGeojsonSet
                let idGeojsonSet = `geojsonSet-${kgeojsonSet}`

                //geojson
                let geojson = get(geojsonSet, 'geojson', null)

                //check
                if (!iseobj(geojson)) {
                    throw new Error(`geojsonSet.geojson is not an effective object`)
                }

                //features
                let features = get(geojson, 'features', [])

                //latLngs
                let latLngs = []
                each(features, (feature) => {
                    if (get(feature, 'geometry.type', '') === 'MultiPolygon') {
                        let coordinates = get(feature, 'geometry.coordinates', [])
                        latLngs = [...latLngs, ...coordinates]
                    }
                })

                //order
                let order = get(geojsonSet, 'order', null)

                //lineColor
                let lineColor = get(geojsonSet, 'lineColor', null)
                if (!isestr(lineColor)) {
                    lineColor = 'rgba(0,150,255,1)'
                }

                //lineWidth
                let lineWidth = get(geojsonSet, 'lineWidth', null)
                if (!isNumber(lineWidth)) {
                    lineWidth = 3
                }

                //fillColor
                let fillColor = get(geojsonSet, 'fillColor', null)
                if (!isestr(fillColor)) {
                    fillColor = 'rgba(0,150,255,0.25)'
                }

                //style
                let style = {
                    fillColor,
                    fillOpacity: 1, //vue leaflet預設為0.2得還原
                    color: lineColor,
                    weight: lineWidth,
                }

                // //lineColorHover
                // let lineColorHover = get(geojsonSet, 'lineColorHover', null)
                // if (!isestr(lineColorHover)) {
                //     // lineColorHover = 'rgba(50,175,255,1)'
                //     lineColorHover = lineColor
                // }

                // //lineWidthHover
                // let lineWidthHover = get(geojsonSet, 'lineWidthHover', null)
                // if (!isNumber(lineWidthHover)) {
                //     lineWidthHover = lineWidth
                // }

                // //fillColorHover
                // let fillColorHover = get(geojsonSet, 'fillColorHover', null)
                // if (!isestr(fillColorHover)) {
                //     fillColorHover = fillColor
                // }

                //styleHover, 因geojson的滑鼠進入出偵測不夠平滑, 會過多觸發導致閃爍, 故geojson預設滑鼠進入與離開樣式皆相同
                let styleHover = {
                    ...style,
                    // fillColor: fillColorHover,
                    // fillOpacity: 1, //vue leaflet預設為0.2得還原
                    // color: lineColorHover,
                    // weight: lineWidthHover,
                    fillColor: 'rgba(250,150,255,0.25)', //bbb
                    color: 'rgba(250,150,255,1)',
                }

                //title
                if (!isestr(get(geojsonSet, 'title', null))) {
                    geojsonSet.title = ''
                }

                //msg
                if (!isestr(get(geojsonSet, 'msg', null))) {
                    geojsonSet.msg = ''
                }

                //order
                if (!isNumber(get(geojsonSet, 'order', null))) {
                    geojsonSet.order = null
                }

                //visible
                if (!isbol(get(geojsonSet, 'visible', null))) {
                    geojsonSet.visible = false
                }

                // feature.properties.style

                return {
                    id: idGeojsonSet,
                    ...geojsonSet,
                    order,
                    latLngs,
                    style, //需給予, 才能通過v-bind給予初始樣式
                    styleHover,
                    // mouseenter: (ev) => {
                    //     // console.log('mouseenter', ev)
                    //     bMouseEnter = true
                    //     if (!isestr(keyStyle)) { //非指定geojson內style
                    //         let layer = ev.target
                    //         layer.setStyle(styleHover)
                    //         // console.log('mouseenter', ev, cloneDeep(styleHover))
                    //     }
                    // },
                    // mouseleave: (ev) => {
                    //     // console.log('mouseleave', ev)
                    //     bMouseEnter = false
                    //     if (!isestr(keyStyle)) { //非指定geojson內style
                    //         let layer = ev.target
                    //         layer.setStyle(style)
                    //         // console.log('mouseleave', ev, cloneDeep(style))
                    //     }
                    // },
                    funSetsClick,
                }
            })

            //changeItemsDebounce
            vo.changeItemsDebounce('changeGeojsonSets')

        },

        changeContourSetsDebounce: function(v) {
            // console.log('methods changeContourSetsDebounce', v)

            let vo = this

            vo.dbcChangeContourSets(() => {
                vo.changeContourSets()
            })

        },

        changeContourSets: function() {
            // console.log('methods changeContourSets')

            let vo = this

            //contourSets
            let contourSets = get(vo, 'opt.contourSets', null)
            if (!isarr(contourSets)) {
                contourSets = []
            }
            contourSets = cloneDeep(contourSets) //cloneDeep, 後續map會直接修改設定物件記憶體故需脫勾, 但值為函數不會脫勾

            // //check, 不能檢查size為0跳出, 否則外部會無法清空數據
            // if (size(contourSets) === 0) {
            //     return
            // }

            //effContourSets
            let effContourSets = map(contourSets, (v) => {
                return omit(v, 'visible')
            })

            //check
            if (isEqual(vo.effContourSetsTemp, effContourSets)) {
                return
            }
            vo.effContourSetsTemp = effContourSets
            // console.log('call changeContourSets')

            //funSetsClick
            let funSetsClick = get(vo, 'opt.contourSetsClick', null)

            vo.contourSets = map(contourSets, (contourSet, kcontourSet) => {
                //contour會使用legend故不提供popup與tooltip

                //idContourSet
                let idContourSet = `contourSet-${kcontourSet}`

                //order
                let order = get(contourSet, 'order', null)

                //lineColor
                let lineColor = get(contourSet, 'lineColor', null)
                if (!isestr(lineColor)) {
                    lineColor = '' //由contour內建自己計算
                }

                //lineWidth
                let lineWidth = get(contourSet, 'lineWidth', null)
                if (!isNumber(lineWidth)) {
                    lineWidth = 1
                }

                //fillOpacity
                let fillOpacity = get(contourSet, 'fillOpacity', null)
                if (!isNumber(fillOpacity)) {
                    fillOpacity = 0.2
                }

                // //fillColor
                // let fillColor = get(contourSet, 'fillColor', null)
                // if (!isestr(fillColor)) {
                //     fillColor = 'rgba(0,150,255,0.25)'
                // }

                // //style
                // let style = {
                //     fillColor,
                //     fillOpacity: 1, //vue leaflet預設為0.2得還原
                //     color: lineColor,
                //     weight: lineWidth,
                // }

                //lineColorHover
                let lineColorHover = get(contourSet, 'lineColorHover', null)
                if (!isestr(lineColorHover)) {
                    lineColorHover = lineColor
                }

                //lineWidthHover
                let lineWidthHover = get(contourSet, 'lineWidthHover', null)
                if (!isNumber(lineWidthHover)) {
                    lineWidthHover = lineWidth
                }

                //fillOpacityHover
                let fillOpacityHover = get(contourSet, 'fillOpacityHover', null)
                if (!isNumber(fillOpacityHover)) {
                    fillOpacityHover = 0.5
                }

                // //fillColorHover
                // let fillColorHover = get(contourSet, 'fillColorHover', null)
                // if (!isestr(fillColorHover)) {
                //     fillColorHover = fillColor
                // }

                // //styleHover
                // let styleHover = {
                //     fillColor: fillColorHover,
                //     fillOpacity: 1, //vue leaflet預設為0.2得還原
                //     color: lineColorHover,
                //     weight: lineWidthHover,
                // }

                //legendNumDig
                let legendNumDig = get(contourSet, 'legendNumDig', null)
                if (!isNumber(legendNumDig)) {
                    legendNumDig = null
                }

                //legendTextFormater
                let legendTextFormater = get(contourSet, 'legendTextFormater', null)
                if (!isfun(legendTextFormater)) {
                    legendTextFormater = null
                }

                //legendTextExtra
                let legendTextExtra = get(contourSet, 'legendTextExtra', null)
                if (!isfun(legendTextExtra)) {
                    legendTextExtra = null
                }

                //title
                if (!isestr(get(contourSet, 'title', null))) {
                    contourSet.title = ''
                }

                //msg
                if (!isestr(get(contourSet, 'msg', null))) {
                    contourSet.msg = ''
                }

                //order
                if (!isNumber(get(contourSet, 'order', null))) {
                    contourSet.order = null
                }

                //visible
                if (!isbol(get(contourSet, 'visible', null))) {
                    contourSet.visible = false
                }

                return {
                    id: idContourSet,
                    ...contourSet,
                    order,
                    lineColor,
                    // lineWidth,
                    // fillOpacity,
                    // lineColorHover,
                    // lineWidthHover,
                    // fillOpacityHover,
                    legendNumDig,
                    legendTextFormater,
                    legendTextExtra,
                    legend: [],
                    // style,
                    // styleHover,
                    // mouseenter: (ev) => {
                    //     // console.log('mouseenter', ev)
                    //     let layer = ev.target
                    //     layer.setStyle(styleHover)
                    // },
                    // mouseleave: (ev) => {
                    //     // console.log('mouseleave', ev)
                    //     let layer = ev.target
                    //     layer.setStyle(style)
                    // },
                    funSetsClick,
                }
            })

            //changeItemsDebounce
            vo.changeItemsDebounce('changeContourSets')

        },

        changeItemsDebounce: function(from) {
            // console.log('methods changeItemsDebounce', from)

            let vo = this

            //dbcChangeItems
            vo.dbcChangeItems(() => {

                //changeItems
                vo.changeItems(from)

            })

        },

        changeItems: function(from) {
            // console.log('methods changeItems', 'from=' + from)

            let vo = this

            //items
            let items = []

            //add
            function add(name, msg, order, visible, updatePath) {
                items.push({
                    name,
                    msg,
                    order,
                    visible,
                    updatePath,
                })
            }
            each(vo.imageSets, (v, k) => {
                add(v.title, v.msg, v.order, v.visible, `imageSets.${k}.visible`)
            })
            each(vo.pointSets, (v, k) => {
                add(v.title, v.msg, v.order, v.visible, `pointSets.${k}.visible`)
            })
            each(vo.polylineSets, (v, k) => {
                add(v.title, v.msg, v.order, v.visible, `polylineSets.${k}.visible`)
            })
            each(vo.polygonSets, (v, k) => {
                add(v.title, v.msg, v.order, v.visible, `polygonSets.${k}.visible`)
            })
            each(vo.geojsonSets, (v, k) => {
                add(v.title, v.msg, v.order, v.visible, `geojsonSets.${k}.visible`)
            })
            each(vo.contourSets, (v, k) => {
                add(v.title, v.msg, v.order, v.visible, `contourSets.${k}.visible`)
            })

            //sortBy
            let itemsOrder = filter(items, (v) => {
                return isNumber(v.order)
            })
            let itemsOther = filter(items, (v) => {
                return !isNumber(v.order)
            })
            itemsOrder = sortBy(itemsOrder, 'order')
            items = [...itemsOrder, ...itemsOther]

            //cloneDeep
            items = cloneDeep(items)

            //save
            vo.items = items

        },

        updateItems: function() {
            // console.log('methods updateItems')

            let vo = this

            //update visible
            each(vo.items, (v) => {

                //set, 將items的變更用set配path, 對原本各數據集的visible做同步
                set(vo, v.updatePath, v.visible)

                //對外部opt各數據集的visible做同步, 否則外部變更數據時會傳入原本的visible造成操作問題
                set(vo.opt, v.updatePath, v.visible)

            })

        },

        modifyItemsVisible: function(fun) {
            // console.log('methods modifyItemsVisible')

            let vo = this

            //check
            if (!isfun(fun)) {
                throw new Error('fun is not a function')
            }

            //process
            each(vo.items, (v, k) => {

                //fun
                let b = fun(v, k)

                //set, 將items的變更用set配path, 對原本各數據集的visible做同步
                set(vo, v.updatePath, b)

                //對外部opt各數據集的visible做同步, 否則外部變更數據時會傳入原本的visible造成操作問題
                set(vo.opt, v.updatePath, b)

            })

        },

        getMapObject: function() {
            // console.log('methods getMapObject')

            let vo = this

            //mapObject
            let mapObject = get(vo, '$refs.lmap.mapObject')

            return mapObject
        },

        panTo: function(latLng, opt = {}) { //供外部用組件ref調用
            // console.log('methods panTo', latLng, opt)

            let vo = this

            //check
            if (!isearr(latLng)) {
                console.log('latLng is not an effective array', latLng)
                throw new Error('latLng is not an effective array')
            }

            //mapObject
            let mapObject = vo.getMapObject()

            //check, 可事先檢測與跳出
            if (!iseobj(mapObject)) {
                return
            }

            //ratioHorizontal, 左側起算之水平縮小比率
            let ratioHorizontal = get(opt, 'ratioHorizontal')
            if (isnum(ratioHorizontal)) {
                ratioHorizontal = cdbl(ratioHorizontal)
            }

            //ratioVertical, 上方起算之垂直縮小比率
            let ratioVertical = get(opt, 'ratioVertical')
            if (isnum(ratioVertical)) {
                ratioVertical = cdbl(ratioVertical)
            }

            //funLatLng
            let funLatLng = get(opt, 'funLatLng')

            //getBounds
            let bds = mapObject.getBounds()
            // console.log('getBounds', bds)

            //lngRange, latRange
            let lngRange = get(bds, '_northEast.lng') - get(bds, '_southWest.lng')
            let latRange = get(bds, '_northEast.lat') - get(bds, '_southWest.lat')
            // console.log('lngRange', lngRange, 'latRange', latRange)

            //反算以外部latLng為中心之角點座標
            let lngMin = latLng[1] - lngRange / 2
            let lngMax = latLng[1] + lngRange / 2
            let latMin = latLng[0] - latRange / 2
            let latMax = latLng[0] + latRange / 2
            // console.log('lngMin', lngMin, 'lngMax', lngMax)

            //lngMaxNew, lngNew
            let lngMaxNew = null
            let lngNew = null
            if (isNumber(ratioHorizontal)) {
                lngMaxNew = lngMax - lngRange * ratioHorizontal
                lngNew = (lngMin + lngMaxNew) / 2
            }
            // console.log('lngMaxNew', lngMaxNew, 'lngNew', lngNew)

            //latMinNew, latNew
            let latMinNew = null
            let latNew = null
            if (isNumber(ratioVertical)) {
                latMinNew = latMin + latRange * ratioVertical
                latNew = (latMinNew + latMax) / 2
            }
            // console.log('latMinNew', latMinNew, 'latNew', latNew)

            //update latLng
            let latLngNew = cloneDeep(latLng)
            if (isNumber(ratioVertical)) {
                latLngNew[0] = latNew
            }
            if (isNumber(ratioHorizontal)) {
                latLngNew[1] = lngNew
            }
            // console.log('latLngNew', latLngNew)

            //funLatLng
            if (isfun(funLatLng)) {
                latLngNew = funLatLng(latLng, {
                    bds,
                    lngRange,
                    latRange,
                    lngMin,
                    lngMax,
                    latMin,
                    latMax,
                    ratioHorizontal,
                    ratioVertical,
                    latLngNew,
                })
            }

            //panTo
            mapObject.panTo(latLngNew)

        },

        centerTo: function(latLng) { //供外部用組件ref調用
            // console.log('methods centerTo', latLng)

            let vo = this

            //panTo
            vo.panTo(latLng)

        },

        closePopup: function() { //關閉popup已由組件自動處理, 僅供外部用組件ref調用
            // console.log('methods closePopup')

            let vo = this

            //mapObject
            let mapObject = vo.getMapObject()

            //check, 可事先檢測與跳出
            if (!iseobj(mapObject)) {
                return
            }

            //closePopup
            try {
                mapObject.closePopup()
            }
            catch (err) {
                // console.log(err)
            }

        },

        clickPoint: function(ev, point, kpoint, pointSet, kpointSet, pointSets) {
            // console.log('methods clickPoint', ev, point, kpoint, pointSet, kpointSet, pointSets)

            // let vo = this

            //obj
            let obj = point

            //msg
            let msg = { ev, point, kpoint, pointSet, kpointSet, pointSets }

            //funSetsClick
            if (isfun(get(obj, 'funSetsClick', null))) {
                obj.funSetsClick(msg)
            }

        },

        popupFeatureById: function(id) {
            // console.log('methods popupFeatureById', id)

            let vo = this

            //refObjects
            let refObjects = get(vo, `$refs[${id}]`, [])
            // console.log('$refs', vo.$refs)
            // console.log('refObjects', refObjects)

            //refObject
            let refObject = get(refObjects, 0, null)
            // console.log('refObject', refObject)

            //mapObject
            let mapObject = get(refObject, 'mapObject', null)
            // console.log('mapObject', mapObject)

            //check
            if (mapObject === null) {
                console.log('invalid mapObject')
                return
            }

            //openPopup
            try {
                mapObject.openPopup()
            }
            catch (err) {
                // console.log(err)
            }

            //latLng
            let latLng = null
            try {
                let r = mapObject._popup.getLatLng()
                latLng = [r.lat, r.lng]
            }
            catch (err) {
                // console.log(err)
            }
            // console.log('latLng', latLng)

            return latLng
        },

        popupFeature: function(type, params) {
            // console.log('methods popupFeature', type, params)

            let vo = this

            //id
            let id = get(params, `${type}.id`, '')
            // console.log('id', id)

            //popupFeatureById
            let latLng = vo.popupFeatureById(id)

            return latLng
        },

        popupPoint: function(params) { //點擊出現popup已由組件處理, 不再需要用函數呼叫, 僅供外部用組件ref調用
            // console.log('methods popupPoint', params)

            let vo = this

            //popupFeature
            let latLng = vo.popupFeature('point', params)

            return latLng
        },

        popupPolyline: function(params) { //點擊出現popup已由組件處理, 不再需要用函數呼叫, 僅供外部用組件ref調用
            // console.log('methods popupPolyline', params)

            let vo = this

            //popupFeature
            let latLng = vo.popupFeature('polylineSet', params)

            return latLng
        },

        popupPolygon: function(params) { //點擊出現popup已由組件處理, 不再需要用函數呼叫, 僅供外部用組件ref調用
            // console.log('methods popupPolygon', params)

            let vo = this

            //popupFeature
            let latLng = vo.popupFeature('polygonSet', params)

            return latLng
        },

        clickPolyline: function(ev, polylineSet, kpolylineSet, polylineSets) {
            // console.log('methods clickPolyline', ev, polylineSet, kpolylineSet, polylineSets)

            // let vo = this

            //obj
            let obj = polylineSet

            //msg
            let msg = { ev, polylineSet, kpolylineSet, polylineSets }

            //funSetsClick
            if (isfun(get(obj, 'funSetsClick', null))) {
                obj.funSetsClick(msg)
            }

        },

        clickPolygon: function(ev, polygonSet, kpolygonSet, polygonSets) {
            // console.log('methods clickPolygon', ev, polygonSet, kpolygonSet, polygonSets)

            // let vo = this

            //obj
            let obj = polygonSet

            //msg
            let msg = { ev, polygonSet, kpolygonSet, polygonSets }

            //funSetsClick
            if (isfun(get(obj, 'funSetsClick', null))) {
                obj.funSetsClick(msg)
            }

        },

        parseGeojsonData: function(ev, geojsonSet, kgeojsonSet, geojsonSets) {

            //latLng, msg
            let ll = ev.latlng
            let latLng = [ll.lat, ll.lng]

            //msg
            let msg = {
                ev,
                lat: get(latLng, 0, null),
                lng: get(latLng, 1, null),
                latLngs: geojsonSet.latLngs, //latLngs由features的mutlipolygon提取
                geojsonSet,
                kgeojsonSet,
                geojsonSets,
            }

            return { latLng, msg }
        },

        clickGeojson: function(ev, geojsonSet, kgeojsonSet, geojsonSets) {
            // console.log('methods clickGeojson', ev, geojsonSet, kgeojsonSet, geojsonSets)

            let vo = this

            //obj
            let obj = geojsonSet

            //parseGeojsonData
            let { msg } = vo.parseGeojsonData(ev, geojsonSet, kgeojsonSet, geojsonSets)

            //funSetsClick
            if (isfun(obj.funSetsClick)) {
                obj.funSetsClick(msg)
            }

        },

        parseContourData: function(ev, polygonSet, kpolygonSet, contourSet, kcontourSet, contourSets) {

            //latLng, msg
            let ll = ev.latlng
            let latLng = [ll.lat, ll.lng]

            //msg
            let msg = {
                ev,
                lat: get(latLng, 0, null),
                lng: get(latLng, 1, null),
                latLngs: polygonSet.latLngs,
                polygonSet,
                kpolygonSet,
                contourSet,
                kcontourSet,
                contourSets,
            }

            return { latLng, msg }
        },

        clickContour: function({ ev, polygonSet, kpolygonSet }, contourSet, kcontourSet, contourSets) {
            // console.log('methods clickContour', ev, polygonSet, kpolygonSet, contourSet, kcontourSet, contourSets)

            let vo = this

            //obj
            let obj = contourSet

            //parseContourData
            let { msg } = vo.parseContourData(ev, polygonSet, kpolygonSet, contourSet, kcontourSet, contourSets)

            //funSetsClick
            if (isfun(obj.funSetsClick)) {
                obj.funSetsClick(msg)
            }

        },

        updateLatLng: function(e) {
            //console.log('methods updateLatLng', e)

            let vo = this

            //showLoc
            vo.showLoc = {
                lat: dig(e.latlng.lat, 7),
                lng: dig(e.latlng.lng, 7),
            }

        },

        contourRefresh: function(data, contourSet, kcontourSet) {
            // console.log('methods contourRefresh', data, contourSet, kcontourSet)

            // let vo = this

            //legends
            let legends = map(data.polygonSets, 'range')

            function getText(k, range) {
                // let t = range.text
                let low = range.low
                let up = range.up
                let delimiter = '-'
                if (isNumber(contourSet.legendNumDig)) {
                    low = dig(range.low, contourSet.legendNumDig)
                    up = dig(range.up, contourSet.legendNumDig)
                }
                if (isfun(contourSet.legendTextFormater)) {
                    let r = contourSet.legendTextFormater({ low, up, legends, index: k })
                    low = get(r, 'low')
                    up = get(r, 'up')
                    delimiter = get(r, 'delimiter', delimiter) //使用delimiter視為預設值
                }
                return {
                    low,
                    up,
                    delimiter,
                }
            }

            //legend
            let legend = map(data.polygonSets, (v, k) => {

                //legendTextExtra
                let textExt = ''
                if (isfun(contourSet.legendTextExtra)) {
                    textExt = contourSet.legendTextExtra({
                        k,
                        n: size(data.polygonSets),
                        polygonSet: v,
                    })
                }

                //r
                let r = {
                    ...getText(k, v.range),
                    textExt,
                    color: v.color,
                    arrow: false,
                    index: k,
                }

                return r
            })

            //reverse
            legend = reverse(legend)

            //save
            contourSet.legend = legend

        },

    },
}
</script>

<style scoped>

.clsPanel {
    display:flex;
    padding:3px;
    box-shadow:0 0 15px rgba(0,0,0,0.2);
    border-radius:5px;
    font-size: 0.8rem;
    font-family:'Microsoft JhengHei','Avenir','Helvetica';
}

::v-deep .leaflet-popup-content {
    margin:0px;
}
::v-deep .leaflet-popup-content-wrapper {
    border-radius:5px;
}

::v-deep .leaflet-tooltip {
    padding:0px;
    white-space:normal;
}

::v-deep .leaflet-control-scale {
    background-color: transparent;
    padding: 0px;
    border-radius: 0px;
    border: 0px;
    border-bottom: 1px solid #fff;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
}
::v-deep .leaflet-control-scale-line {
    padding: 4px 5px 2px 5px;
    text-shadow: 1px 1px 1px #000;
    font-size: 0.75rem;
    color: #fff;
    background-color: rgba(150,150,150,0.5);
    border: 0px;
    border-bottom: 2px solid #666;
    border-left: 2px solid #666;
    border-right: 2px solid #666;
}

::v-deep .leaflet-control-scale.leaflet-control {
    position: relative;
}

</style>
