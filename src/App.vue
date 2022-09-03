<template>
    <div>


        <template v-if="!isNarrow">
            <a href="https://github.com/yuda-lyu/w-leaflet-vue" class="github-corner" style="position:fixed; top:0; right:0; border:0; z-index:10000;" aria-label="View source on GitHub" target="_blank">
                <svg width="80" height="80" viewBox="0 0 250 250" style="fill:rgba(0,0,0,0.25); color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg>
            </a>
        </template>

        <div style="">

            <div style="padding:0px 80px 0px 10px; border-bottom:1px solid #ddd;">
                <template v-for="(m,km) in mainCmps">

                    <div :key="km" style="display:inline-block; margin:10px 0px 0px 0px;">
                        <div
                            :class="`clsBtn clsMainMenu-basic ${km===showMainCmp?'clsMainMenu-active':'clsMainMenu'}`"
                            @click="showMainCmp=km"
                        >
                            {{km}}
                        </div>
                    </div>

                </template>
            </div>

            <div style="padding:0px 80px 10px 0px; border-bottom:1px solid #ddd;">
                <template v-for="(s,ks) in nowSubCmps">
                    <div :key="ks" style="display:inline-block; margin:10px 0px 0px 10px;">
                        <div
                            :class="`clsBtn clsSubMenu-basic ${s===showSubCmp?'clsSubMenu-active':'clsSubMenu'}`"
                            @click="showSubCmp=s"
                        >
                            {{s}}
                        </div>
                    </div>
                </template>
            </div>

        </div>

        <AppBSCSize v-if="showSubCmp==='size'"></AppBSCSize>

        <AppBSCCenter v-if="showSubCmp==='center'"></AppBSCCenter>

        <AppBSCZoom v-if="showSubCmp==='zoom'"></AppBSCZoom>

        <AppBSCPanelBackgroundColor v-if="showSubCmp==='panelBackgroundColor'"></AppBSCPanelBackgroundColor>

        <AppPBMShow v-if="showSubCmp==='panelBaseMaps.show'"></AppPBMShow>

        <AppPBMBaseMaps v-if="showSubCmp==='panelBaseMaps.baseMaps'"></AppPBMBaseMaps>

        <AppPBMPosition v-if="showSubCmp==='panelBaseMaps.position'"></AppPBMPosition>

        <AppPLBShow v-if="showSubCmp==='panelLabels.show'"></AppPLBShow>

        <AppPLBPosition v-if="showSubCmp==='panelLabels.position'"></AppPLBPosition>

        <AppPLBTitle v-if="showSubCmp==='panelLabels.title'"></AppPLBTitle>

        <AppPLBLng v-if="showSubCmp==='panelLabels.lng'"></AppPLBLng>

        <AppPLBLat v-if="showSubCmp==='panelLabels.lat'"></AppPLBLat>

        <AppPLBZoom v-if="showSubCmp==='panelLabels.zoom'"></AppPLBZoom>

        <AppPLBUseItems v-if="showSubCmp==='panelLabels.useItems'"></AppPLBUseItems>

        <AppPZMShow v-if="showSubCmp==='panelZoom.show'"></AppPZMShow>

        <AppPZMPosition v-if="showSubCmp==='panelZoom.position'"></AppPZMPosition>

        <AppPNTPointSets v-if="showSubCmp==='pointSets'"></AppPNTPointSets>

        <AppPNTPointSetPointByArray v-if="showSubCmp==='pointSet-pointByArray'"></AppPNTPointSetPointByArray>

        <AppPNTPointSetChangeData v-if="showSubCmp==='pointSet-changeData'"></AppPNTPointSetChangeData>

        <AppPNTPointSetOrder v-if="showSubCmp==='pointSet.order'"></AppPNTPointSetOrder>

        <AppPNTPointSetIconSrcSizeAnchor v-if="showSubCmp==='pointSet.iconSrc,iconSize,iconAnchor,popupAnchor'"></AppPNTPointSetIconSrcSizeAnchor>

        <AppPNTPointSetPointIconSrcSizeAnchor v-if="showSubCmp==='pointSet.point.iconSrc,iconSize,iconAnchor,popupAnchor'"></AppPNTPointSetPointIconSrcSizeAnchor>

        <AppPNTDefPointSetsClick v-if="showSubCmp==='defPointSetsClick'"></AppPNTDefPointSetsClick>

        <AppPNTPointSetClick v-if="showSubCmp==='pointSet.click'"></AppPNTPointSetClick>

        <AppPNTPointSetPointClick v-if="showSubCmp==='pointSet.point.click'"></AppPNTPointSetPointClick>

        <AppPNTDefPointSetsPopup v-if="showSubCmp==='defPointSetsPopup'"></AppPNTDefPointSetsPopup>

        <AppPNTPointSetPopup v-if="showSubCmp==='pointSet.popup'"></AppPNTPointSetPopup>

        <AppPNTPointSetPointPopup v-if="showSubCmp==='pointSet.point.popup'"></AppPNTPointSetPointPopup>

        <AppPNTDefPointSetsTooltip v-if="showSubCmp==='defPointSetsTooltip'"></AppPNTDefPointSetsTooltip>

        <AppPNTPointSetTooltip v-if="showSubCmp==='pointSet.tooltip'"></AppPNTPointSetTooltip>

        <AppPNTPointSetPointTooltip v-if="showSubCmp==='pointSet.point.tooltip'"></AppPNTPointSetPointTooltip>

        <AppPGNPolygonSets v-if="showSubCmp==='polygonSets'"></AppPGNPolygonSets>

        <AppPGNPolygonSetChangeData v-if="showSubCmp==='polygonSet-changeData'"></AppPGNPolygonSetChangeData>

        <AppPGNPolygonSetOrder v-if="showSubCmp==='polygonSet.order'"></AppPGNPolygonSetOrder>

        <AppPGNPolygonSetLineColor v-if="showSubCmp==='polygonSet.lineColor'"></AppPGNPolygonSetLineColor>

        <AppPGNPolygonSetLineColorHover v-if="showSubCmp==='polygonSet.lineColorHover'"></AppPGNPolygonSetLineColorHover>

        <AppPGNPolygonSetLineWidth v-if="showSubCmp==='polygonSet.lineWidth'"></AppPGNPolygonSetLineWidth>

        <AppPGNPolygonSetLineWidthHover v-if="showSubCmp==='polygonSet.lineWidthHover'"></AppPGNPolygonSetLineWidthHover>

        <AppPGNPolygonSetFillColor v-if="showSubCmp==='polygonSet.fillColor'"></AppPGNPolygonSetFillColor>

        <AppPGNPolygonSetFillColorHover v-if="showSubCmp==='polygonSet.fillColorHover'"></AppPGNPolygonSetFillColorHover>

        <AppPGNDefPolygonSetsClick v-if="showSubCmp==='defPolygonSetsClick'"></AppPGNDefPolygonSetsClick>

        <AppPGNPolygonSetClick v-if="showSubCmp==='polygonSet.click'"></AppPGNPolygonSetClick>

        <AppPGNDefPolygonSetsPopup v-if="showSubCmp==='defPolygonSetsPopup'"></AppPGNDefPolygonSetsPopup>

        <AppPGNPolygonSetPopup v-if="showSubCmp==='polygonSet.popup'"></AppPGNPolygonSetPopup>

        <AppPGNDefPolygonSetsTooltip v-if="showSubCmp==='defPolygonSetsTooltip'"></AppPGNDefPolygonSetsTooltip>

        <AppPGNPolygonSetTooltip v-if="showSubCmp==='polygonSet.tooltip'"></AppPGNPolygonSetTooltip>

        <AppCTRContourSets v-if="showSubCmp==='contourSets'"></AppCTRContourSets>

        <AppCTRContourSetChangeData v-if="showSubCmp==='contourSet-changeData'"></AppCTRContourSetChangeData>

        <AppCTRContourSetThresholds v-if="showSubCmp==='contourSet.thresholds'"></AppCTRContourSetThresholds>

        <AppCTRContourSetGetColor v-if="showSubCmp==='contourSet.getColor'"></AppCTRContourSetGetColor>

        <AppCTRContourSetOrder v-if="showSubCmp==='contourSet.order'"></AppCTRContourSetOrder>

        <AppCTRContourSetGradient v-if="showSubCmp==='contourSet.gradient'"></AppCTRContourSetGradient>

        <AppCTRContourSetLineColor v-if="showSubCmp==='contourSet.lineColor'"></AppCTRContourSetLineColor>

        <AppCTRContourSetLineColorHover v-if="showSubCmp==='contourSet.lineColorHover'"></AppCTRContourSetLineColorHover>

        <AppCTRContourSetLineWidth v-if="showSubCmp==='contourSet.lineWidth'"></AppCTRContourSetLineWidth>

        <AppCTRContourSetLineWidthHover v-if="showSubCmp==='contourSet.lineWidthHover'"></AppCTRContourSetLineWidthHover>

        <AppCTRContourSetFillOpacity v-if="showSubCmp==='contourSet.fillOpacity'"></AppCTRContourSetFillOpacity>

        <AppCTRContourSetFillOpacityHover v-if="showSubCmp==='contourSet.fillOpacityHover'"></AppCTRContourSetFillOpacityHover>

        <AppCTRContourSetChangeStyleWhenHover v-if="showSubCmp==='contourSet.changeStyleWhenHover'"></AppCTRContourSetChangeStyleWhenHover>

        <AppCTRContourSetLegendNumDig v-if="showSubCmp==='contourSet.legendNumDig'"></AppCTRContourSetLegendNumDig>

        <AppCTRContourSetLegendTextFormater v-if="showSubCmp==='contourSet.legendTextFormater'"></AppCTRContourSetLegendTextFormater>

        <AppCTRContourSetLegendTextExtra v-if="showSubCmp==='contourSet.legendTextExtra'"></AppCTRContourSetLegendTextExtra>

        <AppCTRContourSetPolygonClipOuter v-if="showSubCmp==='contourSet.polygonClipOuter'"></AppCTRContourSetPolygonClipOuter>

        <AppCTRContourSetPolygonsClipInner v-if="showSubCmp==='contourSet.polygonsClipInner'"></AppCTRContourSetPolygonsClipInner>

        <AppCTRContourSetPolygonsContainInner v-if="showSubCmp==='contourSet.polygonsContainInner'"></AppCTRContourSetPolygonsContainInner>

        <AppCTRDefContourSetsClick v-if="showSubCmp==='defContourSetsClick'"></AppCTRDefContourSetsClick>

        <AppCTRContourSetClick v-if="showSubCmp==='contourSet.click'"></AppCTRContourSetClick>

        <AppCTRDefContourSetsPopup v-if="showSubCmp==='defContourSetsPopup'"></AppCTRDefContourSetsPopup>

        <AppCTRContourSetPopup v-if="showSubCmp==='contourSet.popup'"></AppCTRContourSetPopup>

        <AppCTRDefContourSetsTooltip v-if="showSubCmp==='defContourSetsTooltip'"></AppCTRDefContourSetsTooltip>

        <AppCTRContourSetTooltip v-if="showSubCmp==='contourSet.tooltip'"></AppCTRContourSetTooltip>

        <AppCTRContourSetLargeSet v-if="showSubCmp==='contourSet.largeSet'"></AppCTRContourSetLargeSet>

        <AppCTRContourSetInterp2 v-if="showSubCmp==='contourSet.interp2'"></AppCTRContourSetInterp2>

        <AppPIMShow v-if="showSubCmp==='panelItems.show'"></AppPIMShow>

        <AppPIMPosition v-if="showSubCmp==='panelItems.position'"></AppPIMPosition>

        <AppPIMWidth v-if="showSubCmp==='panelItems.width'"></AppPIMWidth>

        <AppPIMMaxWidth v-if="showSubCmp==='panelItems.maxWidth'"></AppPIMMaxWidth>

        <AppPIMMaxHeight v-if="showSubCmp==='panelItems.maxHeight'"></AppPIMMaxHeight>

        <AppLGDShow v-if="showSubCmp==='panelLegends.show'"></AppLGDShow>

        <AppLGDPosition v-if="showSubCmp==='panelLegends.position'"></AppLGDPosition>

        <AppLGDWidth v-if="showSubCmp==='panelLegends.width'"></AppLGDWidth>

        <AppLGDMaxWidth v-if="showSubCmp==='panelLegends.maxWidth'"></AppLGDMaxWidth>

        <AppLGDMaxHeight v-if="showSubCmp==='panelLegends.maxHeight'"></AppLGDMaxHeight>

        <AppFunGetMapObject v-if="showSubCmp==='function-getMapObject'"></AppFunGetMapObject>

        <AppFunCenterTo v-if="showSubCmp==='function-centerTo'"></AppFunCenterTo>

        <AppFunPanTo v-if="showSubCmp==='function-panTo'"></AppFunPanTo>

        <AppFunPopupPoint v-if="showSubCmp==='function-popupPoint'"></AppFunPopupPoint>

    </div>
