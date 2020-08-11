let http = require("http");

function processPostData(resp, postDataBuffer, requestJSON) {
  postDataBuffer = "";
  resp.on("data", (data) => {
    postDataBuffer += data;
  });

  resp.on("end", function () {
    postDataBuffer = JSON.parse(postDataBuffer);
  });
}

function fetchRequestsData(requestJSON) {
  const options = {
    host: requestJSON.datahost,
    path: requestJSON.datapath,
    method: requestJSON.datamethod,
    headers: requestJSON.dataheaders,
    port: requestJSON.dataport,
  };

  let postDataBuffer;

  //return http.request wrapped in a promise, so that
  //when data fetching is finished, the promise can
  //be used to init playback.
  let req = http.request(options, (resp) =>
    processPostData(resp, postDataBuffer, requestJSON)
  );
  if (requestJSON.databody !== undefined) req.write(databody);
  req.end();

  return postDataBuffer;
}

module.exports.scheduleDataRequests = fetchRequestsData;
