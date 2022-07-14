# 背景 (注: 2022.07.14 已更新最新官方版本)

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

# 如何使用

```
  npm i           //安装依赖
  npm run start   //通过devserve启动前端页面
  npm run server  //启动node服务，默认3001端口
  npm run build   //打包（某些情况可能会存在内存溢出问题）

```

# 注意

### 1. 本地调试请在 server 文件夹下定义好文件名，本地调用通过文件名对应路由名。如果需要数据库连接，请定义好项目名和路由名。json 配置在原来基础上，已经做了一个包裹, 核心数据配置在 json 属性内，为了方便定位以及后期维护扩展。

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
import React from 'react';
import { Editor } from 'amis-editor';
import './App.css'
import axios from 'axios'

interface StateType {
  json: any
  routeName: string
  itemName: string
  preview: boolean
  historyList: any[]
  step: number
  maxHistoryNum: number
  baseURL: string
  useTestBaseURL: string
  isLocalTest: boolean
}

class App extends React.Component<any, StateType> {
  constructor(props: any) {
    super(props)
    this.state = {
      json: {
        type: "page"  //确保是页面层级
      },
      routeName: 'client-admin',   //默认为''
      itemName: "cms2", //默认为''
      preview: false,
      historyList: [],
      step: 0,
      maxHistoryNum: 10,
      baseURL: window.localStorage.getItem('baseURL') || 'https://dev.zzss.com', //正式开发使用
      useTestBaseURL: 'http://localhost:3001', //本地调试环境切换使用
      isLocalTest: true,  //用于本地调试环境，正式开发请设置为false
    }
  }
  componentDidMount() {
    //获取url query
    this.checkQuery()
    setTimeout(() => {
      this.getJSON()
    }, 0)
  }

  getJSON = () => {
    let { routeName, itemName, isLocalTest, baseURL, useTestBaseURL, } = this.state

    if (!routeName || !itemName) {
      alert('请传入必要参数')
      return
    }
    let url = isLocalTest ? useTestBaseURL : baseURL
    //这里要请求对应的路由数据
    axios.post(url + '/api/getJSON',
      {
        routeName: this.state.routeName,
        itemName: this.state.itemName
      },
    ).then((res: any) => {
      if (res.data.success === false) {
        alert(res.data.msg)
        return
      }

      let obj = res.data
      this.clearJSON()
      let newObj = this.changeBaseURLtoDomain(obj)

      this.setState({
        json: newObj,
        historyList: [...this.state.historyList, newObj],
      }, () => {
        console.log("获取到最新的JSON", this.state.json);
      })
    }).catch((e) => {
      alert("获取后端json失败" + JSON.stringify(e))
    })
  }

