import React, { useState } from "react";
import { notFalsy, notNullUndefined } from "../../Validator/Validator";
//This function builds a table display the list of added headers, their values and an option to remove
//said header
function HeadersList(props) {
  let { headers_name, readonly, formState, setForm } = props; //headers_name identifies the type of headers to list (dataheaders or requestheadrs)
  let table_contents = <tr>No headers added.</tr>; //table_contentsd is inserted into the table.
  let header_keys = null; //keys.
  let header_length = -1; //header length.
  let headers = formState[headers_name];
  //This function removes a header from the header list on the click of a button assigned the headrs name.
  function removeHeader(e) {
    let { name } = e.target; //button name set to header name
    let formStateCopy = { ...formState }; // new form object ot replace old.
    //if header names and value
    if (
      notNullUndefined(name) &&
      notNullUndefined(formState[headers_name][name]) //if header name nt null undefined and is an exisitng header
    ) {
      delete formStateCopy[headers_name][name]; // delete the old header property
      setForm(formStateCopy); //update form state with header removed
    }
  }
  //if headers are not null/undefined
  if (notFalsy(headers)) {
    header_keys = Object.keys(formState[headers_name]); //update keys and length objects for use below.
    header_length = header_keys.length;
  }

  //if header keys contain one or more element
  if (header_length > 0) {
    //map them to the table.
    table_contents = header_keys.map((headerKey) => (
      <tr>
        <td colSpan="1">{headerKey}</td>
        <td colSpan="1">{headers[headerKey]}</td>
        <td colSpan="1">
          <input
            name={headerKey}
            colSpan="1"
            type="button"
            className={readonly ? "btn btn-secondary" : "btn btn-success"}
            value={readonly ? "" : "Remove-Header"}
            onClick={removeHeader}
            disabled={readonly}
          />
        </td>
      </tr>
    ));
  } else {
    table_contents = (
      <tr>
        <td colSpan="3" className="text-center text-warning">
          No HTTP headers added.
        </td>
      </tr>
    );
  }

  return (
    <div
      className="col-12"
      style={{ color: "white", height: "300px", overflow: "auto" }}
    >
      <h2 className="col-12 text-left">
        <span className="badge badge-success ">Added Headers</span>
      </h2>
      <table className="table bg-secondary text-white  ">
        <thead>
          <tr>
            <th scope="col">Header Name</th>
            <th scope="col">Header Value</th>
            <th scope="col"></th>
          </tr>
          {table_contents}
        </thead>
      </table>
    </div>
  );
}

export default HeadersList;
