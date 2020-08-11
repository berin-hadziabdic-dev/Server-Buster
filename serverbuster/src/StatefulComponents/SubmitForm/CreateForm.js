import React, { useState, useEffect } from "react";
import { SubmitForm, create_test } from "./SubmitForm";
import { ServerStrip } from "../../StaticComponents/ServerStrip";
function CreateForm(props) {
  let [formState, setForm] = useState(buildNewTestForm()); //Build empty Test form
  let [resetForm, setResetForm] = useState(false); //this state variable triggers resetting of formState effect
  let [status, setStatus] = useState("N/A");

  function buildNewTestForm() {
    //This ret_val value is used for forms which edit an existing Test-Set.
    return {
      host: "",
      protocol: "http",
      testsetname: "",
      pathlist: [],
      port: 1,
      method: "get",
      headers: {},
      forks: 1,
      reqspersecond: 1000,
      secondduration: 3,
      datafetch: "true",
      datahost: "",
      dataport: 1,
      datamethod: "post",
      datapath: "",
      dataheaders: {},
      databody: "",
    };
  }

  useEffect(() => {
    setForm(buildNewTestForm());
  }, [resetForm]);

  return (
    <React.Fragment>
      <div className="container">
        <ServerStrip status={status} />
      </div>
      <SubmitForm
        formtype={create_test}
        setForm={setForm}
        formState={formState}
        resetForm={resetForm}
        setResetForm={setResetForm}
        status={status}
        setStatus={setStatus}
      />
    </React.Fragment>
  );
}

export default CreateForm;
