import React, { useState, useEffect } from "react";
import { notFalsy, checkProperty } from "../../Validator/Validator";
import { SubmitForm, delete_test, edit_test } from "../SubmitForm/SubmitForm";
import {
  get_testsetnames,
  process_testsetnames,
  post_testsetname,
} from "../../Axios/axiosroutes";
import LoadingSpinner from "../../StaticComponents/loadingSpinner";

import { ServerStrip } from "../../StaticComponents/ServerStrip";
const combobox = "combox";
const select = "select";

function FormNotFound(selectedTestSetName) {
  return (
    <div className="container">
      {" "}
      <div class="form-row">
        <p>
          No forms associated with{" "}
          {notFalsy(selectedTestSetName)
            ? selectedTestSetName
            : "Falsy-esque Testsetname"}{" "}
          discovered. If you're sure one exists, make sure the server is up and
          running.{" "}
        </p>
      </div>
    </div>
  );
}

function FormList(props) {
  let [reloadTestsetNames, setReloadNames] = useState(true);
  let [testsetnames, settestsetnames] = useState(null); //used to activate an effect responsible for fetching data for this component.4
  let { dropdown_options, title } = props;
  let [selectedTestsetName, setSelectedTestsetName] = useState(""); // this holds the testset name the user inputs into combobox.
  let [selectedForm, setSelectedForm] = useState(null); // when a test setname matches a form in the formsArray, that form is held hostage in these variables.
  let [formtype_option, setOption] = useState(dropdown_options[0]); //this pair of variables holds the options of the very lovely dropdown select.
  let [status, setStatus] = useState("N/A");
  function gettestsetnames_handler() {
    get_testsetnames().then((resp) => {
      let namesarray = process_testsetnames(resp.data);
      settestsetnames(namesarray);
    });
  }

  function post_testsetname_handler() {
    post_testsetname(selectedTestsetName).then(
      (resp) => {
        if (resp.status === 200) {
          setSelectedForm(resp.data.testset);
        } else {
          setSelectedForm(null);
        }
      },
      (err) => {}
    );
  }

  useEffect(gettestsetnames_handler, []);
  useEffect(() => {
    gettestsetnames_handler();
    setSelectedTestsetName("");
  }, [reloadTestsetNames]);
  useEffect(post_testsetname_handler, [selectedTestsetName]);
  //onchange function for this component
  function onChange(e) {
    let { name, value } = e.target;
    let whitespaceTest = /\s/gi;
    e.preventDefault();

    switch (name) {
      case combobox:
        //if no whitespaces set selectedItemname to value.
        if (checkProperty("testsetname", value) || value === "")
          setSelectedTestsetName(value);
        break;
      case select: //options are predefined, so no validation since theres no input error.Call setter right off the bat.
        setOption(value);
        break;
    }
  }

  //This function selects what kind of submit form to build based on the formtype property
  //for example, if formtype === edit_form, then the edit form will be built.
  function buildSubmitFormFromFormType() {
    let retForm = null; //by default return form docs if a form can't be selected.

    //If selected form === null, then the user has entered an invalid form name, and thus
    //we need not render any Submit forms, and should instead render the informative warning retForm is
    // initted to.
    if (selectedForm !== null)
      switch (formtype_option) {
        case delete_test:
          retForm = (
            <SubmitForm
              formtype={formtype_option}
              formState={selectedForm}
              setForm={setSelectedForm}
              setReloadNames={setReloadNames}
              status={status}
              setStatus={setStatus}
            />
          );
          break;
        case edit_test:
          retForm = (
            <SubmitForm
              formtype={formtype_option}
              formState={selectedForm}
              setForm={setSelectedForm}
              setReloadNames={setReloadNames}
              status={status}
              setStatus={setStatus}
            />
          );
          break;
      }

    return retForm;
  }

  function buildSelects() {
    let fetchingdata = testsetnames instanceof Promise;

    return (
      <div className="form container bg-secondary">
        <div className="form-row text-white">
          <h1>{title}</h1>
        </div>
        <div className="form-row">
          <div className="form-group col-12 col-md-3">
            <React.Fragment>
              <label for="combox" className="text-white">
                Test Set Combobox
              </label>
              <input
                list="primaries"
                value={selectedTestsetName}
                className="form-control"
                name={combobox}
                placeholder="Enter quarry here"
                onChange={onChange}
                disabled={
                  //disable the input if testsetnames are falsy
                  fetchingdata
                }
              />
            </React.Fragment>

            <datalist id="primaries">
              {
                //populate datalist with testsetnames.
                notFalsy(testsetnames)
                  ? testsetnames.map((testsetname) => (
                      <option value={testsetname}>{testsetname}</option>
                    ))
                  : null
              }
            </datalist>
          </div>

          <div className="form-group col-12 col-md-3">
            <React.Fragment>
              <label for="primaries" className="text-white">
                Action To Take
              </label>
              <select
                value={formtype_option}
                id="select-option"
                className="form-control"
                onChange={onChange}
                name={select}
                disabled={!notFalsy(dropdown_options)}
              >
                {notFalsy(dropdown_options)
                  ? dropdown_options.map((option) => {
                      return <option value={option}>{option}</option>;
                    })
                  : null}
              </select>
            </React.Fragment>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {buildSelects()}
      <div className="container"> {<ServerStrip status={status} />}</div>
      {notFalsy(selectedForm)
        ? buildSubmitFormFromFormType()
        : FormNotFound(selectedTestsetName)}
    </React.Fragment>
  );
}

export { FormList };
