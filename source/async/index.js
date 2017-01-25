'use strict';

const _ = require('lodash');

function chain(promises){
  return new Promise((resolve, reject) => {
    let out = Promise.resolve();
    let e;
    const results = [];

    promises.forEach((p) => {
      out = out.then((prev) => {
        results.push(prev);
        if(!e){
          const args = _.isArray(p.arguments) ? p.arguments : [];
          return p.promise.apply(undefined, p.arguments);
        }
      })
      .catch((err) => {
        e = new Error();
        e.results = results.slice(1);
        e.error = err;
        reject(e);
      });
    });

    out.then((prev) => {
      results.push(prev);
      resolve(results.slice(1));
    });
  });
}

module.exports = {
  chain,
}
