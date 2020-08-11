import React, { useState } from "react";
import { notFalsy, checkProperty } from "../../Validator/Validator";
import HeadersList from "./HeadersList";

function AddHeader(props) {
  //headers = {header0:value0,...,headerN:valueN}
  let { formState, setForm, headers_name } = props;
  let [new_header, set_new_header] = useState({ name: "", value: "" });
  let [headerWarnings, setHeaderWarnings] = useState({
    name: true,
    value: true,
  });

  const btnDisabled =
    !checkProperty("header", new_header.name) ||
    !checkProperty("header", new_header.value);
  let [method, setMethod] = useState("get");
  function onChange(e) {
    let { name, value } = e.target; //get input name and value of input
    let new_header_copy = { ...new_header }; //copy headers
    let warnings_copy = { ...headerWarnings }; //copy header wanrings
    //let invalidHeader = /^$"\s[(),:;\<=>?@/][\{}]/g; //regex to sift out invalid chars
    let invalidHeader = /[\[\]\(\)\,\:\;\<\=\>\?@\{\}]/g;
    if (name === "name") {
      let emptyValue = value === "";
      //only set value if its not an invalidHeader char or value is empty(user deleting input)
      if (!invalidHeader.test(value) || emptyValue) {
        new_header_copy["name"] = value;
        warnings_copy["name"] = emptyValue;
      } else {
        warnings_copy["name"] = true;
      }
    } else {
      warnings_copy["value"] = value === "";
      new_header_copy["value"] = value;
    }
    set_new_header(new_header_copy);
    setHeaderWarnings(warnings_copy);
  }
  //This function adds an Http Header-Value pair to the form state object.
  function addHeader(e) {
    //Get header name,value value from header state.
    let formStateCopy = { ...formState }; //copy formstate.
    let { name, value } = new_header;
    if (
      checkProperty("header", name) && //If new header name is not falsy, empty string in this case.
      checkProperty("header", value) && //if new value not falsy
      formState[headers_name][name] === undefined // and that header name has not already been added.
    ) {
      formState[headers_name][name] = value; //set formstate copy headers object to the new object.
      setForm(formStateCopy); // replace old formstate copy with new.
      set_new_header({ name: "", value: "" });
    }
  }

  return (
    <div class="col-12 form-row">
      <div class="form-group col-12 col-md-4">
        <label for="header-name">Header Name</label>
        <input
          name="name"
          type="text"
          className="form-control"
          value={new_header.name}
          onChange={onChange}
        />
        {headerWarnings.name ? (
          <span className="form-text text-warning">
            {'Bad Input/Value. Accepted Header Inputs: /^$"s[(),:;<=>?@/][{}]/'}
          </span>
        ) : (
          <span class="form-text text-success">
            Header name value is valid.
          </span>
        )}
      </div>
      <div className="form-group col-12 col-md-4">
        <label for="header-value">Header Value</label>
        <input
          name="value"
          type="text"
          className="form-control"
          value={new_header.value}
          onChange={onChange}
        />
        {headerWarnings.value ? (
          <span className="form-text text-warning">
            {'Bad Input/Value. Accepted Header Inputs: /^$"s[(),:;<=>?@/][{}]/'}
          </span>
        ) : (
          <span class="form-text text-success">
            Header name value is valid.
          </span>
        )}
      </div>

      <div class="form-group col-12 col-md-4 ">
        <label for="header-button" className="text-white">
          Move along good sir or madam.
        </label>
        <input
          type="button"
          className={
            btnDisabled
              ? "btn btn-outline-warning my-auto form-control"
              : "btn btn-outline-success my-auto form-control"
          }
          value={btnDisabled ? " Disabled" : "Add-Header-KV"}
          id="header-button"
          onClick={(e) => addHeader(e)}
          disabled={btnDisabled}
        />
        {headerWarnings.value || headerWarnings.name ? (
          <span className="form-text text-warning">
            Can't add header name-value pair. Check the inputs, correct the
            mistake, and try again.
          </span>
        ) : (
          <span class="form-text text-success">
            Header name-value pair valid.
          </span>
        )}
      </div>
    </div>
  );
}

export default AddHeader;
