'use strict';

const _ = require('lodash');
const jsonSize = require('../../utils').jsonSize;

function prepareLogsBatches(logs) {
  if(!_.isArray(logs) || logs.length === 0){
    return [];
  }

  const out = [];
  const threshold = 1000*60*60*23;

  let sLogs = sortLogs(logs);
  let batch = [];
  out.push(batch);
  let cTimestamp = sLogs[0].timestamp;
  let cSize = 0;
  _.each(sLogs, (l) => {
    let tempSize = jsonSize(l);
    if(
      cSize + tempSize < 1000 &&
      l.timestamp - cTimestamp < threshold
    ) {
      batch.push(l);
    }else{
      batch = [];
      out.push(batch);
      batch.push(l);
      cSize = 0;
      cTimestamp = l.timestamp;
    }
  });

  return out;
}

function sortLogs(logs) {
  return logs.sort((a, b) => {
    if(a.timestamp > b.timestamp){
      return 1;
    }else if(a.timestamp < b.timestamp){
      return -1;
    }else{
      return 0;
    }
  });
}

module.exports = {
  sortLogs,
  prepareLogsBatches,
};
