# 关于
基于amis-editor，通过封装json数据上报、配置、自定义组件等，实现低代码管理后台实时更新，无需手动写json配置。


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