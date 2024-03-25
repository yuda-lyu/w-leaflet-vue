<template>
    <div
        style="display:inline-block;"
        v-domresize
        @domresize="resize"
    >

        <!-- 得要關閉zoomControl, 改由l-control-zoom處理才能改位置 -->
        <l-map
            ref="lmap"
            :zoom="zoom"
            :center="center"
            :options="{
                preferCanvas: true,
                zoomControl: false,
            }"
            @update:zoom="updateZoom"
            @update:center="updateCenter"
            @mousemove="updateLatLng"
        >

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
                    :style="{background:panelBackgroundColor}"
                >
                    <Radios
                        :items.sync="panelBaseMaps.baseMaps"
                        :keyValue="'visible'"
                        :keyTitle="'name'"
                    ></Radios>
                </div>
            </l-control>

            <!-- 控制數據圖層 -->
            <l-control
                :position="panelItems.position"
                v-if="panelItems.show && items.length>0"
            >
                <div class="clsPanel" :style="{background:panelBackgroundColor}">
                    <div :style="{overflowY:'auto',...panelItems.style}">
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
            <l-control :position="panelLabels.position" v-if="panelLabels.show">
                <div class="clsPanel" :style="{background:panelBackgroundColor}">
                    <div :style="{overflowY:'auto',...panelLabels.style}">

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
            <l-control :position="panelLegends.position" v-if="panelLegends.show && countVisible(contourSets)>0">
                <div class="clsPanel" :style="{background:panelBackgroundColor}">
                    <div :style="{display:'flex',alignItems:'flex-start',overflowX:'auto',overflowY:'auto',...panelLegends.style}">

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
                                                :key="'klegend-'+klegend"
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

            <!-- popup顯示區 -->
            <l-layer-group ref="refPopup"></l-layer-group>

            <!-- tooltip顯示區 -->
            <l-layer-group style="white-space:normal;" ref="refTooltip"></l-layer-group>

            <!-- 底圖圖層 -->
            <l-tile-layer
                layer-type="base"
                :key="'baseMap:'+kbaseMap"
                :name="baseMap.name"
                :visible.sync="baseMap.visible"
                :url="baseMap.url"
                :subdomains="baseMap.subdomains"
                :attribution="baseMap.attribution"
                v-for="(baseMap,kbaseMap) in panelBaseMaps.baseMaps"
            ></l-tile-layer>

            <!-- 點陣圖圖層 -->
            <l-layer-group
                layer-type="overlay"
                :key="'imageSet:'+kimageSet"
                :name="imageSet.title"
                :visible.sync="imageSet.visible"
                v-for="(imageSet,kimageSet) in imageSets"
            >
                <l-image-overlay
                    :url="imageSet.image.url"
                    :bounds="imageSet.bounds"
                    _mouseenter="(ev)=>{imageSet.mouseenter(ev);tooltipImage(ev,imageSet,kimageSet,imageSets)}"
                    _mouseleave="(ev)=>{imageSet.mouseleave(ev);closeTooltip()}"
                    _click="(ev)=>{clickImage(ev,imageSet,kimageSet,imageSets)}"
                ></l-image-overlay>
            </l-layer-group>

            <!-- 多邊形圖層 -->
            <l-layer-group
                layer-type="overlay"
                :key="'polygonSet:'+kpolygonSet"
                :name="polygonSet.title"
                :visible.sync="polygonSet.visible"
                v-for="(polygonSet,kpolygonSet) in polygonSets"
            >
                <l-polygon
                    :lat-lngs="polygonSet.latLngs"
                    v-bind="polygonSet.style"
                    @mouseenter="(ev)=>{polygonSet.mouseenter(ev);tooltipPolygon(ev,polygonSet,kpolygonSet,polygonSets)}"
                    @mouseleave="(ev)=>{polygonSet.mouseleave(ev);closeTooltip()}"
                    @click="(ev)=>{clickPolygon(ev,polygonSet,kpolygonSet,polygonSets)}"
                ></l-polygon>
            </l-layer-group>

            <!-- geojson圖層 -->
            <l-layer-group
                layer-type="overlay"
                :key="'geojsonSet:'+kgeojsonSet"
                :name="geojsonSet.title"
                :visible.sync="geojsonSet.visible"
                v-for="(geojsonSet,kgeojsonSet) in geojsonSets"
            >
                <l-geo-json
                    :geojson="geojsonSet.geojson"
                    v-bind="geojsonSet.style"
                    :optionsStyle="(feature)=>{ return getGeojsonStyle(feature,geojsonSet)}"
                    @mouseenter="(ev)=>{geojsonSet.mouseenter(ev);tooltipGeojson(ev,geojsonSet,kgeojsonSet,geojsonSets)}"
                    @mouseleave="(ev)=>{geojsonSet.mouseleave(ev);closeTooltip()}"
                    @click="(ev)=>{clickGeojson(ev,geojsonSet,kgeojsonSet,geojsonSets)}"
                ></l-geo-json>
            </l-layer-group>

            <!-- 等值線圖層 -->
            <l-layer-group
                layer-type="overlay"
                :key="'contourSet:'+kcontourSet"
                :name="contourSet.title"
                :visible.sync="contourSet.visible"
                v-for="(contourSet,kcontourSet) in contourSets"
            >
                <LContour
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
                    @mouseenter="(v)=>{contourMouseenter(v,contourSet,kcontourSet,contourSets);tooltipContour(v,contourSet,kcontourSet,contourSets)}"
                    @mouseleave="(v)=>{contourMouseleave(v,contourSet,kcontourSet,contourSets);closeTooltip()}"
                    @click="(v)=>{clickContour(v,contourSet,kcontourSet,contourSets)}"
                ></LContour>
            </l-layer-group>

            <!-- 點圖層 -->
            <l-layer-group
                layer-type="overlay"
                :key="'pointSet:'+kpointSet"
                :name="pointSet.title"
                :visible.sync="pointSet.visible"
                v-for="(pointSet,kpointSet) in pointSets"
            >

                <template
                    v-for="(point,kpoint) in pointSet.points"
                >

                    <l-marker
                        :key="'point:'+kpoint"
                        :lat-lng="point.latLng"
                        :icon="point.icon"
                        @click="(ev)=>{clickPoint(ev,point,kpoint,pointSet,kpointSet,pointSets)}"
                        @mouseenter="(ev)=>{tooltipPoint(ev,point,kpoint,pointSet,kpointSet,pointSets)}"
                        @mouseleave="closeTooltip"
                        v-if="point.type==='icon'"
                    ></l-marker>

                    <l-circle-marker
                        :key="'point:'+kpoint"
                        :lat-lng="point.latLng"
                        v-bind="point.style"
                        @click="(ev)=>{clickPoint(ev,point,kpoint,pointSet,kpointSet,pointSets)}"
                        @mouseenter="(ev)=>{tooltipPoint(ev,point,kpoint,pointSet,kpointSet,pointSets)}"
                        @mouseleave="closeTooltip"
                        v-if="point.type==='circle'"
                    ></l-circle-marker>

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
import getCentroidMultiPolygon from 'w-gis/src/getCentroidMultiPolygon.mjs'
import domResize from 'w-component-vue/src/js/domResize.mjs'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { LMap, LTileLayer, LControl, LControlZoom, LLayerGroup, LMarker, LCircleMarker, LPolygon, LGeoJson, LImageOverlay } from 'vue2-leaflet'
import LContour from './LContour.vue'
import Radios from './Radios.vue'
import Checkboxs from './Checkboxs.vue'


