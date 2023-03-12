import CustomTitleRender from "./CustomTitle/renderer"
import CustomCountdownRender from "./CustomCountdown/renderer"
import CustomHeatmapRender from "./CustomHeatmap/renderer"

/**
 * 用于sdk注册注册的对象
 */
const compRenderMap = {
    "custom-title": CustomTitleRender,
    "custom-countdown": CustomCountdownRender,
    "custom-heatmap": CustomHeatmapRender,
}

if (window) {
    //@ts-ignore
    window.compRenderMap = compRenderMap
}
export default compRenderMap
