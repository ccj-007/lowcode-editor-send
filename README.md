# 关于
### 🚀 ✈️ 🚁 基于amis-editor，通过封装json数据上报、配置、自定义组件等，实现低代码管理后台实时更新，无需手动写json配置。


# 如何使用

```
  npm i           //安装依赖
  npm run start   //通过devserve启动前端页面
  npm run server  //启动node服务
  
```

# 核心
```js
//src/App.tsx  
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


```



# 后端服务

```js

//server/app.js  用于调试服务端
const http = require("http");
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client-admin.json')

http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json;');
  res.setHeader("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  console.log(req.url);
  console.log(req.method);
  if (req.method == 'OPTIONS') {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild, sessionToken',
      'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS'
    });
    res.end('');
  }

  if (req.method === 'POST' && req.url === '/api/setJSON') {
    let item = '';
    // 读取每次发送的数据
    req.on('data', function (chunk) {
      item += chunk.toString();
    });
    // 数据发送完成
    req.on('end', function () {
      // json文件需要存入路径
      fs.writeFileSync(file, item)
      // items.push(item.item);
      // // 将数据返回到客户端
      res.write(item);
      res.end();
    });
  }

  if (req.method === 'GET' && req.url === '/api/getJSON') {

    fs.readFile(file, 'utf-8', function (err, data) {
      if (err) {
        console.log(err);
        res.write('文件读取失败');
        res.end();
      } else {
        let obj = JSON.parse(data)
        console.log("getJSON", obj.json);

        res.write(JSON.stringify(obj.json));
        res.end();
      }
    });
  }

}).listen(3001); // 监听的端口

```


## 如何在Vue的前端项目中使用 ？

  ### 1. 在静态目录public中的index.html引入对应的sdk
```js
  <link rel="stylesheet" href="./lowcode/amis/antd.css" />
  <link rel="stylesheet" href="./lowcode/amis/iconfont.css" />
  <script src="./lowcode/amis/sdk.js"></script>
```

  ### 2. 在路由允许的情况下调用封装的方法，即可渲染lowcode页面
```js
  import Vue from 'vue'
  import defaultConfig from "./config";
  import axios from 'axios'

  var timer = null

  let defaultOptions = {
    method: 'local', // 'http' | 'local' 通过接口返回或者本地静态文件夹获取
    routeName: '', //输入路由名（必填）
    itemName: '', //项目名（必填）
  }
  let newOptions  //修改后的配置
  /**
   * 在路由允许的情况下调用可生成对应lowcode页面
   * @param {DOM} DOM 
   * @param {Object} options 
   */
  export const getLowcodePage = (DOM, options = {}) => {
    newOptions = Object.assign(defaultOptions, options)
    let { routeName } = newOptions
    if (!DOM || !routeName) {
      throw new Error('DOM or routeName is no exist')
    }

    //handle first render error
    const check = (routeName) => {
      let dom = document.querySelector(DOM)
      if (dom) {
        getJsonFs(routeName)
        if (!timer) {
          clearTimeout(timer)
        }
      } else {
        timer = setTimeout(() => {
          check(routeName)
        }, 0)
      }
    }

    //get json
    const getJsonFs = (routeName) => {
      if (newOptions.method === 'local') {
        Vue.http.get(`lowcode/pages/${routeName}.json`, {}, { emulateJSON: true }).then((res) => {
          let obj = JSON.parse(res.bodyText)
          if (obj) {
            startAmis(obj)
          }
        }).catch((error) => {
          console.log("error", error);
        })
      }


      if (newOptions.method === 'http') {
        //正式项目需要通过post请求传入对象{routeName, itemName}
        //目前调试使用，注意某些跨域情况在vue.config.js中做跨域代理
        axios.get('/api/getJSON').then((res) => {
          let { data } = res
          startAmis(data)
          console.log('http', data);
        }).catch((e) => {
          alert("获取后端json失败" + JSON.stringify(e))
        })
      }
    }

    //amis render
    const startAmis = (jsonObj) => {
      console.log("jsonObj", jsonObj);
      let amis = window.amisRequire('amis/embed');
      amis.embed(DOM, jsonObj, {
        data: {
          baseUrl: process.env.VUE_APP_API_BASE_URL
        }
      }, defaultConfig
      )
    }

    //entrance
    check(routeName)
  }

```

  ### 3. 做跨域代理

```js
  //vue.config.js
  devServer: {
    proxy: {
      //测试lowcode使用
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  },
```



  ### 4. 开始调用方法

```js
<template>
  <div id='main-lowcode'>
    <div id="content-lowcode">
    </div>
  </div>

</template>

<script>
import { getLowcodePage } from '@/lowcode/index'

export default {
  data() {
    return {}
  },
  created() {},
  mounted() {
    // 获取lowcode页面
    getLowcodePage('#content-lowcode', {
      method: 'http', //接口请求
      routeName: 'client-admin',  
      itemName: 'cms2'
    })
  }
}
</script>

<style lang="less" scoped>

</style>
```
