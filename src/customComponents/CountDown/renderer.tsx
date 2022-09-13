import React from "react";
import { Renderer, RendererProps } from "amis";
import styles from './index.module.css'

export interface MyRendererProps extends RendererProps { }
interface CountDownState {
  count: number;
}

let timer: null | NodeJS.Timeout = null;
let preCount: any = null

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
    this.startCountTime()
  }

  componentDidUpdate(nextProps: any) {
    if (nextProps.target && preCount !== nextProps.target) {
      preCount = nextProps.target
      this.setState(
        { count: Number(nextProps.target) }
      )
    }
  }

  startCountTime() {
    timer = setInterval(() => {
      let newCount = this.state.count - 1;
      if (newCount < 0 && timer) {
        clearInterval(timer);
      } else {
        this.setState({ count: newCount });
      }
    }, 1000);
  }

  render() {

    return <div className={styles['count']}>{this.state.count}</div>;
  }
}

//@ts-ignore
Renderer({ type: "count-down", autoVar: true })(CountDownRenderer);
