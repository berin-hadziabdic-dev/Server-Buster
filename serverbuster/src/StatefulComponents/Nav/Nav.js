import React from "react";
import { Link } from "react-router-dom";
function Nav(props) {
  return (
    <nav
      className="navbar navbar-expand-md fixed-top navbar-dark border-bottom"
      style={{
        background:
          "linear-gradient(90deg, rgba(0,210,26,1) 0%, rgba(0,179,130,1) 100%)",
      }}
    >
      <a className="navbar-brand badge">Test-Sets</a>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#collapser"
        aria-controls="collapser"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="collapser">
        <ul className="navbar-nav ml-auto">
          <Link to="tutorials" className="nav-item">
            <a className="nav-link">Tutorials</a>
          </Link>
          <Link to="newset" className="nav-item">
            <a className="nav-link">New-Test-Set</a>
          </Link>
          <Link to="editset" className="nav-item">
            <a className="nav-link">Edit/Delete-Test-Set</a>
          </Link>
          <Link to="reports" className="nav-item">
            <a className="nav-link">View-Reports</a>
          </Link>
          <Link to="runset" className="nav-item">
            <a className="nav-link">Run Testset</a>
          </Link>
        </ul>
      </div>
    </nav>
  );
}

export default Nav;
