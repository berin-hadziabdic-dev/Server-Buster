import React, { useLayoutEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import CreateForm from "./StatefulComponents/SubmitForm/CreateForm";
import Nav from "./StatefulComponents/Nav/Nav";
import { FormList } from "./StatefulComponents/ListComponent/FormList";
import { notFalsy } from "./Validator/Validator";
import ReportList from "./StatefulComponents/ListComponent/ReportList";
import RunList from "./StatefulComponents/RunListComponent/RunList";
import Tutorial from "./StaticComponents/Tutorial";
let appMargin = <div style={{ "margin-top": "100px" }}></div>;
//List options
const edit_test = "Edit-Test";
const delete_test = "Delete-Test";
const create_test = "Create-Test";

function App() {
  return (
    <div className="App">
      <Router>
        <Nav />
        {appMargin}
        <Switch>
          <Route exact path="/tutorials">
            <Tutorial />
          </Route>
          <Route exact path="/editset">
            <FormList
              dropdown_options={[edit_test, delete_test]}
              title="Choose a Test-Set and a Corresponding Action"
            />
          </Route>
          <Route exact path="/newset">
            <CreateForm />
          </Route>
          <Route exact path="/reports">
            <ReportList />
          </Route>
          <Route exact path="/runset">
            <RunList />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
