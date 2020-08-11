//This function is used to fork server testing processes
// with a validated json options object
const path = require("path");
const { access } = require("fs");
const { fork } = require("child_process");

function ForkSpamProcess(res, validatedJson, report_name) {
  let fileName = __dirname + "/../ServerSpam/ServerSpammer.js";
  access(fileName, function (err) {
    if (err === null) {
      let { forks } = validatedJson;

      //If fork script location is valid.
      //fork the number of children specified by the fork param provided by the user.
      for (let fork_i = 0; fork_i < forks; fork_i++) {
        validatedJson.report_name =
          fork_i === 0 ? report_name : report_name + "forkNumber" + fork_i;
        // add after detached to enable debuggingexecArgv: ["--inspect-brk"],
        let childProc = fork(fileName, [], {
          detached: true,
        });
        childProc.send(validatedJson);
        childProc.disconnect(); //Cut the ipc channel and free up associated handles allowing child to exit.,
        childProc.on("exit", () => {
          console.log("Child exit!");
        });
      }
    } else {
      res.status(400);
      res.set({ "content-type": "application/json" });
      res.end(JSON.stringify(forkScriptDNE));
    }
  });
}

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
  reqspersecond: 7,
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

module.exports.ForkSpamProcess = ForkSpamProcess;