function getDefBaseMaps() {
    //用函數產生數據, 避免跨組件污染
    let defBaseMaps = [
        {
            name: 'Mapbox',
            //api.mapbox.com/v4/mapbox.satellite
            //api.mapbox.com/v4/mapbox.mapbox-streets-v8
            //api.mapbox.com/v4/mapbox.terrain-rgb
            //api.mapbox.com/v4/mapbox.mapbox-traffic-v1
            url: '//api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic2VtaXNwaGVyZSIsImEiOiJja2s1anBrZzMwN3NkMndsOGt6MHo5ajI5In0._vUKnQ57n7UcWsWgOPIEgQ',
            visible: true,
        },
        {
            name: 'OpenStreetMap',
            // url: '//{s}.tile.osm.org/{z}/{x}/{y}.png', //同樣位址
            url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            visible: false,
        },
        {
            name: 'OpenTopoMap',
            url: '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            visible: false,
        },

        //使用google.cn圖資
        {
            name: 'GoogleStreets',
            url: '//www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}',
            visible: false,
        },
        {
            name: 'GoogleSatellite',
            url: '//www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
            visible: false,
        },
        {
            name: 'GoogleHybrid',
            url: '//www.google.cn/maps/vt?lyrs=s,h@189&gl=cn&x={x}&y={y}&z={z}',
            visible: false,
        },

        //google要申請tokne才能用
        // {
        //     name: 'googleStreets',
        //     url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        //     visible: false,
        // },
        // {
        //     name: 'googleHybrid',
        //     url: 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
        //     visible: false,
        // },
        // {
        //     name: 'googleSat',
        //     url: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        //     visible: false,
        // },
        // {
        //     name: 'googleTerrain',
        //     url: 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
        //     visible: false,
        // },

        //TGOS要申請token才能用
        // {
        //     name: 'TGOS福衛二號影像',
        //     url: 'http://gis.sinica.edu.tw/tgos/file-exists.php?img=F2IMAGE_W-png-{z}-{x}-{y}',
        //     visible: false,
        // },
        // {
        //     name: 'TGOS福衛二號混合圖',
        //     url: 'http://gis.sinica.edu.tw/tgos/file-exists.php?img=ROADMAP_W-png-{z}-{x}-{y}',
        //     visible: false,
        // },
        // {
        //     name: 'TGOS電子地圖',
        //     url: 'http://gis.sinica.edu.tw/tgos/file-exists.php?img=TGOSMAP_W-png-{z}-{x}-{y}',
        //     visible: false,
        // },
        // {
        //     name: 'TGOS地形暈渲圖',
        //     url: 'http://gis.sinica.edu.tw/tgos/file-exists.php?img=HILLSHADE_W-png-{z}-{x}-{y}',
        //     visible: false,
        // },
        // {
        //     name: 'TGOS地形暈渲混合圖',
        //     url: 'http://gis.sinica.edu.tw/tgos/file-exists.php?img=HILLSHADEMIX_W-png-{z}-{x}-{y}',
        //     visible: false,
        // },

        // 山崩雲API服務供應平台
        // https://landslide.geologycloud.tw/map

        // 地質資料整合查詢平台
        // https://geomap.gsmma.gov.tw/gwh/gsb97-1/sys8a/t3/index1.cfm

        // {
        //     name: '五萬分之一地質圖',
        //     url: 'https://landslide.geologycloud.tw/jlwmts/jetlink/gm50000/GoogleMapsCompatible/{z}/{x}/{y}',
        //     visible: false,
        // },
        // {
        //     name: '數值地形多向陰影圖',
        //     url: 'https://landslide.geologycloud.tw/jlwmts/jetlink/Shadw20/GoogleMapsCompatible/{z}/{x}/{y}',
        //     visible: false,
        // },
        // {
        //     name: '岩體強度分級',
        //     url: 'https://landslide.geologycloud.tw/jlwmts/jetlink/EVGM_a1/GoogleMapsCompatible/{z}/{x}/{y}',
        //     visible: false,
        // },
        // {
        //     name: '岩性組合分佈圖',
        //     url: 'https://landslide.geologycloud.tw/jlwmts/jetlink/EVGM_all/GoogleMapsCompatible/{z}/{x}/{y}',
        //     visible: false,
        // },

        // {
        //     name: '山崩與地滑地質敏感區',
        //     url: 'https://landslide.geologycloud.tw/jlwmts/jetlink/SensitiveArea/GoogleMapsCompatible/{z}/{x}/{y}',
        //     visible: false,
        // },
        // {
        //     name: '落石地質災害潛勢圖',
        //     url: 'https://landslide.geologycloud.tw/jlwmts/jetlink/EVGM_G01/GoogleMapsCompatible/{z}/{x}/{y}',
        //     visible: false,
        // },
        // {
        //     name: '岩屑崩滑地質災害潛勢圖',
        //     url: 'https://landslide.geologycloud.tw/jlwmts/jetlink/EVGM_G02/GoogleMapsCompatible/{z}/{x}/{y}',
        //     visible: false,
        // },
        // {
        //     name: '岩體滑動地質災害潛勢圖',
        //     url: 'https://landslide.geologycloud.tw/jlwmts/jetlink/EVGM_G04/GoogleMapsCompatible/{z}/{x}/{y}',
        //     visible: false,
        // },

        // {
        //     name: '五十萬之一地體構造圖',
        //     url: 'https://geomap.gsmma.gov.tw/api/Tile/v1/getTile.cfm?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=500K_TECTONIC_MAP_1978&STYLE=default&FORMAT=image/png&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        //     visible: false,
        // },
        // {
        //     name: '五十萬之一變質相圖',
        //     url: 'https://geomap.gsmma.gov.tw/api/Tile/v1/getTile.cfm?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=500K_METAMORPHIC_FACIES_MAP_1994&STYLE=default&FORMAT=image/png&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        //     visible: false,
        // },
        // {
        //     name: '五十萬之一附近海域沉積物分佈圖',
        //     url: 'https://geomap.gsmma.gov.tw/api/Tile/v1/getTile.cfm?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=500K_OFFSHORE_SEDIMENT_MAP_1995&STYLE=default&FORMAT=image/png&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        //     visible: false,
        // },
        // {
        //     name: '五十萬之一陸上砂資源分佈與品質圖',
        //     url: 'https://geomap.gsmma.gov.tw/api/Tile/v1/getTile.cfm?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=500K_LAND_GRAVEL_MAP_1998&STYLE=default&FORMAT=image/png&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        //     visible: false,
        // },
        // {
        //     name: '五十萬之一能源礦產及地下水資源分佈圖',
        //     url: 'https://geomap.gsmma.gov.tw/api/Tile/v1/getTile.cfm?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=500K_ENERGY_GROUNDWATER_REOUSRCE_2006&STYLE=default&FORMAT=image/png&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        //     visible: false,
        // },

        // {
        //     name: '臺灣通用電子地圖',
        //     url: 'https://wmts.nlsc.gov.tw/wmts/EMAP/default/EPSG:3857/{z}/{y}/{x}',
        //     visible: false,
        // },
        // {
        //     name: '臺灣地形陰影圖',
        //     url: 'https://wmts.nlsc.gov.tw/wmts/MOI_HILLSHADE/default/EPSG:3857/{z}/{y}/{x}',
        //     visible: false,
        // },
        // {
        //     name: '臺灣通用正射影像',
        //     url: 'https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/EPSG:3857/{z}/{y}/{x}',
        //     visible: false,
        // },

        // {
        //     name: '國家級特定風景區',
        //     url: 'https://wmts.nlsc.gov.tw/wmts/Scenic/default/EPSG:3857/{z}/{y}/{x}',
        //     visible: false,
        // },
        // {
        //     name: '段籍圖',
        //     url: 'https://wmts.nlsc.gov.tw/wmts/LANDSECT/default/EPSG:3857/{z}/{y}/{x}',
        //     visible: false,
        // },

    ]
    return defBaseMaps
}


