import { registerEditorPlugin } from "amis-editor";

import CustomTitlePlugin from "./CustomTitle/plugin";
import "./CustomTitle/renderer";
import CountDownPlugin from "./CountDown/plugin";
import "./CountDown/renderer";

/**
 * 注册组件入口
 */
const registerCompoments = () => {
	registerEditorPlugin(CustomTitlePlugin);
	registerEditorPlugin(CountDownPlugin);
};

export default registerCompoments;
