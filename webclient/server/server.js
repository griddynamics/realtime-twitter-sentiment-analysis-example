/**
 * Copyright © 2016 Grid Dynamics (info@griddynamics.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var log = require('./debug').log('server');
var error = require('./debug').error('server');


var mainConfig = require('./main.config');
var path = require('path');

//import port number from configuration file
var port = mainConfig.webServer.port;
//import http protocol library
var http = require('http');
//import and run express js framework
var app = require('express')();
//create http server with express js
var server = http.createServer(app);
//import and set socket.io library to our http server
var io = require('socket.io')(server);

//run http server listing on port from config
server.listen(port, mainConfig.webServer.ip,
  function (err) {
    if (err) {
      error(err);
    } else {
      log('==> Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port);
    }
  });

//import socket.io controller
var IoController = require('./controllers/io.controller');
//run socket io controller
new IoController(io);

if(mainConfig.webServer.isProdMode){
  //set route for assets
  app.get('/virtual/*', function (req, res) {
    res.sendFile(path.resolve('server/dist/'+req.params[0]));
  });
  //set route for web site base path
  app.get('/', function (req, res) {
    res.sendFile(path.resolve('server/dist/index.html'));
  });
}else {
  //import and set webpack
  var webpack = require('webpack');
  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');
  var wpConfig = require('./webpack.config');
  var compiler = webpack(wpConfig);
  app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: wpConfig.output.publicPath}));
  app.use(webpackHotMiddleware(compiler));
  //set route for web site base path
  app.get('/', function (req, res) {
    var filename = path.join(compiler.outputPath,'index.html');
    var content = compiler.outputFileSystem.readFileSync(filename);
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Content-Length', content.length);
    res.send(content);
  });
}
