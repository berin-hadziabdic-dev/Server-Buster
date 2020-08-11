let express = require("express");
let { MongoClient } = require("mongodb");
const { response } = require("express");
const { notFalsy } = require("../Validation/Validator");
let uri = "mongodb://localhost:27017";
let dataCollection = null;
let serverCollection = null;
let blogPostCollection = null;

const app_json_header = { "content-type": "application/json" };

function end(status, body, res) {
  res.status(status);
  res.set(app_json_header);
  res.write(body);
  res.end();
}

async function connect() {
  return new Promise((resolve, reject) => {
    MongoClient.connect(uri, (err, dbObj) => {
      let dbTuple = {
        test_data: dbObj.db("test_data"),
        server_data: dbObj.db("server_data"),
      };
      if (err === null) resolve(dbTuple);
      else reject(err);
    });
  });
}

let post_iter = 0;

connect().then(
  (dbObj) => {
    dataCollection = dbObj["test_data"].collection("data");
    serverCollection = dbObj["server_data"].collection("data");
    blogPostCollection = dbObj["server_data"].collection("blogs");
    let debug = "debug";
  },
  (err) => {
    console.log(err);
  }
);

let app = express();
let listening_port = 3030;

app.use(express.json());

app.post("/data", (req, res) => {
  dataCollection.find({}, { projection: { _id: 0 } }, (err, cursor) => {
    if (err === null) {
      cursor.toArray((err_arr, respArray) => {
        if (err_arr === null) {
          res.status(200);
          res.send(respArray);
        } else {
          res.status(500);
          res.end();
        }
      });
    } else {
      res.status(500);
    }
  });
});
app.get("/createdata", (req, res) => {
  if (dataCollection !== null) {
    dataCollection.remove({}, (err, resp) => {
      for (let i = 0; i < 5000; i++) {
        let dbObj = {
          headers: {
            "content-type": "application/json",
            accepts: "application/json",
          },
          body: {
            username: i + "",
            password: i + "",
            accountInfo: {
              first_name: "first name " + i + "UPDATED",
              last_name: "last_name " + i + "UPDATED",
              id: "xxx-UPDATED" + i,
            },
            msgObj: { msg_id: `id:${i}`, msg: `Hi, I am user ${i}.` },
            deleteMsg: { msg_id: `id:${i}` },
          },
        };

        dataCollection.insert(dbObj);
      }
    });

    blogPostCollection.remove({}, (err, resp) => {
      for (let i = 0; i < 5000; i++) {
        let msgObj = { msg_id: `id:${i}`, msg: `Hi, I am user ${i}.` };
        blogPostCollection.insert(msgObj);
      }
    });

    serverCollection.remove({}, (err, resp) => {
      for (let i = 0; i < 1000; i++) {
        let dbObj = {
          username: i + "",
          password: i + "",
          accountInfo: {
            first_name: "first name " + i,
            last_name: "last_name " + i,
            id: "xxx-" + i,
          },
        };

        serverCollection.insert(dbObj);
      }
      res.status(200);
      res.end("Data reset finished.");
    });
  }
});
app.post("/login", (req, res) => {
  let body = req.body;

  authenticate(body).then((resp) => {
    if (resp) {
      res.status(200);
    }
    //login successful
    else res.status(400).send(); //login failed

    res.setHeader("Cookies", "testing=cookies");
    res.end({ msg: "body from /login" });
  });
});

async function authenticate(body) {
  return new Promise((resolve, reject) => {
    serverCollection.find(
      { username: body.username, password: body.password },
      {},
      (err, cursor) => {
        if (err === null) {
          cursor.hasNext(function (hasNext_err, hasNext_resp) {
            if (hasNext_err !== null) reject(hasNext_err);
            else resolve(hasNext_resp);
          });
        }
      }
    );
  });
}

app.post("/getaccountinfo", function (req, res) {
  let body = req.body;
  authenticate(body).then((resp) => {
    if (resp) {
      let { username, password } = body;

      console.log(`username: ${username}, password: ${password}`); //debug

      if (resp)
        serverCollection.findOne(
          { username: username, password: password },
          { projection: { _id: 0, accountInfo: 1 } },
          (err, document) => {
            if (err !== null) {
              res.status(204);
              res.end();
            } else {
              res.status(204);
              if (notFalsy(document)) {
                res.writeHead(200, { "content-type": "application/json" });
                let docString = JSON.stringify(document.accountInfo);
                if (document.accountInfo === undefined) {
                  console.log("debug here");
                }
                console.log(docString);
                res.write(docString);
              }
              res.end();
            }
          }
        );
    }
  });
});

