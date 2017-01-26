'use strict';

function sleep(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, value);
  });
}

module.exports = {
  sleep,
}
