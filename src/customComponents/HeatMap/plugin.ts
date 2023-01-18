/**
 * @description 倒计时组件
 */

import { BasePlugin,  getSchemaTpl } from "amis-editor";

export default class HeatMapPlugin extends BasePlugin {
	rendererName = "heat-map";

	searchKeywords = "echarts图表";

	// 暂时只支持这个，配置后会开启代码编辑器
	$schema = "/schemas/UnkownSchema.json";

	// 用来配置名称和描述
	name = "热力图";
	description = "用于某些时间限制的操作场景";

	// tag，决定会在哪个 tab 下面显示的
	tags = ["自定义组件"];

	// 图标
	icon = "fas fa-hotdog";

	// 拖入组件里面时的初始数据
	scaffold = {
		type: "heat-map",
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
	}

	// 右侧面板相关
	panelTitle = "热力图";
  
  panelBodyCreator(context: any) {
    let panelConfig = getSchemaTpl("tabs", [
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
    ])
    let panelBody = [
      {
        title: "常规",
        controls: [
          {
            name: "preview",
            label: "是否预览",
            type: "checkbox",  
          },
          {
            name: "json_heatmap",
            label: "热力图的json配置",
            type: "json-editor",
            onChange: (e: any) => {
              const id = context.id;
              const { manager } = this;
              const { store } = manager;
              const node = store.getNodeById(id);
              console.log(node, e);
              // const component = node.getComponent();
              // component.getCustomApi(val);
            }  
          },
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
    ]
    panelConfig.tabs.unshift(...panelBody)
		return [
			panelConfig
		]
	}
}
