const { notFalsy, notNullUndefined } = require("../Validation/Validator");
const http = require("http");
const https = require("https");
let reports_collection_ref = null;
const { connect_to_db } = require("../UserConfig/connection");

//connect to local db and get ref to reports collection.

//These consts are used as stand ins in req/res pairs which are incomplete.
//The app expects all report pairs to contain a request and response.
const ERROR_REQUEST = {
  headers: {
    "CUSTOM-ERROR-HEADER": "THERE WAS A PROBLEM WITH THE REQUEST.",
  },
  body: "ERROR ",
};

const ERROR_RESPONSE = {
  error:
    "THIS IS NOT AN INSTANCE OF NODE'S Server.Response. This is a custom made error response object.",
  headers: {
    "CUSTOM-ERROR-HEADER": "THERE WAS A PROBLEM WITH THE RESPONSE.",
  },
  body: "CUSTOM-ERROR-BODY. RESPONSE ERROR",
  status: -1,
};

//Anytime an error path is detected which is defined as null and undefined
//the path is automatically set to error-path, and if any matching req res pairs
//are found, they are automatically grouped under /error-path
const ERROR_PATH = "/ERROR-PATH";
const ERROR_STATUS = "ERROR: NO STATUSCODE SUPPLIED IN THE RESPONSE OBJECT.";

function validateReq(reqObj) {
  return reqObj instanceof http.ClientRequest;
}

function validateRes(resObj) {
  return resObj instanceof http.IncomingMessage;
}

//this function ensures headers are a valid value (not null undefined)
// if they are falsy, they are replaced with an appropriate header object.
function checkHeaders(headers) {
  let retVal = { "App-Message": "No-User-Headers-Supplied" };
  if (notFalsy(headers) && Object.keys(headers).length > 0) retVal = headers;

  return retVal;
}

//this function replaces falsy body values with an informative body message.
function checkBody(body) {
  let retval = "App-Message: User supplied empty body.";
  if (notFalsy(body)) retval = body;

  return retval;
}

//this function assumes the paired Node request is embedded in the nodeResponse
function checkReqResPair(nodeResponse) {
  let retval = {};
  let checked_req = validateReq(nodeResponse.req)
    ? nodeResponse.req
    : ERROR_REQUEST;
  let checked_res = validateRes(nodeResponse) ? nodeResponse : ERROR_RESPONSE;

  retval.req = checked_req;
  retval.res = checked_res;

  return retval;
}

//this class represents test reports stored in the database.
class TestSetReport {
  constructor(testname, pathlist, report_name) {
    this.testsetname = testname; // the testsetname of the report
    this.reportBank = {}; // the list of reports, organized by path
    this.reqResIdBankIterators = {}; //this object contains a mapping of /paths to the next availabel free index for that path
    this.createPaths(pathlist); //this function call formats reqResBankIterators
    this.dbConnection = null;
    this.beforeexitProcessWrite = false;
    this.report_name = report_name;
  }

  //this function ensures path is valid value. If it is not it is automatically set to the error-path value.
  checkPath(path) {
    let retPath = path;
    if (!notNullUndefined(retPath)) retPath = ERROR_PATH;

    if (!notFalsy(this.reportBank[retPath])) {
      this.reportBank[retPath] = {}; //create new path bank to store req res pairs
      this.reqResIdBankIterators[retPath] = 0; // add the matching reqres iterator
    }

    return retPath;
  }
  createPaths(pathlist) {
    let keys = Object.keys(pathlist);
    let pathKey = null;

    if (keys.length > 0)
      for (let i = 0; i < keys.length; i++) {
        pathKey = pathlist[keys[i]].path;
        this.reportBank[pathKey] = {};
        this.reqResIdBankIterators[pathKey] = 0;
      }
    else pathlist[""] = {};
  }

  //this function adds a req/res pair to the report/object
  addReqResPair(path, nodeResponse, buffer) {
    let checked_path = this.checkPath(path); //get the path the req was dispatched to, check and validate it.
    let pathDispatchIndex = this.reqResIdBankIterators[checked_path]; //get next available path index
    let setReqResValue = checkReqResPair(nodeResponse);
    this.reqResIdBankIterators[path]++; //increment path index

    // update reportBank while checking and validating all nested fields.

    this.reportBank[checked_path][pathDispatchIndex] = {
      req: {
        headers: checkHeaders(setReqResValue.req._headers),
        body: checkBody(setReqResValue.req.databody),
      },
      res: {
        headers: checkHeaders(setReqResValue.res.headers),
        body: checkBody(buffer),
        status: notFalsy(setReqResValue.res.statusCode)
          ? setReqResValue.res.statusCode
          : -1,
      },
    };
  }

  //This function should be used to iterate through the report set
  //fix any partial reports
  // and return the final processed report for db insertion.
  writeToDatabase() {
    let paths = Object.keys(this.reportBank);
    let indexKeys = null;
    let path = null;
    let reqresPair = null;

    for (let i = 0; i < paths.length; i++) {
      path = paths[i];
      indexKeys = Object.keys(this.reportBank[path]);

      for (let indexKey = 0; indexKey < indexKeys.length; indexKey++) {
        reqresPair = this.reportBank[path][indexKey];
        if (!notFalsy(reqresPair)) {
          this.reportBank[path][indexKey] = {
            req: ERROR_REQUEST,
            res: ERROR_RESPONSE,
          };
        } else {
          !notFalsy(reqresPair.req) ? (reqRespair.req = ERROR_REQUEST) : null;
          !notFalsy(reqresPair.res) ? (reqRespair.res = ERROR_RESPONSE) : null;
        }
      }
    }

    try {
      let dbReport = {
        testsetname: this.testsetname,
        report_name: this.report_name,
        report_value: this.reportBank,
      };
      if (this.beforeexitProcessWrite === false) {
        this.beforeexitProcessWrite = true;

        connect_to_db().then((database) => {
          let serverbuster = database.db("serverbuster");

          serverbuster.collection("reports", function (
            err,
            reports_collection
          ) {
            if (err === null) {
              reports_collection.insertOne(dbReport, (err, result) => {
                if (err === null) {
                  console.log(JSON.stringify(result));
                } else {
                  console.log(err);
                }

                database.close();
              });
            }
          });
        });
      }
    } finally {
    }
  }
}

module.exports.TestSetReport = TestSetReport;
