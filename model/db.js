var mysql = require('mysql2');
require("dotenv").config();

//local mysql db connection
var connection = mysql.createPool({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
});

module.exports = connection;
