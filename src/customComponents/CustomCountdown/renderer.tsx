import * as React from "react";
import styles from './index.module.css'
import { normalizeApi, RendererProps } from "amis-core";

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
  timer: NodeJS.Timer | null
}

export default class CustomCountdownRenderer extends React.Component<
  MyRendererProps,
  CountDownState
> {
  constructor(props: MyRendererProps) {
    super(props);
    this.state = {
      timer: null,
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
    if (this.props.initFetch) {
      this.getCustomApi();
    }
  }
  setCount(payload: number) {
    this.setState({ count: payload })
  }
  setMinimum(payload: number) {
    this.setState({ minimum: payload })
  }
  setMaximum(payload: number) {
    this.setState({ maximum: payload })
  }
  setStep(payload: number) {
    this.setState({ step: payload })
  }
  setLoop(payload: boolean) {
    this.setState({ isLoop: payload })
  }
  setDel(payload: boolean) {
    this.setState({ isDel: payload })
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

  updateCount() {
    const { isLoop, count, step, minimum, maximum, isDel, timer } = this.state
    let newCount
    if (isDel) {
      newCount = count - step;
      if (newCount < minimum && timer) {
        if (isLoop) {
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
        if (isLoop) {
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
    this.setState({
      timer: setInterval(() => {
        this.updateCount()
      }, 1000)
    })
  }

  componentWillUnmount(): void {
    this.state.timer && clearInterval(this.state.timer);
    this.setState({ timer: null })
  }

  render() {
    return (
      <>
        {
          this.props.$$hidden ? <></> :
            <div className={`${styles['count'] + ' ' + this.state.className}`}>{this.state.count}</div>
        }
      </>
    )
  }
}
