import * as React from "react";
import { normalizeApi, RendererProps } from "amis-core";
import Heatmap from 'heatmap.js'
import { JsonSchema } from "amis/lib/renderers/Json";

export interface MyRendererProps extends RendererProps { }
interface HeatMapState {
  compInfo: any
  data: any
  json: any
  className: string,
  heatmapInstance: any
  preview: boolean
}

export default class CustomHeatmapRenderer extends React.Component<
  MyRendererProps,
  HeatMapState
> {
  heatDOM: React.RefObject<HTMLDivElement> = React.createRef()
  constructor(props: MyRendererProps) {
    super(props);
    this.state = {
      compInfo: null,
      data: null,
      json: null,
      className: '',
      heatmapInstance: null,
      preview: true
    }
  }

  componentDidMount() {
    if (this.props.initFetch) {
      // this.getCustomApi();
    }
    this.getInstance()
  }
  setPreview(payload: boolean) {
    this.setState({ preview: payload })
  }
  setJSON(payload: JsonSchema) {
    this.setState({ json: payload })
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
  getInstance = () => {
    if (this.state.heatmapInstance) return
    let heatmapInstance = Heatmap.create({
      //@ts-ignore
      container: this.heatDOM.current
    });
    this.setState({
      heatmapInstance
    }, () => {
      this.renderHeatMap()
    })
  }
  renderHeatMap() {
    let json = { radius: 4 }
    if (this.state.json) {
      eval('json =' + this.state.json)
    }
    let r = json && json.radius ? json.radius : 70

    var points = [];
    var max = 0;
    var width = 300;
    var height = 300;
    var len = 200;

    while (len--) {
      var value = Math.floor(Math.random() * 100);
      var radius = Math.floor(Math.random() * r);
      max = Math.max(max, value);
      var point = {//这里可以自定义
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
        value: value,
        radius: radius
      };
      points.push(point);
    }
    var data = {
      max: max,//所有数据中的最大值
      data: points//最终要展示的数据
    };
    //@ts-ignore
    this.state.heatmapInstance.setData(data);
  }
  render() {
    return (
      <div className={`${this.state.className}`} ref={this.heatDOM} style={{ width: '300px', height: '300px', display: this.state.preview ? 'block' : 'none' }}  >
      </div>
    )
  }
}


