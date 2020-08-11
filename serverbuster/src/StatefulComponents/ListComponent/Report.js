import React, { useState, useEffect } from "react";
import {
  notFalsy,
  numberCheck,
  validateReportObject,
  notNullUndefined,
} from "../../Validator/Validator";

import "./Report.css";
import { ServerStrip } from "../../StaticComponents/ServerStrip";

function NumberSelect(props) {
  let { report_length, setSelectedIndex, selectedReqResIndex, report } = props;
  let [indexWarning, setIndexWarning] = useState(false);

  console.log("Report_length:  " + report_length);
  function onChange(e) {
    let { name, value } = e.target;
    let indexValue = value;
    // set value to 0 zero if it is falsy.
    //value is used as an index and empty string values cause crashes, so in the case
    //of an undefined, null, and etc value, just set it to zero.
    if (numberCheck(value) && notFalsy(report) && notFalsy(report[value])) {
      setIndexWarning(false); //turn off warning if one has been turned on.
    } else {
      setIndexWarning(true); // empty and or falsy input detected.
      indexValue = 0; //set index value to zero since empty strings are considered falsy and cause the app to crash.
    }

    setSelectedIndex(indexValue);
  }
  return (
    <div className="form-row border-bottom">
      <div className="form-group col-12 col-md-4">
        <label for="report-select">Select Report By Dispatch Order</label>
        <input
          id="report-select"
          type="number"
          onChange={onChange}
          min={0}
          max={report_length - 1}
          disabled={report_length === 0}
          className="form-control"
          value={selectedReqResIndex}
        />
        {indexWarning ? (
          <span className="form-text text-danger">
            Empty number selects and values below zero are not allowed.
          </span>
        ) : null}
        {report_length === 0 ? (
          <span className="form-text text-warning">No reports discovered.</span>
        ) : null}
      </div>
    </div>
  );
}

