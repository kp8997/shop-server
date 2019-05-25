const app = require('./app');
const http = require('http');
const port = process.env.PORT || 9999;
const server = http.createServer(app);

server.listen(port);