var mysql = require('mysql');

var config={
    host: 'localhost',
    user: 'root',
    password: '20180423',
    port: '3306',
    database: 'shop',
};
function handleError (err) {
    if (err) {
      // 如果是连接断开，自动重新连接
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        connect();
      } else {
        console.error(err.stack || err);
      }
    }
  }
  
  // 连接数据库
  function connect () {
    connection = mysql.createConnection(config);
    connection.connect(handleError);
    connection.on('error', handleError);
  }
  connect();
var http = require('http');
var fs = require('fs');
var url = require('url');
const buf=require('./bufferOpr.js');
//console.log(buf.files());

// 创建服务器
http.createServer(function (request, response) {
    if(connection.state=='disconnected'){connection.connect();}
    var pathname = url.parse(request.url).pathname;
    var index1 = pathname.indexOf('.') + 1;
    var idnex2 = pathname.length;
    var type = pathname.substring(index1).toLocaleLowerCase();
    //console.log(pathname.substr(1), type, url.parse(request.url, true).query['class']);
    var queryJson = url.parse(request.url, true);
    //console.log(queryJson);
    var classId = queryJson.query['cate']||queryJson.query['class']||0;
    var item_id = queryJson.query['id']||0;
    var item_price = queryJson.query['price']||0;
	var item_name = queryJson.query['name']||'XX';
	//console.log(classId,item_name,item_price);
    var sql;
    var sql1 = classId ? `where classid=${classId * 1}` : '';
    switch (pathname.substr(1)) {
        case 'mysql':
            sql = `SELECT id,name,img,price FROM goods ${sql1} order by price desc`;
            console.log(sql);
            //查
            connection.query(sql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                }else{
                    response.writeHead(200, {
                        'Content-Type': 'text/html;charset=utf-8'
                    });
                    console.log(result.length, new Date());
                    response.write(JSON.stringify(result.reduce((x, y) => {
                        x.push(y);
                        return x
                    }, [])));
                    response.end();
                }
                
            });
            break;
        case 'add':
            sql=`insert into goods (name,price,classid) values('${item_name}',${item_price},${classId})`;
            console.log(sql);
            connection.query(sql, function (err, result) {
                if (err) {
                    response.writeHead(404);
                    response.end('ERR ADD');
                } else {
                    response.writeHead(200);
                    response.end('DONE ADD');
                }
            });
            request.on('data', function (chunk) {
            });
            request.on('end', function () {
                
            });
            break;
        case 'file':        
        
        let chunks=[];
        let _buf;    
            request.on('data', function (chunk) {
                //console.log(chunk)
                //console.log(chunk.toString())
                chunks.push(chunk)       
            });
            request.on('end', function () {
                console.log('request.on.end')
                _buf=Buffer.concat(chunks)
                // console.log('<<<<<',buf.find(_buf))
                let files=buf.find(_buf)
                //console.log(files)
                files.forEach((f,i)=>{
                    let _name=new Date().getTime()+'_'+i+f.filename.match(/.[^\.]+$/)[0]
                    _name=_name.replace(/blob$/i,'.jpg')
                    fs.writeFile('img/'+_name,f.binary,function(err){console.log(err)})
                    console.log(f.name,f.filename)
                    sql = `update goods set img='${_name}' where id=${f.name.split('').slice(2).join('')*1}`;
                    connection.query(sql, function (err, result) {
                        if (err) {
                            response.writeHead(404);
                            response.end('ERR FILE');
                        } else {
                            response.writeHead(200);
                            response.end('DONE FILE');
                        }
                    });
                })
                response.end('END')
            });
            break;
        case 'edit':
            sql = `update goods set price=${item_price} where id=${item_id}`;
            connection.query(sql, function (err, result) {
                if (err) {
                    response.writeHead(404);
                    response.end('ERR EDIT');
                } else {
                    response.writeHead(200);
                    response.end('DONE EDIT');
                }
            });
            break;
        case '':
            fs.readFile('mysql.html', (err, data) => {
                if (err) {
                    response.writeHead(404, { 'content-type': 'text/html;chartset-utf-8' })
                } else {
                    response.writeHead(200, { 'content-type': 'text/html;chartset-utf-8' })
                    response.write(data.toString())
                }
                response.end();
            });
            break;
        case 'getVideoList':
            console.log('getVideoList',queryJson.query['callback'])
            var fl=fs.readdirSync('E:/BaiduYunDownload/第4季和字幕/第4季内嵌字幕版/'+queryJson.query['path']);
            fl=fl.filter(function(i){return /\.mp4$/g.test(i)});
            fl=fl.map(i=>queryJson.query['path']+'/'+i)
            console.log(fl)
            response.writeHead(200);
            response.end(queryJson.query['callback']+'('+JSON.stringify(fl)+')');
            //response.end(encodeURI(JSON.stringify(fl)));
            break;
        default:
            fs.readFile(pathname.substr(1), (err, data) => {
                if (err) {
                    response.writeHead(404, { 'content-type': 'text/html;chartset-utf-8' })

                } else {
                    if (type == 'jpg' || type == 'png' || type == 'ico'|| type == 'mp4') {
                        response.writeHead(200, { 'content-type': type!='mp4'?'image/jepg':'video/mp4' })
                        response.write(data, 'binary')
                    } else {
                        response.writeHead(200, { 'content-type': 'text/html;chartset-utf-8' })
                        response.write(data.toString())
                    }

                }
                response.end();
            });
    }
}).listen(8081);
console.log('8081端口服务器已启动..');
//connection.end();