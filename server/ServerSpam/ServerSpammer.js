const http = require("http");
const { notFalsy, notNullUndefined } = require("../Validation/Validator");
const { TestSetReport } = require("./TestSetReport");

let dataArray = undefined;
let requestJSON = undefined;
let testsetreport = undefined;

//These functions are involved in fetching posting data pre spamming a server.
function processPostData(resp, tempArg) {
  dataArray = "";
  resp.on("data", (data) => {
    dataArray += data;
  });

  resp.on("end", function () {
    dataArray = JSON.parse(dataArray);
    scheduleRequests(tempArg);
  });
}

function fetchRequestsData(tempArg) {
  const options = {
    host: tempArg.datahost,
    path: tempArg.datapath,
    method: tempArg.datamethod,
    headers: tempArg.dataheaders,
    port: tempArg.dataport,
    timeout: 2000, //2 second req timeout in case server crashes
  };

  //return http.request wrapped in a promise, so that
  //when data fetching is finished, the promise can
  //be used to init playback.
  let req = http.request(options, (resp) => processPostData(resp, tempArg));
  if (requestJSON.databody !== undefined)
    req.write(JSON.stringify({ msg: requestJSON.databody }));
  req.end();
  req.on("error", () => {
    req.destroy();
    process.exit(1);
  });
  req.on("timeout", () => {
    req.destroy();
    process.exit(1);
  });
}
// end of data fetching functions.

//After data fetching, these functions then spam a specified host
//with requests.

function requestResponseCallback(response, res_id) {
  let buffer = "";
  response.on("data", (data) => {
    buffer = buffer + data;
  });
  response.on("end", () => {
    testsetreport.addReqResPair(response.req.path, response, buffer);
  });
}

//This function builds the entire pool of requests which
//will be sent to a website. If body-data or headers have been fetched
//prior to the execution of this function, they will be integrated into
//each request here.

function dataArrayCheck(datafetch) {
  let retVal = true;

  if (datafetch) {
    retVal = dataArray.length > 0;
  }

  return retVal;
}

function configureRequest(newRequest) {
  if (newRequest instanceof http.ClientRequest) {
    //on request error, remove request from event loop.
    newRequest.on("error", function (err) {
      let incompleteResponse = { req: newRequest };
      testsetreport.addReqResPair(
        newRequest.path,
        incompleteResponse,
        `APP-ERROR_MESSAGE: NO RESPONSE BODY. REQUEST TIMED OUT ON PATH: ${newRequest.path}. Error: ${err}`
      );

      newRequest.destroy();
    });

    //on time out, remove the request from the loop

    newRequest.on("timeout", function () {
      let err = "The request timed out.";
      let incompleteResponse = { req: newRequest };
      newRequest.destroy();

      testsetreport.addReqResPair(
        newRequest.path,
        incompleteResponse,
        `APP-ERROR_MESSAGE: NO RESPONSE BODY. REQUEST TIMED OUT ON PATH: ${newRequest.path}. Error: ${err}`
      );
    });
  }
}

function buildClientPool(tempArg) {
  let {
    host,
    pathlist,
    port,
    reqspersecond,
    secondduration,
    datafetch,
  } = tempArg; //change temp arg back to request json.

  let pathlength = Array.isArray(pathlist) ? pathlist.length : 0;
  let totalrequestlength = reqspersecond * secondduration;
  let requestPool = [];
  let poolIterator = 0;
  let pathselector = 0 % pathlength;

  while (poolIterator < totalrequestlength && dataArrayCheck(dataArray)) {
    let shiftedData = dataArray.shift(); //get next piece of data
    let dataBody = ""; //databody for this particular request
    pathselector = poolIterator % pathlength;

    let options = {
      //options for this request
      host: host,
      port: port,
      method: pathlist[pathselector]["method"], //get method from path obhject
      path: pathlist[pathselector]["path"], //gegt path from path object
      headers: datafetch && notFalsy(shiftedData) ? shiftedData.headers : null,
      timeout: 1500, //4 second req timeout in case server crashes
    };

    let newRequest = http.request(options, (resp) =>
      requestResponseCallback(resp)
    );
    configureRequest(newRequest);
    requestPool.push(newRequest);

    //if datafetch is true
    if (datafetch) {
      dataBody = notFalsy(shiftedData) ? shiftedData.body : "";
      //if shiftedData not null, then use it as the write value. Otherwise write empty string.
    }
    if (!notNullUndefined(shiftedData)) {
      //if data is null or undefined break out of the loop. We have come to the end of the data array
      break;
    } else {
      requestPool[poolIterator].databody = dataBody;
    }
    poolIterator++;
  }

  return requestPool;
}

function scheduleRequests(tempArg) {
  let clientPool = buildClientPool(tempArg); // build the request pool.
  let { reqspersecond, secondduration } = tempArg;
  let totalRequests = reqspersecond * secondduration;

  for (
    let sec_i = 0;
    sec_i < secondduration && clientPool.length > 0;
    sec_i++
  ) {
    setTimeout(() => {
      for (
        let secreq_i = 0;
        secreq_i < reqspersecond && clientPool.length > 0;
        secreq_i++
      ) {
        try {
          let poppedRequest = clientPool.shift();
          poppedRequest.write(JSON.stringify(poppedRequest.databody));
          poppedRequest.end();
        } catch (err) {
        } finally {
        }
      }
    }, sec_i * 1000);
  }
}

function spamServer(jsonArg) {
  requestJSON = jsonArg;

  try {
    if (requestJSON.datafetch === "true") {
      fetchRequestsData(jsonArg);
    } else {
      scheduleRequests(jsonArg);
    }
  } catch (err) {
  } finally {
  }
}

process.on("message", (jsonMsg) => {
  testsetreport = new TestSetReport(
    jsonMsg.testsetname,
    jsonMsg.pathlist,
    jsonMsg.report_name
  );
  spamServer(jsonMsg);
});
process.on("beforeExit", () => {
  testsetreport.writeToDatabase(); //write to db before destroying process.
});
process.on("exit", function (code) {
  console.log("Process exit.");
});

module.exports.spamServer = spamServer;
