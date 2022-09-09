import * as React from "react";
import { Editor } from "amis-editor";
import "./App.css";
import axios from "axios";
import crudTpl from "./tpl/crud.json"; //json文件默认可以在src目录下导入
import { proxy } from "ajax-hook"; //拦截amis内部ajax请求
import { SchemaObject } from "amis/lib/Schema"; //json数据类型
import registerCompoments from "./customComponents/register";

registerCompoments(); //注册自定义组件

interface StateType {
	json: any;
	routeName: string;
	itemName: string;
	preview: boolean;
	historyList: Object[];
	step: number;
	maxHistoryNum: number;
	baseURL: string;
	isCustomStyle: boolean;
	linkDOM: HTMLElement | null;
}

type InputType = React.RefObject<HTMLInputElement>;

class App extends React.Component<any, StateType> {
	baseURLRef: InputType = React.createRef();
	itemNameRef: InputType = React.createRef();
	routeNameRef: InputType = React.createRef();

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
			baseURL:
				window.localStorage.getItem("baseURL") || "http://localhost:3001", //正式开发环境请自行修改
			isCustomStyle:
				window.localStorage.getItem("lowcode_style") === "true" ? true : false,
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
		let { routeName, itemName } = this.state;

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
		let { routeName, itemName } = this.state;
		console.log(this.state.json);
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
		if (!this.itemNameRef.current) return;
		let val = this.itemNameRef.current.value as string;
		this.setState({
			itemName: val,
		});
		window.localStorage.setItem("lowcode_itemName", val);
	};
	//监听路由输入
	inputRouteName = () => {
		if (!this.routeNameRef.current) return;
		let val = this.routeNameRef.current.value as string;
		this.setState({
			routeName: val,
		});
		window.localStorage.setItem("lowcode_routeName", val);
	};
	//根路径
	inputUrlName = () => {
		if (!this.baseURLRef.current) return;
		let val = this.baseURLRef.current.value as string;
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
		this.setState(
			{
				isCustomStyle: !this.state.isCustomStyle,
			},
			() => {
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
					window.localStorage.setItem("lowcode_style", "true");
				} else {
					let head = document.getElementsByTagName("head");
					console.log("head", this.state.isCustomStyle);

					if (head && head[0] && this.state.linkDOM) {
						head[0].removeChild(this.state.linkDOM);
					}

					window.localStorage.setItem("lowcode_style", "false");
				}
			}
		);
	};
	//crud模板
	setTpl = () => {
		let obj = this.changeBaseURLtoDomain(crudTpl) as SchemaObject;
		this.setState({
			json: obj,
		});
		alert("模板生成成功");
	};

	/**
	 * 转为domain, 注： 这里内部是无法拦截axios的请求，所以这里直接对序列化的字符串做替换
	 * 但是这种做法存在很容易出错，所以我们直接拦截ajax请求。
	 */
	changeBaseURLtoDomain = (obj: any) => {
		return obj;
		// let { baseURL } = this.state;
		// if (!baseURL) return;
		// let str = JSON.stringify(obj);
		// let res = str.replace(/\$\{baseURL\}/g, baseURL);
		// return JSON.parse(res);
	};
	//转为${baseURL}
	chengeDomaintoBaseURL = (obj: any) => {
		return obj;
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
							{this.state.isCustomStyle ? "默认样式" : "自定义样式"}
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
