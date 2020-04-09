const config = require(__dirname + '/config/config.json');
var func = require('./func/log');
const http = require("./app").http;

http.listen(config.port, () => func.log("SERVER",`Server running on port: ${config.port}`, 0));