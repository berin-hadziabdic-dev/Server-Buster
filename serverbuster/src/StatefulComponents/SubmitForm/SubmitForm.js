import React, { useEffect, useState } from "react";
import {
  validateRequestProps,
  checkProperty,
  validateDataProps,
  notFalsy,
} from "../../Validator/Validator";

import { post_edittestset, post_axios } from "../../Axios/axiosroutes";
import AddHeader from "./AddHeader";
import HeadersList from "./HeadersList";
import Axios from "axios";
import { AddPathToList, PathList } from "./PathList";
import MomentDatePicker from "./MomentDatePicker";
import moment from "moment";

const code_204_msg = "Testsetname already exists.";
const prop_strings = {
  testsetname: "testsetname",
  host: "host",
  path: "path",
  pathlist: "pathlist",
  port: "port",
  method: "method",
  headers: "headers",
  forks: "forks",
  reqspersecond: "reqspersecond",
  secondduration: "scondduration",
  datafetch: "datafetch",
  datahost: "datahost",
  dataport: "dataport",
  datamethod: "datamethod",
  datapath: "datapath",
  dataheaders: "dataheaders",
};
const form_cell = "col-12 col-md-6 form-group";
const create_test = "Create-Test";
const edit_test = "Edit-Test";
const delete_test = "Delete-Test";
const preview_test = "Preview-Test";
const STATUS_NA = "N/A";

//This function should only be called on a validated form and prior to the form being sent
//to the server.
//this method is needed when the user
function prepForm(formState) {
  let { datafetch } = formState;

  if (datafetch === "false") {
    formState.datahost = "";
    formState.dataport = 1;
    formState.datamethod = "";
    formState.datapath = "";
    formState.dataheaders = {};
    formState.databody = "";
  }

  return formState;
}
function validateForm(formState) {
  let validRequestProps = validateRequestProps(formState);

  let validDataProps =
    formState["datafetch"] === "true" ? validateDataProps(formState) : true;
  console.log(
    "Test SET DNE NOT IMPLEMENTED YET once server code done, finish it and add it here."
  );
  return validDataProps && validRequestProps;
}

//builds footer button options for the submit form
function buildButtonOptions(
  formtype,
  formState,
  setStatus,
  resetForm,
  setResetForm,
  setWarning,
  setReloadNames
) {
  let buttonOptions = null;
  switch (formtype) {
    case delete_test: //posts to delete testset route
      buttonOptions = {
        className: "form-control btn-success",
        value: "Delete-TestSet-" + formState.testsetname,
        httpFunction: () => {
          post_axios("/deletetestset", {
            testsetname: formState.testsetname,
          }).then(
            (resp) => {
              setStatus(resp.status);

              if (resp.status === 200) {
                setReloadNames((prevState) => !prevState);
              }
            },
            (err) => {
              setStatus(STATUS_NA);
            }
          );
        },
      };
      break;
    case edit_test: //posts to edittestset route
      buttonOptions = {
        className: "form-control btn-success",
        value: "Update-TestSet-" + formState.testsetname,
        httpFunction: () => {
          let preppedForm = prepForm(formState);
          post_edittestset(preppedForm).then(
            (resp) => {
              setStatus(resp.status);
            },
            (err) => {
              setStatus(STATUS_NA);
            }
          );
        },
      };
      break;
    case preview_test:
      buttonOptions = null;
      break;
    default:
      buttonOptions = {
        className: "form-control btn-success",
        value: "Create-New-TestSet",
        httpFunction: () => {
          let preppedForm = prepForm(formState);
          post_axios("/createtestset", preppedForm).then(
            (resp) => {
              setStatus(resp.status);

              if (resp.status === 200) {
                setResetForm(!resetForm); //make brandnew form state
                setWarning(buildWarningBools(formState)); //make warning labels off that new formstate
              }
            },
            (err) => {
              setStatus(STATUS_NA);
            }
          );
        },
      };
      break;
  }

  return buttonOptions;
}

function buildWarningBools(formState) {
  //This ret_val value is used for forms which edit an existing Test-Set.
  let {
    host,
    pathlist,
    testsetname,
    port,
    forks,
    reqspersecond,
    secondduration,
    datafetch,
    datahost,
    dataport,
    datapath,
    datamethod,
  } = formState;

  return {
    host: !checkProperty("host", host),
    protocol: false,
    testsetname: !checkProperty("testsetname", testsetname),
    pathlist: !checkProperty("pathlist", pathlist),
    port: !checkProperty("port", port),
    method: false,
    headers: false,
    forks: !checkProperty("forks", forks),
    reqspersecond: !checkProperty("reqspersecond", reqspersecond),
    secondduration: !checkProperty("secondduration", secondduration),
    datafetch: !checkProperty("datafetch", datafetch),
    datahost: !checkProperty("datahost", datahost),
    dataport: !checkProperty("dataport", dataport),
    datamethod: false,
    datapath: !checkProperty("datapath", datapath),
    dataheaders: false,
    databody: false,
  };
}

