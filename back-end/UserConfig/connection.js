let { MongoClient } = require("mongodb");
let uri = "mongodb://localhost:27017/serverbuster";

async function connect_to_db() {
  return MongoClient.connect(uri);
}

module.exports.connect_to_db = connect_to_db;
