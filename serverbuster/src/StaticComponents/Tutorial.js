import React from "react";
import hostpath from "./hostpathtutorial.png";
import forksports from "./reqspersecforks.png";
import datafetch from "./datafetch.png";
import editdelete from "./editdelete.png";
import selectreport from "./selectreport.png";
import checkbox from "./checkbox.png";
import report from "./report.png";
import runreport from "./runreport.png";
function Tutorial() {
  return (
    <div className="container">
      <div className="form-row">
        <h1>The Serverbuster</h1>
        <p>
          This tool can flood routes on your server with Get, Put,Post, and
          Delete HTTP requests. For routes that require header or body data,
          like in the case of authentication or some other purpose, the user,
          that's you and me, needs to generate this data. You should be familiar
          with the basics of TCP and HTTP. I.e, know the tcp port your test
          server runs on, and know the correct header or body contents to send
          to your routes. This tool intended to be used on localhost, and it's
          probably a terrible idea to expose it to the public network. The main
          benefit in this tool is that you can try to simulate regular or even
          extreme conditions. I.e, what happens if 10,000 users try to login at
          the same time, or what happens if 5000 users post a comment in a
          comment section and so on and so forth. It revolves around testsets,
          configuration files of what host to spam, what routes to spam, and how
          much to spam, and reports which just give you the results of each
          request response hair by displaying the corresponding request and
          response headers, body, and status code.
        </p>
      </div>
      <div className="form-row">
        <h1>The Testset</h1>
        <p>
          The testset is a configuration JSON that instructs the ServerSpam
          microservice what to spam, how much to spam, how long to spam, and how
          and where to get pre spam data. To explain everything, we'll use a
          simple example. Suppose, I have a simple Node.js server that I'd like
          to deploy for a customer. Locally, I chose to run that server on
          localhost:3030 before deployment. This server has several routes.
          <table className="table">
            <thead>
              <td>Route</td>
              <td>Method</td>
              <td>Required Headers</td>
              <td>Required Body</td>
            </thead>
            <tbody>
              <tr>
                <td>/login</td>
                <td>Post</td>
                <td>Cookies=username=..;password=..</td>
                <td>No body required</td>
              </tr>
              <tr>
                <td>/getaccountinfo</td>
                <td>Post</td>
                <td>Cookies=username=..;password=..</td>
                <td>No body required</td>
              </tr>
              <tr>
                <td>/makepost</td>
                <td>Put</td>
                <td>Cookies=username=..;password=..</td>
                <td>{"JSON Body: {username:string, postmsg:string}"}</td>
              </tr>
            </tbody>
          </table>
        </p>
        <p>
          So far, what we know is that our server runs on localhost on TCP port
          3030, and it exposes three routes. Say, I'd like to attempt accessing
          these routes at a rate of 200 requests per second for a total of three
          seconds. To do this, we need to create a new testset which can be
          reached via New Test Set link on the nav bar. Here's an image of a
          testset form which does that very thing.
          <br></br>
          <img src={hostpath} />
          <br></br>
          Up above, I'm creating a new testset. I gave it a testset name.
          Testsetnames are unique and if I attempt to use an existing already
          taken testsetname, it would be marked invalid; I would also not be
          able to create the testset,so be sure to use unique non-existing
          testset names!Further, you also see I selected localhost as my target
          host, and you also see that I have added two paths. /login and
          /getaccountinfo. I am also in the process of adding a third. To the
          left of the Add-Endpoint button is the form that adds api-endpoints to
          the pathlist. Eveyrthing else is pretty self explanatory, aside from
          the dispatch order. The pathlist object stores the list of paths you'd
          like to spam for each testset, and it follows this JSON definition,
          assuming I added the third path:
          <pre>
            {JSON.stringify(
              {
                0: { method: "post", path: "/login" },
                1: { method: "post", path: "/getaccountinfo" },
                2: { method: "put", path: "/makepost" },
              },
              null,
              2
            )}
          </pre>
          For each set of paths, /login, /getaccountinfo, and /makepost, the
          application expects a single set of data. (Set of data = user, in most
          cases) More on this later. In any case, assuming the data set is
          correctly generated, then three requests, are sent to the pathlist, in
          the correct order:
          <ol>
            <li>Post to /login with the same dataset</li>
            <li>Post to /getaccountinfo with the same dataset</li>
            <li>Put to /makepost with the same dataset </li>
          </ol>
          After all three paths have been transacted with, the app will then
          follow the same procudure, but advance to the the next data element.
          In this example, its useful to think of these data elements as perhaps
          simulating different users visiting all three routes.
        </p>
        <p>
          The final part of the testset configuration involves specifying a tcp
          port, requests per second, requests persecond duration, number of
          forks, and fetching of data.
          <img src={forksports} />
          <br></br>
          Above, I am instructing the Serverspam microservice to send requests
          to TCP port 3030. The reqspersecond field simply specifies how many
          requests per second I'd like to dispatch. The secondduration field
          specifies how many seconds the Serverspam microservice will spam the
          server. In the example above, I am spamming 200 reqs per second for 3
          seconds, so a total of 600 requests will be sent over three seconds if
          the Node event loop behaves nice.
        </p>

        <p>
          <h2 className="badge badge-primary">Field breakdown:</h2>
          <p>
            {" "}
            With the example above, here's an easy to digest table that defines
            all of the relevant fields.
          </p>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">fieldname</th>
                <th scope="col">definition</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>testsetname</td>
                <td>A unique name that identifies the testset</td>
              </tr>
              <tr>
                <td>hostname</td>
                <td>the hostname where requests will be funneled to</td>
              </tr>
              <tr>
                <td>http/https</td>
                <td>
                  Use http or https to dispatch requests.Currently, only http
                  supported.
                </td>
              </tr>

              <tr>
                <td>API-Endpoint</td>
                <td>The Endpoint to target on hostname:tcpport.</td>
              </tr>
              <tr>
                <td>Dispatch-Order</td>
                <td>
                  For one unique set of paths and data element, this field
                  determines the order in which the request will be dispatched
                  to the path. 0 = first path, 1 = second path, and etc
                  perdataset or user.
                </td>
              </tr>
              <tr>
                <td>Endpoint HTTP Method</td>
                <td>
                  The method with which to dispatch requests for the
                  corresponding dispatch order.
                </td>
              </tr>
              <tr>
                <td>TCP Port Of Test-Server</td>
                <td>
                  The TCP Port # which your test server will be listening on.
                </td>
              </tr>

              <tr>
                <td># Of TestSets Forks</td>
                <td>
                  If one Node.js process cannot handle the request load you'd
                  like to spam your server with,you can fork several copies of
                  it.Note the same dataset will be used in each fork.
                </td>
              </tr>
              <tr>
                <td>Reqs Per Second To Dispatch</td>
                <td>
                  The number of requests per second you'd like to dispatch.
                </td>
              </tr>
              <tr>
                <td>Second Duration</td>
                <td>The second duration of the Reqs Per Second dispatch.</td>
              </tr>
              <tr>
                <td>Datafetch</td>
                <td>
                  Set to true if you'd like to fetch data before beginning spam.
                  For get requests this isn't required. For put, post, and
                  delete, this may be required since your server routes may need
                  headers or a body to fully carry out their duties. The
                  datafetching routine is covered below.
                </td>
              </tr>
            </tbody>
          </table>
        </p>
      </div>
      <div className="form-row">
        <h1 className="col-12">Datafetching</h1>
        <p>
          The data set consists of data elements. In the context of the example
          above, each data element can be thought of as something representing a
          user. Each data element is then used to post the set of routes
          specified in the testset in the exact dispatch order. In the example
          above, one data element is used for /login, /getaccountinfo, and
          /makepost. This app requires that you have mongoDB installed, that you
          automatically generate your data, and that your data be in a simple
          but very specific format. First, the dataset itself must be an Array,
          and second the structure of each element is as follows.
          <pre>
            {JSON.stringify(
              [
                {
                  headers: {
                    username: "1",
                    password: "1",
                  },
                  body: '{postMsg:"Hi from user 1!"}',
                },
                {
                  headers: {
                    username: "2",
                    password: "2",
                  },
                  body: '{postMsg:"Hi from user 2!"}',
                },
              ],
              null,
              2
            )}
          </pre>
          Each data element in the array must be an object with a defined
          headers and body property, and again, it's useful to think of these
          data elements as users, and again, each data element will be used on
          the pathlist set specified in the testset. I don't think this should
          limit anyone too much, since its fairly straightforward to generate
          this data in the language of your choice and convert it to JSON before
          sending it back to the app.
          <em>
            Under normal conditions, the server can send the client information
            in headers and body. For example, if I login to a website, I might
            get a sessionID in my cookies. At this time, the application expects
            all server supplied information, such as cookies and etc., to be
            supplied in the user generated dataset. In otherwords, you need to
            know what these values and fields are. The app does not track client
            state like the browser does, but this feature will be added in the
            future. In fact, it is first on the docket.
          </em>
        </p>
      </div>
      <div className="form-row">
        <h1>Configuring Datafetching</h1>
        <p>
          Configuring datafetching is ,more or less, the same as configuring
          your testset. The application assumes the test data will be accesible
          via an HTTP endpoint. This shouldn't be too much of a limitation. I
          found it easy to add a datafetch route to the server I was testing.
          Here's an image of the data portion of the test form below.
          <br></br>
          <img src={datafetch} />
          <table className="table">
            <thead>
              <tr>
                <th scope="col">fieldname</th>
                <th scope="col">definition</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data Hostname</td>
                <td>The hostname of the system supplying the data.</td>
              </tr>
              <tr>
                <td>/Path/On/Datapoint</td>
                <td>The API endpoint of the data used by the testset.</td>
              </tr>

              <tr>
                <td>TCP Port Of Data Server</td>
                <td>
                  The TCP port of hostname application supplying the data.
                </td>
              </tr>

              <tr>
                <td>HTTP(S) Method</td>
                <td>
                  The method with which to access the data with on the API
                  endpoint.
                </td>
              </tr>
              <tr>
                <td>Header Name</td>
                <td>
                  A header key that can be be added to the request value, but
                  only with a paired header value
                </td>
              </tr>
              <tr>
                <td>Header Value</td>
                <td>
                  The value of a header key. Both the header name and header
                  value must contain valid values, in order to be added.
                </td>
              </tr>
              <tr>
                <td>Datafetch</td>
                <td>
                  Set to true if you'd like to fetch data before beginning spam.
                  For get requests this isn't required. For put, post, and
                  delete, this may be required since your server routes may need
                  headers or a body to fully carry out their duties. The
                  datafetching routine is covered below.
                </td>
              </tr>
            </tbody>
          </table>
        </p>
      </div>
      <div className="form-row">
        <h1> Edit And Delete</h1>
        <p>
          {" "}
          You can edit or delete testsets. To access this feature, click on the
          Edit/Delete-Test-Set link. Type in the name of your target testset in
          the combobox, and select whether or not you'd like to delete or edit a
          testset using the select dropdown. If you are editing a testset,
          you'll be allowed to enter and change values into the form. If you are
          deleting a testset, the form will be disabled. Scroll down to the
          bottom of the page. If all testset fields contain valid values, click
          the Update or Delete button. Editing a testset replaces the old
          testset value with the new testvalue. Deleting a testset will remove
          the testset from the database and remove all reports associated with
          the testset.
          <br></br>
          <img src={editdelete}></img>
        </p>
      </div>
      <div className="form-row">
        <h1>Viewing Reports</h1>
        <p>
          You can view reports by selecting a testset name from the testset
          combo box, and a report name from the select drop down. The select
          drop down will be disabled if no reports exist for a given testset.
          <br></br>
          <img src={selectreport}></img>
        </p>
      </div>
      <div className="form-row">
        <h1>Filtering reports by Status</h1>
        <p>
          {" "}
          After a report has been selected, and if said report is a non empty
          report, you will see status code checkbox list. These checkboxes and
          their numeric labels represents all of the status code responses
          returned for that particular report. If you encounter a -1 status code
          checkbox, this means there was an error with a specific response. This
          most likely is a timeout error or a tcp socket hangout. You will also
          see a pathlist drop down. This dropdown represents the different paths
          the report sent requests to.
          <br></br>
          {<img src={checkbox}></img>}
        </p>
        <h1>The Report</h1>
        <p>
          {" "}
          Each report contains a set of req and res pairs dispatched on a
          specific path. In my example, I selected the /login route, so I will
          be able to view all reports for all different users sent to this
          route. You can filter out reqres pair by unchecking their status code.
          For example, in the image below, I unchecked status codes 200 and 400,
          so that I can only see the req res pairs which threw an error. If
          there was an error, the error is described in the response report body
          section. You can also cycle through the backing array using the number
          select labeled dispatch order. When no status codes have been filtered
          out, this ordering should represent the order which the requests hit
          the back end. That is, the zeroth req/res pair was the first request
          sent to the path, the first is the second, and so on and so forth.
          When requests are filtered out by status, they are pulled out of the
          backing array and the survivors are spliced together. In a nutshell,
          indices are not preserved but relative numerical ordering is.{" "}
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <img src={report} />
        </p>
      </div>
      <div className="form-row">
        <h1>Running A Testset</h1>
        <p>
          Running a testset is easy. You can access this feature through the
          navbar link Run-TestSet.Select a testset name from the select dropdown
          and type in a report name in the text input to the right. You'll get a
          warning if the report name is already taken or invalid. Also note that
          the very first forked process takes on the original report name while
          any forks after have their fork number appended to the report name.
          <br></br> <br></br>
          <br></br> <br></br>
          <img src={runreport} />
        </p>
      </div>
    </div>
  );
}

export default Tutorial;
