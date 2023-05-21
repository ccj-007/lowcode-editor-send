import { registerEditorPlugin } from "amis-editor"
import { Renderer } from "amis-core"
import CustomTitlePlugin from "./CustomTitle/plugin"
import CustomTitleRender from "./CustomTitle/renderer"
import CustomCountdownPlugin from "./CustomCountdown/plugin"
import CustomCountdownRender from "./CustomCountdown/renderer"
import CustomHeatmapPlugin from "./CustomHeatmap/plugin"
import CustomHeatmapRender from "./CustomHeatmap/renderer"

/**
 * 注册组件入口
 */
const registerCompoments = () => {
    //@ts-ignore
    Renderer({ type: "custom-countdown", autoVar: true })(CustomCountdownRender)
    //@ts-ignore
    Renderer({ type: "custom-heatmap", autoVar: true })(CustomHeatmapRender)
    //@ts-ignore
    Renderer({ type: "custom-title", autoVar: true })(CustomTitleRender)

    registerEditorPlugin(CustomTitlePlugin)
    registerEditorPlugin(CustomCountdownPlugin)
    registerEditorPlugin(CustomHeatmapPlugin)
}

export default registerCompoments
