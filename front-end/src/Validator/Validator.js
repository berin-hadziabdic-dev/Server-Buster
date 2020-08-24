//method literals to be used in this file. One a dictionary for checking.

import { post_axios } from "../Axios/axiosroutes";

//the other individual listings of various expected process arguments.
const methods = { get: "get", put: "put", post: "post", delete: "delete" };

const host = "host";
const port = "port";
const method = "method";
const pathlist = "pathlist";
const reqspersecond = "reqspersecond";
const forks = "forks";
const secondduration = "secondduration";
const datahost = "datahost";
const dataport = "dataport";
const datapath = "datapath";
const datamethod = "datamethod";
const datafetch = "datafetch";
const dataheaders = "dataheaders";
const databody = "databody";
const datasave = "datasave";
const reqspreview = "reqspreview";
const testsetname = "testsetname";
const report_name = "report_name";
const header = "header";

const bodyProperties = {
  testsetname: "testsetname",
  host: "host",
  paths: "paths",
  method: "method",
  port: "port",
  reqspersecond: "reqspersecond",
  secondduration: "secondduration",
  forks: "forks",
  datafetch: "datafetch",
  datapath: "datapath",
  datahost: "datahost",
  dataport: "dataport",
  datamethod: "datamethod",
  dataheaders: "dataheaders",
  databody: "databody",
  reqspreview: "reqspreview",
  datasave: "datasave",
};

function notNullUndefinedString(property) {
  return property !== "undefined" && property !== "null";
}

function notNullUndefined(property) {
  return property !== null && property !== undefined;
}
function notFalsy(property) {
  return (
    notNullUndefined(property) &&
    property !== "" &&
    property !== 0 &&
    notNullUndefinedString(property)
  );
}

function numberCheck(number_value) {
  let numConversion = Number(number_value);
  let validNumber = typeof numConversion === "number";
  let nanstring = /[^0-9]/gi; //test for characters other than digits in a string
  let zero_padding_test = /0[0-9]+/gi;
  let debug = zero_padding_test.test(number_value);

  if (validNumber) {
    validNumber =
      numConversion % 1 === 0 &&
      numConversion >= 1 &&
      !nanstring.test(numConversion + "") &&
      !zero_padding_test.test(number_value); // adding empty str to explicitly convert number to string.
  }
  return validNumber;
}

function validateHeaders(headersObject) {
  let validHeaders = notFalsy(headersObject);
  let keys = Object.keys(headersObject);
  let i = 0;
  let length = keys.length;
  let headerValue = null;
  let headerKey = null;

  while (i < length && validHeaders) {
    headerKey = keys[i];
    headerValue = headersObject[headerKey];
    validHeaders = notFalsy(headerKey) && notFalsy(headerValue);
    i++;
  }

  return validHeaders;
}

function validatePathReport(pathReport) {
  let validPathReport = notFalsy(pathReport) && typeof pathReport === "object";
  let reqres_pair = null;
  if (validatePathReport) {
    let reportLenght = Object.keys(pathReport);
    for (
      let report_i = 0;
      report_i < reportLenght && validPathReport;
      report_i++
    ) {
      let reqres_pair = pathReport(report_i + "");
      validPathReport = notFalsy(reqres_pair);
      if (validPathReport) {
        let { req, res } = reqres_pair;
        if (notFalsy(req) && notFalsy(res)) {
          if (
            !notNullUndefined(req.headers) &&
            !notNullUndefined(req.body) &&
            !notNullUndefined(res.headers) &&
            !notNullUndefined(res.body) &&
            !notNullUndefined(res.status)
          ) {
            validPathReport = false;
          }
        } else validPathReport = false;
      }
    }
  }

  return validPathReport;
}
function validateTestSetReports(testsetReports) {
  let validReports =
    notFalsy(testsetReports) &&
    typeof testsetReports === "object" &&
    Object.keys(testsetReports).length > 0;

  if (validReports) {
    let pathKeys = Object.keys(testsetReports);
    let path_len = pathKeys.length;
    let pathKey = null;

    if (path_len === 0) validReports = false;
    else {
      for (
        let pathKey_i = 0;
        pathKey_i < path_len && validReports;
        pathKey_i++
      ) {
        pathKey = pathKeys[pathKey_i];
        validReports = checkProperty(datapath, pathKey);

        if (validReports)
          validReports = validatePathReport(testsetReports[pathKey]);
      }
    }
  }
  return validReports;
}
//This function checks the values of the JSON arguments
//used to specify the hostname, hostport, and etc
// of the API endpoint which contains data that will be dispatched
//alongside every dispatched request.

function checkProperty(prop, prop_value) {
  // validProps is the return value which indicates if dataprops are valid or not.
  let validProps = true;
  let whitespace_found = /\\s/gi;
  let forwardslash_consecutive = /\/\/+/;

  validProps =
    notNullUndefined(prop_value) && notNullUndefinedString(prop_value);

  if (validProps)
    switch (prop) {
      case report_name:
        validProps =
          notFalsy(prop_value) &&
          !/[^a-z0123456789.]/gi.test(prop_value) && //not undef
          typeof prop_value === "string"; //and is correct type
        break;
      case testsetname:
      case datahost:
      case host:
        validProps =
          notFalsy(prop_value) && //not empty str undefined null
          !/[^a-z0123456789.]/gi.test(prop_value) && //not undef
          !whitespace_found.test(prop_value) && // no whitespace fund
          typeof prop_value === "string"; //and is correct type
        break;
      case datamethod:
        validProps = methods[prop_value] !== undefined;
        break;
      case datafetch:
        validProps = prop_value === "true" || prop_value === "false";
        break;
      case port:
      case dataport:
      case forks:
      case reqspersecond:
      case secondduration:
        validProps = numberCheck(prop_value);
        break;
      case method:
        validProps = notFalsy(prop_value) && notFalsy(methods[prop_value]);
        break;
      case pathlist:
        validProps = validatePaths(prop_value);
        break;
      case datapath:
        let multipleForwardSlash = !forwardslash_consecutive.test(prop_value);
        let forwardSlash = /^\//.test(prop_value);
        let invalidCharFound = /[^a-z0-9-._~:\/?#\[\]@!$&'()*+,;=]/gi.test(
          prop_value
        );
        validProps =
          prop_value === "" ||
          (forwardSlash && !invalidCharFound && multipleForwardSlash);
        break;
      case dataheaders:
        validProps = validateHeaders(prop_value);
        break;
      case databody:
        validProps =
          notNullUndefined(prop_value) && typeof prop_value === "string";
        break;
      case reqspreview:
        validProps = prop_value instanceof Array;
        break;
      case header:
        validProps = notFalsy(prop_value) && !whitespace_found.test(prop_value);
        break;
    }

  return validProps;
}

