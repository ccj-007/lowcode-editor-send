import React from "react";
import { Editor } from "amis-editor";
import "./App.css";
import axios from "axios";

interface StateType {
	json: any;
	routeName: string;
	itemName: string;
	preview: boolean;
	historyList: Object[];
	step: number;
	maxHistoryNum: number;
	baseURL: string;
	useTestBaseURL: string;
	isLocalTest: boolean;
}

class App extends React.Component<any, StateType> {
	constructor(props: any) {
		super(props);
		this.state = {
			json: {
				type: "page", //确保是页面层级
			},
			routeName: "client-admin", //默认为''
			itemName: "cms2", //默认为''
			preview: false,
			historyList: [],
			step: 0,
			maxHistoryNum: 10,
			baseURL: window.localStorage.getItem("baseURL") || "https://dev.zzss.com", //正式开发使用
			useTestBaseURL: "http://localhost:3001", //本地调试环境切换使用
			isLocalTest: true, //用于本地调试环境，正式开发请设置为false
		};
	}
	componentDidMount() {
		//获取url query
		this.checkQuery();
		setTimeout(() => {
			this.getJSON();
		}, 0);
	}

	getJSON = () => {
		let {
			routeName,
			itemName,
			isLocalTest,
			baseURL,
			useTestBaseURL,
		} = this.state;

		if (!routeName || !itemName) {
			alert("请传入必要参数");
			return;
		}
		let url = isLocalTest ? useTestBaseURL : baseURL;
		//这里要请求对应的路由数据
		axios
			.post(url + "/api/getJSON", {
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

	sendJSON = () => {
		let {
			routeName,
			itemName,
			isLocalTest,
			baseURL,
			useTestBaseURL,
		} = this.state;
		if (this.state.json.type !== "page") {
			alert("请确保在页面层级更新json");
			return;
		}
		if (!routeName || !itemName) {
			alert("请传入必要参数");
			return;
		}
		let obj = this.chengeDomaintoBaseURL(this.state.json);

		let url = isLocalTest ? useTestBaseURL : baseURL;
		axios
			.post(
				url + "/api/setJSON",
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
		if (!e) return;
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
		//@ts-ignore
		let val = this.refs.itemName.value;
		this.setState({
			itemName: val,
		});
	};
	//监听路由输入
	inputRouteName = () => {
		//@ts-ignore
		let val = this.refs.routeName.value;
		this.setState({
			routeName: val,
		});
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

	//根路径
	inputUrlName = () => {
		//@ts-ignore
		let val = this.refs.baseURL.value;
		this.setState(
			{
				baseURL: val,
			},
			() => {
				window.localStorage.setItem("baseURL", this.state.baseURL);
			}
		);
	};

	//转为domain
	changeBaseURLtoDomain = (obj: any) => {
		let { baseURL } = this.state;
		if (!baseURL) return;
		let str = JSON.stringify(obj);
		let res = str.replace(/\$\{baseURL\}/g, baseURL);
		return JSON.parse(res);
	};
	//转为${baseURL}
	chengeDomaintoBaseURL = (obj: any) => {
		let { baseURL } = this.state;
		if (!baseURL) return;
		let str = JSON.stringify(obj);
		let urlReg = new RegExp(baseURL, "g");
		let res = str.replace(urlReg, "${baseURL}");
		return JSON.parse(res);
	};

	render() {
		return (
			<>
				<div className="tabbar">
					<div>
						<span className="ml20">项目名：</span>
						<input
							type="text"
							ref="itemName"
							placeholder={this.state.itemName}
							onChange={() => this.inputItemName()}
						/>
						<span className="ml20">路由名：</span>
						<input
							type="text"
							ref="routeName"
							placeholder={this.state.routeName}
							onChange={() => this.inputRouteName()}
						/>
						<span className="ml20">设置baseURL：</span>
						<input
							type="text"
							ref="baseURL"
							placeholder={this.state.baseURL}
							onChange={() => this.inputUrlName()}
						/>
						<button className="send-btn" onClick={this.getJSON}>
							获取页面
						</button>
					</div>
					<div>
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
					value={JSON.parse(JSON.stringify(this.state.json))}
					onChange={this.handleChange}
					preview={this.state.preview}
				/>
			</>
		);
	}
}

export default App;