/**
 * @vue-prop {Object} opt 輸入資料設定物件
 * @vue-prop {Array} [opt.center=[23.5, 121.1]] 輸入地圖顯示中點陣列，陣列為WGS84[緯度,經度]，預設[23.5, 121.1]
 * @vue-prop {Number} [opt.zoom=7] 輸入地圖顯示層級整數，預設7
 * @vue-prop {Object} [opt.panelBackgroundColor='rgba(255,255,255,0.95)'] 輸入各顯示資訊區背景顏色字串，預設'rgba(255,255,255,0.95)'
 * @vue-prop {Boolean} [opt.panelBaseMaps.show=true] 輸入底圖選擇區是否顯示布林值，預設true
 * @vue-prop {Array} [opt.panelBaseMaps.baseMaps=詳見程式碼] 輸入底圖選擇清單陣列，各元素為底圖設定物件，需提供欄位為name(底圖名稱字串)、url(底圖連結字串)、visible(是否顯示布林值)，預設值詳見程式碼的defBaseMaps預設值
 * @vue-prop {String} [opt.panelBaseMaps.position='topleft'] 輸入底圖選擇區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'topleft'
 * @vue-prop {Boolean} [opt.panelLabels.show=true] 輸入地圖資訊區是否顯示布林值，預設true
 * @vue-prop {String} [opt.panelLabels.position='topright'] 輸入地圖資訊區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'topright'
 * @vue-prop {String} [opt.panelLabels.title=''] 輸入地圖資訊區內標題字串，預設''
 * @vue-prop {String} [opt.panelLabels.lng='Longitude'] 輸入地圖資訊區內標注經度字串，預設'Longitude'
 * @vue-prop {String} [opt.panelLabels.lat='Latitude'] 輸入地圖資訊區內標注緯度字串，預設'Latitude'
 * @vue-prop {String} [opt.panelLabels.zoom='Zoom'] 輸入地圖資訊區內標注顯示層級字串，預設'Zoom'
 * @vue-prop {Array} [opt.panelLabels.useItems=['lng','lat','zoom']] 輸入地圖資訊區內呈現項目陣列，各元素給字串，'lng'代表經度，'lat'代表緯度，'zoom'代表顯示層級，預設['lng','lat','zoom']
 * @vue-prop {Number} [opt.panelLabels.maxWidth=null] 輸入地圖資訊區最大寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelLabels.maxHeight=null] 輸入地圖資訊區最大高度數字，單位px，預設null
 * @vue-prop {Boolean} [opt.panelZoom.show=true] 輸入縮放按鈕區是否顯示布林值，預設true
 * @vue-prop {String} [opt.panelZoom.position='bottomleft'] 輸入縮放按鈕區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'bottomleft'
 * @vue-prop {Boolean} [opt.panelItems.show=true] 輸入圖層顯隱切換區是否顯示布林值，預設true
 * @vue-prop {String} [opt.panelItems.position='topleft'] 輸入圖層顯隱切換區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'topleft'
 * @vue-prop {Number} [opt.panelItems.width=null] 輸入圖層顯隱切換區寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelItems.maxWidth=null] 輸入圖層顯隱切換區最大寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelItems.maxHeight=null] 輸入圖層顯隱切換區最大高度數字，單位px，預設null
 * @vue-prop {Boolean} [opt.panelLegends.show=true] 輸入圖例區是否顯示布林值，預設true
 * @vue-prop {String} [opt.panelLegends.position='bottomright'] 輸入圖例區位置字串，可選'topleft'、'topright'、'bottomleft'、'bottomright'，預設'bottomright'
 * @vue-prop {Number} [opt.panelLegends.width=null] 輸入圖例區寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelLegends.maxWidth=null] 輸入圖例區最大寬度數字，單位px，預設null
 * @vue-prop {Number} [opt.panelLegends.maxHeight=null] 輸入圖例區最大高度數字，單位px，預設null
 * @vue-prop {Array} [opt.pointSets=[]] 輸入點集合陣列，各元素為物件，預設[]
 * @vue-prop {String} [opt.pointSets[i].title=''] 輸入第i個點集合的標題字串，預設為''
 * @vue-prop {String} [opt.pointSets[i].msg=''] 輸入第i個點集合的說明字串，預設為''
 * @vue-prop {Number} [opt.pointSets[i].order=null] 輸入第i個點集合的排序用數字，預設null
 * @vue-prop {String} [opt.pointSets[i].lineColor='rgba(255,255,255,1)'] 輸入第i個點集合的框線顏色字串，預設為'rgba(255,255,255,1)'
 * @vue-prop {Number} [opt.pointSets[i].lineWidth=1] 輸入第i個點集合的框線寬度數字，預設為1
 * @vue-prop {String} [opt.pointSets[i].fillColor='rgba(0,150,255,0.65)'] 輸入第i個點集合的填充顏色字串，預設為'rgba(0,150,255,0.65)'
 * @vue-prop {Number} [opt.pointSets[i].size=10] 輸入第i個點集合的圖標尺寸數字，預設10
 * @vue-prop {String} [opt.pointSets[i].iconSrc=詳見程式碼] 輸入第i個點集合的顯示圖標來源字串，可使用base64格式或網址，預設為google map的點圖標，值詳見程式碼
 * @vue-prop {Array} [opt.pointSets[i].iconSize=[24,40]] 輸入第i個點集合的顯示圖標尺寸陣列，使用[寬,高]，長寬單位px，預設[24,40]
 * @vue-prop {Array} [opt.pointSets[i].iconAnchor=[iconSize[0]/2,iconSize[1]]] 輸入第i個點集合的顯示圖標的實際定位位置陣列，由圖標左上角代表實際定位點起算，往左移動為+x，往上移動為+y，x與y單位px，需給予[x,y]，預設[iconSize[0]/2,iconSize[1]]
 * @vue-prop {Array} [opt.pointSets[i].popupAnchor=[0,-iconSize[1]/1.5]] 輸入第i個點集合的顯示popup或tooltip時的指向位置陣列，由實際定位點起算，往右移動為+x，往下移動為+y，x與y單位px，需給予[x,y]，預設[0,-iconSize[1]/1.5]
 * @vue-prop {Boolean} [opt.pointSets[i].visible=true] 輸入第i個點集合的是否顯示布林值，預設為true
 * @vue-prop {Array} [opt.pointSets[i].points=[]] 輸入第i個點集合的各點數據陣列，各元素為物件或為緯經度陣列，也就是[{p1},{p2},...]或是[[p1lat,p1lng],[p2lat,p2lng],...]，預設為[]
 * @vue-prop {String} [opt.pointSets[i].points[j].title=''] 輸入第i個點集合的第j個點的標題字串，預設為''
 * @vue-prop {String} [opt.pointSets[i].points[j].msg=''] 輸入第i個點集合的第j個點的說明字串，預設為''
 * @vue-prop {String} [opt.pointSets[i].points[j].lineColor='rgba(255,255,255,1)'] 輸入第i個點集合的第j個點的框線顏色字串，預設為'rgba(255,255,255,1)'
 * @vue-prop {Number} [opt.pointSets[i].points[j].lineWidth=1] 輸入第i個點集合的第j個點的框線寬度數字，預設為1
 * @vue-prop {String} [opt.pointSets[i].points[j].fillColor='rgba(0,150,255,0.65)'] 輸入第i個點集合的第j個點的填充顏色字串，預設為'rgba(0,150,255,0.65)'
 * @vue-prop {Number} [opt.pointSets[i].points[j].size=10] 輸入第i個點集合的第j個點的圖標尺寸數字，預設10
 * @vue-prop {Array} [opt.pointSets[i].points[j].latLng=[]] 輸入第i個點集合的第j個點的緯經度座標陣列，也就是給予[lat,lng]，預設[]
 * @vue-prop {String} [opt.pointSets[i].points[j].iconSrc=詳見程式碼] 輸入第i個點集合的第j個點的顯示圖標來源字串，可使用base64格式或網址，預設為google map的點圖標，值詳見程式碼
 * @vue-prop {Array} [opt.pointSets[i].points[j].iconSize=[24,40]] 輸入第i個點集合的第j個點的顯示圖標尺寸陣列，使用[寬,高]，長寬單位px，預設[24,40]
 * @vue-prop {Array} [opt.pointSets[i].points[j].iconAnchor=[iconSize[0]/2,iconSize[1]]] 輸入第i個點集合的第j個點的顯示圖標的實際定位位置陣列，由圖標左上角代表實際定位點起算，往左移動為+x，往上移動為+y，x與y單位px，需給予[x,y]，預設[iconSize[0]/2,iconSize[1]]
 * @vue-prop {Array} [opt.pointSets[i].points[j].popupAnchor=[0,-iconSize[1]/1.5]] 輸入第i個點集合的第j個點的顯示popup或tooltip時的指向位置陣列，由實際定位點起算，往右移動為+x，往下移動為+y，x與y單位px，需給予[x,y]，預設[0,-iconSize[1]/1.5]
 * @vue-prop {Function} [opt.defPointSetsClick=function(){}] 輸入全域點集合的click呼叫函數，可給予函數接收點擊事件，預設為function(){}
 * @vue-prop {Function} [opt.pointSets[i].click=function(){}] 輸入第i個點集合的click呼叫函數，預設為function(){}
 * @vue-prop {Function} [opt.pointSets[i].points[j].click=function(){}] 輸入第i個點集合的第j個點的click呼叫函數，預設為function(){}
 * @vue-prop {Function} [opt.defPointSetsPopup=function(){}] 輸入全域點集合的popup內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.pointSets[i].popup=function(){}] 輸入第i個點集合的popup內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.pointSets[i].points[j].popup=function(){}] 輸入第i個點集合的第j個點的popup內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.defPointSetsTooltip=function(){}] 輸入全域點集合的tooltip內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.pointSets[i].tooltip=function(){}] 輸入第i個點集合的tooltip內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.pointSets[i].points[j].tooltip=function(){}] 輸入第i個點集合的第j個點的tooltip內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
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
 * @vue-prop {Function} [opt.defPolygonSetsClick=function(){}] 輸入全域多邊形集合的click呼叫函數，可給予函數接收點擊事件，預設為function(){}
 * @vue-prop {Function} [opt.polygonSets[i].click=function(){}] 輸入第i個多邊形集合的click呼叫函數，預設為function(){}
 * @vue-prop {Function} [opt.defPolygonSetsPopup=function(){}] 輸入全域多邊形集合的popup內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.polygonSets[i].popup=function(){}] 輸入第i個多邊形集合的popup內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.defPolygonSetsTooltip=function(){}] 輸入全域多邊形集合的tooltip內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.polygonSets[i].tooltip=function(){}] 輸入第i個多邊形集合的tooltip內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Boolean} [opt.polygonSets[i].visible=true] 輸入第i個多邊形集合的是否顯示布林值，預設為true
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
 * @vue-prop {Function} [opt.defGeojsonSetsClick=function(){}] 輸入全域geojson集合的click呼叫函數，可給予函數接收點擊事件，預設為function(){}
 * @vue-prop {Function} [opt.geojsonSets[i].click=function(){}] 輸入第i個geojson集合的click呼叫函數，預設為function(){}
 * @vue-prop {Function} [opt.defGeojsonSetsPopup=function(){}] 輸入全域geojson集合的popup內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.geojsonSets[i].popup=function(){}] 輸入第i個geojson集合的popup內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.defGeojsonSetsTooltip=function(){}] 輸入全域geojson集合的tooltip內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.geojsonSets[i].tooltip=function(){}] 輸入第i個geojson集合的tooltip內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Boolean} [opt.geojsonSets[i].visible=true] 輸入第i個geojson集合的是否顯示布林值，預設為true
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
 * @vue-prop {Function} [opt.defContourSetsClick=function(){}] 輸入全域等值線集合的click呼叫函數，可給予函數接收點擊事件，預設為function(){}
 * @vue-prop {Function} [opt.contourSets[i].click=function(){}] 輸入第i個等值線集合的click呼叫函數，預設為function(){}
 * @vue-prop {Function} [opt.defContourSetsPopup=function(){}] 輸入全域等值線集合的popup內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.contourSets[i].popup=function(){}] 輸入第i個等值線集合的popup內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.defContourSetsTooltip=function(){}] 輸入全域等值線集合的tooltip內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Function} [opt.contourSets[i].tooltip=function(){}] 輸入第i個等值線集合的tooltip內容產生函數，可基於傳入資料回傳顯示文字或html內容，預設為function(){}
 * @vue-prop {Boolean} [opt.contourSets[i].visible=true] 輸入第i個等值線集合的是否顯示布林值，預設為true
 */
