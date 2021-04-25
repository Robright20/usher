require('dotenv').config();
const OAuth2 = require("client-oauth2");
const {config} = require("./auth-config");
const {fetch} = require("./helpers");
const sqlite3 = require("sqlite3").verbose();
const fs = require('fs');

const db = new sqlite3.Database(process.env.DB, (err) => {
  void (!err ?? console.log(err))
});

db.serialize(function() {
  const dbSchema = fs.readFileSync(process.env.DB_SCHEMA, "utf-8");
  db.exec(dbSchema);
});

const oa = new OAuth2(config);

(async function main() {
  // const token = await oa.credentials.getToken();
  // db.close();
  // console.log(db.serialize)
  // fetch("/v2/users/fokrober", token)
  // 	.then((res) => console.log(res));
})();
