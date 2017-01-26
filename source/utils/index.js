'use strict';

function sleep(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, value);
  });
}

function stringBytes(s) {
  return ~-encodeURI(s).split(/%..|./).length;
}

function jsonSize(s) {
  return stringBytes(JSON.stringify(s));
}

module.exports = {
  sleep,
  stringBytes,
  jsonSize,
};
