var express = require('express');
var fs = require('fs');
var app = express();
app.use(express.logger());

app.get('/', function(request, response) {
  var fs = require('fs');
  var content = fs.readFileSync('index.html');
  var contentString = content.toString();
  response.send(contentString);
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