app.put("/edit_account", function (req, res) {
  let body = req.body;
  if (notFalsy(body) && notFalsy(body.accountInfo)) {
    let { username, password, accountInfo } = body;
    authenticate(body).then((authenticated) => {
      if (authenticated) {
        dataCollection.findOneAndUpdate(
          {
            username: username,
            password: password,
          },
          { $set: { accountInfo: accountInfo } },
          function (err, result) {
            if (err === null) {
              res.writeHead(200, { "content-type": "application/json" });
              res.end(JSON.stringify({ msg: "Body msg from /edit_accounts" }));
            } else {
              res.status(204);
              res.end({ msg: "Body msg from /edit_accounts" });
            }
          }
        );
      } else {
        res.status(204);
        res.end({ msg: "Body msg from /edit_accounts" });
      }
    });
  } else {
    res.status(204);
    res.end({ msg: "Body msg from /edit_accounts" });
  }
});

app.post("/getaccountinfo", function (req, res) {
  let { body } = req;
  //if body is falsy, send 400 resp
  if (!notFalsy(body)) {
    res.writeHead(400).end();
  } else {
    console.log(`getaccount info params: ${username}, ${password}`);
    let { username, password } = body;

    if (!notFalsy(username) || !notFalsy(password)) {
      res.writeHead(400).end("{}");
    } else {
      dataCollection.findOne(
        { username: username, password: password },
        { projection: { accountInfo: 1 } },
        function (err, document) {
          if (err !== null) {
            res
              .writeHead(500)
              .end(JSON.stringify({ msg: "/hi from get account infp" }));
          } else if (!notFalsy(document) && !notFalsy(document.accountInfo)) {
            res
              .writeHead(400)
              .end(JSON.stringify({ msg: "/hi from get account infp" }));
          } else {
            let jsonString = JSON.stringify(document.accountInfo);
            res
              .writeHead(200, { "content-type": "application/json" })
              .end(jsonString);
          }
        }
      );
    }
  }
});

app.get("/getusernames", function (req, res) {
  dataCollection.find({}, { projection: { _id: 0, username: 1 } }, function (
    find_error,
    cursor
  ) {
    if (find_error !== null)
      res
        .writeHead(500, { "content-type": "application/json" })
        .end(JSON.stringify({ msg: "hi from get usernames" }));
    else
      cursor.toArray(function (array_error, array) {
        if (array_error !== null)
          res
            .writeHead(400, { "content-type": "application/json" })
            .end({ msg: "hi from getusernames" });
        else {
          let arr_stringified = JSON.stringify(array);
          res.writeHead(200, { "content-type": "application/json" });
          res.write(arr_stringified);
          res.end();
        }
      });
  });
});

app.put("/makepost", function (req, res) {
  let body = req.body;

  authenticate(body).then(
    (authenticated) => {
      if (authenticated) {
        let { msgObj } = body;
        blogPostCollection.insert(msgObj, function (err, result) {
          if (err !== null) {
            res
              .writeHead(500, { "content-type": "application/json" })
              .end(JSON.stringify({ msg: "Msg from /makepost" }));
          } else {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ msg: "msg from/makepost" }));
          }
        });
      } else
        res
          .writeHead(401, { "content-type": "application/json" })
          .end({ msg: "msg from/makepost" });
    },
    (err) => {
      res
        .writeHead(200, { "content-type": "application/json" })
        .end(JSON.stringify({ msg: "msg from/makepost" }));
    }
  );
});

app.post(
  "/getmsgpost",
  (req, res) => {
    let body = req.body;
    if (notFalsy(body) && notFalsy(body.msgObj)) {
      let { msg_id } = body.msgObj;
      blogPostCollection.findOne(
        { msg_id: msg_id },
        { projection: { _id: 0, msg: 1 } },
        (findOne_err, document) => {
          if (findOne_err !== null) {
            res.writeHead(204, { "content-type": "application/json" });
            res.write(JSON.stringify(document));
            res.end();
          } else {
            res.writeHead(200, { "content-type": "application/json" });
            res.write(JSON.stringify(document));
            res.end();
          }
        }
      );
    } else {
      res.writeHead(500, { "content-type": "application/json" });
      res.write(JSON.stringify({ msg: "msg from getmsgpost" }));
      res.end();
    }
  },
  (err) => {}
);

app.listen(listening_port, () => console.log("test server listening on 3030"));
