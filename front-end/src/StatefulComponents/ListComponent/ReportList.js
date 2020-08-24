import React, { useState, useEffect } from "react";
import { post_axios, get_axios } from "../../Axios/axiosroutes";
import {
  notNullUndefined,
  notFalsy,
  validateTestSetReports,
  checkProperty,
} from "../../Validator/Validator";

import Report from "./Report";
import { ServerStrip } from "../../StaticComponents/ServerStrip";
import { isArray } from "jquery";
const NA_status = "N/A";

function processServerResponse(server_array, field_name) {
  let ret = [];
  let array_element = null;

  if (Array.isArray(server_array)) {
    for (
      let server_array_i = 0;
      server_array_i < server_array.length;
      server_array_i++
    ) {
      if (field_name !== "testsetname") {
        //get path keys

        array_element = server_array[server_array_i]["report_name"];
        ret.push(array_element);
      } else {
        array_element = server_array[server_array_i][field_name];
        if (notFalsy(array_element)) ret.push(array_element);
      }
    }
  }

  return ret;
}

function validateArrayResp(obj) {
  let ret_object = true;
  if (notNullUndefined(obj)) {
    if (!Array.isArray(obj)) {
      ret_object = false;
    }
  } else {
    ret_object = false;
  }

  return ret_object;
}

function buildStatusArrayFromCheckObject(checkObject) {
  let statusArray = []; //our status array object
  let statusKeysIterator = null; //iterator that goes through keys of checkObject

  if (notNullUndefined(checkObject) && typeof checkObject === "object") {
    //basic object validation
    let statusKeys = Object.keys(checkObject); //Get keys or statuses from checkobject

    //fo through entire array and add status whcih dont already exist.
    for (let i = 0; i < statusKeys.length; i++) {
      statusKeysIterator = statusKeys[i];

      if (statusArray.indexOf(statusKeysIterator) === -1) {
        statusArray.push(statusKeysIterator);
      }
    }
  }

  return statusArray;
}
//report object = {  dispatchindex_0: {req,res}, dispatchindex_1:{req,res} ... }
function buildStatusCodeCheckObject(report) {
  let path_keys = Object.keys(report);
  let path_report = null;
  let path_report_length = 0;
  let res_status = null;
  let statusCodes = {};

  if (path_keys.length > 0) {
    for (let report_i = 0; report_i < path_keys.length; report_i++) {
      path_report = report[path_keys[report_i]];
      path_report_length = 0;
      if (notFalsy(path_report))
        path_report_length = Object.keys(path_report).length;

      for (let reqres_i = 0; reqres_i < path_report_length; reqres_i++) {
        res_status =
          notFalsy(path_report[reqres_i].res) &&
          notFalsy(path_report[reqres_i].res.status)
            ? path_report[reqres_i].res.status
            : null;
        if (notFalsy(res_status) && statusCodes[res_status] === undefined)
          statusCodes[res_status] = true;
      }
    }
  }
  return statusCodes;
}

function filterReportsOnPath(pathobject, status_filter) {
  let filteredPathObject = {};
  let filtered_i = 0;
  let reqrespair = null;
  let unfilitered_length = 0;

  if (
    notFalsy(pathobject) &&
    typeof pathobject === "object" &&
    notFalsy(status_filter) &&
    typeof status_filter === "object"
  ) {
    unfilitered_length = Object.keys(pathobject).length;

    for (
      let unfilitered_i = 0;
      unfilitered_i < unfilitered_length;
      unfilitered_i++
    ) {
      reqrespair = pathobject[unfilitered_i];

      if (
        notFalsy(reqrespair) &&
        notFalsy(reqrespair.res) &&
        notFalsy(reqrespair.res.status)
      ) {
        let status = reqrespair.res.status;

        if (status_filter[status] === true) {
          filteredPathObject[filtered_i + ""] = reqrespair; //need to convert filtered_i to string since dictionaries indexed by integers, are integerstrings
          filtered_i++;
        }
      }
    }
  }

  return filteredPathObject;
}
function filterLoadedReport(loadedReportObject, status_filter) {
  let filteredObject = {}; // make a copy of the source report object.
  if (
    notFalsy(loadedReportObject) &&
    typeof loadedReportObject === "object" &&
    Object.keys(loadedReportObject).length > 0
  ) {
    let pathlist = Object.keys(loadedReportObject);

    pathlist.map((path) => {
      let path_report_object = loadedReportObject[path];
      filteredObject[path] = filterReportsOnPath(
        path_report_object,
        status_filter
      );
    });
  }

  return filteredObject;
}