function Report(props) {
  let [selectedReqResIndex, setSelectedIndex] = useState(0); // Dispatch index of {req,res pair}

  let [pathList, setPathList] = useState([]);

  let [selectedPath, setSelectedPath] = useState("");
  let [selectedPathReport, setSelectedPathReport] = useState(null);
  let [report_length, setReportLength] = useState(0);

  let { selectedTestSet, selectedReportName, report, msg, status } = props;

  function onChange(e) {
    let { value } = e.target;

    setSelectedPath(value);
  }

  //Effect Chain start---------------------
  useEffect(() => {
    if (notFalsy(report) && typeof report === "object") {
      let paths = Object.keys(report);

      //If actual paths exist for this report
      if (paths.length > 0) {
        let selectedPath = paths[0];
        let pathReport = report[selectedPath];
        let report_len = Object.keys(pathReport).length;

        setPathList(paths); //set the pathlist and selected report.
        setSelectedPath(selectedPath);
        setSelectedPathReport(report[selectedPath]);
        setReportLength(report_len);
        setSelectedIndex(0);
      }
    }
  }, [report]);

  //anytime the selected path changes, then load the associated report_value
  useEffect(() => {
    if (
      notFalsy(selectedPath) &&
      notFalsy(report) &&
      notFalsy(report[selectedPath])
    ) {
      setSelectedIndex(0);
      setSelectedPathReport(report[selectedPath]);
    }
  }, [selectedPath]);

  useEffect(() => {
    if (
      notFalsy(selectedPathReport) &&
      typeof selectedPathReport === "object"
    ) {
      let report_len = Object.keys(selectedPathReport).length;
      setReportLength(report_len);
    }
  }, [selectedPathReport]);

  function processHeaderData({ headers }) {
    let headerProperties = Object.keys(headers);
    let headerLength =
      notFalsy(headers) && typeof headers === "object"
        ? Object.keys(headers).length
        : 0;
    let headers_rows = [];
    let headerName = null;
    let headerValue = null;
    let table_row_header = null;

    if (headerLength > 0) {
      table_row_header = (
        <thead>
          <th scope="col">Header Name</th>
          <th scope="col"> Header Value</th>
        </thead>
      );

      for (let i = 0; i < headerProperties.length; i++) {
        headerName = headerProperties[i + ""];
        headerValue = headers[headerName];
        headers_rows.push(
          <tr>
            <td>{headerName}</td>
            <td>{headerValue}</td>
          </tr>
        );
      }
    } else
      headers_rows = (
        <tr>
          <td colSpan="2">
            No header info supplied in the HTTP req/res object.
          </td>
        </tr>
      );

    return (
      <React.Fragment>
        {table_row_header}
        <tbody>{headers_rows}</tbody>
      </React.Fragment>
    );
  }

  function DataRender(props) {
    let { data, display_type } = props;
    let ret_element = (
      <div className="col-12">
        {" "}
        <h2 className="badge badge-danger">React App Error</h2>
      </div>
    );

    if (
      notFalsy(data) &&
      typeof data === "object" &&
      notFalsy(data.headers) &&
      notNullUndefined(data.body)
    ) {
      if (display_type === "headers")
        ret_element = (
          <table className="table custom-table">
            {processHeaderData(data)}
          </table>
        );
      else if (display_type === "body") {
        let { body } = data;

        if (typeof body !== "string") {
          body = JSON.stringify(body, null, "   ");
        }
        ret_element = (
          <table className="table custom-table">
            <thead>
              {" "}
              <tr>
                <th colSpan="1">Body String Data</th>
              </tr>
            </thead>
            <tbody>
              {" "}
              <pre> {body}</pre>
            </tbody>
          </table>
        );
      }
    }

    return ret_element;
  }

  {
    return !notFalsy(selectedPathReport) && report_length > 0 ? (
      <React.Fragment>
        <div className="col-12 bg-secondary">
          <h2 className="text-warning">
            {" "}
            The report could not be located on the server OR the report stored
            on the server did not pass front-end/back-end validation.
          </h2>
          <p className="text-white">
            TestSet: {selectedTestSet} <br></br>
            ReportName: {selectedReportName} <br></br>
            <br></br>
            This TestSet/Report combination could not be found on the server.{" "}
            <br></br>
            The message returned from the server is: <br></br>
            <span className="text-danger"> {msg} </span>
            <br></br>
            1) Make sure the Testset name is a valid name, by selecting or
            matching a testset name in the dropdown. <br></br>
            2) The selected report name should always be valid since the drop
            down list is generated through data supplied from the back end. 3)
            If both conditions above are satisfied, then it is very likely an
            invalid report is stored in the database. An invalid report is one
            which is missing one or both the req and res fields in one or more
            of the dispatched requests.
          </p>
        </div>
        <ServerStrip status={status} />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <div className="form-row">
          <div className="form-group col-12 col-md-4">
            <label for="combox" className="text-primary">
              Select A Path
            </label>
            <select
              list="paths-list"
              value={selectedPath}
              className="form-control"
              name={"combobox"}
              placeholder="Enter quarry here"
              onChange={onChange}
              id="combobox"
              disabled={
                //disable the input if testsetnames are not arrays or if it is an array it is array of length zero.
                !Array.isArray(pathList) || pathList.length === 0
              }
            >
              {
                //populate datalist with testsetnames.
                Array.isArray(pathList) && pathList.length > 0
                  ? pathList.map((path) => <option value={path}>{path}</option>)
                  : null
              }
            </select>
          </div>
        </div>
        {notFalsy(selectedPathReport) && report_length > 0 ? (
          <React.Fragment>
            <NumberSelect
              report_length={report_length}
              setSelectedIndex={setSelectedIndex}
              selectedReqResIndex={selectedReqResIndex}
              report={selectedPathReport}
            />
          </React.Fragment>
        ) : null}
        <div className="form-row">
          {report_length > 0 ? (
            <React.Fragment>
              <h2 className="col-12">
                Response Report for: {selectedReportName} on Path {selectedPath}{" "}
              </h2>
              <h3>
                Status Code:{" "}
                {selectedPathReport[selectedReqResIndex].res.status}
              </h3>
              <DataRender
                display_type="headers"
                data={selectedPathReport[selectedReqResIndex].res}
              />
              <DataRender
                display_type="body"
                data={selectedPathReport[selectedReqResIndex].res}
              />
            </React.Fragment>
          ) : null}

          {report_length > 0 ? (
            <React.Fragment>
              <h2 className="col-12">
                Request Report for: {selectedReportName} on Path {selectedPath}
              </h2>

              <DataRender
                display_type="body"
                data={selectedPathReport[selectedReqResIndex].req}
              />

              <DataRender
                display_type="headers"
                data={selectedPathReport[selectedReqResIndex].req}
              />
            </React.Fragment>
          ) : (
            <h3 className="text-warning">
              {" "}
              The report is empty. There is no request and response information
              to show here. Boxes some check status code to show matching
              reports here.{" "}
            </h3>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default Report;
