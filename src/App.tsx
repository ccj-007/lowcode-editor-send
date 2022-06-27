import React from 'react';
import { Editor } from 'amis-editor';
import './App.css'
import axios from 'axios'

class App extends React.Component {
  state = {
    json: {
      type: "page"  //确保是页面层级
    },
    routeName: 'default',
    pathName: "client-admin"
  }
  constructor(props: any) {
    super(props)
  }
  componentDidMount() {
    axios.get('http://localhost:3001/api/getJSON').then((res: any) => {
      if (!res || !res.data) return
      let obj = res.data
      this.setState({
        json: obj
      }, () => {
        console.log(this.state.json);
      })
    })
  }
  sendJSON = () => {
    if (this.state.json.type !== 'page') {
      alert('请确保在页面层级更新json')
      return
    }
    axios.post('http://localhost:3001/api/setJSON', {
      json: this.state.json,
      routeName: this.state.routeName,
      pathName: this.state.pathName
    },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then((res) => {
      if (res && res.data && res.data.json) {
        this.setState({
          json: res.data.json
        })
        console.log("josn获取是否成功", res);
      }
    })
  }
  handleChange = (e: any) => {
    if (e) {
      this.setState({
        json: e
      }, () => {
        console.log("change", this.state.json);
      })
    }
  }

  render() {
    return (
      <>
        <button className='send-btn' onClick={this.sendJSON}>点击配置生效</button>
        <span>项目名：</span><input type="text" />
        <span>路由名：</span><input type="text" />
        <Editor
          value={JSON.parse(JSON.stringify(this.state.json))}
          onChange={this.handleChange}
        />
      </>
    )
  }
}

export default App;
