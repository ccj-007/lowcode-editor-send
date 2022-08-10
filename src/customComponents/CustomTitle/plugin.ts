import { BasePlugin, getSchemaTpl } from "amis-editor";

export default class CustomTitlePlugin extends BasePlugin {
	rendererName = "custom-title";

	searchKeywords = "自定义标题";

	// 暂时只支持这个，配置后会开启代码编辑器
	$schema = "/schemas/UnkownSchema.json";

	// 用来配置名称和描述
	name = "自定义标题";
	description = "这是个自定义组件的demo";

	// tag，决定会在哪个 tab 下面显示的
	tags = ["自定义组件"];

	// 图标
	icon = "fa-solid fa-icons";

	// 拖入组件里面时的初始数据
	scaffold = {
		type: "custom-title",
		api: {
			method: "get",
			url: "/yiyan/",
		},
		label: "百度一下,你就知道",
		showAbout: true,
		sentence: "a",
		initFetch: false,
		body: [{ type: "container", body: ["内容区"] }],
	};

	// 用来生成预览图的
	previewSchema = {
		...this.scaffold,
	};
	// 右侧面板相关
	panelTitle = "自定义标题";
	panelBodyCreator(context: { id: any }) {
		return [
			getSchemaTpl("tabs", [
				{
					title: "常规",
					body: [
						getSchemaTpl("switch", {
							name: "showAbout",
							label: "关于自定义标题的",
						}),

						getSchemaTpl("radios", {
							type: "radios",
							label: "句子类型",
							name: "sentence",
							description:
								"这个选项用来演示自定义事件,会在切换类型时刷新一下编辑器里的组件实例内容",
							options: [
								{
									label: "动画",
									value: "a",
								},
								{
									label: "漫画",
									value: "b",
								},
								{
									label: "游戏",
									value: "c",
								},
								{
									label: "文学",
									value: "d",
								},
								{
									label: "原创",
									value: "e",
								},
								{
									label: "来自网络",
									value: "f",
								},
								{
									label: "其他",
									value: "g",
								},
								{
									label: "影视",
									value: "h",
								},
								{
									label: "诗词",
									value: "i",
								},
								{
									label: "网易云",
									value: "j",
								},
								{
									label: "哲学",
									value: "k",
								},
								{
									label: "抖机灵",
									value: "l",
								},
							],
							onChange: (val: any, old: any, picker: any, action: any) => {
								const id = context.id;
								const { manager } = this;
								const { store } = manager;
								const node = store.getNodeById(id);

								//@ts-ignore
								const component = node.getComponent();
								component.getYiyan(val); // renderer中定义的组件内部方法
							},
							inline: false,
							columnsCount: 2,
						}),
					],
				},
				{
					title: "接口",
					body: [
						getSchemaTpl("switch", {
							name: "initFetch",
							label: "初始是否拉取",
						}),
						getSchemaTpl("api", {
							name: "api",
							label: "接口地址",
							description:
								" 接口存在跨域问题，需要后端代理，请在此填写接口地址",
						}),
					],
				},
				{
					title: "外观",
					body: [getSchemaTpl("className")],
				},
			]),
		];
	}
}
