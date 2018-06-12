const express = require('express');
// const app = express();
const cors = require('cors');
// const bodyParser = require("body-parser");
const logger = require('./logger');

var app = require('express')();
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*'); //<-- you can change this with a specific url like http://localhost:4200
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Authorization,Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
app.use(require('./routes'));

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});