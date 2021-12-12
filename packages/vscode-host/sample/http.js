var express = require('express')
var serveStatic = require('serve-static')

var staticBasePath = './';
 
var app = express()
 
app.use(serveStatic(staticBasePath))
app.listen(8080)
console.log('Listening on port 8080');