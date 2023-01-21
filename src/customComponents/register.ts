import { registerEditorPlugin } from "amis-editor";

import CustomTitlePlugin from "./CustomTitle/plugin";
import "./CustomTitle/renderer";
import CustomCountdownPlugin from "./CustomCountdown/plugin";
import "./CustomCountdown/renderer";
import CustomHeatmapPlugin from "./CustomHeatmap/plugin";
import "./CustomHeatmap/renderer";

/**
 * 注册组件入口
 */
const registerCompoments = () => {
	registerEditorPlugin(CustomTitlePlugin);
	registerEditorPlugin(CustomCountdownPlugin);
	registerEditorPlugin(CustomHeatmapPlugin);
};

export default registerCompoments;
