const express = require('express');
const config = require(__dirname + '/config/config.json');
var func = require('./func/log');

const app = express();

var http = require('http').createServer(app);
var io = require('socket.io')(http, {
    'path': '/api/socket.io',
    origins: '*:*'
});
require('./router/websocket')(io);
var cookieParser = require('socket.io-cookie');

io.use(cookieParser);

app.disable('x-powered-by');
app.set('views', __dirname);

app.use('/api/', require('./router/main'));

http.listen(config.port, () => func.log("SERVER",`Server running on port: ${config.port}`, 0));