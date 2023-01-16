import React from "react";
import { Renderer, RendererProps } from "amis";
import styles from './index.module.css'
import { normalizeApi } from "amis-core";
import Heatmap from 'heatmap.js'

export interface MyRendererProps extends RendererProps { }
interface HeatMapState {
  compInfo: any
  data: any
  json: any
  className: string,
  heatmapInstance: any
  preview: boolean
}

let preCompInfo: any = null

export default class HeatMapRenderer extends React.Component <
  MyRendererProps,
  HeatMapState
> {
  heatDOM: React.RefObject<HTMLDivElement>  = React.createRef()
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
    if(this.props.initFetch) {
      // this.getCustomApi();
    }
    this.getInstance()
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
    var heatmapInstance = Heatmap.create({
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
      let json = {radius: 4}
      if(this.state.json) {
        eval('json =' + this.state.json)
      }
      let r = json && json.radius ? json.radius : 70
      
			var points = [];
			var max = 0;
			var width = 300;
			var height = 300;
			var len = 200;
      
			while (len--) {
			  var value = Math.floor(Math.random()* 100);
        var radius = Math.floor(Math.random()* r);
			  max = Math.max(max, value);
			  var point = {//这里可以自定义
          x: Math.floor(Math.random()* width),
          y: Math.floor(Math.random()* height),
          value: value,
          //@ts-ignore
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

  shouldComponentUpdate(nextProps: any, nextState: any) {
    if((preCompInfo) !== (nextProps)) {
      console.log("更新的组件信息", nextProps.json_heatmap);
      preCompInfo = nextProps
      this.setState({
        compInfo: nextProps,
        json: nextProps.json_heatmap ,
        preview: !!nextProps.preview ,
        className: nextProps.className || '',
      }, () => {
        this.renderHeatMap()
      })
      return true
    }
    if((this.state) !== (nextState)) {
      return true
    }
    return false
  }
  render() {
    return (
      <div>
        {
           <div className={`${this.state.className}`} ref={this.heatDOM}  style={{width: '300px', height: '300px', display:  this.state.preview ? 'block' : 'none'}} >
          </div> 
        }
      </div>  
    )
  }
}

//@ts-ignore
Renderer({ type: "heat-map", autoVar: true })(HeatMapRenderer);
