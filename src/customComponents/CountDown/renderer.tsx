import React from "react";
import { Renderer, RendererProps } from "amis";

export interface MyRendererProps extends RendererProps {}
interface CountDownState {
	count: number;
}

let timer: null | NodeJS.Timeout = null;

export default class CountDownRenderer extends React.Component<
	MyRendererProps,
	CountDownState
> {
	constructor(props: MyRendererProps) {
		super(props);

		this.state = {
			count: 60,
		};
	}

	componentDidMount() {
		timer = setInterval(() => {
			let newCount = this.state.count - 1;
			if (newCount < 0 && timer) {
				clearInterval(timer);
			} else {
				this.setState({ count: newCount });
			}
		}, 1000);
	}

	componentDidUpdate(nextProps: any) {
		console.log("nextProps", nextProps);
	}

	render() {
		const { className } = this.props;

		return <div className={className}>{this.state.count}</div>;
	}
}

//@ts-ignore
Renderer({ type: "count-down", autoVar: true })(CountDownRenderer);
