'use strict';

const moment = require('moment');

class DateObj {
  constructor(value) {
    this.obj = moment.utc(value);
  }

  getTimestamp() {
    return parseInt(this.obj.format('x'), 10);
  }

  getFormatted(format) {
    return this.obj.format(format);
  }

  getUTCString() {
    return this.getFormatted('YYYY-MM-DDTHH:mm:ss.SSSS[Z]');
  }
}

function getTimestamp(value) {
  return (new DateObj(value)).getTimestamp();
}

function getUTCString(value) {
  return (new DateObj(value)).getUTCString();
}

module.exports = {
  DateObj,
  getTimestamp,
  getUTCString,
};
