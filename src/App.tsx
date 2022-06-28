import React from 'react';
import { Editor } from 'amis-editor';
import './App.css'
import axios from 'axios'

interface StateType {
  json: any,
  routeName: string,
  itemName: string,
  preview: boolean
  historyList: any[],
  step: number
  maxHistoryNum: number
}

class App extends React.Component<any, StateType> {
  constructor(props: any) {
    super(props)
    this.state = {
      json: {
        type: "page"  //确保是页面层级
      },
      routeName: 'client-admin',   //默认为''
      itemName: "cms2", //默认为''
      preview: false,
      historyList: [],
      step: 0,   //操作一次step + 1， -1初始状态
      maxHistoryNum: 5
    }
  }
  componentDidMount() {
    axios.get('http://localhost:3001/api/getJSON').then((res: any) => {
      if (!res || !res.data) return
      let obj = res.data
      this.setState({
        json: obj,
        historyList: [...this.state.historyList, obj],
      }, () => {
        console.log(this.state.json);
      })
    }).catch((e) => {
      alert("获取后端json失败" + JSON.stringify(e))
    })
  }
  sendJSON = () => {
    if (this.state.json.type !== 'page') {
      alert('请确保在页面层级更新json')
      return
    }
    if (!this.state.routeName || !this.state.itemName) {
      alert('请传入必要参数')
      return
    }
    axios.post('http://localhost:3001/api/setJSON', {
      json: this.state.json,
      routeName: this.state.routeName,
      itemName: this.state.itemName
    },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then((res) => {
      if (res && res.data && res.data.json) {
        alert("配置成功")
        this.setState({
          json: res.data.json
        })
      }
    }).catch((e) => {
      alert("存入配置失败" + JSON.stringify(e))
    })
  }
  //监听lowcode的json改变
  handleChange = (e: any) => {
    if (!e) return
    this.setState({
      json: e,
      historyList: [...this.state.historyList, e],
      step: this.state.step + 1
    }, () => {
      let { historyList, maxHistoryNum } = this.state
      if (historyList.length > maxHistoryNum) {
        let limitObj = [...historyList].splice(-maxHistoryNum)
        this.setState({
          historyList: limitObj,
          step: this.state.step - 1
        })
      }
      console.log("change", this.state.historyList);
    })

  }
  inputItemName = () => {
    //@ts-ignore
    let val = this.refs.itemName.value;
    this.setState({
      itemName: val
    })
  }
  inputRouteName = () => {
    //@ts-ignore
    let val = this.refs.routeName.value;
    this.setState({
      routeName: val
    })
  }
  //开始预览
  startPreview = () => {
    this.setState({
      preview: !this.state.preview
    })
  }
  //重置
  clearJSON = () => {
    this.setState({
      json: {}
    })
  }
  //上一步
  backHistoryJSON = () => {
    let { step, historyList } = this.state
    if (step - 1 >= 0) {
      this.setState({
        step: step - 1,
      }, () => {
        this.setState({
          json: historyList[this.state.step]
        })
      })
    } else {
      alert('您当前没有历史记录')
    }
  }
  //下一步
  goHistoryJSON = () => {
    let { step, historyList } = this.state
    let curStep = historyList.length - 1
    if (step < curStep) {
      this.setState({
        step: step + 1,
      }, () => {
        this.setState({
          json: historyList[this.state.step]
        })
      })
    } else {
      alert('已经是最新!')
    }
  }

  render() {
    return (
      <>
        <div className='tabbar'>
          <div>
            <span className='ml20 mr20'>
              <span className='mr20'>当前项目名： {this.state.itemName}  </span> <span>当前路由： {this.state.routeName}</span>
            </span>
            <span>项目名：</span><input type="text" ref='itemName' placeholder={'请输入有效的项目名'} className='mr20' onChange={() => this.inputItemName()} />
            <span>路由名：</span><input type="text" ref='RouteName' placeholder={'输入项目需要的路由'} onChange={() => this.inputRouteName()} />
          </div>
          <div>
            <button className='send-btn' onClick={this.backHistoryJSON}>上一步</button>
            <button className='send-btn' onClick={this.goHistoryJSON}>下一步</button>
            <button className='send-btn' onClick={this.clearJSON}>重置</button>
            <button className='send-btn' onClick={this.startPreview}>{this.state.preview ? '编辑' : '预览'}</button>
            <button className='send-btn' onClick={this.sendJSON}>点击配置生效</button>
          </div>
        </div>
        <Editor
          value={JSON.parse(JSON.stringify(this.state.json))}
          onChange={this.handleChange}
          preview={this.state.preview}
        />
      </>
    )
  }
}

export default App;