function checkServerForExistance(
  prop_name,
  testsetname_value,
  report_name_value
) {
  let validPropAsync = null;
  //if sync check passes
  switch (prop_name) {
    case "testsetname":
      validPropAsync = post_axios("/existstestsetname", {
        testsetname: testsetname_value,
      });
      break;
    case "report_name":
      validPropAsync = post_axios("/existsreportname", {
        report_name: report_name_value,
        testsetname: testsetname_value,
      });
      break;
  }

  return validPropAsync;
}
function validatePaths(pathlist) {
  let valid_paths = Array.isArray(pathlist);
  let selectedPathObject = null;

  if (valid_paths) {
    let length = pathlist.length;

    for (let i = 0; i < length && valid_paths; i++) {
      selectedPathObject = pathlist[i];
      valid_paths =
        notFalsy(selectedPathObject) &&
        notNullUndefinedString(selectedPathObject) &&
        checkProperty("datapath", pathlist[i].path);
    }
  }
  return valid_paths;
}

function validateRequestProps({
  testsetname,
  host,
  method,
  pathlist,
  port,
  reqspersecond,
  secondduration,
  forks,
  datafetch,
}) {
  //these let statements are used for code clarity/debugging
  let testsetname_test = checkProperty("testsetname", testsetname);
  let host_test = checkProperty("host", host);
  let method_test = checkProperty("method", method);
  let pathlist_test = validatePaths(pathlist);
  let port_test = checkProperty("port", port);
  let reqspersecond_test = checkProperty("reqspersecond", reqspersecond);
  let secondduration_test = checkProperty("secondduration", secondduration);
  let forks_test = checkProperty("forks", forks);

  return (
    testsetname_test &&
    host_test &&
    method_test &&
    pathlist_test &&
    port_test &&
    reqspersecond_test &&
    secondduration_test &&
    forks_test
  );
}

function validateDataProps({
  datafetch,
  datapath,
  datahost,
  dataport,
  datamethod,
  dataheaders,
  databody,
}) {
  let datafetch_test = checkProperty("datafetch", datafetch);
  let datapath_test = checkProperty("datapath", datapath);
  let datahost_test = checkProperty("datahost", datahost);
  let dataport_test = checkProperty("dataport", dataport);
  let datamethod_test = checkProperty("datamethod", datamethod);
  let dataheaders_test = checkProperty("dataheaders", dataheaders);
  let databody_test = checkProperty("databody", databody);

  return (
    datafetch_test &&
    datapath_test &&
    datahost_test &&
    dataport_test &&
    datamethod_test &&
    dataheaders_test &&
    databody_test
  );
}

function validateTestSet(testset) {
  let notFalsie = notFalsy(testset);
  let validReqProps = validateRequestProps(testset);
  let validDataProps = validateDataProps(testset);

  return notFalsie && validReqProps && validDataProps;
}

function buildProcessJsonString(formState) {
  let process_json = { ...formState };
  //This funciton stringifies formState and converts datafetch from string to bool
  let { datafetch } = process_json;
  datafetch = datafetch === "true" ? true : false;

  if (!datafetch) {
    process_json.datahost = undefined;
    process_json.dataport = undefined;
    process_json.datamethod = undefined;
    process_json.dataport = undefined;
    process_json.dataheaders = undefined;
  }
  return JSON.stringify(process_json);
}

function validateMethod(method) {
  return (
    method === "get" ||
    method === "put" ||
    method === "post" ||
    method === "delete"
  );
}

function validateReportObject(report) {
  let validReportObj = notNullUndefined(report) && typeof report === "object";

  if (validReportObj) {
    let reportIndices = Object.keys(report);
    let reportIndex = null;
    let reqres_pair = null;
    validReportObj = reportIndices.length > 0;

    if (validReportObj) {
      for (let i = 0; i < reportIndices.length && validReportObj; i++) {
        reportIndex = reportIndices[i];
        reqres_pair = report[reportIndex];

        let { req, res } = notFalsy(reqres_pair)
          ? reqres_pair
          : { req: undefined, res: undefined };

        if (
          !notFalsy(req) ||
          !notFalsy(res) ||
          !notFalsy(req.body) ||
          !notFalsy(req.headers) ||
          !notFalsy(res.body) ||
          !notFalsy(res.headers)
        ) {
          validReportObj = false;
        }
      }
    }

    return validReportObj;
  }
}

export {
  notNullUndefined,
  checkProperty,
  validateRequestProps,
  validateDataProps,
  notFalsy,
  buildProcessJsonString,
  validateMethod,
  validateTestSet,
  validateReportObject,
  numberCheck,
  checkServerForExistance,
  validateTestSetReports,
};
