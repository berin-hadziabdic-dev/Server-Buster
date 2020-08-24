const dns = require("dns");

async function hostExists(host) {
  let hostExists = true;
  let promise = new Promise((resolve, reject) => {
    dns.lookup(host, (err, addr, family) => {
      if (err === null) resolve(hostExists);
      else {
        hostExists = false;
        reject(hostExists);
      }
    });
  });

  return promise;
}

export default hostExists;
