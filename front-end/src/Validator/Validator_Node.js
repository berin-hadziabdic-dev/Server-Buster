//method literals to be used in this file. One a dictionary for checking.
//the other individual listings of various expected process arguments.
const methods = { get: "get", put: "put", post: "post", delete: "delete" };

const host = "host";
const port = "port";
const method = "method";
const paths = "paths";
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

function numberCheck(number) {
  let numConversion = Number(number);
  let validNumber = typeof numConversion === "number";
  let nanstring = /[^0-9]/gi; //test for characters other than digits in a string

  if (validNumber) {
    validNumber =
      numConversion % 1 === 0 &&
      numConversion >= 1 &&
      !nanstring.test(numConversion + ""); // adding empty str to explicitly convert number to string.
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
//This function checks the values of the JSON arguments
//used to specify the hostname, hostport, and etc
// of the API endpoint which contains data that will be dispatched
//alongside every dispatched request.

function checkProperty(prop, prop_value) {
  // validProps is the return value which indicates if dataprops are valid or not.
  let validProps = true;
  let whitespace_found = /\\s/gi;

  validProps =
    notNullUndefined(prop_value) && notNullUndefinedString(prop_value);

  if (validProps)
    switch (prop) {
      case report_name:
        break;
      case testsetname:
        validProps = notFalsy(prop_value) && !whitespace_found.test(prop_value);
        break;
      case datahost:
      case host:
        validProps =
          notFalsy(prop_value) && //not empty str undefined null
          !/[^a-z0123456789.]/gi.test(prop_value) && //not undef
          typeof prop_value === "string"; //and is correct type
        break;
      case datamethod:
        validProps = methods[prop_value] !== undefined;
        break;
      case datafetch:
      case datasave:
        validProps = typeof prop_value === "boolean";
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
      case paths:
        validProps = validatePaths(prop_value);
        break;
      case datapath:
        let forwardSlash = /^\//.test(prop_value);
        let invalidCharFound = /[^a-z0-9-._~:\/?#\[\]@!$&'()*+,;=]/.test(
          prop_value
        );
        validProps = prop_value === "" || (forwardSlash && !invalidCharFound);
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
    }

  return validProps;
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
  reqspreview,
}) {
  let reqspreview_test = checkProperty("reqspreview", reqspreview);
  let datafetch_test = checkProperty("datafetch", datafetch);
  let datapath_test = checkProperty("datapath", datapath);
  let datahost_test = checkProperty("datahost", datahost);
  let dataport_test = checkProperty("dataport", dataport);
  let datamethod_test = checkProperty("datamethod", datamethod);
  let dataheaders_test = checkProperty("dataheaders", dataheaders);
  let databody_test = checkProperty("databody", databody);

  return (
    reqspreview_test &&
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

function validateReportName(report_name) {
  let invalidCharsTest = /[^a-z1-9_]/gi;
  let testOutcome = invalidCharsTest.test(report_name);

  return testOutcome;
}

module.exports.notNullUndefined = notNullUndefined;
module.exports.checkProperty = checkProperty;
module.exports.validateRequestProps = validateRequestProps;
module.exports.validateDataProps = validateDataProps;
module.exports.notFalsy = notFalsy;
module.exports.validateTestSet = validateTestSet;
module.exports.validateReportName = validateReportName;
