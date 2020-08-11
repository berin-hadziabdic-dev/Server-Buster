import React, { useState, useEffect } from "react";
import {
  checkProperty,
  checkServerForExistance,
  validateTestSet,
  notFalsy,
} from "../../Validator/Validator";
import { ServerStrip } from "../../StaticComponents/ServerStrip";
import { get_axios, post_axios } from "../../Axios/axiosroutes";
import { SubmitForm } from "../SubmitForm/SubmitForm";

const TESTSETNAME = "testsetname";
const REPORTNAME = "report_name";
function RunList(props) {
  let [status, setStatus] = useState("N/A");
  let [testsetnames, setTestsetnames] = useState([]);
  let [selectedTestSetName, setSelectedTestsetName] = useState("");
  let [selectedForm, setSelectedForm] = useState(null);
  let [reportName, setReportName] = useState("");
  let [validReportName, setValidReportName] = useState(
    checkProperty(REPORTNAME, "")
  );
  const emptytestsets =
    !Array.isArray(testsetnames) || testsetnames.length === 0;

  //this function communicates whether or not a testsetname or reportname is found on the server
  //404 is returned if testsetname isnt found and 200 if it is.
  // in the context oif this function 404 is desirable since it means a ttestsetname is not in use,
  // 200 is not since it means a testsetname or reportname is in use.

  function processTestsetArray(response) {
    let retVal = [];

    if (notFalsy(response) && Array.isArray(response.data)) {
      let { data } = response;

      //extract testsetnames from each db object embedded in the array.
      retVal = data.map((obj) => obj.testsetname);
    }
    return retVal;
  }
  function onChange({ target: { name }, target: { value } }) {
    switch (name) {
      case "select":
        if (checkProperty(TESTSETNAME, value)) setSelectedTestsetName(value);
        break;
      case "text":
        let validReportName = checkProperty(REPORTNAME, value);
        if (validReportName || value === "") setReportName(value);
        if (validReportName) {
          checkServerForExistance(
            "report_name",
            selectedTestSetName,
            value
          ).then((resp) => {
            resp.status === 200
              ? setValidReportName(true)
              : setValidReportName(false);
          });
        }
        setValidReportName(validReportName);
        break;
    }
  }

  useEffect(() => {
    get_axios("/gettestsetnames").then((resp) => {
      if (resp.status === 200) {
        let processedTestsetnames = processTestsetArray(resp);
        setTestsetnames(processedTestsetnames);
      } else {
        setTestsetnames([]);
      }
    });
  }, []);

  useEffect(() => {
    if (notFalsy(selectedTestSetName)) {
      post_axios("/posttestset", {
        testsetname: selectedTestSetName,
      }).then((resp) => {
        if (resp.status === 200) {
          let testset = resp.data;

          if (notFalsy(testset) && validateTestSet(testset))
            setSelectedForm(testset);
        }
      });
    }
  }, [selectedTestSetName]);

  useEffect(() => {
    if (Array.isArray(testsetnames) && testsetnames.length > 0)
      setSelectedTestsetName(testsetnames[0]);
  }, [testsetnames]);

  useEffect(() => {
    setReportName("");
  }, [selectedTestSetName]);

  function buildOptions() {
    let nonEmptyTestsetnames = testsetnames.length > 0;

    return nonEmptyTestsetnames ? (
      testsetnames.map((testsetname) => (
        <option value={testsetname}>{testsetname}</option>
      ))
    ) : (
      <option value={null}>No tests discovered.</option>
    );
  }

  function post_fork() {
    if (
      Array.isArray(testsetnames) &&
      testsetnames.length >= 1 &&
      validReportName
    ) {
      let post_object = {
        testsetname: selectedTestSetName,
        report_name: reportName,
      };

      post_axios("/forktestset", post_object).then(
        (resp) => {
          let { status } = resp.status;
          setStatus(status);

          if (status === 200) setReportName("");
        },
        (err) => setStatus("N/A")
      );
    }
  }
  return (
    <div className="container">
      <div className="form-row">
        <div className="form-group col-12 col-md-5">
          <label for="select">Testset Name</label>
          <select
            name="select"
            id="select"
            onChange={onChange}
            className="form-control"
            value={selectedTestSetName}
            disabled={emptytestsets}
          >
            {buildOptions()}
          </select>
          {emptytestsets ? (
            <span className="form-text text-danger">
              No test sets exist. No reports can be generated.
            </span>
          ) : null}
        </div>
        <div className="form-group col-12 col-md-4">
          <label for="text">Report Name</label>
          <input
            type="text"
            name="text"
            className="form-control"
            value={reportName}
            onChange={onChange}
            disabled={emptytestsets}
          />
          {emptytestsets ? (
            <span className="form-text text-danger">
              No test sets exist. No reports can be generated.
            </span>
          ) : null}
          {validReportName ? (
            <span className="form-text text-success">Reportname valid.</span>
          ) : (
            <span className="form-text text-danger">
              Report names only accept /[a-z0-9]/gi. If all valid characters
              have been entered, the report name may be taken.Try a different
              report name.{" "}
            </span>
          )}
        </div>
        <div className="form-group col-md-3">
          <label for="dispatch-button" className="text-white">
            Hey!
          </label>
          <input
            id="dispatch-button"
            type="button"
            className="btn btn-primary form-control"
            onClick={() => post_fork()}
            value="Run-TestSet"
          ></input>
          {emptytestsets ? (
            <span className="form-text text-danger">
              No test sets exist. Button is disabled.
            </span>
          ) : null}
        </div>
      </div>
      <ServerStrip status={status} />
    </div>
  );
}

export default RunList;
