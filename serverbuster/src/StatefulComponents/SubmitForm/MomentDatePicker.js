import moment from "moment";
import React, { useState } from "react";

//moment tips:
//moment([year, month, day, hour, minute, second, millisecond])
//moment cloning: momentCopy = moment(oldMoment)
//getters and setters are overloaded. moment.noun() -> getter, moment.noun(value) -> setter
// moment.second() -> get second moment.hour(12) -> set hour

/* <MomentDatePicker
className={"col-12 col-md-6"}
date={date}
setDate={setDate}
/>*/

function inFuture(date) {
  let now = moment();
  let inFuture = false;
  if (
    date.year() > now.year() ||
    date.month() > now.month() ||
    date.day() > now.day()
  ) {
    inFuture = true;
  }

  return inFuture;
}
function MomentDatePicker(props) {
  let { date, setDate, className } = props; //get date object and setter from parent form
  let [warnings, setWarnings] = useState({
    //Create warning objects for bad user input.
    date: false,
    hour: false,
    minute: false,
  });

  function onChange(e) {
    let now = moment();
    let warningsCopy = { ...warnings };
    let { name, value } = e.target;

    switch (name) {
      case "date":
        let parsedDateValue = moment(value);
        if (parsedDateValue.unix() > now.unix()) {
          setDate(moment(e.target.value)); //set date to new moment create with the new date input
          warningsCopy[e.target.name] = false; //valid date turn any warnings off
        } else {
          warningsCopy[e.target.name] = true; //invalid date turn warning on
        }
        break;
      case "hour":
      case "minute":
        let date_moment_clone = moment(date);
        date_moment_clone[name](Number(value));
        if (date_moment_clone.unix() > now.unix()) {
          setDate(date_moment_clone);
          warningsCopy[value] = false;
        } else {
          warningsCopy[value] = true;
        }
        break;
    }

    setWarnings(warningsCopy);
  }

  return (
    <div className={className + " form-group form-row"}>
      <div className="form-group ">
        <label for="date">Date Of Test</label>
        <input
          className="form-control"
          value={date.format("YYYY-MM-DD")}
          name="date"
          type="date"
          id="date"
          onChange={onChange}
        />
        {warnings["date"] ? (
          <span className="form-text text-danger">
            Scheduled date must be in the present or future.
          </span>
        ) : (
          <span className="form-text text-success">Date valid</span>
        )}
      </div>
      <div className="form-group col-2">
        <label for="hour" className="form-text ">
          Hour
        </label>
        <input
          className="form-control"
          type="number"
          name="hour"
          id="hour"
          min={inFuture(date) ? 0 : moment().hour()} // if date is 1 day,month, or year ahead the min hr is 0
          max={24}
          onChange={onChange}
          value={date.hour()}
        />
        {warnings["hour"] ? (
          <span className="form-text text-danger">
            Can't set hour field into the past.
          </span>
        ) : (
          <span className="form-text text-success">Hour input good.</span>
        )}
      </div>
      <div className="form-group col-2">
        <label for="minute" className="form-text ">
          Minute
        </label>
        <input
          className="form-control"
          type="number"
          name="minute"
          min={inFuture(date) ? 0 : date.minute()}
          max={59}
          onChange={onChange}
          value={date.minute}
        />
        {warnings["minute"] ? (
          <span className="form-text text-danger">
            Can't set minute field into the past.
          </span>
        ) : (
          <span className="form-text text-success">Minute input good.</span>
        )}
      </div>
    </div>
  );
}

export default MomentDatePicker;