</template>

<script>
import get from 'lodash/get'
import AppBSCSize from './AppBSCSize.vue'
import AppBSCCenter from './AppBSCCenter.vue'
import AppBSCZoom from './AppBSCZoom.vue'
import AppBSCPanelBackgroundColor from './AppBSCPanelBackgroundColor.vue'
import AppPBMShow from './AppPBMShow.vue'
import AppPBMBaseMaps from './AppPBMBaseMaps.vue'
import AppPBMPosition from './AppPBMPosition.vue'
import AppPLBShow from './AppPLBShow.vue'
import AppPLBPosition from './AppPLBPosition.vue'
import AppPLBTitle from './AppPLBTitle.vue'
import AppPLBLng from './AppPLBLng.vue'
import AppPLBLat from './AppPLBLat.vue'
import AppPLBZoom from './AppPLBZoom.vue'
import AppPLBUseItems from './AppPLBUseItems.vue'
import AppPZMShow from './AppPZMShow.vue'
import AppPZMPosition from './AppPZMPosition.vue'
import AppPNTPointSets from './AppPNTPointSets.vue'
import AppPNTPointSetPointByArray from './AppPNTPointSetPointByArray.vue'
import AppPNTPointSetChangeData from './AppPNTPointSetChangeData.vue'
import AppPNTPointSetOrder from './AppPNTPointSetOrder.vue'
import AppPNTPointSetIconSrcSizeAnchor from './AppPNTPointSetIconSrcSizeAnchor.vue'
import AppPNTPointSetPointIconSrcSizeAnchor from './AppPNTPointSetPointIconSrcSizeAnchor.vue'
import AppPNTDefPointSetsClick from './AppPNTDefPointSetsClick.vue'
import AppPNTPointSetClick from './AppPNTPointSetClick.vue'
import AppPNTPointSetPointClick from './AppPNTPointSetPointClick.vue'
import AppPNTDefPointSetsPopup from './AppPNTDefPointSetsPopup.vue'
import AppPNTPointSetPopup from './AppPNTPointSetPopup.vue'
import AppPNTPointSetPointPopup from './AppPNTPointSetPointPopup.vue'
import AppPNTDefPointSetsTooltip from './AppPNTDefPointSetsTooltip.vue'
import AppPNTPointSetTooltip from './AppPNTPointSetTooltip.vue'
import AppPNTPointSetPointTooltip from './AppPNTPointSetPointTooltip.vue'
import AppPGNPolygonSets from './AppPGNPolygonSets.vue'
import AppPGNPolygonSetChangeData from './AppPGNPolygonSetChangeData.vue'
import AppPGNPolygonSetOrder from './AppPGNPolygonSetOrder.vue'
import AppPGNPolygonSetLineColor from './AppPGNPolygonSetLineColor.vue'
import AppPGNPolygonSetLineColorHover from './AppPGNPolygonSetLineColorHover.vue'
import AppPGNPolygonSetLineWidth from './AppPGNPolygonSetLineWidth.vue'
import AppPGNPolygonSetLineWidthHover from './AppPGNPolygonSetLineWidthHover.vue'
import AppPGNPolygonSetFillColor from './AppPGNPolygonSetFillColor.vue'
import AppPGNPolygonSetFillColorHover from './AppPGNPolygonSetFillColorHover.vue'
import AppPGNDefPolygonSetsClick from './AppPGNDefPolygonSetsClick.vue'
import AppPGNPolygonSetClick from './AppPGNPolygonSetClick.vue'
import AppPGNDefPolygonSetsPopup from './AppPGNDefPolygonSetsPopup.vue'
import AppPGNPolygonSetPopup from './AppPGNPolygonSetPopup.vue'
import AppPGNDefPolygonSetsTooltip from './AppPGNDefPolygonSetsTooltip.vue'
import AppPGNPolygonSetTooltip from './AppPGNPolygonSetTooltip.vue'
import AppCTRContourSets from './AppCTRContourSets.vue'
import AppCTRContourSetChangeData from './AppCTRContourSetChangeData.vue'
import AppCTRContourSetThresholds from './AppCTRContourSetThresholds.vue'
import AppCTRContourSetGetColor from './AppCTRContourSetGetColor.vue'
import AppCTRContourSetOrder from './AppCTRContourSetOrder.vue'
import AppCTRContourSetGradient from './AppCTRContourSetGradient.vue'
import AppCTRContourSetLineColor from './AppCTRContourSetLineColor.vue'
import AppCTRContourSetLineColorHover from './AppCTRContourSetLineColorHover.vue'
import AppCTRContourSetLineWidth from './AppCTRContourSetLineWidth.vue'
import AppCTRContourSetLineWidthHover from './AppCTRContourSetLineWidthHover.vue'
import AppCTRContourSetFillOpacity from './AppCTRContourSetFillOpacity.vue'
import AppCTRContourSetFillOpacityHover from './AppCTRContourSetFillOpacityHover.vue'
import AppCTRContourSetChangeStyleWhenHover from './AppCTRContourSetChangeStyleWhenHover.vue'
import AppCTRContourSetLegendNumDig from './AppCTRContourSetLegendNumDig.vue'
import AppCTRContourSetLegendTextFormater from './AppCTRContourSetLegendTextFormater.vue'
import AppCTRContourSetLegendTextExtra from './AppCTRContourSetLegendTextExtra.vue'
import AppCTRContourSetPolygonClipOuter from './AppCTRContourSetPolygonClipOuter.vue'
import AppCTRContourSetPolygonsClipInner from './AppCTRContourSetPolygonsClipInner.vue'
import AppCTRContourSetPolygonsContainInner from './AppCTRContourSetPolygonsContainInner.vue'
import AppCTRDefContourSetsClick from './AppCTRDefContourSetsClick.vue'
import AppCTRContourSetClick from './AppCTRContourSetClick.vue'
import AppCTRDefContourSetsPopup from './AppCTRDefContourSetsPopup.vue'
import AppCTRContourSetPopup from './AppCTRContourSetPopup.vue'
import AppCTRDefContourSetsTooltip from './AppCTRDefContourSetsTooltip.vue'
import AppCTRContourSetTooltip from './AppCTRContourSetTooltip.vue'
import AppCTRContourSetLargeSet from './AppCTRContourSetLargeSet.vue'
import AppCTRContourSetInterp2 from './AppCTRContourSetInterp2.vue'
import AppPIMShow from './AppPIMShow.vue'
import AppPIMPosition from './AppPIMPosition.vue'
import AppPIMWidth from './AppPIMWidth.vue'
import AppPIMMaxWidth from './AppPIMMaxWidth.vue'
import AppPIMMaxHeight from './AppPIMMaxHeight.vue'
import AppLGDShow from './AppLGDShow.vue'
import AppLGDPosition from './AppLGDPosition.vue'
import AppLGDWidth from './AppLGDWidth.vue'
import AppLGDMaxWidth from './AppLGDMaxWidth.vue'
import AppLGDMaxHeight from './AppLGDMaxHeight.vue'
import AppFunGetMapObject from './AppFunGetMapObject.vue'
import AppFunCenterTo from './AppFunCenterTo.vue'
import AppFunPanTo from './AppFunPanTo.vue'
import AppFunPopupPoint from './AppFunPopupPoint.vue'


