const { connect_to_db } = require("../UserConfig/connection");
const {
  validateTestSet,
  notNullUndefined,
  notFalsy,
  checkProperty,
} = require("../Validation/Validator");

const {
  ForkSpamProcess,
} = require("../MicroServices_Forking/ForkingMicroservice");
let mongoDatabase = null;
let testsets_collection = null;
let reports_collection = null;
const app_json_header = { "content-type": "application/json" };
const code_500_stringified = JSON.stringify({
  msg: "Internal server error. Check the error logs for elaboration.",
});
const code_400_stringified = JSON.stringify({
  msg:
    "Invalid request. Check the body, path, or any other variable which might invalidate the request.",
});
const code_204_stringified = JSON.stringify({
  msg:
    "The server processed your request, but couldn't find any matching resources.",
});

function end(status, body, res) {
  res.status(status);
  res.set(app_json_header);
  res.end(body);
}

const code_200_stringified = JSON.stringify({ msg: "Request successful." });

function reportname_exists(body, res) {
  if (
    notFalsy(body) &&
    notFalsy(body.testsetname) &&
    notFalsy(body.report_name)
  ) {
    let { testsetname, report_name } = body;
    reports_collection.findOne(
      {
        testsetname: testsetname,
        report_name: report_name,
      },
      (err, resDocument) => {
        if (err !== null) end(500, code_500_stringified, res);
        else if (notFalsy(resDocument)) end(400, code_400_stringified, res);
        else end(200, code_200_stringified, res);
      }
    );
  } else {
    end(400, code_400_stringified, res);
  }
}

function createtestsets(req, res) {
  testsets_collection.remove({}, (err, res) => {
    reports_collection.remove({}, (err, res) => {
      for (let i = 0; i < 100; i++) {
        let testsetname = `test${i}`;
        let dummy_testset = {
          testsetname: testsetname,
          host: "localhost",
          port: 9999,
          method: selectmethod(),
          forks: 1,
          pathlist: [
            { path: `/${i}`, method: selectmethod() },
            { path: `/${i + 1}`, method: selectmethod() },
          ],
          reqspersecond: i,
          secondduration: 5,
          datafetch: "true",
          datahost: "localhost",
          dataport: 9000,
          datapath: `/path${i}`,
          dataheaders: {
            Cookies: `${i}`,
            Accepts: "application/json",
            "content-type": "application/json",
          },
          databody: JSON.stringify(`The value of i is ${i}.Test databody.`),
          datamethod: selectmethod(),
          reqspreview: [],
        };

        let report_name = `${i}Report`;
        let report_name_two = `${i}ReportTwo`;

        let report_value = buildReportsForTesting(i, `/${i}`); //reports for testing path 1

        let report_value_two = buildReportsForTesting(i, `/${i + 1}`); //reports for testing path 1

        testsets_collection.insertOne({
          testsetname: testsetname,
          testset: dummy_testset,
        });

        reports_collection.insertOne({
          testsetname: testsetname,
          report_name: report_name,
          report_value: {
            "/pathOne": report_value,
            "/pathTwo": report_value_two,
          },
        });

        reports_collection.insertOne({
          testsetname: testsetname,
          report_name: report_name_two,
          report_value: {
            "/pathOne": report_value,
            "/pathTwo": report_value_two,
          },
        });
      }
    });
  });

  function selectmethod() {
    let rand = Math.floor(Math.random() * 100);
    let mod = rand % 4;
    let ret = "get";
    switch (true) {
      case mod === 1:
        ret = "put";
        break;
      case mod === 2:
        ret = "post";
        break;
      case mod === 3:
        ret = "delete";
        break;
    }

    return ret;
  }

  //this function builds dummy reports for testing.
  function buildReportsForTesting(i) {
    let dummyReqRes = null; //this is the object which holds req/res info indexed by the order they are dispatched in.
    let reports = {}; //this is the report object which holds all reports, sorted by path for a partiuclar test set.
    let statuses = [200, 204, 500, 400];
    for (let j = 0; j <= i; j++) {
      dummyReqRes = {}; // make new reqres obj for index j
      dummyReqRes.req = {};
      dummyReqRes.res = {};
      dummyReqRes.report = {};
      dummyReqRes.req.headers = {
        Cookies: `${j}`,
        Accepts: "application/json",
      };
      dummyReqRes.res.headers = {
        Cookies: `${j}`,
        Accepts: "application/json",
      };
      dummyReqRes.req.body = JSON.stringify(
        `The value of j is ${j}.Testing req body.`
      );
      dummyReqRes.res.body = JSON.stringify(
        `The value of i is ${j}.Testing res body.`
      );
      dummyReqRes.res.status = statuses[j % 3];
      reports[j] = dummyReqRes;
    }

    return reports;
  }
}

