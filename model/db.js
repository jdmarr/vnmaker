var mysql = require('mysql2');
require("dotenv").config();

//local mysql db connection
var connection = mysql.createConnection({
    host     : process.env.MYSQL_HOST,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;