function findReport(reportName, reportValues) {
  let returnReport = null;
  let retVal = null;

  if (
    notFalsy(reportName) &&
    notFalsy(reportValues) &&
    Array.isArray(reportValues)
  ) {
    let length_reports = reportValues.length;
    let report_i = 0;
    let report_object = null;

    while (report_i < length_reports && returnReport === null) {
      report_object = reportValues[report_i];

      if (report_object["report_name"] === reportName)
        returnReport = report_object;

      report_i++;
    }
  }

  if (returnReport !== null) retVal = returnReport.report_value;

  return retVal;
}

function renderReport(selectedReportName, filteredTestsetReports) {
  let retVal = (
    <div className="form-row">
      <h3 className="text-warning col-12">Empty Report</h3>
      <p>
        {" "}
        The selected report could not be found, is empty, or incomplete in some
        way. Unable to render results of such reports.
      </p>
    </div>
  );

  if (
    notFalsy(selectedReportName) &&
    notFalsy(filteredTestsetReports) &&
    validateTestSetReports(filteredTestsetReports)
  )
    retVal = (
      <Report
        selectedReportName={selectedReportName}
        report={filteredTestsetReports}
        status={"TEST-WORKOUT IN REPORTLIST"}
      />
    );

  return retVal;
}
function ReportList(props) {
  let [testsetnames, setTestsetNames] = useState([]);

  let [testsetReportNames, setTestsetReportsNames] = useState([]);
  let [testsetReportsValues, setTestsetReportsValues] = useState([]);

  let [selectedTestSetName, setSelectedTestSetName] = useState(""); //Name of currently selected testset
  let [selectedReportName, setSelectedPathReportName] = useState(""); //Name of selected report

  let [selectedReport, setSelectedReport] = useState(null); //value of selectedReportName
  let [filteredTestsetReports, setFilteredLoadedReportObject] = useState(null); //filtered selected reportvalue.

  let [checkBoxFilter, setCheckBoxFilter] = useState({}); //checkbox filter for status.
  let [status, setStatus] = useState(null);
  const reportToRender = renderReport(
    selectedReportName,
    filteredTestsetReports
  );

  let [validTestsetName, setValidTestsetName] = useState(false);

  useEffect(() => {
    getTestSetNames();
  }, []);

  //#2 gettestsetnames always sets selected testsetnme to the first report if one exists
  //load all the reports for that testset. get all the report names and save all of those
  //reports in Tessetreportvalues.
  // saved report values are organized like so { report_name0:report_value, ... , report_nameN: report_valueN}
  //furthermore if the loaded report object is not empty, the selectedReportname is set to the first report name.
  useEffect(() => {
    if (notFalsy(selectedTestSetName))
      post_axios("/loadtestsetreports", {
        testsetname: selectedTestSetName,
      }).then((resp) => {
        if (resp.status === 200) {
          let processedArray = processServerResponse(resp.data, "reports");

          if (isArray(processedArray) && processedArray.length > 0) {
            let testsetReports = resp.data;
            let reportName = processedArray[0];
            let selectedReport_Value = findReport(reportName, testsetReports);
            let checkBoxFilter_value = buildStatusCodeCheckObject(
              selectedReport_Value
            );
            let filteredTestsetReports = filterLoadedReport(
              selectedReport_Value,
              checkBoxFilter_value
            );
            setTestsetReportsNames(processedArray);
            setTestsetReportsValues(testsetReports);
            setSelectedPathReportName(reportName);
            setSelectedReport(selectedReport_Value[reportName]);
            setCheckBoxFilter(checkBoxFilter_value);
            setFilteredLoadedReportObject(filteredTestsetReports);
          }
        } else {
          setTestsetReportsNames([]);
          setTestsetReportsValues([]);
          setSelectedPathReportName("");
          setSelectedReport(null);
          setCheckBoxFilter(null);
          setFilteredLoadedReportObject(null);
        }
        setStatus(resp.status);
      });
  }, [selectedTestSetName]);

  useEffect(() => {
    let notFalsyTestsetReports =
      notFalsy(testsetReportsValues) &&
      typeof testsetReportsValues === "object" &&
      Object.keys(testsetReportsValues).length > 0;

    if (notFalsy(selectedReportName) && notFalsyTestsetReports) {
      let selectedReport = findReport(selectedReportName, testsetReportsValues);
      let checkFilter = buildStatusCodeCheckObject(selectedReport);
      let filteredReport = filterLoadedReport(selectedReport, checkFilter);

      setSelectedReport(selectedReport);
      setCheckBoxFilter(checkFilter);
      setFilteredLoadedReportObject(filteredReport);
    }
  }, [selectedReportName]);

  useEffect(() => {
    let filteredReport = filterLoadedReport(selectedReport, checkBoxFilter);
    setFilteredLoadedReportObject(filteredReport);
  }, [checkBoxFilter]);

  //this effect ensures all properties in the reportlist are valid.

  function onChange(e) {
    let { name, value } = e.target;
    let whitespace_chars_present = /\s/.test(value);

    if (!whitespace_chars_present)
      switch (name) {
        case "combobox":
          let testname_valid = checkProperty("testsetname", value);
          setSelectedTestSetName(value);
          setValidTestsetName(testname_valid);
          break;
        case "select":
          setSelectedPathReportName(value);
          break;
      }
  }

  function stringToBool(value) {
    let bool = true;

    if (value === "false") bool = false;

    return bool;
  }

  function statusFilterOnChange(e) {
    let { name, checked } = e.target;
    let checkBoxFilterObjectCopy = { ...checkBoxFilter };
    checkBoxFilterObjectCopy[name] = checked; //might need to use checked instead of value
    setCheckBoxFilter(checkBoxFilterObjectCopy);
  }

  function getTestSetNames() {
    get_axios("/gettestsetnames", {}).then(
      (response) => {
        let testsetnames_response = response.data;

        if (
          response.status === 200 &&
          validateArrayResp(testsetnames_response)
        ) {
          let testsetnames = processServerResponse(
            testsetnames_response,
            "testsetname"
          );
          setTestsetNames(testsetnames);

          if (testsetnames.length > 0) {
            let testsetname = testsetnames[0];
            let valid_name = checkProperty("testsetnames", testsetname);
            setSelectedTestSetName(testsetnames[0]);
            setValidTestsetName(valid_name);
          }
        } else {
          alert("Need status !== 200 response status code");
        }
      },
      (err) => {
        alert("Err logic needed reportlist.");
      }
    );
  }

  return (
    <div className="container border">
      <div className="form-row text-secondary">
        <h1>Completed Tests Reports</h1>
      </div>
      <div className="form-row justify-content-start border-bottom">
        <div className="form-group col-12 col-md-4">
          <label for="combox" className="text-primary">
            Testset Name
          </label>
          <input
            list="testsetnames"
            value={selectedTestSetName}
            className="form-control"
            name={"combobox"}
            placeholder="Enter quarry here"
            onChange={onChange}
            id="combobox"
            disabled={
              //disable the input if testsetnames are not arrays or if it is an array it is array of length zero.
              !Array.isArray(testsetnames) || testsetnames.length === 0
            }
          />
          {validTestsetName ? (
            <span className="text-success">Valid testsetname detected</span>
          ) : (
            <span className="text-warning"> Invalid testsetname detected.</span>
          )}
        </div>
        {
          //if testsanmes are falsy render warning. otherwise render the dropdown list.
          testsetnames.length === 0 ? (
            <span className="form-text text-danger">
              Testset names are empty. Can't select from an empty list!
            </span>
          ) : (
            <datalist id="testsetnames">
              {
                //populate datalist with testsetnames.
                testsetnames.map((testsetname) => (
                  <option value={testsetname}>{testsetname}</option>
                ))
              }
            </datalist>
          )
        }
        <div className="form-group col-12 col-md-4">
          <label for="primaries">Select A Report</label>
          <select
            value={selectedReportName}
            id="select-option"
            className="form-control"
            onChange={onChange}
            name="select"
            disabled={
              !Array.isArray(testsetReportsValues) ||
              testsetReportsValues.length === 0
            }
          >
            {testsetnames.length > 0
              ? testsetReportNames.map((option) => {
                  return <option value={option}>{option}</option>;
                })
              : null}
          </select>
          {!Array.isArray(testsetReportsValues) ||
          testsetReportNames.length === 0 ? (
            <span className="form-text text-warning">
              No reports exist for the given test set.
            </span>
          ) : null}
        </div>
        <ServerStrip title={"Testname Server Query Results"} status={status} />
        {testsetReportNames.length > 0 &&
        notFalsy(filteredTestsetReports) &&
        Object.keys(filteredTestsetReports).length > 0 ? (
          <div className="form-group col-12">
            <h4>Select StatusCode Filter Options</h4>
            <p>
              Check a status code to include all request/response pairs which
              resulted in checked statuscode.
            </p>
            <p>
              Uncheck a status code to exclude all request/response pairs which
              resulted in unchecked statuscode.
            </p>
            {buildStatusArrayFromCheckObject(checkBoxFilter).map((status) => (
              <div className="form-check">
                <input
                  name={status}
                  type="checkbox"
                  className="form-check-input"
                  checked={checkBoxFilter[status]}
                  onChange={statusFilterOnChange}
                />
                <label for={status} className="form-check-label">
                  {status}
                </label>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {reportToRender}
    </div>
  );
}

export default ReportList;
