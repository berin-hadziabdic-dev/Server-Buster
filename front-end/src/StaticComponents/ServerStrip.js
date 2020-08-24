import React from "react";
import { notFalsy } from "../Validator/Validator";

const STATUS_NA = "N/A";

function buildServerStripType(formtype) {
  let properties = {
    title: "Create Testset Server Response",
    code_200_msg: "Testset created.",
    code_204_msg:
      "Testset was not created. Perhaps, the name is already taken.",
    code_400_msg: "Test set was not created. Did not pass back end validation.",
    code_500_msg: "Server error. Testset not created.",
  };
  switch (formtype) {
    case "Edit-Test":
      properties = {
        title: "Edit Testset server response",
        code_200_msg: "Testset update persisted.",
        code_204_msg: "Testset update processed but not persisted.",
        code_400_msg:
          "Testset did not pass backend validation.Updated testset not persisted.",
        code_500_msg: "Testset not persisted. Server error.",
      };
      break;
    case "Delete-Test":
      properties = {
        title: "Delete test server response.",
        code_200_msg: "Testset annihilated.",
        code_204_msg: "Testset deletion started but not completed.",
        code_400_msg: "Bad input given to server.",
        code_500_msg: "Server error.",
      };
      break;
  }

  return <ServerStrip status={"status"} {...properties} />;
}

function ServerStrip(props) {
  let status = notFalsy(props.status) ? props.status : STATUS_NA;
  let text_className = "text-success";

  switch (status) {
    case 200:
    case 204:
      break;
    case 400:
      text_className = "text-danger";
      break;
    case 500:
      text_className = "text-warning";
      break;
    default:
      text_className = "text-primary";
      break;
  }
  return (
    <div className="form-row">
      <h2>{notFalsy(props.title) ? props.title : "Server-Response"}</h2>
      <div className="col-12">
        {" "}
        Status Code: <span className={text_className}></span>{" "}
        {notFalsy(status) ? status : STATUS_NA}
      </div>
      <div className="col-12">
        <h4>Status Legend</h4>
        <ul>
          <li className="text-success">
            200:{" "}
            {props.code_200_msg ? props.code_200_msg : "Operation Successful"}
          </li>
          <li className="text-success">
            204:{" "}
            {notFalsy(props.code_204_msg)
              ? props.code_204_msg
              : "Operation processed did not complete."}
          </li>
          <li className="text-danger">
            400:{" "}
            {notFalsy(props.code_400_msg)
              ? props.code_400_msg
              : "Operation processed but not completed. Bad user input."}
          </li>
          <li className="text-warning">
            500:{" "}
            {notFalsy(props.code_500_msg)
              ? props.code_500_msg
              : "Operation did not complete. Server error."}
          </li>
          <li className="text-primary">
            N/A: No requests sent to server. No response available.{" "}
          </li>
        </ul>
      </div>
    </div>
  );
}

export { ServerStrip };