export default {
    components: {
        AppBSCSize,
        AppBSCCenter,
        AppBSCZoom,
        AppBSCPanelBackgroundColor,
        AppPBMShow,
        AppPBMBaseMaps,
        AppPBMPosition,
        AppPLBShow,
        AppPLBPosition,
        AppPLBTitle,
        AppPLBLng,
        AppPLBLat,
        AppPLBZoom,
        AppPLBUseItems,
        AppPZMShow,
        AppPZMPosition,
        AppPNTPointSets,
        AppPNTPointSetPointByArray,
        AppPNTPointSetChangeData,
        AppPNTPointSetOrder,
        AppPNTPointSetIconSrcSizeAnchor,
        AppPNTPointSetPointIconSrcSizeAnchor,
        AppPNTDefPointSetsClick,
        AppPNTPointSetClick,
        AppPNTPointSetPointClick,
        AppPNTDefPointSetsPopup,
        AppPNTPointSetPopup,
        AppPNTPointSetPointPopup,
        AppPNTDefPointSetsTooltip,
        AppPNTPointSetTooltip,
        AppPNTPointSetPointTooltip,
        AppPGNPolygonSets,
        AppPGNPolygonSetChangeData,
        AppPGNPolygonSetOrder,
        AppPGNPolygonSetLineColor,
        AppPGNPolygonSetLineColorHover,
        AppPGNPolygonSetLineWidth,
        AppPGNPolygonSetLineWidthHover,
        AppPGNPolygonSetFillColor,
        AppPGNPolygonSetFillColorHover,
        AppPGNDefPolygonSetsClick,
        AppPGNPolygonSetClick,
        AppPGNDefPolygonSetsPopup,
        AppPGNPolygonSetPopup,
        AppPGNDefPolygonSetsTooltip,
        AppPGNPolygonSetTooltip,
        AppCTRContourSets,
        AppCTRContourSetChangeData,
        AppCTRContourSetThresholds,
        AppCTRContourSetGetColor,
        AppCTRContourSetOrder,
        AppCTRContourSetGradient,
        AppCTRContourSetLineColor,
        AppCTRContourSetLineColorHover,
        AppCTRContourSetLineWidth,
        AppCTRContourSetLineWidthHover,
        AppCTRContourSetFillOpacity,
        AppCTRContourSetFillOpacityHover,
        AppCTRContourSetChangeStyleWhenHover,
        AppCTRContourSetLegendNumDig,
        AppCTRContourSetLegendTextFormater,
        AppCTRContourSetLegendTextExtra,
        AppCTRContourSetPolygonClipOuter,
        AppCTRContourSetPolygonsClipInner,
        AppCTRContourSetPolygonsContainInner,
        AppCTRDefContourSetsClick,
        AppCTRContourSetClick,
        AppCTRDefContourSetsPopup,
        AppCTRContourSetPopup,
        AppCTRDefContourSetsTooltip,
        AppCTRContourSetTooltip,
        AppCTRContourSetLargeSet,
        AppCTRContourSetInterp2,
        AppPIMShow,
        AppPIMPosition,
        AppPIMWidth,
        AppPIMMaxWidth,
        AppPIMMaxHeight,
        AppLGDShow,
        AppLGDPosition,
        AppLGDWidth,
        AppLGDMaxWidth,
        AppLGDMaxHeight,
        AppFunGetMapObject,
        AppFunCenterTo,
        AppFunPanTo,
        AppFunPopupPoint,
    },
    data: function() {
        return {
            showMainCmp: 'basic',
            showSubCmp: 'size',
            mainCmps: {
                basic: [
                    'size',
                    'center',
                    'zoom',
                    'panelBackgroundColor',
                ],
                panelBaseMaps: [
                    'panelBaseMaps.show',
                    'panelBaseMaps.baseMaps',
                    'panelBaseMaps.position',
                ],
                panelLabels: [
                    'panelLabels.show',
                    'panelLabels.position',
                    'panelLabels.title',
                    'panelLabels.lng',
                    'panelLabels.lat',
                    'panelLabels.zoom',
                    'panelLabels.useItems',
                ],
                panelZoom: [
                    'panelZoom.show',
                    'panelZoom.position',
                ],
                panelItems: [
                    'panelItems.show',
                    'panelItems.position',
                    'panelItems.width',
                    'panelItems.maxWidth',
                    'panelItems.maxHeight',
                ],
                panelLegends: [
                    'panelLegends.show',
                    'panelLegends.position',
                    'panelLegends.width',
                    'panelLegends.maxWidth',
                    'panelLegends.maxHeight',
                ],
                point: [
                    'pointSets',
                    'pointSet-pointByArray',
                    'pointSet-changeData',
                    'pointSet.order',
                    'pointSet.iconSrc,iconSize,iconAnchor,popupAnchor',
                    'pointSet.point.iconSrc,iconSize,iconAnchor,popupAnchor',
                    'defPointSetsClick',
                    'pointSet.click',
                    'pointSet.point.click',
                    'defPointSetsPopup',
                    'pointSet.popup',
                    'pointSet.point.popup',
                    'defPointSetsTooltip',
                    'pointSet.tooltip',
                    'pointSet.point.tooltip',
                ],
                polygon: [
                    'polygonSets',
                    'polygonSet-changeData',
                    'polygonSet.order',
                    'polygonSet.lineColor',
                    'polygonSet.lineColorHover',
                    'polygonSet.lineWidth',
                    'polygonSet.lineWidthHover',
                    'polygonSet.fillColor',
                    'polygonSet.fillColorHover',
                    'defPolygonSetsClick',
                    'polygonSet.click',
                    'defPolygonSetsPopup',
                    'polygonSet.popup',
                    'defPolygonSetsTooltip',
                    'polygonSet.tooltip',
                ],
                contour: [
                    'contourSets',
                    'contourSet-changeData',
                    'contourSet.thresholds',
                    'contourSet.getColor',
                    'contourSet.order',
                    'contourSet.gradient',
                    'contourSet.lineColor',
                    'contourSet.lineColorHover',
                    'contourSet.lineWidth',
                    'contourSet.lineWidthHover',
                    'contourSet.fillOpacity',
                    'contourSet.fillOpacityHover',
                    'contourSet.changeStyleWhenHover',
                    'contourSet.legendNumDig',
                    'contourSet.legendTextFormater',
                    'contourSet.legendTextExtra',
                    'contourSet.polygonClipOuter',
                    'contourSet.polygonsClipInner',
                    'contourSet.polygonsContainInner',
                    'defContourSetsClick',
                    'contourSet.click',
                    'defContourSetsPopup',
                    'contourSet.popup',
                    'defContourSetsTooltip',
                    'contourSet.tooltip',
                    'contourSet.largeSet',
                    'contourSet.interp2',
                ],
                function: [
                    'function-getMapObject',
                    'function-centerTo',
                    'function-panTo',
                    'function-popupPoint',
                ],
            },

        }
    },
    // mounted: function() {
    //     let vo = this
    // },
    computed: {

        isNarrow: function() {
            return window.innerWidth < 1000
        },

        nowSubCmps: function() {
            let vo = this
            let rs = get(vo.mainCmps, vo.showMainCmp, [])
            vo.showSubCmp = get(rs, 0, '')
            return rs
        },

    },
}
</script>