connect_to_db().then((dbObj) => {
  mongoDatabase = dbObj.db("serverbuster");
  mongoDatabase.collection("testsets", function (err, res_collection) {
    if (err === null) {
      testsets_collection = res_collection;
    } else {
      console.log("Insert error logging logic in testsetroutes.js line 11.");
    }
  });
  mongoDatabase.collection("reports", function (err, res_collection) {
    if (err === null) {
      reports_collection = res_collection;
    } else {
      console.log("Insert error logging logic in testsetroutes.js line 11.");
    }
  });
});

function getreport(body, res) {
  let { testsetname, report_name } = body;
  let dbQueryObj = {
    testsetname: body.testsetname,
    report_name: body.report_name,
  };
  reports_collection.find(
    dbQueryObj,
    { projection: { report_value: 1 } },
    (err, cursor) => {
      if (err === null) {
        cursor.hasNext((err_hasNext, hasNext_bool) => {
          if (err_hasNext === null && hasNext_bool) {
            cursor.next((err_next, { report: { report_value } }) => {
              if (err_next === null) {
                end(200, JSON.stringify(report_value), res);
              } else {
                end(400, code_400_stringified, res);
              }
            });
          } else {
            end(204, code_204_stringified, res);
          }
        });
      } else {
        end(400, code_400_stringified, res);
      }
    }
  );
}

function gettestsetreports(body, res) {
  let bodyCheck =
    notFalsy(body) &&
    notFalsy(body.testsetname) &&
    checkProperty("testsetname", body.testsetname);

  if (!bodyCheck) end(400, code_400_stringified, res);
  else
    reports_collection.find(
      { testsetname: body.testsetname },
      { projection: { _id: 0, report_value: 1, report_name: 1 } },
      (err, cursor) => {
        if (err === null) {
          cursor.hasNext(function (err, hasNext_bool) {
            if (err === null) {
              if (hasNext_bool) {
                cursor.toArray(function (err, arrObj) {
                  if (err === null) {
                    end(200, JSON.stringify(arrObj), res);
                  } else {
                    end(400, code_400_stringified, res);
                  }
                });
              } else {
                end(400, code_400_stringified, res);
              }
            } else {
              end(400, code_400_stringified, res);
            }
          });
        }
      }
    );
}
function gettestsetnames(req, res) {
  testsets_collection.find(
    //so many sexy nested promises! What could go wrong?
    {},
    {
      projection: {
        testsetname: 1,
        _id: 0,
      },
    },
    function (err, cursor) {
      if (err === null) {
        cursor.hasNext().then(
          //a result has been located
          cursor.toArray((err, array) => {
            if (err === null) end(200, JSON.stringify(array), res);
            else end(500, code_500_stringified, res);
          })
        );
      }
    }
  );
}

function gettestset(body, res) {
  let { testsetname } = body;

  testsets_collection.find(
    { testsetname: testsetname },
    {
      projection: { _id: 0 },
    },
    function (err, cursor) {
      if (err === null) {
        cursor.hasNext((hasNext_err, hasNext_bool) => {
          if (hasNext_err !== null) end(500, code_500_stringified, res);
          //if hasNext throws error send 500
          else if (!hasNext_bool) end(204, code_204_stringified, res);
          // if no hasNext error but no has next items detected, send 204
          else
            cursor.next((next_err, testsetObj) => {
              if (next_err === null) {
                // if no next err
                let { testset } = testsetObj;
                if (validateTestSet(testset))
                  //validate it
                  end(200, JSON.stringify(testsetObj), res);
                //if validation passes send 200 + testset in body
                else end(400, JSON.stringify(code_400_stringified), res); //otherwise, testset was found but was invalid. send 400 since this is a server error
              } else {
                end(400, code_400_stringified, res); // send 400 in case of server error.
              }
            });
        });
      } else {
        console.log("Insert err handling logic line 66 testsetroutes.");
      }
    }
  );
}

function deletetestset(testsetname, res) {
  if (
    notFalsy(testsetname) &&
    checkProperty("testsetname", testsetname.testsetname)
  ) {
    testsets_collection.deleteOne(testsetname, (err, resp) => {
      if (err === null) {
        end(200, null, res);
        reports_collection.remove({ testsetname: testsetname }); //remove any reports associated with the testset
      } else {
        res.end(400, null, res);
      }
    });
  } else {
    end(400, null, res);
  }
}

function edittestset(updated_testset, res) {
  if (notNullUndefined(updated_testset)) {
    let { testsetname } = updated_testset;

    if (validateTestSet(updated_testset)) {
      testsets_collection.updateOne(
        { testsetname: testsetname },
        { $set: { testset: updated_testset } },
        (err, result) => {
          if (err === null) {
            end(200, null, res);
          }
        }
      );
    } else {
      end(400, code_400_stringified);
    }
  } else {
    end(400, code_400_stringified);
  }
}

