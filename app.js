const express = require('express');

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

module.exports = {
    app: app,
    http: http
};

