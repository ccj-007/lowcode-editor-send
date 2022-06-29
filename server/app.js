const http = require("http");
const fs = require('fs');
const path = require('path');

/**
 * 失败数据模型
 * @param {*} msg 消息 
 */
function errModel (msg) {
  let obj = {
    success: false,
    msg
  }
  return JSON.stringify(obj)
}

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
      let items = JSON.parse(item)
      if (items.routeName && items.itemName) {
        let file = path.join(__dirname, `${items.routeName}.json`)
        // json文件需要存入路径
        fs.writeFileSync(file, item)
        //将数据返回到客户端
        res.write(item);
        res.end();
      } else {
        res.write(errModel('文件配置失败, 检查路由或项目名是否正确'));
        res.end();
      }
    });
  }

  //本地模拟直接用client-admin.json
  if (req.method === 'POST' && req.url === '/api/getJSON') {
    let item = '';
    // 读取每次发送的数据
    req.on('data', function (chunk) {
      item += chunk.toString();
    });
    // 数据发送完成
    req.on('end', function () {
      let items = JSON.parse(item)

      if (items.routeName && items.itemName) {
        let file = path.join(__dirname, `${items.routeName}.json`)

        fs.readFile(file, 'utf-8', function (err, data) {
          if (err) {
            console.log(err);
            res.write(errModel('请检查路由是否正确'));
            res.end();
          } else {
            let obj = JSON.parse(data)
            res.write(JSON.stringify(obj.json));
            res.end();
          }
        });
      } else {
        res.write(errModel('请检查路由或项目名是否正确'));
        res.end();
      }
    });
  }

}).listen(3001); // 监听的端口
