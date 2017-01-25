'use strict';

const moment = require('moment');

class DateObj {
  constructor(value) {
    this.obj = moment.utc(value);
  }

  getTimestamp() {
    return parseInt(this.obj.format('x'));
  }

  getFormatted(format) {
    return this.obj.format(format);
  }

  getUTCString() {
    return this.getFormatted();
  }
}

function getTimestamp(value){
  return (new DateObj(value)).getTimestamp();
}

module.exports = {
  DateObj,
  getTimestamp,
};
