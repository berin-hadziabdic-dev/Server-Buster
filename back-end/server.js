//Dependencies
const express = require("express");
const app = express();
const { app_port } = require("./UserConfig/Config");
const path = require("path");

const {
  ForkSpamProcess,
} = require("./MicroServices_Forking/ForkingMicroservice");

const {
  create_testset,
  gettestsetnames,
  gettestset,
  createtestsets,
  edittestset,
  deletetestset,
  gettestsetreports,
  getreport,
  testsetname_exists,
  porker_forker,
  reportname_exists,
} = require("./Routes/testsetroutes");

//Error reporting constants.
const invalidRequestOptions = {
  msg: "Request options JSON in invalid format.",
};
const forkScriptDNE =
  "Fork script not found. Has it been renamed, moved, or deleted?";
const invalidDatahost = { msg: "DNS lookup of datahost failed." };
const invalidhost = { msg: "DNS lookup of testhost failed." };

// parse application/x-www-form-urlencoded
// parse application/json
app.use(express.json());
//static files (react app) serving directory
app.use(express.static(path.join(__dirname, "build")));

app.post("/forktestset", (req, res) => {
  let body = req.body;

  porker_forker(body, res);
});
app.post("/existstestsetname", (req, res) => {
  let body = req.body;
  testsetname_exists(body, res);
});

app.post("/existsreportname", (req, res) => {
  let body = req.body;
  reportname_exists(body, res);
});
app.post("/createtestset", (req, res) => {
  let body = req.body;
  create_testset(body, res);
});
app.post("/loadreport", (req, res) => {
  let body = req.body;
  getreport(body, res);
});

app.post("/loadtestsetreports", (req, res) => {
  let body = req.body;
  gettestsetreports(body, res);
});
app.post("/deletetestset", (req, res) => {
  let body = req.body;
  deletetestset(body, res);
});
app.post("/edittestset", (req, res) => {
  let testsetname_obj = req.body;
  edittestset(testsetname_obj, res);
});
app.post("/posttestset", (req, res) => {
  let body = req.body;
  gettestset(body, res);
});
app.get("/gettestsetnames", (req, res) => gettestsetnames(req, res));

app.get("/createtestsets", (req, res) => {
  createtestsets(req, res);
});

app.post("/testserver", function (req, res) {
  let jsonBody = req.body; // getJson body from request
  let validBody = validateProcArgs(validBody); // validate body properties.
  let childProc = []; // holds reference to childProc Aray

  //if body valid check if forkscript exists, and if it does attempt to fork.
  if (validBody) {
    hostExists(jsonArg.host).then((resp) => {
      if (resp) {
        hostExists(jsonArg.datahost).then((resp) => {
          if (resp) ForkSpamProcess(res, jsonArg);
          else {
            res.set({ app_json_header });
            res.status(400);
            res.end(invalidDatahost);
          }
        });
      } else {
        res.set({ app_json_header });
        res.status(400);
        res.end(invalidhost);
      }
    });
  } else {
    res.set(app_json_header);
    res.status(400);
    res.end(JSON.stringify(invalidRequestOptions));
  }

  res.status(200);
  res.end(JSON.stringify(requestOptions));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.listen(app_port, () => {
  console.log("SB Backend running...");
});
