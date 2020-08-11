let {
  notNullUndefined,
  checkProperty,
  validateRequestProps,
  validateDataProps,
  notFalsy,
  buildProcessJsonString,
  validateMethod,
  validateTestSet,
} = require("./Validator_Node");

let assert = require("assert");

let testset = {
  testsetname: "test1",
  host: "localhost",
  pathlist: [
    { path: "/one", method: "get" },
    { path: "/two", method: "put" },
  ],
  method: "get",
  port: 9999,
  reqspersecond: 4,
  secondduration: 100,
  forks: 2,
  datafetch: true,
  datahost: "myhost",
  datapath: "/path",
  datamethod: "get",
  dataheaders: { cookies: "mycookie", mysecondcookie: "secondcookievlaue" },
  dataport: 800,
  databody: "test body",
  datasave: true,
  reqspreview: [],
};

let testset_2 = {
  testsetname: "test1",
  host: "localhost",
  pathlist: [
    { path: "/one", method: "get" },
    { path: "/two", method: "put" },
  ],
  method: "get",
  port: 9999,
  reqspersecond: 4,
  secondduration: 100,
  forks: 2,
  datafetch: true,
  datahost: "myhost",
  datapath: "/path",
  datamethod: "get",
  dataheaders: { cookies: "mycookie", mysecondcookie: "secondcookievlaue" },
  dataport: 800,
  databody: "test body",
  datasave: true,
  reqspreview: [],
};

assert(validateTestSet(testset));

let invalidhost = {};
Object.assign(invalidhost, testset);

invalidhost.host = "localhost";
assert(validateTestSet(invalidhost));
invalidhost.host = "www.myhost.com";
assert(validateTestSet(invalidhost));
invalidhost.host = "www.myhost.orh";
assert(validateTestSet(invalidhost));
console.log(
  "End of all valid host,datahost tests. The same logic tests both fields."
);

invalidhost.host = 45;
assert(!validateTestSet(invalidhost));
invalidhost.host = null;
assert(!validateTestSet(invalidhost));
invalidhost.host = undefined;
assert(!validateTestSet(invalidhost));
invalidhost.host = {};
assert(!validateTestSet(invalidhost));
invalidhost.host = "Invalid?host";
assert(!validateTestSet(invalidhost));
invalidhost.host = "Invalid,host";
assert(!validateTestSet(invalidhost));
invalidhost.host = "";
assert(!validateTestSet(invalidhost));
console.log("End of all invalid host tests.");

let invalidport = {};
Object.assign(invalidport, testset);

console.log(
  "End of valid port, forks,reqspersecond,secconduration,dataport tests. All use the same testing logic."
);
invalidport.port = null;
assert(!validateTestSet(invalidport));
invalidport.port = "Four";
assert(!validateTestSet(invalidport));
invalidport.port = undefined;
assert(!validateTestSet(invalidport));
invalidport.port = 0;
assert(!validateTestSet(invalidport));

let invalidheaders = {};
Object.assign(invalidheaders, testset);

assert(invalidheaders);
invalidheaders.dataheaders["Header-Name"] = "Header-Value";
assert(invalidheaders);
invalidheaders.dataheaders["Header-Name-2"] = "Another-value";
assert(invalidheaders);
console.log("End of valid dataheaders test.");

invalidheaders.dataheaders[""] = "";
assert(!validateTestSet(invalidheaders));
delete invalidheaders.dataheaders[""];
invalidheaders.dataheaders = undefined;
assert(!validateTestSet(invalidheaders));
console.log("End of invalid dataheaders test.");

let invalidpaths = {};
Object.assign(invalidpaths, testset_2);
assert(validateTestSet(invalidpaths));

invalidpaths.pathlist[2] = { path: "/added_path", method: "get" };
assert(validateTestSet(invalidpaths));
invalidpaths.pathlist[2] = undefined;
assert(!validateTestSet(invalidpaths));
invalidpaths.pathlist[2] = { path: null, method: "get" };
assert(!validateTestSet(invalidpaths));
invalidpaths.pathlist[2] = { path: "doesnotstartwith/", method: "get" };
assert(!validateTestSet(invalidpaths));

console.log("End of invalid paths test.");
