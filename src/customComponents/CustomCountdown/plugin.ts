/**
 * @description 倒计时组件
 */
import { ActiveEventContext, BaseEventContext, BasePlugin, ChangeEventContext, PluginEvent, getSchemaTpl } from "amis-editor";

export default class CustomCountdownPlugin extends BasePlugin {
	rendererName = "custom-countdown";

	searchKeywords = "倒计时";
	/**
	 * 暂时只支持这个，配置后会开启代码编辑器
	 */
	$schema = "/schemas/UnkownSchema.json";

	/**
	 * 用来配置名称和描述
	 */
	name = "倒计时";
	description = "用于某些时间限制的操作场景";

	/**
	 *  tag，决定会在哪个 tab 下面显示的
	 */
	tags = ["自定义组件"];

	/**
	 * 图标
	 */
	icon = "fas fa-stopwatch-20";

	/**
	 * 拖入组件里面时的初始数据
	 */
	scaffold = {
		type: "custom-countdown",
		api: '/chen/',
		count: 60,
		step: 1,
		isLoop: false,
		initFetch: false,
		minimum: 0,
		maximum: 100,
		isDel: true,
		body: [{ type: "container", body: ["内容区"] }],
	};

	/**
	 * 用来生成预览图的
	 */
	previewSchema = {
		...this.scaffold,
	};

	onActive(e: PluginEvent<ActiveEventContext>) { }

	/**
	 * 面板修改之前的数据
	 */
	beforeUpdate(e: PluginEvent<ChangeEventContext>) { }

	/**
	 * 面板修改之后的数据
	 */
	afterUpdate(e: PluginEvent<ChangeEventContext>) { }

	/**
	 * 右侧面板相关
	 */
	panelTitle = "countdown";

	panelBodyCreator(context: BaseEventContext) {
		return [
			getSchemaTpl("tabs", [
				{
					title: "常规",
					body: [
						getSchemaTpl("input-number", {
							name: "count",
							label: "定义默认倒计时时间",
							placeholder: '请输入数字',
							required: true,
							type: "input-number",
							onChange: (val: number, old: any, picker: any, action: any) => {
								const node = this.manager.store.getNodeById(context.id);
								const component = node?.getComponent() || {};
								component.setCount(val)
							}
						}),
						getSchemaTpl("input-number", {
							type: 'input-number',
							name: 'minimum',
							label: "最小多少暂停",
							onChange: (val: number) => {
								const node = this.manager.store.getNodeById(context.id);
								const component = node?.getComponent() || {};
								component.setMinimum(val)
							}
						}),
						getSchemaTpl("input-number", {
							type: 'input-number',
							name: 'maximum',
							label: "最大多少暂停",
							onChange: (val: number) => {
								const node = this.manager.store.getNodeById(context.id);
								const component = node?.getComponent() || {};
								component.setMaximum(val)
							}
						}),
						getSchemaTpl("input-number", {
							name: "step",
							label: "设置步长",
							type: "input-number",
							onChange: (val: number) => {
								const node = this.manager.store.getNodeById(context.id);
								const component = node?.getComponent() || {};
								component.setStep(val)
							}
						}),
						getSchemaTpl("checkbox", {
							name: "isLoop",
							label: "是否循环",
							type: "checkbox",
							trueValue: true,
							falseValue: false,
							onChange: (val: boolean) => {
								const node = this.manager.store.getNodeById(context.id);
								const component = node?.getComponent() || {};
								component.setLoop(val)
							}
						}),
						getSchemaTpl("checkbox", {
							name: "isDel",
							label: "选中为递减状态，否则为递增",
							type: "checkbox",
							trueValue: true,
							falseValue: false,
							onChange: (val: boolean) => {
								const node = this.manager.store.getNodeById(context.id);
								const component = node?.getComponent() || {};
								component.setDel(val)
							}
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
					body: [getSchemaTpl("className"),
					getSchemaTpl("icon"),
					getSchemaTpl("combo-container"),
					getSchemaTpl("hidden"),
					getSchemaTpl("switchDefaultValue"),
					],
				},
				{
					title: "事件",
					body: [getSchemaTpl("editable", {
						name: "event",
						label: "事件",
					})],
				},
				{
					title: "其他",
					body: [getSchemaTpl("name", {
					})],
				},
			]),
		];
	}
}
