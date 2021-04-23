var mysql = require('mysql2');
require("dotenv").config();

//local mysql db connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : 'vndb'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;
