import React from "react";
import { Renderer } from "amis";
import { normalizeApi } from "amis-core";
import styles from './index.module.css'

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

  getYiyan(val: any) {
    console.log('选择的值', val);
    this.setState({
      data: { ...this.state.data, type: val }
    })
  }
  renderBody() {
    return React.createElement(
      "div",
      { className: styles['content'] },
      <div>低代码（Low Code）是一种可视化的应用开发方法，用较少的代码、以较快的速度来交付应用程序，将程序员不想开发的代码做到自动化，称之为低代码。低代码是一组数字技术工具平台，基于图形化拖拽、参数化配置等更为高效的方式，实现快速构建、数据编排、连接生态、中台服务。通过少量代码或不用代码实现数字化转型中的场景应用创新。</div>
    );
  }

  render() {
    //@ts-ignore
    const { id } = this.props;
    const {
      hitokoto: title = "关于低代码",
      type,
    } = this.state.data;

    return (
      <div>
        <div
          className="card"
          style={{
            backgroundImage: `url(https://source.unsplash.com/random/1920x200?x=${id})`,
          }}
        >
          <div className={styles['container']}>
            <div className={styles['title']}>{title}</div>
            <div className="footer">
              <div className={styles['radio']}>涉及的方向:{sentenceMap[type] || "动画"}</div>
            </div>
          </div>
          {this.renderBody()}
        </div>
      </div>
    );
  }
}

//@ts-ignore
Renderer({ type: "custom-title", autoVar: true })(CustomTitleRenderer);