<style>
.clsBtn {
    transition:all 0.5s;
    cursor: pointer;
    user-select: none;
}
.clsMainMenu-basic {
    padding: 3px 9px;
}
.clsMainMenu {
    border-bottom:2px solid #fff;
}
.clsMainMenu:hover {
    border-bottom:2px solid #aaa;
}
.clsMainMenu-active {
    border-bottom:2px solid #f26;
    background:#efefef;
}
.clsSubMenu-basic {
    padding: 3px 12px;
    font-size:0.8rem;
    border-radius:30px;
}
.clsSubMenu {
    background:#efefef;
}
.clsSubMenu:hover {
    background:#ddd;
}
.clsSubMenu-active {
    background:#f26;
    color:#fff;
    box-shadow:0 0 15px rgb(0 0 0 / 20%);
}
.item-link {
    display: inline-block;
    margin: 10px 10px 5px 0px;
    padding: 5px 10px;
    font-size: 0.8rem;
    color: #fff;
    background-color: #443a65;
    cursor: pointer;
    text-decoration: none;
}
.option-label {
    position:absolute;
    left:10px;
    top:-33px;
    padding:4px 20px 7px 20px;
    border-left:1px solid #ddd;
    border-top:1px solid #ddd;
    border-right:1px solid #ddd;
    border-bottom:1px solid #f6f6f6;
    border-top-left-radius:15px;
    border-top-right-radius:15px;
    background:#f6f6f6;
}
</style>
