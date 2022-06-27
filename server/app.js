var http = require("http");
const fs = require('fs');
var path = require('path');
var file = path.join(__dirname, 'client-admin.json')

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
