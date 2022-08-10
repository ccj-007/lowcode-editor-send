import React from "react";
import { Renderer, Spinner } from "amis";
import { normalizeApi } from "amis-core";

export const sentenceMap: any = {
	a: "动画",
	b: "漫画",
	c: "游戏",
	d: "文学",
	e: "原创",
	f: "来自网络",
	g: "其他",
	h: "影视",
	i: "诗词",
	j: "网易云",
	k: "哲学",
	l: "抖机灵",
};

export default class CustomTitleRenderer extends React.Component {
	state: any = {
		data: {},
		loading: false,
	};

	componentDidMount() {
		//@ts-ignore
		const { initFetch } = this.props;
		if (initFetch) {
			//@ts-ignore
			this.getCustomApi();
		}
	}

	getCustomApi(val: any) {
		//@ts-ignore
		const { env, api, sentence } = this.props;
		const _api = normalizeApi(api);
		this.setState({ loading: true });
		env
			.fetcher({ ..._api, data: { c: val || sentence } })
			//@ts-ignore
			.then(({ data: any }) => {
				//@ts-ignore
				this.setState({ data: data, loading: false });
			})
			.catch((err: any) => {
				this.setState({ loading: false });
			});
	}

	renderBody() {
		//@ts-ignore
		const { children, body, render } = this.props;

		return React.createElement(
			"div",
			{ className: "yiyan-body" },
			children
				? typeof children === "function"
					? children()
					: children
				: body
				? render("body", body)
				: null
		);
	}

	render() {
		//@ts-ignore
		const { className, showAbout, id } = this.props;
		const {
			hitokoto = "我是自定义组件",
			from = "我是自定义组件",
			from_who = "我是自定义组件",
			type,
		} = this.state.data;
		const about = () => (
			<a className="about" href="https://hitokoto.cn/about">
				关于自定义组件
			</a>
		);

		return (
			<div>
				<div
					className="card"
					style={{
						backgroundImage: `url(https://source.unsplash.com/random/1920x200?x=${id})`,
					}}
				>
					<div className="container">
						<div className="content">{hitokoto}</div>
						<div className="from">
							@{from}-{from_who || "佚名"}
						</div>
						<div className="footer">
							<Spinner show={this.state.loading}></Spinner>
							<div className="reviewer">{sentenceMap[type] || "动画"}</div>
							{showAbout && about()}
						</div>
					</div>
				</div>
				{this.renderBody()}
			</div>
		);
	}
}

//@ts-ignore
Renderer({ type: "custom-title", autoVar: true })(CustomTitleRenderer);