  sendJSON = () => {
    let { routeName, itemName, isLocalTest, baseURL, useTestBaseURL } = this.state
    if (this.state.json.type !== 'page') {
      alert('请确保在页面层级更新json')
      return
    }
    if (!routeName || !itemName) {
      alert('请传入必要参数')
      return
    }
    let obj = this.chengeDomaintoBaseURL(this.state.json)

    let url = isLocalTest ? useTestBaseURL : baseURL
    axios.post(url + '/api/setJSON', {
      json: obj,
      routeName: this.state.routeName,
      itemName: this.state.itemName
    },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then((res) => {
      if (res.data.success === false) {
        alert(res.data.msg)
        return
      }

      if (res && res.data && res.data.json) {
        alert("配置成功")
        let obj = res.data.json
        this.setState({
          json: obj
        })
      }
    }).catch((e) => {
      alert("存入配置失败" + JSON.stringify(e))
    })
  }
  //监听lowcode的json改变
  handleChange = (e: any) => {
    if (!e) return
    this.setState({
      json: e,
      historyList: [...this.state.historyList, e],
      step: this.state.step + 1
    }, () => {
      let { historyList, maxHistoryNum } = this.state
      if (historyList.length > maxHistoryNum) {
        let limitObj = [...historyList].splice(-maxHistoryNum)
        this.setState({
          historyList: limitObj,
          step: this.state.step - 1
        })
      }
      console.log("change", this.state.historyList);
    })
  }
  //获取query
  checkQuery = () => {
    let itemName = this.getQueryString('itemName')
    let routeName = this.getQueryString('routeName')
    if (itemName && routeName) {
      this.setState({
        itemName,
        routeName
      })
    }
  }
  // 获取查询字符串
  getQueryString = (name: string) => {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    } else {
      return null
    };
  }
  //监听项目名输入
  inputItemName = () => {
    //@ts-ignore
    let val = this.refs.itemName.value;
    this.setState({
      itemName: val
    })
  }
  //监听路由输入
  inputRouteName = () => {
    //@ts-ignore
    let val = this.refs.routeName.value;
    this.setState({
      routeName: val
    })
  }
  //开始预览
  startPreview = () => {
    this.setState({
      preview: !this.state.preview
    })
  }
  //重置
  clearJSON = () => {
    this.setState({
      json: {}
    })
  }
  //上一步
  backHistoryJSON = () => {
    let { step, historyList } = this.state
    if (step - 1 >= 0) {
      this.setState({
        step: step - 1,
      }, () => {
        this.setState({
          json: historyList[this.state.step]
        })
      })
    } else {
      alert('您当前没有历史记录')
    }
  }
  //下一步
  goHistoryJSON = () => {
    let { step, historyList } = this.state
    let curStep = historyList.length - 1
    if (step < curStep) {
      this.setState({
        step: step + 1,
      }, () => {
        this.setState({
          json: historyList[this.state.step]
        })
      })
    } else {
      alert('已经是最新!')
    }
  }

  //根路径
  inputUrlName = () => {
    //@ts-ignore
    let val = this.refs.baseURL.value;
    this.setState({
      baseURL: val,
    }, () => {
      window.localStorage.setItem('baseURL', this.state.baseURL)
    })
  }

  //转为domain
  changeBaseURLtoDomain = (obj: any) => {
    let { baseURL } = this.state
    if (!baseURL) return
    let str = JSON.stringify(obj)
    let res = str.replace(/\$\{baseURL\}/g, baseURL)
    return JSON.parse(res)
  }
  //转为${baseURL}
  chengeDomaintoBaseURL = (obj: any) => {
    let { baseURL } = this.state
    if (!baseURL) return
    let str = JSON.stringify(obj)
    let urlReg = new RegExp(baseURL, 'g')
    let res = str.replace(urlReg, '${baseURL}')
    return JSON.parse(res)
  }

  render() {
    return (
      <>
        <div className='tabbar'>
          <div>
            <span className='ml20'>项目名：</span><input type="text" ref='itemName' placeholder={this.state.itemName} onChange={() => this.inputItemName()} />
            <span className='ml20'>路由名：</span><input type="text" ref='routeName' placeholder={this.state.routeName} onChange={() => this.inputRouteName()} />
            <span className='ml20'>设置baseURL：</span><input type="text" ref='baseURL' placeholder={this.state.baseURL} onChange={() => this.inputUrlName()} />
            <button className='send-btn' onClick={this.getJSON}>获取页面</button>
          </div>
          <div>
            <button className='send-btn' onClick={this.backHistoryJSON}>上一步</button>
            <button className='send-btn' onClick={this.goHistoryJSON}>下一步</button>
            <button className='send-btn' onClick={this.clearJSON}>重置</button>
            <button className='send-btn' onClick={this.startPreview}>{this.state.preview ? '编辑' : '预览'}</button>
            <button className='send-btn' onClick={this.sendJSON}>点击配置生效</button>
          </div>
        </div>
        <Editor
          value={JSON.parse(JSON.stringify(this.state.json))}
          onChange={this.handleChange}
          preview={this.state.preview}
        />
      </>
    )
  }
}

export default App;


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

### 问题: 如果在集成中的样式需要做到统一，可以在 amis 包的 amis.css 修改，建议根据原有中后台系统配色修改，独立引入 html。如果存在高度定制化的组件，也是可以通过自定义组件的方式引入，同时配合编辑器。但要注意 amis 不太适合高度定制化、交互复杂的场景，这点要特别注意。