function postloadreportnames(testsetname_obj, res) {
  let testsetname_query = { testsetname: testsetname_obj.testsetname };
  reports_collection.find(
    testsetname_query,
    { projection: { "report.report_name": 1 } },
    function (err, cursor) {
      if (err == null)
        cursor.hasNext((err_hasNext, result_hasNext) => {
          if (err_hasNext === null && result_hasNext) {
            cursor.toArray(function (err_array, results_array) {
              if (err_array === null) {
                end(200, JSON.stringify(results_array), res);
              } else {
                end(400, code_400_stringified, res);
              }
            });
          } else {
            end(204, code_204_stringified, res);
          }
        });
      else {
        end(500, code_500_stringified, res);
      }
    }
  );
}

function convertStringBoolsToActualBools(body) {
  let { datafetch } = body;
  let retval = false;

  if (datafetch === "true") {
    body.datafetch = true;
  }

  return retval;
}

function create_testset(body, res) {
  if (notFalsy(body)) {
    let { testsetname } = body;

    testsets_collection.find({ testsetname: testsetname }, {}, function (
      err,
      cursor
    ) {
      if (err !== null) end(500, code_500_stringified, res);
      else {
        cursor.hasNext(function (hasNext_err, hasNext_bool) {
          if (hasNext_err !== null) {
            end(400, code_400_stringified, res); //If there's a Mongo related error,send 400
          } else if (!hasNext_bool) {
            //If no testsets with the name try to validate
            if (validateTestSet(body)) {
              testsets_collection.insertOne(
                { testsetname: testsetname, testset: body },
                function (err, result) {
                  //No insertion errors, send 200 back
                  if (err === null) end(200, code_200_stringified, res);
                  else end(500, code_500_stringified, res); //insertion error send 500
                }
              );
            } else end(400, code_400_stringified, res); //hasnext error send 500
          } else end(204, code_204_stringified, res); //send 204 to indicate that the testsetname already exists in the database.
        });
      }
    });
  } else {
    //undefined empty body
    end(400, code_400_stringified, res);
  }
}

function testsetname_exists(body, res) {
  //perform basic checks on body and testsetname embedded on body
  if (
    notFalsy(body) &&
    notFalsy(body.testsetname) &&
    checkProperty("testsetname", body.testsetname)
  ) {
    let { testsetname } = body;

    testsets_collection.find(
      { testsetname: testsetname },
      { _id: 1 },
      function (err, cursor) {
        if (err !== null) end(500, code_500_stringified, res);
        //if err in find operation send 500
        else
          cursor.hasNext(function (hasNext_err, hasNext_bool) {
            //no err now check for hasnext
            if (hasNext_err === null) end(500, code_500_stringified, res);
            //send 500 has next err
            else if (!hasNext_bool) end(200, code_200_stringified, end);
            //send 200 if nohasnext meaning testname is available
            else end(204, code_204_stringified, res); //otherwise send 204 testname is not available.
          });
      }
    );
  } else {
    //given bad testsetname. send 400 to user.
    end(400, code_400_stringified, res);
  }
}

function porker_forker(body, res) {
  if (notFalsy(body) && notFalsy(body.testsetname)) {
    let { testsetname, report_name } = body;

    testsets_collection.findOne(
      { testsetname: testsetname },
      (err, document) => {
        if (err !== null || !notFalsy(document)) {
          res.writeHead(500, { "content-type": "application/json" });
          res.end(code_500_stringified);
        } else {
          if (document.testsetname !== testsetname) {
            res.writeHead(500, { "content-type": "application/json" });
            res.end(code_500_stringified);
          } else {
            //add reportname to document object
            porker_forker_validate_and_spawn(document, report_name, res);
          }
        }
      }
    );
  } else {
    res.writeHeaders(400, { "content-type": "application/json" });
    res.end(code_500_stringified);
  }
}

function porker_forker_validate_and_spawn(document, report_name, res) {
  //left off debugging here.
  let { testset } = document;
  if (validateTestSet(testset) && checkProperty("report_name", report_name)) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(code_200_stringified);
    document.report_name = report_name; //add report_name to document to be used in the forked process.
    ForkSpamProcess(res, testset, report_name);
  } else {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(code_400_stringified);
  }
}

module.exports.gettestsetnames = gettestsetnames;
module.exports.gettestset = gettestset;
module.exports.createtestsets = createtestsets;
module.exports.edittestset = edittestset;
module.exports.deletetestset = deletetestset;
module.exports.gettestsetreports = gettestsetreports;
module.exports.postloadreportnames = postloadreportnames;
module.exports.getreport = getreport;
module.exports.create_testset = create_testset;
module.exports.testsetname_exists = testsetname_exists;
module.exports.porker_forker = porker_forker;
module.exports.reportname_exists = reportname_exists;
