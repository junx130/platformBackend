const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: process.env.dbHost, // log to pi
  port: process.env.dbPort, // PI, defualt
  user: process.env.dbUser,
  password: process.env.dbPassword,
  connectionLimit: 5,
});

exports.pool = pool;
