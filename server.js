var fs = require("fs");
var express = require("express");
var webshot = require("node-webshot");
var app = express();
var PORT = process.argv[2] || 4545;
var block_screenshotter = false;

app.post("/submit",function(request,response) {
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

app.get("/",function(request,response) {
  fs.readFile(__dirname + "/public/index.html",function(err,data) {
    if ( err ) throw err;
    data = data.toString();
    var elements = [];
    fs.readFile(__dirname + "/data.json",function(err,itemData) {
      itemData = JSON.parse(itemData.toString());
      var keys = Object.keys(itemData);
      for ( var i = 0; i < keys.length; i++ ) {
        elements.push(`    <tr>
      <td class="bigCol">${itemData[keys[i]].name}</td>
      <td class="smallCol">
        <a href="/recipe?id=${keys[i]}" target="_blank">Open</a>
      </td>
      <td class="smallCol">
        <button onclick="javascript: confirmDelete(${itemData[keys[i]].name},${keys[i]})" class="remove">X</button>
      </td>
    </tr>`);
      }
      response.send(data.replace("{{items}}",elements.join("\n")));
    });
  });
});

app.get("/recipe",function(request,response) {
  var id = request.query.id;
  fs.readFile(__dirname + "/public/recipe.html",function(err,data) {
    if ( err ) throw err;
    data = data.toString();
    fs.readFile(__dirname + "/data.json",function(err,itemData) {
      if ( err ) throw err;
      itemData = JSON.parse(itemData.toString());
      var element = itemData[id];
      if ( ! element ) {
        response.send("error");
        return;
      }
      data = data
        .replace("{{name}}",element.name)
        .replace("{{url}}",element.url)
        .replace("{{img}}",`/pictures/${id}.png`);
      response.send(data);
    });
  });
});

app.use("/pictures",express.static(__dirname + "/pictures"));

app.listen(PORT,function() {
  console.log("Listening on port " + PORT);
  fs.stat(__dirname + "/data.json",function(err) {
    if ( err ) {
      if ( err.code == "ENOENT" ) {
        fs.writeFile(__dirname + "/data.json","{}",function(err) {
          if ( err ) throw err;
        });
      } else {
        throw err;
      }
    }
  });
});