function SubmitForm(props) {
  //edit indicates whether or not the user is using this form to edit an existing test set
  // or whether or not the user is using to create a brand new test set.

  let {
    formtype,
    formState,
    setForm,
    resetForm,
    setResetForm,
    setReloadNames,

    status,
    setStatus,
  } = props;
  let [formWarnings, setWarning] = useState(buildWarningBools(formState));

  const buttonOptions = buildButtonOptions(
    formtype,
    formState,
    setStatus,
    resetForm,
    setResetForm,
    setWarning,
    setReloadNames
  );

  useEffect(
    function () {
      setWarning(buildWarningBools(formState));
    },
    [formState]
  );

  function onChange(e) {
    e.preventDefault();

    let { name, value, type } = e.target; //get name and vale from obj through destructuring
    let formStateCopy = { ...formState };
    let formWarningsCopy = { ...formWarnings }; //copy of formWarnings to set new warning state to
    let property_check = checkProperty(name, value);
    let empty_string = type === "text" && value === "";

    if (property_check || (type === "text" && value === "")) {
      // prop value good.
      //if prop value passes validation.
      // set new state
      formStateCopy[name] = value; //change form name to value
      setForm(formStateCopy); //update formstate
      empty_string
        ? (formWarningsCopy[name] = true)
        : (formWarningsCopy[name] = false); //set formWarnings of prop to false to display valid label.
    } else formWarningsCopy[name] = true; // other wise display true label

    setWarning(formWarningsCopy); //update warnings
    setStatus(null);
  }

  //this function builds inputs of types of text or number
  function buildTextNumberInput(
    field_name, //The name of the formState property
    labelText, //The label text of the input
    placeholder, //The placeholder for the input
    validtext, // the text to display when input is valid.
    invalidText, //text for invalid input
    input_type, // the type of the input text or number
    min_number // for number inputs, the minimum acceptable number.
  ) {
    return (
      <div class={form_cell}>
        <label for={field_name}>{labelText}</label>
        <input
          {...min_number}
          type={input_type}
          className="form-control"
          id={field_name}
          name={field_name}
          placeholder={placeholder}
          value={formState[field_name]}
          onChange={(e) => onChange(e)}
          disabled={formtype === delete_test}
        />

        {
          //if prop invalid, set to invalid label. otherwise set to valid.
          !formWarnings[field_name] ? (
            <span class="form-text text-success">{validtext}</span>
          ) : (
            <span class="form-text text-danger">{invalidText}</span>
          )
        }
      </div>
    );
  }

  function getDisabledStatus() {
    return formtype === delete_test || formtype === preview_test;
  }

  //builds select dropdown. label = form group label
  //options = {innerHtml:what the user sees on drop down,value:what the react state maps to what the user sees}
  //optons is also an array of strings which contains the values and innerhtml of the options inside the select.
  function buildSelect(field_name, label, options, valid_msg) {
    return (
      <div class={form_cell}>
        <label for={field_name}>{label}</label>
        <select
          id={field_name}
          value={formState[field_name]}
          onChange={onChange}
          name={field_name}
          className="form-control"
          disabled={getDisabledStatus()} //disable field if this delete type form which is readonly
        >
          {Array.isArray(options)
            ? options.map((option) => {
                return <option value={option}>{option}</option>;
              })
            : null}
        </select>
        <label for="field_name" className="form-text text-success">
          {valid_msg}
        </label>
      </div>
    );
  }

  //This function builds thre form footer which is just a button.
  //however, the two footer options post to different backend routes .
  function buildFormFooter() {
    //if edit form build edit footer
    let ret_val = null;
    let invalid_label = (
      <label for="submit-button" className="form-text text-danger mx-2">
        Invalid form field detected. Correct the mistake and try again.
      </label>
    );
    let valid_label = (
      <label for="submit-button" className="form-text text-success mx-2">
        Form value valid.
      </label>
    );
    //If submit form needs a footer, formfooter will not be undefined
    if (
      buttonOptions !== undefined &&
      typeof buttonOptions === "object" &&
      buttonOptions !== null
    ) {
      let validForm = validateForm(formState);
      ret_val = (
        <div className=" form-row border-top pt-2">
          {validForm ? (
            <input
              id="test-button"
              type="button"
              value={buttonOptions.value} //get value from footerobject
              className={buttonOptions.className + " col-12 col-md-4"} //get class name frm footerobject
              //if form not valid, retval is false, disable it
              onClick={() => buttonOptions.httpFunction(formState.testsetname)} //get http function from footerobject
              id="submit-button"
            />
          ) : (
            <input
              id="test-button"
              type="button"
              value="Cannot Submit" //get value from footerobject
              className={"btn-danger col-12 col-md-4"} //get class name frm footerobject
              //if form not valid, retval is false, disable it
              disabled={true}
            />
          )}
          {validForm ? valid_label : invalid_label}
        </div>
      );
    }

    return ret_val;
  }

  function getFormTitle() {
    let title = null;

    switch (formtype) {
      case edit_test:
        title = `TestSet ${formState.testsetname} Edit Form`;
        break;
      case delete_test:
        title = `TestSet ${formState.testsetname} Delete Form`;
        break;
      case create_test:
        title = "Create a new Test-Set";
        break;
      case preview_test:
        title = "Test-Set Preview";
        break;
    }

    return title;
  }

  return (
    <div class="container border px-1">
      <div className="form-row bg-secondary">
        <h1 className="text-white">{getFormTitle()}</h1>
      </div>
      <div class="form-row">
        {formtype !== create_test // if not creating a create type form, then dont allow usr to change testset name.
          ? null
          : buildTextNumberInput(
              "testsetname",
              "TestSet Name",
              null,
              "TestSet name valid",
              "The name is either taken or the TestSet name is an empty string. White space characters are not allow. Pick a new name.",
              "text",
              null
            )}
        {buildTextNumberInput(
          "host",
          "Hostname",
          "www.hostname.com -> NS Record",
          "Hostname input valid.",
          "Bad input. Acceptance Criteria: /[a-z0-9.]/i",
          "text",
          null
        )}
        {buildSelect("protocol", "HTTP/HTTPS setting", ["http", "https"], null)}
        {
          //don't allow user to add paths if delete test is false.
          getDisabledStatus() ? null : (
            <AddPathToList formState={formState} setForm={setForm} />
          )
        }
        <PathList
          formState={formState}
          setForm={setForm}
          readonly={getDisabledStatus()}
        />

        {buildTextNumberInput(
          "port",
          "TCP Port Of Test-Server",
          "9999",
          "Port field valid.",
          "Bad Input. Accepts digits [0-9]. Accepted values, Port > 0. No decimals or fractions allowed.",
          "number",
          1
        )}
        {buildTextNumberInput(
          "forks",
          "# Of Request Sets Forks",
          null,
          "Number of Forks valid.",
          "Accepted Inputs: [0-9]. Accepted Digits: [0-9]+ .Accepted Values: value >= 1. No decimals or fractions allowed.",
          "number",
          1
        )}
        {buildTextNumberInput(
          "reqspersecond",
          "Reqs Per Second To Dispatch",
          null,
          "Reqs Per Sec field valid",
          "Accepted Inputs: [0-9]. Accepted Digits: [0-9]+ .Accepted Values: value >= 1. No decimals or fractions allowed.",
          "number",
          1
        )}
        {buildTextNumberInput(
          "secondduration",
          "RPS Duration",
          null,
          "Reqs Per Sec field valid",
          "Accepted Inputs: [0-9]. Accepted Digits: [0-9]+. Accepted Values: value >= 1",
          "number",
          1
        )}

        {buildSelect(
          "datafetch",
          "Fetch Header/Body Data Pre Request Dispatch?",
          ["false", "true"],
          "Fetch value valid."
        )}
      </div>
      <div className="form-row">
        {formState.datafetch === "false"
          ? null
          : [
              <div class="col-12 bg-secondary justify-content-start">
                <h3 className="text-white col mr-auto">Data-Form</h3>
              </div>,
              buildTextNumberInput(
                "datahost",
                "Data Hostname",
                "www.hostname.com -> NS Record",
                "Data Hostname valid.",
                "Input invalid. Acceptance Criteria: /[a-z0-9.]/i",
                "text",
                null
              ),
              buildTextNumberInput(
                "datapath",
                "/Path/On/Datahost",
                "/Path/On/Datahost -> A Record.",
                "Pathname valid.",
                "Bad input. Must be empty string or string starting with /",
                "text",
                null
              ),
              buildTextNumberInput(
                "dataport",
                "TCP Port Of Data Server",
                "9999",
                "Port field valid.",
                "Accepts digits:+[0-9]. Accepts values: port > 0,  No decimals or fractions allowed.",
                "number",
                1
              ),
              buildSelect(
                "datamethod",
                "HTTP(S) Method",
                ["get", "put", "post", "delete"],
                "HTTP(S) method valid"
              ),
              //only render the option to add headers if the form is not used as delete form
              getDisabledStatus() ? null : (
                <AddHeader
                  setForm={setForm}
                  headers_name={"dataheaders"}
                  formState={formState}
                />
              ),
              <HeadersList
                headers_name={"dataheaders"}
                formState={formState}
                setForm={setForm}
                readonly={getDisabledStatus()}
              />,
            ]}
      </div>

      {formState !== preview_test ? buildFormFooter() : null}
    </div>
  );
}

export { SubmitForm, create_test, delete_test, edit_test };
