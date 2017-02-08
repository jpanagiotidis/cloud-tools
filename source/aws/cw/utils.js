'use strict';

const _ = require('lodash');
const jsonSize = require('../../utils').jsonSize;

const TIME_THRESHOLD = 1000 * 60 * 60 * 23;
const SIZE_THRESHOLD = 1000000;

function sortLogs(logs) {
  if (!_.isArray(logs)) {
    throw new Error('An array was expected');
  }

  return logs.sort((a, b) => {
    if (a.timestamp > b.timestamp) {
      return 1;
    } else if (a.timestamp < b.timestamp) {
      return -1;
    }
    return 0;
  });
}

function prepareLogsBatches(logs) {
  if (!_.isArray(logs) || logs.length === 0) {
    return [];
  }

  const out = [];

  const sLogs = sortLogs(logs);
  let batch = [];
  out.push(batch);
  let cTimestamp = sLogs[0].timestamp;
  let cSize = 0;
  _.each(sLogs, (l) => {
    const tempSize = jsonSize(l);
    if (
      cSize + tempSize < SIZE_THRESHOLD &&
      l.timestamp - cTimestamp < TIME_THRESHOLD
    ) {
      cSize += tempSize;
      batch.push(l);
    } else {
      batch = [];
      out.push(batch);
      batch.push(l);
      cSize = 0;
      cTimestamp = l.timestamp;
    }
  });

  return out;
}

module.exports = {
  sortLogs,
  prepareLogsBatches,
};
