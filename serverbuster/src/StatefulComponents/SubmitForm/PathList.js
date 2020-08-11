import React, { useState } from "react";
import {
  notNullUndefined,
  validateMethod,
  checkProperty,
} from "../../Validator/Validator";
import { isArray } from "jquery";

function PathList(props) {
  let { formState, setForm, readonly } = props;
  let pathIndex = 0;

  let valid_pathlist =
    notNullUndefined(formState.pathlist) &&
    Array.isArray(formState.pathlist) &&
    formState.pathlist.length >= 1;

  function removePath(e) {
    let { pathlist } = formState;
    let index = Number(e.target.name);
    let formStateCopy = { ...formState };

    let validPathIndex =
      Array.isArray(pathlist) &&
      index >= 0 &&
      index < pathlist.length &&
      notNullUndefined(pathlist[index]);

    if (validPathIndex) {
      formStateCopy.pathlist.splice(index, 1);
      setForm(formStateCopy);
    }
  }

  let table_contents = valid_pathlist ? (
    formState.pathlist.map((pathObject) => {
      let { path, method } = pathObject;
      let ret_row = (
        <tr>
          <td>{pathIndex}</td>
          <td>{path}</td>
          <td>{method}</td>
          <td>
            <input
              type="button"
              className="btn btn-outline-success"
              name={pathIndex}
              value="Remove Path"
              onClick={(e) => removePath(e)}
              disabled={readonly}
            />
          </td>
        </tr>
      );
      pathIndex++;

      return ret_row;
    })
  ) : (
    <tr>
      <td colSpan="4" className="text-warning">
        No pathnames added.
      </td>
    </tr>
  );

  return (
    <div className="col-12">
      <div style={{ height: "300px", overflow: "auto" }}>
        <table className="table bg-secondary text-white">
          <tr>
            <th colSpan="1">Dispatch Order</th>
            <th colSpan="1">Path</th>
            <th colSpan="1">HTTP Method</th>
            <th colSpan="1"></th>
          </tr>
          {table_contents}
        </table>
      </div>
    </div>
  );
}

function AddPathToList(props) {
  let { formState, setForm } = props; //get formstate and formstate setter
  let { pathlist } = formState; //get pathlist from formState mainly for readabiltiuy and cohe clarity
  let index = Array.isArray(pathlist) ? pathlist.length : 0;

  let [path, setPath] = useState(""); //Holds the copy of path to add
  let [methodbuffer, setMethodBuffer] = useState("get"); //holds the method of to add
  let [insertionIndex, setIndex] = useState(formState.pathlist.length); //holds what order to dispatch request in
  let [validPathInput, setValidPathInput] = useState(true); //bool tracking whether or not input supplied by user is good.

  //Onchange function. Accepts good input rejects bad nd sets validPathinput accordingly
  function onChange(e) {
    let { name, value } = e.target;

    if (name === "path") {
      //handler for path
      let pathgood = checkProperty("datapath", value);
      if (pathgood) setPath(value);
      setValidPathInput(pathgood);
    } else if (name === "methodbuffer") {
      // method of endpoint type change handler
      if (validateMethod(value)) {
        setMethodBuffer(value);
      }
    } else if (name === "index") {
      //insertion index of endpoint
      if (isArray(formState.pathlist) && value <= pathlist.length)
        setIndex(value);
    }
  }
  function addPath() {
    let formCopy = { ...formState };
    let { pathlist } = formCopy;
    let validpathlist = isArray(pathlist);
    let pathObject = {};

    if (
      checkProperty("path", path) &&
      validpathlist &&
      insertionIndex >= 0 &&
      insertionIndex <= pathlist.length
    ) {
      pathObject["method"] = methodbuffer;
      pathObject["path"] = path;
      pathlist.splice(insertionIndex, 0, pathObject);
      setForm(formCopy);
      setPath("");
      setMethodBuffer("get");
      setIndex(formState.pathlist.length);
      setValidPathInput(true);
    } else {
      setValidPathInput(false);
    }
  }

  return (
    <div className="col-12 form-row">
      <div className="form-group col-12 col-md-3">
        <label for="pathbuffer">API-Endpoint</label>
        <input
          type="text"
          className="form-control"
          value={path}
          placeholder="/pathmustbeginwithforwardslash"
          name="path"
          onChange={(e) => onChange(e)}
        />
        {validPathInput ? (
          <span className="form-text text-success">Input valid</span>
        ) : (
          <span className="form-text text-danger">
            Input invalid. Path must begin with /.
            Accepts:[^a-z0-9-._~:\/?#\[\]@!$&'()*+,;=] Multiple consecutive
            forwards slashes not allowed.
          </span>
        )}
      </div>
      <div className="form-group col-12 col-md-3">
        <label for="index">Dispatch order.</label>
        <input
          name="index"
          type="number"
          min={0}
          max={isArray(pathlist) ? pathlist.length : 0}
          className="form-control"
          value={insertionIndex}
          onChange={(e) => onChange(e)}
        />
      </div>
      <div class="form-group col-12 col-md-3">
        <label for="methodbuffer">Endpoint HTTP Method </label>
        <select
          id="path-method"
          className="form-control"
          onChange={(e) => {
            onChange(e);
          }}
          name="methodbuffer"
        >
          <option value="get">get</option>
          <option value="put">put</option>
          <option value="post">post</option>
          <option value="delete">delete</option>
        </select>
      </div>
      <div className="form-group col-12 col-md-3">
        <label for="add-path-btn" className="text-white">
          Nothing to see here. :)
        </label>
        <input
          type="button"
          className="form-control btn btn-outline-success"
          value="Add Endpoint"
          id="add-path-btn"
          onClick={addPath}
        />
      </div>
    </div>
  );
}
export { PathList, AddPathToList };