export default {
    directives: {
        domresize: domResize(),
    },
    components: {
        LMap,
        LTileLayer,
        LControl,
        LControlZoom,
        LLayerGroup,
        LMarker,
        LCircleMarker,
        LPolygon,
        LGeoJson,
        LImageOverlay,
        LContour,
        Radios,
        Checkboxs,
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
            dbcChangePolygonSets: debounce(),
            dbcChangeGeojsonSets: debounce(),
            dbcChangeContourSets: debounce(),
            dbcChangeImageSets: debounce(),
            dbcChangeItems: debounce(),
            wats: [],

            center: [],
            zoom: null,
            panelBackgroundColor: '',
            panelZoom: {},
            panelBaseMaps: {},
            panelItems: {},
            panelLabels: {},
            panelLegends: {},
            showLoc: {
                lat: '',
                lng: '',
            },

            imageSets: [],
            effImageSetsTemp: [],

            pointSets: [],
            effPointSetsTemp: [],

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

        each(['imageSets', 'defImageSetsClick', 'defImageSetsPopup', 'defImageSetsTooltip'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changeImageSetsDebounce, wo)
            vo.wats.push(wat)
        })

        each(['pointSets', 'defPointSetsClick', 'defPointSetsPopup', 'defPointSetsTooltip'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changePointSetsDebounce, wo)
            vo.wats.push(wat)
        })

        each(['polygonSets', 'defPolygonSetsClick', 'defPolygonSetsPopup', 'defPolygonSetsTooltip'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changePolygonSetsDebounce, wo)
            vo.wats.push(wat)
        })

        each(['geojsonSets', 'defGeojsonSetsClick', 'defGeojsonSetsPopup', 'defGeojsonSetsTooltip'], (v) => {
            let wat = vo.$watch(`opt.${v}`, vo.changeGeojsonSetsDebounce, wo)
            vo.wats.push(wat)
        })

        each(['contourSets', 'defContourSetsClick', 'defContourSetsPopup', 'defContourSetsTooltip'], (v) => {
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

        // renderer: function() {
        //     return L.canvas({ padding: 0, tolerance: 0 })
        // },

    },
    methods: {

        resize: function(msg) {
            // console.log('methods resize', msg)

            let vo = this

            //mapObject
            let mapObject = vo.getMapObject()
            // console.log('mapObject', mapObject)

            //invalidateSize
            if (iseobj(mapObject)) {
                mapObject.invalidateSize()
                // console.log('invalidateSize')
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

            //check
            if (!r.eff) {
                let defIconSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII='
                r.iconSrc = defIconSrc
                r.iconSize = [24, 40]
                r.iconAnchor = [r.iconSize[0] / 2, r.iconSize[1]] //圖左上角相對座標
                r.popupAnchor = [0, -r.iconSize[1] / 1.5] //google預設icon
                r.tooltipAnchor = [0, -r.iconSize[1] / 1.5] //google預設icon
            }

            //icon
            let icon = new Icon({
                iconUrl: r.iconSrc,
                iconSize: r.iconSize,
                iconAnchor: r.iconAnchor,
                popupAnchor: r.popupAnchor,
                tooltipAnchor: r.tooltipAnchor,
            })

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
            // console.log('mapObject', mapObject)

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
            }

            //panelBaseMaps
            let panelBaseMaps = get(vo, 'opt.panelBaseMaps', null)
            if (!isobj(panelBaseMaps)) {
                panelBaseMaps = {}
            }
            panelBaseMaps = {
                ...defPanelBaseMaps,
                ...panelBaseMaps,
            }
            if (size(get(panelBaseMaps, 'baseMaps', [])) === 0) {
                if (size(get(vo, 'panelBaseMaps.baseMaps', [])) === 0) {
                    panelBaseMaps.baseMaps = getDefBaseMaps() //無既有數據, 使用getDefBaseMaps產生預設地圖
                }
                else {
                    panelBaseMaps.baseMaps = cloneDeep(vo.panelBaseMaps.baseMaps) //有既有數據, 因baseMaps包含使用者已切換指定之底圖, 故得要優先使用
                }
            }
            panelBaseMaps = cloneDeep(panelBaseMaps) //一定要cloneDeep使陣列記憶體與外部拖勾, 要不然更新baseMaps時就會觸發外部opt記憶體變更而被watch到, 進而導致無限觸發事件
            // console.log('panelBaseMaps', panelBaseMaps)

            //check
            if (!isEqual(vo.panelBaseMapsTemp, panelBaseMaps)) { //判斷純外部給資料是否有變更, baseMaps會因切換底圖而有變更, 故若外部設定數據有變更才重新複寫

                //update
                vo.panelBaseMaps = panelBaseMaps

                //update panelBaseMapsTemp
                vo.panelBaseMapsTemp = cloneDeep(panelBaseMaps)

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
            vo.panelZoom = {
                ...defPanelZoom,
                ...panelZoom,
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
            panelLabels = cloneDeep(panelLabels) //一定要cloneDeep使陣列記憶體與外部拖勾, 要不然添加style就會影響外部opt記憶體變更
            panelLabels.style = {}
            if (isNumber(panelLabels.maxWidth)) {
                panelLabels.style.maxWidth = `${panelLabels.maxWidth}px`
            }
            if (isNumber(panelLabels.maxHeight)) {
                panelLabels.style.maxHeight = `${panelLabels.maxHeight}px`
            }
            vo.panelLabels = {
                ...defPanelLabels,
                ...panelLabels,
            }

            //panelItems
            let defPanelItems = {
                show: true,
                position: 'topleft',
            }
            let panelItems = get(vo, 'opt.panelItems', null)
            if (!isobj(panelItems)) {
                panelItems = {}
            }
            panelItems = cloneDeep(panelItems) //一定要cloneDeep使陣列記憶體與外部拖勾, 要不然添加style就會影響外部opt記憶體變更
            panelItems.style = {}
            if (isNumber(panelItems.width)) {
                panelItems.style.width = `${panelItems.width}px`
            }
            if (isNumber(panelItems.maxWidth)) {
                panelItems.style.maxWidth = `${panelItems.maxWidth}px`
            }
            if (isNumber(panelItems.maxHeight)) {
                panelItems.style.maxHeight = `${panelItems.maxHeight}px`
            }
            vo.panelItems = {
                ...defPanelItems,
                ...panelItems,
            }

            //panelLegends
            let defPanelLegends = {
                show: true,
                position: 'bottomright',
                maxWidth: 300,
            }
            let panelLegends = get(vo, 'opt.panelLegends', null)
            if (!isobj(panelLegends)) {
                panelLegends = {}
            }
            panelLegends = cloneDeep(panelLegends) //一定要cloneDeep使陣列記憶體與外部拖勾, 要不然添加style就會影響外部opt記憶體變更
            panelLegends.style = {}
            if (isNumber(panelLegends.width)) {
                panelLegends.style.width = `${panelLegends.width}px`
            }
            if (isNumber(panelLegends.maxWidth)) {
                panelLegends.style.maxWidth = `${panelLegends.maxWidth}px`
            }
            if (isNumber(panelLegends.maxHeight)) {
                panelLegends.style.maxHeight = `${panelLegends.maxHeight}px`
            }
            vo.panelLegends = {
                ...defPanelLegends,
                ...panelLegends,
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

            // //funSetsClick
            // let funSetsClick = get(vo, 'opt.defImageSetsClick', null)

            // //funSetsPopup
            // let funSetsPopup = get(vo, 'opt.defImageSetsPopup', null)

            // //funSetsTooltip
            // let funSetsTooltip = get(vo, 'opt.defImageSetsTooltip', null)

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

                // //funSetClick
                // let funSetClick = get(imageSet, 'click', null)

                // //funSetPopup, 預設以滑鼠點下位置出現
                // let funSetPopup = get(imageSet, 'popup', null) || funSetsPopup //僅提供一種popup, 若多邊形有popup則優先使用

                // //funSetTooltip
                // let funSetTooltip = get(imageSet, 'tooltip', null) || funSetsTooltip //僅提供一種tooltip, 若多邊形有tooltip則優先使用

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
                    // style, //需給予, 才能通過v-bind給予初始樣式
                    // styleHover,
                    mouseenter: (ev) => {
                        // console.log('mouseenter', ev)
                        // let layer = ev.target
                        // layer.setStyle(styleHover)
                    },
                    mouseleave: (ev) => {
                        // console.log('mouseleave', ev)
                        // let layer = ev.target
                        // layer.setStyle(style)
                    },
                    // funSetsClick,
                    // funSetClick,
                    // funSetPopup,
                    // funSetTooltip,
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
            let funSetsClick = get(vo, 'opt.defPointSetsClick', null)

            //funSetsPopup
            let funSetsPopup = get(vo, 'opt.defPointSetsPopup', null)

            //funSetsTooltip
            let funSetsTooltip = get(vo, 'opt.defPointSetsTooltip', null)

            //pointSets
            vo.pointSets = map(pointSets, (pointSet, kpointSet) => {

                //order
                let order = get(pointSet, 'order', null)

                //funSetClick
                let funSetClick = get(pointSet, 'click', null)

                //funSetPopup
                let funSetPopup = get(pointSet, 'popup', null)

                //funSetTooltip
                let funSetTooltip = get(pointSet, 'tooltip', null)

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

                    //point
                    if (isearr(point)) {
                        let p = {
                            latLng: [get(point, 0), get(point, 1)],
                        }
                        point = p
                    }

                    //funClick
                    let funClick = get(point, 'click', null)

                    //funPopup
                    let funPopup = get(point, 'popup', null) || funSetPopup || funSetsPopup //僅提供一種popup, 若點有popup則優先使用

                    //funTooltip
                    let funTooltip = get(point, 'tooltip', null) || funSetTooltip || funSetsTooltip //僅提供一種tooltip, 若點有tooltip則優先使用

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

                    let pointTemp = {
                        ...point,
                        type,
                        funSetsClick,
                        funSetClick,
                        funClick,
                        funPopup,
                        funTooltip,
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
                        }
                        else {
                            icon = pointSetIconPointSet
                        }
                        // console.log('point icon', icon)

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

                        //use icon
                        pointTemp.icon = icon

                    }

                    return pointTemp
                })

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

                return {
                    ...pointSet,
                    order,
                }
            })

            //changeItemsDebounce
            vo.changeItemsDebounce('changePointSets')

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
            let funSetsClick = get(vo, 'opt.defPolygonSetsClick', null)

            //funSetsPopup
            let funSetsPopup = get(vo, 'opt.defPolygonSetsPopup', null)

            //funSetsTooltip
            let funSetsTooltip = get(vo, 'opt.defPolygonSetsTooltip', null)

            vo.polygonSets = map(polygonSets, (polygonSet, kpolygonSet) => {

                //order
                let order = get(polygonSet, 'order', null)

                //funSetClick
                let funSetClick = get(polygonSet, 'click', null)

                //funSetPopup, 預設以滑鼠點下位置出現
                let funSetPopup = get(polygonSet, 'popup', null) || funSetsPopup //僅提供一種popup, 若多邊形有popup則優先使用

                //funSetTooltip
                let funSetTooltip = get(polygonSet, 'tooltip', null) || funSetsTooltip //僅提供一種tooltip, 若多邊形有tooltip則優先使用

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
                    ...polygonSet,
                    order,
                    style, //需給予, 才能通過v-bind給予初始樣式
                    styleHover,
                    mouseenter: (ev) => {
                        // console.log('mouseenter', ev)
                        let layer = ev.target
                        layer.setStyle(styleHover)
                    },
                    mouseleave: (ev) => {
                        // console.log('mouseleave', ev)
                        let layer = ev.target
                        layer.setStyle(style)
                    },
                    funSetsClick,
                    funSetClick,
                    funSetPopup,
                    funSetTooltip,
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
            let funSetsClick = get(vo, 'opt.defGeojsonSetsClick', null)

            //funSetsPopup
            let funSetsPopup = get(vo, 'opt.defGeojsonSetsPopup', null)

            //funSetsTooltip
            let funSetsTooltip = get(vo, 'opt.defGeojsonSetsTooltip', null)

            vo.geojsonSets = map(geojsonSets, (geojsonSet, kgeojsonSet) => {

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

                //funSetClick
                let funSetClick = get(geojsonSet, 'click', null)

                //funSetPopup, 預設以滑鼠點下位置出現
                let funSetPopup = get(geojsonSet, 'popup', null) || funSetsPopup //僅提供一種popup, 若多邊形有popup則優先使用

                //funSetTooltip
                let funSetTooltip = get(geojsonSet, 'tooltip', null) || funSetsTooltip //僅提供一種tooltip, 若多邊形有tooltip則優先使用

                //keyStyle
                let keyStyle = get(geojsonSet, 'keyStyle', '')
                // if (!isestr(keyStyle)) {
                //     keyStyle = 'properties.style'
                // }

                //bMouseEnter, 因geojson組件另外有提供feature給予style(optionsStyle), 此會因render導致覆蓋hover所給予的style, 故得另外偵測處理
                let bMouseEnter = false

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

                //funSetsStyle
                let funSetsStyle = (feature, geojsonSet) => {
                    let style = {}
                    if (isestr(keyStyle)) {
                        style = get(feature, keyStyle, {})
                        if (!iseobj(style)) {
                            console.log(`feature.${keyStyle} is not an effective object`)
                        }
                    }
                    else {
                        if (bMouseEnter) {
                            style = get(geojsonSet, 'styleHover', {})
                        }
                        else {
                            style = get(geojsonSet, 'style', {})
                        }
                    }
                    return style
                }

                //style
                let style = {
                    fillColor,
                    fillOpacity: 1, //vue leaflet預設為0.2得還原
                    color: lineColor,
                    weight: lineWidth,
                }

                //lineColorHover
                let lineColorHover = get(geojsonSet, 'lineColorHover', null)
                if (!isestr(lineColorHover)) {
                    lineColorHover = lineColor
                }

                //lineWidthHover
                let lineWidthHover = get(geojsonSet, 'lineWidthHover', null)
                if (!isNumber(lineWidthHover)) {
                    lineWidthHover = lineWidth
                }

                //fillColorHover
                let fillColorHover = get(geojsonSet, 'fillColorHover', null)
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
                    ...geojsonSet,
                    latLngs,
                    order,
                    style, //需給予, 才能通過v-bind給予初始樣式
                    styleHover,
                    mouseenter: (ev) => {
                        // console.log('mouseenter', ev)
                        bMouseEnter = true
                        if (!isestr(keyStyle)) { //非指定geojson內style
                            let layer = ev.target
                            layer.setStyle(styleHover)
                            // console.log('mouseenter', ev, cloneDeep(styleHover))
                        }
                    },
                    mouseleave: (ev) => {
                        // console.log('mouseleave', ev)
                        bMouseEnter = false
                        if (!isestr(keyStyle)) { //非指定geojson內style
                            let layer = ev.target
                            layer.setStyle(style)
                            // console.log('mouseleave', ev, cloneDeep(style))
                        }
                    },
                    funSetsStyle,
                    // funSetsStyleHover,
                    funSetsClick,
                    funSetClick,
                    funSetPopup,
                    funSetTooltip,
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
            let funSetsClick = get(vo, 'opt.defContourSetsClick', null)

            //funSetsPopup
            let funSetsPopup = get(vo, 'opt.defContourSetsPopup', null)

            //funSetsTooltip
            let funSetsTooltip = get(vo, 'opt.defContourSetsTooltip', null)

            vo.contourSets = map(contourSets, (contourSet, kcontourSet) => {
                //contour會使用legend故不提供popup與tooltip

                //order
                let order = get(contourSet, 'order', null)

                //funSetClick
                let funSetClick = get(contourSet, 'click', null)

                //funSetPopup, 預設以滑鼠點下位置出現
                let funSetPopup = get(contourSet, 'popup', null) || funSetsPopup //僅提供一種popup, 若多邊形有popup則優先使用

                //funSetTooltip
                let funSetTooltip = get(contourSet, 'tooltip', null) || funSetsTooltip //僅提供一種tooltip, 若多邊形有tooltip則優先使用

                //lineColor
                let lineColor = get(contourSet, 'lineColor', null)
                if (!isestr(lineColor)) {
                    lineColor = 'rgba(0,150,255,1)'
                }

                //lineWidth
                let lineWidth = get(contourSet, 'lineWidth', null)
                if (!isNumber(lineWidth)) {
                    lineWidth = 3
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
                    ...contourSet,
                    order,
                    // style, //需給予, 才能通過v-bind給予初始樣式
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
                    legendNumDig,
                    legendTextFormater,
                    legendTextExtra,
                    legend: [],
                    funSetsClick,
                    funSetClick,
                    funSetPopup,
                    funSetTooltip,
                }
            })

            //changeItemsDebounce
            vo.changeItemsDebounce('changeContourSets')

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

        changeItemsDebounce: function(from) {
            // console.log('methods changeItemsDebounce', from)

            let vo = this

            //dbcChangeItems
            vo.dbcChangeItems(() => {

                //changeItems
                vo.changeItems(from)

            })

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

        panTo: function(latLng, opt = {}) {
            // console.log('methods panTo', latLng, opt)

            let vo = this

            //check
            if (!isearr(latLng)) {
                console.log('latLng is not an effective array', latLng)
                throw new Error('latLng is not an effective array')
            }

            //mapObject
            let mapObject = vo.getMapObject()

            //check
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

        centerTo: function(latLng) {
            // console.log('methods centerTo', latLng)

            let vo = this

            //panTo
            vo.panTo(latLng)

        },

        closePopup: function() {
            // console.log('methods closePopup')

            let vo = this

            //call closePopup
            vo.$refs.refPopup.mapObject.closePopup()

        },

        closeTooltip: function() {
            // console.log('methods closeTooltip')

            let vo = this

            //call closeTooltip
            vo.$refs.refTooltip.mapObject.closeTooltip()

        },

        // parseImageData: function(ev, imageSet, kimageSet, imageSets) {

        //     //latLng, msg
        //     let ll = ev.latlng
        //     let latLng = [ll.lat, ll.lng]

        //     //msg
        //     let msg = {
        //         ev,
        //         lat: get(latLng, 0, null),
        //         lng: get(latLng, 1, null),
        //         latLngs: imageSet.latLngs, //bbb
        //         imageSet,
        //         kimageSet,
        //         imageSets,
        //     }

        //     return { latLng, msg }
        // },

        // clickImage: function(ev, imageSet, kimageSet, imageSets) {
        //     // console.log('methods clickImage', ev, imageSet, kimageSet, imageSets)

        //     let vo = this

        //     //obj
        //     let obj = imageSet

        //     //parseImageData
        //     let { latLng, msg } = vo.parseImageData(ev, imageSet, kimageSet, imageSets)

        //     //funSetClick
        //     if (isfun(obj.funSetClick)) {
        //         obj.funSetClick(msg)
        //     }

        //     //funSetsClick
        //     if (isfun(obj.funSetsClick)) {
        //         obj.funSetsClick(msg)
        //     }

        //     //funSetPopup
        //     if (isfun(obj.funSetPopup)) {

        //         //h
        //         let h = obj.funSetPopup(msg)

        //         //opt
        //         let opt = {
        //             maxWidth: 'auto',
        //         }

        //         //call openPopup
        //         vo.$refs.refPopup.mapObject.bindPopup(h, opt).openPopup(latLng)

        //     }

        // },

        // tooltipImage: function(ev, imageSet, kimageSet, imageSets) {
        //     // console.log('methods tooltipImage', ev, imageSet, kimageSet, imageSets)

        //     let vo = this

        //     //check, 因tooltip只有處理funSetTooltip, 故可先偵測先行跳出
        //     if (!isfun(imageSet.funSetTooltip)) {
        //         return
        //     }

        //     //obj
        //     let obj = imageSet

        //     //parseImageData
        //     let { msg } = vo.parseImageData(ev, imageSet, kimageSet, imageSets)

        //     //getCentroidMultiPolygon
        //     let centerlatLng = getCentroidMultiPolygon(msg.latLngs) //bbb

        //     //check
        //     if (size(centerlatLng) !== 2) {
        //         return
        //     }

        //     //h
        //     let h = obj.funSetTooltip(msg)

        //     //opt
        //     let opt = {
        //         maxWidth: 'auto',
        //     }

        //     //call openTooltip
        //     vo.$refs.refTooltip.mapObject.bindTooltip(h, opt).openTooltip(centerlatLng)

        // },

        parsePointData: function(ev, point, kpoint, pointSet, kpointSet, pointSets) {

            //latLng
            let latLng = get(point, 'latLng', null)

            //msg
            let msg = {
                ev,
                lat: get(latLng, 0, null),
                lng: get(latLng, 1, null),
                point,
                kpoint,
                pointSet,
                kpointSet,
                pointSets,
            }

            return { latLng, msg }
        },

        clickPoint: function(ev, point, kpoint, pointSet, kpointSet, pointSets) {
            // console.log('methods clickPoint', ev, point, kpoint, pointSet, kpointSet, pointSets)

            let vo = this

            //popupPoint
            vo.popupPoint({ ev, point, kpoint, pointSet, kpointSet, pointSets })

        },

        popupPoint: function(params) {
            // console.log('methods popupPoint', params)

            let vo = this
            let ele = null

            //spread
            let { ev, point, kpoint, pointSet, kpointSet, pointSets, popup } = params

            //check ev
            if (!iseobj(ev)) {
                ev = {}
            }

            //check point
            if (!iseobj(point)) {
                throw new Error('invalid point')
            }

            //check kpoint
            if (!ispint(kpoint)) {
                kpoint = 0
            }

            //check pointSet
            if (!iseobj(pointSet)) {
                pointSet = {}
            }

            //check kpointSet
            if (!ispint(kpointSet)) {
                kpointSet = 0
            }

            //check pointSets
            if (!isearr(pointSets)) {
                pointSets = []
            }

            //obj
            let obj = point

            //parsePointData
            let { latLng, msg } = vo.parsePointData(ev, point, kpoint, pointSet, kpointSet, pointSets)

            //funClick
            if (isfun(obj.funClick)) {
                obj.funClick(msg)
            }

            //funSetClick
            if (isfun(obj.funSetClick)) {
                obj.funSetClick(msg)
            }

            //funSetsClick
            if (isfun(obj.funSetsClick)) {
                obj.funSetsClick(msg)
            }

            //funPopup popup
            let funPopup = null
            if (isfun(obj.funPopup)) { //obj.funPopup為套件內彙整popup事件
                funPopup = obj.funPopup
            }
            else if (isfun(obj.popup)) { //obj.popup為外部傳入point時原先提供popup事件
                funPopup = obj.popup
            }
            else if (isfun(popup)) { //popup為外部直接提供popup事件
                funPopup = popup
            }
            // console.log('funPopup', funPopup)

            //funPopup
            if (isfun(funPopup)) {

                //h
                let h = funPopup(msg)

                //offset
                let offset = null
                if (!isearr(offset)) {
                    offset = get(obj, 'icon.options.popupAnchor', null) //由leaflet內部呼叫時, point或pointSet的popupAnchor已存入icon本身
                    // console.log('offset1', offset, obj)
                }
                if (!isearr(offset)) {
                    offset = get(obj, 'popupAnchor', null) //若無, 由leaflet外部呼叫時, popupAnchor由point提供
                    // console.log('offset2', offset, obj)
                }
                if (!isearr(offset)) {
                    offset = [0, -(40 / 1.5)] //若point沒有提供popupAnchor則代表使用原先icon與其popupAnchor
                    // console.log('offset3', offset, obj)
                }
                // console.log('offset', offset)

                //opt
                let opt = {
                    offset,
                    maxWidth: 'auto',
                }

                //call openPopup
                vo.$refs.refPopup.mapObject.bindPopup(h, opt).openPopup(latLng)

                //ele
                ele = get(vo, '$refs.refPopup.mapObject._popup._contentNode')
                // console.log('ele', ele)

            }

            return ele
        },

        tooltipPoint: function(ev, point, kpoint, pointSet, kpointSet, pointSets) {
            // console.log('methods tooltipPoint', ev, point,kpoint,pointSet,kpointSet,pointSets)

            let vo = this

            //check, 因tooltip只有處理funTooltip, 故可先偵測先行跳出
            if (!isfun(point.funTooltip)) {
                return
            }

            //obj
            let obj = point

            //parsePointData
            let { latLng, msg } = vo.parsePointData(ev, point, kpoint, pointSet, kpointSet, pointSets)

            //h
            let h = obj.funTooltip(msg)

            //offset bbb
            let offset = null
            if (!isearr(offset)) {
                offset = get(obj, 'icon.options.tooltipAnchor', null) //由leaflet內部呼叫時, point或pointSet的popupAnchor已存入icon本身
                // console.log('offset1', offset, obj)
            }
            if (!isearr(offset)) {
                offset = get(obj, 'tooltipAnchor', null) //若無, 由leaflet外部呼叫時, popupAnchor由point提供
                // console.log('offset2', offset, obj)
            }
            if (!isearr(offset)) {
                offset = [0, -(40 / 1.5)] //若point沒有提供popupAnchor則代表使用原先icon與其popupAnchor
                // console.log('offset3', offset)
            }
            // console.log('offset', offset)

            //opt
            let opt = {
                offset,
                maxWidth: 'auto',
            }

            //call openTooltip
            vo.$refs.refTooltip.mapObject.bindTooltip(h, opt).openTooltip(latLng)

        },

        parsePolygonData: function(ev, polygonSet, kpolygonSet, polygonSets) {

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
                polygonSets,
            }

            return { latLng, msg }
        },

        clickPolygon: function(ev, polygonSet, kpolygonSet, polygonSets) {
            // console.log('methods clickPolygon', ev, polygonSet, kpolygonSet, polygonSets)

            let vo = this

            //obj
            let obj = polygonSet

            //parsePolygonData
            let { latLng, msg } = vo.parsePolygonData(ev, polygonSet, kpolygonSet, polygonSets)

            //funSetClick
            if (isfun(obj.funSetClick)) {
                obj.funSetClick(msg)
            }

            //funSetsClick
            if (isfun(obj.funSetsClick)) {
                obj.funSetsClick(msg)
            }

            //funSetPopup
            if (isfun(obj.funSetPopup)) {

                //h
                let h = obj.funSetPopup(msg)

                //opt
                let opt = {
                    maxWidth: 'auto',
                }

                //call openPopup
                vo.$refs.refPopup.mapObject.bindPopup(h, opt).openPopup(latLng)

            }

        },

        tooltipPolygon: function(ev, polygonSet, kpolygonSet, polygonSets) {
            // console.log('methods tooltipPolygon', ev, polygonSet, kpolygonSet, polygonSets)

            let vo = this

            //check, 因tooltip只有處理funSetTooltip, 故可先偵測先行跳出
            if (!isfun(polygonSet.funSetTooltip)) {
                return
            }

            //obj
            let obj = polygonSet

            //parsePolygonData
            let { msg } = vo.parsePolygonData(ev, polygonSet, kpolygonSet, polygonSets)

            //getCentroidMultiPolygon
            let centerlatLng = getCentroidMultiPolygon(msg.latLngs)

            //check
            if (size(centerlatLng) !== 2) {
                return
            }

            //h
            let h = obj.funSetTooltip(msg)

            //opt
            let opt = {
                maxWidth: 'auto',
            }

            //call openTooltip
            vo.$refs.refTooltip.mapObject.bindTooltip(h, opt).openTooltip(centerlatLng)

        },

        getGeojsonStyle: function(feature, geojsonSet) {
            // console.log('getGeojsonStyle', 'feature', feature, 'geojsonSet', geojsonSet)

            //funSetsStyle
            let style = geojsonSet.funSetsStyle(feature, geojsonSet)
            // console.log('getGeojsonStyle', cloneDeep(style))

            return style
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
            let { latLng, msg } = vo.parseGeojsonData(ev, geojsonSet, kgeojsonSet, geojsonSets)

            //funSetClick
            if (isfun(obj.funSetClick)) {
                obj.funSetClick(msg)
            }

            //funSetsClick
            if (isfun(obj.funSetsClick)) {
                obj.funSetsClick(msg)
            }

            //funSetPopup
            if (isfun(obj.funSetPopup)) {

                //h
                let h = obj.funSetPopup(msg)

                //opt
                let opt = {
                    maxWidth: 'auto',
                }

                //call openPopup
                vo.$refs.refPopup.mapObject.bindPopup(h, opt).openPopup(latLng)

            }

        },

        tooltipGeojson: function(ev, geojsonSet, kgeojsonSet, geojsonSets) {
            // console.log('methods tooltipGeojson', ev, geojsonSet, kgeojsonSet, geojsonSets)

            let vo = this

            //check, 因tooltip只有處理funSetTooltip, 故可先偵測先行跳出
            if (!isfun(geojsonSet.funSetTooltip)) {
                return
            }

            //obj
            let obj = geojsonSet

            //parseGeojsonData
            let { msg } = vo.parseGeojsonData(ev, geojsonSet, kgeojsonSet, geojsonSets)

            //getCentroidMultiPolygon
            let centerlatLng = getCentroidMultiPolygon(msg.latLngs) //latLngs由features的mutlipolygon提取

            //check
            if (size(centerlatLng) !== 2) {
                return
            }

            //inv, 因geojson為經緯度而leaflet為緯經度, 得交換
            centerlatLng = [centerlatLng[1], centerlatLng[0]]

            //h
            let h = obj.funSetTooltip(msg)

            //opt
            let opt = {
                maxWidth: 'auto',
            }

            //call openTooltip
            vo.$refs.refTooltip.mapObject.bindTooltip(h, opt).openTooltip(centerlatLng)

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
            let { latLng, msg } = vo.parseContourData(ev, polygonSet, kpolygonSet, contourSet, kcontourSet, contourSets)

            //funSetClick
            if (isfun(obj.funSetClick)) {
                obj.funSetClick(msg)
            }

            //funSetsClick
            if (isfun(obj.funSetsClick)) {
                obj.funSetsClick(msg)
            }

            //funSetPopup
            if (isfun(obj.funSetPopup)) {

                //h
                let h = obj.funSetPopup(msg)

                //opt
                let opt = {
                    maxWidth: 'auto',
                }

                //call openPopup
                vo.$refs.refPopup.mapObject.bindPopup(h, opt).openPopup(latLng)

            }

        },

        tooltipContour: function({ ev, polygonSet, kpolygonSet }, contourSet, kcontourSet, contourSets) {
            // console.log('methods tooltipContour', ev, polygonSet, kpolygonSet, contourSet, kcontourSet, contourSets)

            let vo = this

            //check, 因tooltip只有處理funSetTooltip, 故可先偵測先行跳出
            if (!isfun(contourSet.funSetTooltip)) {
                return
            }

            //obj
            let obj = contourSet

            //parseContourData
            let { msg } = vo.parseContourData(ev, polygonSet, kpolygonSet, contourSet, kcontourSet, contourSets)

            //center
            let centerlatLng = polygonSet.center

            //h
            let h = obj.funSetTooltip(msg)

            //opt
            let opt = {
                maxWidth: 'auto',
            }

            //call openTooltip
            vo.$refs.refTooltip.mapObject.bindTooltip(h, opt).openTooltip(centerlatLng)

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

        contourMouseenter: function(data, contourSet, kcontourSet) {
            // console.log('methods contourMouseenter', data, contourSet, kcontourSet)

            // let vo = this

            //update arrow
            each(contourSet.legend, (v, k) => {
                contourSet.legend[k].arrow = data.kpolygonSet === contourSet.legend[k].index
            })

        },

        contourMouseleave: function(data, contourSet, kcontourSet) {
            // console.log('methods contourMouseleave', data, contourSet, kcontourSet)

            // let vo = this

            //hide arrow
            each(contourSet.legend, (v, k) => {
                contourSet.legend[k].arrow = false
            })

        },

    },
}
</script>

<style scoped>
.clsPanel {
    padding:4px 5px;
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
</style>
