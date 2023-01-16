import React from "react";
import { Renderer, RendererProps } from "amis";
import styles from './index.module.css'
import { normalizeApi } from "amis-core";

export interface MyRendererProps extends RendererProps { }
interface CountDownState {
  count: number;
  isLoop: boolean
  compInfo: any
  step: number
  className: string
  data: any
  minimum: number
  maximum: number
  isDel: boolean
}

let timer: null | NodeJS.Timeout = null;
let preCompInfo: null = null 

export default class CountDownRenderer extends React.Component <
  MyRendererProps,
  CountDownState
> {
  constructor(props: MyRendererProps) {
    super(props);
    this.state = {
      compInfo: null,
      count: 60,
      isLoop: false,
      step: 1,
      className: '',
      data: null,
      minimum: 0,
      maximum: 100,
      isDel: true,
    }
  }

  componentDidMount() {
    this.startCountTime()
    if(this.props.initFetch) {
      this.getCustomApi();
    }
  }

  getCustomApi(val?: any) {
    const { env, api, sentence } = this.props;
    const _api = normalizeApi(api);
    env.fetcher({ ..._api, data: { c: val || sentence } })
      .then(({ data: any }) => {
        //@ts-ignore
        this.setState({ data: data });
      })
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    if((preCompInfo) !== (nextProps)) {
      console.log("更新的组件信息", nextProps);
      preCompInfo = nextProps
      this.setState({
        compInfo: nextProps,
        count: nextProps.count || 60,
        isLoop: !!nextProps.isLoop,
        minimum: nextProps.minimum || 0,
        maximum: nextProps.maximum || 100,
        step: nextProps.step || 1,
        className: nextProps.className || '',
        isDel: !!nextProps.isDel,
      })
      
      return true
    }
    if((this.state) !== (nextState)) {
      return true
    }
    return false
  }

  updateCount() {
    const {isLoop, count, step, minimum, maximum, isDel} = this.state
    let newCount 
    if(isDel) {
      newCount = count - step;
      if (newCount < minimum && timer) {
        if(isLoop) {
          this.setState({ count: this.props.count });
        } else {
          clearInterval(timer);
        }
      } else {
        this.setState({ count: newCount });
      }
    } else {
      newCount = count + step;
      if (newCount > maximum && timer) {
        if(isLoop) {
          this.setState({ count: 0 });
        } else {
          clearInterval(timer);
        }
      } else {
        this.setState({ count: newCount });
      }
    }
  }

  startCountTime() {
    timer = setInterval(() => {
        this.updateCount()
    }, 1000);
  }

  render() {
    return (
      this.props.$$hidden ? <></> :
      <div className={`${styles['count'] + ' ' + this.state.className}`}>{this.state.count}</div>
    )
  }
}

//@ts-ignore
Renderer({ type: "count-down", autoVar: true })(CountDownRenderer);
