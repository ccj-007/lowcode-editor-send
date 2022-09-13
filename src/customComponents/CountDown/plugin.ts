/**
 * @description 倒计时组件
 */

import { BasePlugin } from "amis-editor";
export const compInfo = {
	afterUpdateData: {},
};
export default class CountDownPlugin extends BasePlugin {
	rendererName = "count-down";

	searchKeywords = "倒计时";

	// 暂时只支持这个，配置后会开启代码编辑器
	$schema = "/schemas/UnkownSchema.json";

	// 用来配置名称和描述
	name = "倒计时";
	description = "用于某些时间限制的操作场景";

	// tag，决定会在哪个 tab 下面显示的
	tags = ["自定义组件"];

	// 图标
	icon = "fas fa-stopwatch-20";

	// 拖入组件里面时的初始数据
	scaffold = {
		type: "count-down",
		body: [{ type: "container", body: ["内容区"] }],
	};

	// 用来生成预览图的
	previewSchema = {
		...this.scaffold,
	};

	onActive(e: any) {
		console.log("onActive", e);
	}

	/**
	 * 面板修改之前的数据
	 */
	beforeUpdate(e: any) {
		console.log("beforeUpdate", e);
	}
	/**
	 * 面板修改之后的数据
	 */
	afterUpdate(e: any) {
		console.log("afterUpdate", e);
		compInfo.afterUpdateData = e;
	}

	// 右侧面板相关
	panelTitle = "countdown";
	panelBody = [
		{
			type: "tabs",
			tabsMode: "line",
			className: "m-t-n-xs",
			contentClassName: "no-border p-l-none p-r-none",
			tabs: [
				{
					title: "常规",
					controls: [
						{
							name: "target",
							label: "定义默认倒计时时间",
							type: "input-number",
						},
					],
				},

				{
					title: "外观",
					controls: [
						
					],
				},
			],
		},
	];
}
