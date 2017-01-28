'use strict';

function sleep(value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, value);
  });
}

function stringBytes(s) {
  // eslint-disable-next-line no-bitwise
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
