# 背景 (注: 2022.10.19 已更新最新官方版本)

### 你是否在做中后台项目中经常要重复做 crud 的业务逻辑，花费大量时间还时常有 bug 发生，但是现在只要几分钟就能让你快速连通前后端，拖拉拽实现后台业务逻辑。你就问香不香！

# 关于

### 🚀 ✈️ 🚁 基于 amis-editor（React + TS），通过封装 json 数据上报、配置、自定义组件等，实现低代码管理后台实时更新，无需手动写 json 配置。如果你要在 Vue 中使用当然也可以。

## 👍 简单一句话： 你不用敲代码了！！

## ⭐⭐⭐ 觉得不错点个 star 再走 ！⭐⭐⭐

![](https://pic.zzss.com/manager/attach/common/20220629/784994.png)

### 在原框架上实现了哪些功能

1. 支持 url 路由跳转对应的配置页面
2. 支持历史记录修改
3. 支持预览
4. 支持重置
5. 支持配置更新前端 lowcode 页面（不用敲代码喽！！！）
6. 通过路由及项目名配置查询
7. 支持切换环境
8. 编辑器打包 (关闭 sourcemap 和 node 内存溢出问题处理， 15M 体积)
9. 新增 crud 模板
10. 新增自定义 css 样式模板
11. 自定义组件示例，已解决 remark、类型错误导致无法渲染自定义组件的问题

- 自定义组件：
   - 自定义标题组件
   - 倒计时组件

### 修复了哪些问题

1. 修复map文件丢失的问题，默认启动会有警告
2. 在本地调试需要手动刷新，现在支持webpack-devserver-plugin的热更新

### 自定义组件需要注意什么

- 在node_modules/amis/lib/Schema.d.ts里面定义了tab面板配置的类型，你可以根据此完成自定义组件的大部分工作
```js
// src/customComponents/CountDown/plugin.ts
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
							type: "input-number",  //这里的类型需要看源码的类型定义, 根据需要配置
						},
					],
				},
			],
		},
	];
```

# 如何使用

```
  npm i           //安装依赖
  npm run start   //通过devserve启动前端页面
  npm run server  //启动node服务，默认3001端口
  npm run build   //打包（某些情况可能会存在内存溢出问题）

```

# 注意

### 1. 本地调试请在 server 文件夹下定义好文件名，本地调用通过文件名对应路由名。如果需要数据库连接，请定义好项目名和路由名等字段用于查询。json 配置在原来基础上，已经做了一个包裹, 核心数据配置在 json 属性内，为了方便定位以及后期维护扩展。

### 2. 在编辑中极有可能遇到点错导致页面丢失问题，可以做个发布的版本备份功能

```js
{
  "json": {
    "type": "page",
    "title": "Hello world",
    "body": [
    ]
  },
  "routeName": "test2.json",
  "itemName": "cms2"
}
```

# 核心

```js
//src/App.tsx
import * as React from "react";
import { Editor } from "amis-editor";
import "./App.css";
import axios from "axios";
import crudTpl from "./tpl/crud.json"; //json文件默认可以在src目录下导入
import { proxy } from "ajax-hook";  //拦截amis内部ajax请求
import { SchemaObject } from "amis/lib/Schema"; //json数据类型
import { MyRendererPlugin } from "./MyRendererPlugin";
import { registerEditorPlugin } from 'amis-editor';

registerEditorPlugin(MyRendererPlugin); //自定义组件

interface StateType {
  json: any;
  routeName: string;
  itemName: string;
  preview: boolean;
  historyList: Object[];
  step: number;
  maxHistoryNum: number;
  baseURL: string;
  isCustomStyle: boolean
  linkDOM: HTMLElement | null
}

type InputType = React.RefObject<HTMLInputElement>

class App extends React.Component<any, StateType> {
  baseURLRef: InputType = React.createRef()
  itemNameRef: InputType = React.createRef()
  routeNameRef: InputType = React.createRef()

  constructor(props: any) {
    super(props);
    this.state = {
      json: {},
      routeName: window.localStorage.getItem("lowcode_routeName") || "test1", //test1对应server文件夹下的json的文件名（本地调试）
      itemName: window.localStorage.getItem("lowcode_itemName") || "cms2",
      preview: false,
      historyList: [],
      step: 0,
      maxHistoryNum: 10,
      baseURL: window.localStorage.getItem("baseURL") || "http://localhost:3001", //正式开发环境请自行修改
      isCustomStyle: window.localStorage.getItem("lowcode_style") === 'true' ? true : false,
      linkDOM: null,
    };
  }
  componentDidMount() {
    //拦截处理
    proxy({
      onRequest: (config, handler) => {
        // config.headers = headers;  在这里处理通用请求头
        config.url = this.state.baseURL + config.url;
        console.log("config", config);
        handler.next(config);
      },
      onError: (err, handler) => {
        console.log(err.type);
        handler.next(err);
      },
      onResponse: (response, handler) => {
        console.log(response.response);
        handler.next(response);
      },
    });

    //获取url query
    this.checkQuery();
    setTimeout(() => {
      this.getJSON();
    }, 0);
  }

  /**
   * 通过接口获取json对象
   */
  getJSON = () => {
    let {
      routeName,
      itemName,
    } = this.state;

    if (!routeName || !itemName) {
      alert("请传入必要参数");
      return;
    }
    //这里要请求对应的路由数据
    axios
      .post("/api/getJSON", {
        routeName: this.state.routeName,
        itemName: this.state.itemName,
      })
      .then((res) => {
        if (res.data.success === false) {
          alert(res.data.msg);
          return;
        }

        let obj = res.data;
        this.clearJSON();
        let newObj = this.changeBaseURLtoDomain(obj);

        this.setState(
          {
            json: newObj,
            historyList: [...this.state.historyList, newObj],
          },
          () => {
            console.log("获取到最新的JSON", this.state.json);
          }
        );
      })
      .catch((e) => {
        alert("获取后端json失败" + JSON.stringify(e));
      });
  };

  /**
  * 通过接口保存json对象
  */
  sendJSON = () => {
    let {
      routeName,
      itemName,
    } = this.state;
    console.log(this.state.json)
    if (!routeName || !itemName) {
      alert("请传入必要参数");
      return;
    }
    let obj = this.chengeDomaintoBaseURL(this.state.json);

    axios
      .post(
        "/api/setJSON",
        {
          json: obj,
          routeName: this.state.routeName,
          itemName: this.state.itemName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.data.success === false) {
          alert(res.data.msg);
          return;
        }

        if (res && res.data && res.data.json) {
          alert("配置成功");
          let obj = res.data.json;
          this.setState({
            json: obj,
          });
        }
      })
      .catch((e) => {
        alert("存入配置失败" + JSON.stringify(e));
      });
  };

  //监听lowcode的json改变
  handleChange = (e: any) => {
    console.log("更新了");
    this.setState(
      {
        json: e,
        historyList: [...this.state.historyList, e],
        step: this.state.step + 1,
      },
      () => {
        let { historyList, maxHistoryNum } = this.state;
        if (historyList.length > maxHistoryNum) {
          let limitObj = [...historyList].splice(-maxHistoryNum);
          this.setState({
            historyList: limitObj,
            step: this.state.step - 1,
          });
        }
        console.log("change", this.state.historyList);
      }
    );
  };

  //获取query
  checkQuery = () => {
    let itemName = this.getQueryString("itemName");
    let routeName = this.getQueryString("routeName");
    if (itemName && routeName) {
      this.setState({
        itemName,
        routeName,
      });
    }
  };

  // 获取查询字符串
  getQueryString = (name: string) => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    } else {
      return null;
    }
  };

  //监听项目名输入
  inputItemName = () => {
    if (!this.itemNameRef.current) return
    let val = this.itemNameRef.current.value as string
    this.setState({
      itemName: val,
    });
    window.localStorage.setItem("lowcode_itemName", val)
  };
  //监听路由输入
  inputRouteName = () => {
    if (!this.routeNameRef.current) return
    let val = this.routeNameRef.current.value as string
    this.setState({
      routeName: val,
    });
    window.localStorage.setItem("lowcode_routeName", val)
  };
  //根路径
  inputUrlName = () => {
    if (!this.baseURLRef.current) return
    let val = this.baseURLRef.current.value as string
    this.setState(
      {
        baseURL: val,
      },
      () => {
        window.localStorage.setItem("baseURL", this.state.baseURL);
      }
    );
  };

  //开始预览
  startPreview = () => {
    this.setState({
      preview: !this.state.preview,
    });
  };
  //重置
  clearJSON = () => {
    this.setState({
      json: {},
    });
  };

  //上一步
  backHistoryJSON = () => {
    let { step, historyList } = this.state;
    if (step - 1 >= 0) {
      this.setState(
        {
          step: step - 1,
        },
        () => {
          this.setState({
            json: historyList[this.state.step],
          });
        }
      );
    } else {
      alert("您当前没有历史记录");
    }
  };
  //下一步
  goHistoryJSON = () => {
    let { step, historyList } = this.state;
    let curStep = historyList.length - 1;
    if (step < curStep) {
      this.setState(
        {
          step: step + 1,
        },
        () => {
          this.setState({
            json: historyList[this.state.step],
          });
        }
      );
    } else {
      alert("已经是最新!");
    }
  };

  //设置自定义样式
  setStyles = () => {
    this.setState({
      isCustomStyle: !this.state.isCustomStyle
    }, () => {
      if (this.state.isCustomStyle) {
        console.log("head", this.state.isCustomStyle);

        var url = "./styles/index.css";
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", url);
        this.setState({
          linkDOM: link,
        });
        document.getElementsByTagName("head")[0].appendChild(link);
        window.localStorage.setItem("lowcode_style", 'true');
      } else {
        let head = document.getElementsByTagName("head");
        console.log("head", this.state.isCustomStyle);

        if (head && head[0] && this.state.linkDOM) {
          head[0].removeChild(this.state.linkDOM);
        }

        window.localStorage.setItem("lowcode_style", "false");
      }
    })
  };
  //crud模板
  setTpl = () => {
    let obj = this.changeBaseURLtoDomain(crudTpl) as SchemaObject
    this.setState({
      json: obj
    })
    alert("模板生成成功");
  };

  /**
   * 转为domain, 注： 这里内部是无法拦截axios的请求，所以这里直接对序列化的字符串做替换
   * 但是这种做法存在很容易出错，所以我们直接拦截ajax请求。
   */
  changeBaseURLtoDomain = (obj: any) => {
    return obj
    // let { baseURL } = this.state;
    // if (!baseURL) return;
    // let str = JSON.stringify(obj);
    // let res = str.replace(/\$\{baseURL\}/g, baseURL);
    // return JSON.parse(res);
  };
  //转为${baseURL}
  chengeDomaintoBaseURL = (obj: any) => {
    return obj
    // let { baseURL } = this.state;
    // if (!baseURL) return;
    // let str = JSON.stringify(obj);
    // let urlReg = new RegExp(baseURL, "g");
    // let res = str.replace(urlReg, "${baseURL}");
    // return JSON.parse(res);
  };

  render() {
    return (
      <>
        <div className="tabbar">
          <div>
            <span className="ml20">项目名：</span>
            <input
              type="text"
              ref={this.itemNameRef}
              className="input-info"
              placeholder={this.state.itemName}
              onChange={() => this.inputItemName()}
            />
            <span className="ml20">路由名：</span>
            <input
              type="text"
              ref={this.routeNameRef}
              className="input-info"
              placeholder={this.state.routeName}
              onChange={() => this.inputRouteName()}
            />
            <span className="ml20">设置baseURL：</span>
            <input
              type="text"
              ref={this.baseURLRef}
              placeholder={this.state.baseURL}
              onChange={() => this.inputUrlName()}
            />
            <button className="send-btn" onClick={this.getJSON}>
              获取页面
            </button>
          </div>
          <div>
            <button className="send-btn" onClick={this.setStyles}>
              {this.state.isCustomStyle ? '默认样式' : '自定义样式'}
            </button>
            <button className="send-btn" onClick={this.setTpl}>
              crud模板
            </button>
            <button className="send-btn" onClick={this.backHistoryJSON}>
              上一步
            </button>
            <button className="send-btn" onClick={this.goHistoryJSON}>
              下一步
            </button>
            <button className="send-btn" onClick={this.clearJSON}>
              重置
            </button>
            <button className="send-btn" onClick={this.startPreview}>
              {this.state.preview ? "编辑" : "预览"}
            </button>
            <button className="send-btn" onClick={this.sendJSON}>
              点击配置生效
            </button>
          </div>
        </div>
        <Editor
          value={this.state.json}
          onChange={this.handleChange}
          preview={this.state.preview}
        />
      </>
    );
  }
}

export default App;

```

**调整：** 在编辑器中你无法拦截到内部 amis 的 axios 请求实例，所以在原来的处理中域名是直接 json 解析，不方便处理，现在通过 ajax-hooks 库直接拦截 ajax 请求，可以根据业务配置你的请求头、域名等。

```sh
 npm i ajax-hook
```

```js
import { proxy } from "ajax-hook";

//拦截处理
proxy({
	onRequest: (config, handler) => {
		// config.headers = headers;  在这里处理通用请求头
		config.url = this.state.baseURL + config.url; //处理url
		handler.next(config);
	},
	onError: (err, handler) => {
		console.log(err.type);
		handler.next(err);
	},
	onResponse: (response, handler) => {
		console.log(response.response);
		handler.next(response);
	},
});
```

# 后端服务

```js
//server/app.js  用于调试服务端
const http = require("http");
const fs = require("fs");
const path = require("path");

/**
 * 失败数据模型
 * @param {*} msg 消息
 */
function errModel(msg) {
	let obj = {
		success: false,
		msg,
	};
	return JSON.stringify(obj);
}

http
	.createServer(function (req, res) {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");
		res.setHeader("Content-Type", "application/json;");
		res.setHeader(
			"Access-Control-Allow-Methods",
			"DELETE,PUT,POST,GET,OPTIONS"
		);
		console.log(req.url);
		console.log(req.method);
		if (req.method == "OPTIONS") {
			res.writeHead(200, {
				"Content-Type": "text/plain",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers":
					"Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild, sessionToken",
				"Access-Control-Allow-Methods": "PUT, POST, GET, DELETE, OPTIONS",
			});
			res.end("");
		}

		if (req.method === "POST" && req.url === "/api/setJSON") {
			let item = "";
			// 读取每次发送的数据
			req.on("data", function (chunk) {
				item += chunk.toString();
			});
			// 数据发送完成
			req.on("end", function () {
				let items = JSON.parse(item);
				if (items.routeName && items.itemName) {
					let file = path.join(__dirname, `${items.routeName}.json`);
					// json文件需要存入路径
					fs.writeFileSync(file, item);
					//将数据返回到客户端
					res.write(item);
					res.end();
				} else {
					res.write(errModel("文件配置失败, 检查路由或项目名是否正确"));
					res.end();
				}
			});
		}

		//本地模拟直接用client-admin.json
		if (req.method === "POST" && req.url === "/api/getJSON") {
			let item = "";
			// 读取每次发送的数据
			req.on("data", function (chunk) {
				item += chunk.toString();
			});
			// 数据发送完成
			req.on("end", function () {
				let items = JSON.parse(item);

				if (items.routeName && items.itemName) {
					let file = path.join(__dirname, `${items.routeName}.json`);

					fs.readFile(file, "utf-8", function (err, data) {
						if (err) {
							console.log(err);
							res.write(errModel("请检查路由是否正确"));
							res.end();
						} else {
							let obj = JSON.parse(data);
							res.write(JSON.stringify(obj.json));
							res.end();
						}
					});
				} else {
					res.write(errModel("请检查路由或项目名是否正确"));
					res.end();
				}
			});
		}
	})
	.listen(3001); // 监听的端口
```

## 如何在 Vue 的前端项目中使用 ？

### 1. 在静态目录 public 中的 index.html 引入对应的 sdk，sdk 官网有可以自行下载

```js
  <link rel="stylesheet" href="./lowcode/amis/antd.css" />
  <link rel="stylesheet" href="./lowcode/amis/iconfont.css" />
  <script src="./lowcode/amis/sdk.js"></script>
```

### 2. 在路由允许的情况下调用封装的方法，即可渲染 lowcode 页面

```js
import Vue from "vue";
import defaultConfig from "./config";
import axios from "axios";

var timer = null;

let defaultOptions = {
	method: "local", // 'http' | 'local' 通过接口返回或者本地静态文件夹获取
	routeName: "", //输入路由名（必填）
	itemName: "", //项目名（必填）
};
let newOptions; //修改后的配置
/**
 * 在路由允许的情况下调用可生成对应lowcode页面
 * @param {DOM} DOM
 * @param {Object} options
 */
export const getLowcodePage = (DOM, options = {}) => {
	newOptions = Object.assign(defaultOptions, options);
	let { routeName } = newOptions;
	if (!DOM || !routeName) {
		throw new Error("DOM or routeName is no exist");
	}

	//handle first render error
	const check = (routeName) => {
		let dom = document.querySelector(DOM);
		if (dom) {
			getJsonFs(routeName);
			if (!timer) {
				clearTimeout(timer);
			}
		} else {
			timer = setTimeout(() => {
				check(routeName);
			}, 0);
		}
	};

	//get json
	const getJsonFs = (routeName) => {
		if (newOptions.method === "local") {
			Vue.http
				.get(`lowcode/pages/${routeName}.json`, {}, { emulateJSON: true })
				.then((res) => {
					let obj = JSON.parse(res.bodyText);
					if (obj) {
						startAmis(obj);
					}
				})
				.catch((error) => {
					console.log("error", error);
				});
		}

		if (newOptions.method === "http") {
			//正式项目需要通过post请求传入对象{routeName, itemName}
			//目前调试使用，注意某些跨域情况在vue.config.js中做跨域代理
			axios
				.post(
					"/api/getJSON",
					{
						routeName: options.routeName,
						itemName: options.itemName,
					},
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				)
				.then((res) => {
					let { data } = res;
					startAmis(data);
					console.log("http", data);
				})
				.catch((e) => {
					alert("获取后端json失败" + JSON.stringify(e));
				});
		}
	};

	//amis render
	const startAmis = (jsonObj) => {
		console.log("jsonObj", jsonObj);
		let amis = window.amisRequire("amis/embed");
		amis.embed(
			DOM,
			jsonObj,
			{
				data: {
					baseUrl: process.env.VUE_APP_API_BASE_URL,
				},
			},
			defaultConfig
		);
	};

	//entrance
	check(routeName);
};
```

### 3. 做跨域代理

```js
  //vue.config.js
  devServer: {
    proxy: {
      //测试lowcode使用
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  },
```

### 4. 开始调用方法

```js
<template>
  <div id='main-lowcode'>
    <div id="content-lowcode">
    </div>
  </div>

</template>

<script>
import { getLowcodePage } from '@/lowcode/index'

export default {
  data() {
    return {}
  },
  created() {},
  mounted() {
    // 获取lowcode页面
    getLowcodePage('#content-lowcode', {
      method: 'http', //'http'代表接口请求，注意如果是'local',请在public文件夹中放入json配置文件，即可本地获取json页面
      routeName: 'client-admin',
      itemName: 'cms2'
    })
  }
}
</script>

<style lang="less" scoped>

</style>
```

# 总结

### 实现以上基本能快速将中后台系统集成进低代码页面, 甚至单独搭建一个低代码管理后台。 可谓是 crud 的解决办法的神器。

---

### 问题 1: 如果在集成中的样式需要做到统一？

可以在 amis 包的 amis.css 修改，建议根据原有中后台系统配色修改，独立引入 html。在编辑器中针对不同的中后台项目，已经封装了可以通过按钮预览对应的样式的页面，在/public/styles 可以配置修改。

### 问题 2: 如何自定义组件？

如果存在定制化的组件，也是可以通过自定义组件的方式引入，在 src/customComponents 里面已经定义了一个示例，后期会新增更多自定义组件。。

### 问题 3： 如何处理权限？

可以通过 JSON 的解析，找到对应的 disabled 字段，做对应的修改即可

### 问题 4： 哪里找到大量的模板？

https://aisuda.bce.baidu.com/amis/examples/index

### 问题 5：真正如何托拉拽实现，前端不用敲代码！

在实践中不能敲代码，那么真正用编辑器实现一个 crud 的功能，会遇到一些坑，如对应的返回的数据格式可以有适配器转换，查询功能和实际列表展示，一定要注意映射字段的处理。在批量处理中一定要后端必须传入 id。列表中的一些字段其实也可以用映射，按需展示，修改等。
