import axios from "axios";
const get = "get",
  put = "put",
  post = "post",
  delete_ = "delete";

// /gettestset route is used to pull all information regarding for testsets.
// type tells us what we need.
//type info below
// testsetnames = a list of all testsets.
//testset = test set form
// report = report for a specified testsetname

async function get_testsetnames() {
  return axios({
    url: "/gettestsetnames",
    method: get,
    validateStatus: () => true,
  });
}

function process_testsetnames(testsetnames) {
  let ret = null;

  if (Array.isArray(testsetnames)) {
    ret = testsetnames.map((dbObj) => dbObj.testsetname);
  }

  return ret;
}

function post_axios(url, postobj) {
  return axios({
    url: url,
    method: post,
    data: postobj,
    validateStatus: () => true,
  });
}

function get_axios(url) {
  return axios({
    url: url,
    method: get,
    validateStatus: () => true,
  });
}

function post_testsetname(testsetname_string) {
  return axios({
    url: "/posttestset",
    method: post,
    validateStatus: () => true,
    data: { testsetname: testsetname_string },
  });
}

function post_edittestset(testset) {
  return axios({
    url: "/edittestset",
    method: post,
    data: testset,
    validateStatus: () => true,
  });
}

export {
  get_testsetnames,
  process_testsetnames,
  post_testsetname,
  post_edittestset,
  post_axios,
  get_axios,
};
