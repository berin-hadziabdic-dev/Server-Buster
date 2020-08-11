const { spamServer } = require("./ServerSpammer");

let testset = {
  testsetname: "test-custom",
  host: "localhost",
  port: 3030,
  forks: 1,
  pathlist: [
    {
      path: "/login",
      method: "post",
    },
    {
      path: "/getaccountinfo",
      method: "post",
    },
    { path: "/edit_account", method: "put" },
    { path: "/getaccountinfo", method: "post" },
    { path: "/getusernames", method: "get" },
    { path: "/makepost", method: "put" },
    { path: "/getmsgpost", method: "post" },
  ],
  reqspersecond: 40,
  secondduration: 2,
  datafetch: true,
  datahost: "localhost",
  dataport: 3030,
  datapath: "/data",
  dataheaders: {
    Cookies: "2",
    Accepts: "application/json",
    "content-type": "application/json",
  },
  databody: '"The value of i is 2.Test databody."',
  datamethod: "post",
  reqspreview: [],
};

spamServer(testset);
