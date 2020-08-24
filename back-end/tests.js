let { spamServer } = require("./ServerSpam/ServerSpammer");
let { validateProcArgs } = require("./Validation/ProcArgValidator");
let defaultOptions = {
  host: "localhost",
  path: "/",
  port: "8080",
  method: "get",
  forks: "1",
  reqspersecond: "100",
  secondduration: "5",
  datafetch: true,
  datahost: "localhost",
  dataport: "8080",
  datamethod: "post",
  datapath: "/",
  dataheaders: "",
};

function testdata_route() {
  let testdata_options = {};
  Object.assign(testdata_options, defaultOptions);
  testdata_options.datapath = "/testdata";
  if (validateProcArgs(testdata_options)) spamServer(testdata_options);
  else {
    console.log("Proc arg validation failed.");
  }
}

testdata_route();
