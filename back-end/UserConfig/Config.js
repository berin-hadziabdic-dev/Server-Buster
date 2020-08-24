let { MongoClient } = require("mongodb");
let uri = "mongodb://localhost:27017/serverbuster";
let app_port = 8080;

async function connect_to_db() {
  return MongoClient.connect(uri);
}

module.exports.connect_to_db = connect_to_db;
module.exports.app_port = app_port;
