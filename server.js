var fs = require("fs");
var express = require("express");
var webshot = require("node-webshot");
var app = express();
var PORT = process.argv[2] || 4545;
var block_screenshotter = false;

app.post("/submitURL",function(request,response) {
  if ( block_screenshotter ) {
    response.send("blocked");
    return;
  }
  block_screenshotter = true;
  var params = "";
  request.on("data",function(chunk) {
    params += chunk;
  });
  request.on("end",function() {
    params = params.split(",").map(item => decodeURIComponent(item));
    var pictureID = Math.floor(Math.random() * 1e9);
    webshot(params[0],`${__dirname}/pictures/${pictureID}.png`,{
      shotSize: {
        width: "all",
        height: "all"
      }
    },function(err) {
      if ( err ) {
        console.log(err);
        response.send("error");
      }
      fs.readFile(__dirname + "/data.json",function(err,data) {
        if ( err ) throw err;
        data = JSON.parse(data.toString());
        data[pictureID.toString()] = {
          "name": params[1],
          "url": params[0]
        }
        fs.writeFile(__dirname + "/data.json",JSON.stringify(data,null,2),function(err) {
          if ( err ) throw err;
          response.send("ok");
          block_screenshotter = false;
        });
      });
    });
  });
});

app.get("/blank",function(request,response) {
  response.send("");
});

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
  fs.stat(__dirname + "/data.json",function(err) {
    if ( err ) {
      if ( err.code == "ENOENT" ) {
        fs.writeFile(__dirname + "/data.json","{}",function(err) {
          if ( err ) throw err;
        })
      } else {
        throw err;
      }
    }
  });
});
