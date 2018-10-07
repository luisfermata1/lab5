var express = require("express");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

function apiServer(){
    app.listen(3000, () => {
    console.log("Server running on port 3000");
    });
}


apiServer();