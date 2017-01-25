'use strict';

const aws = require('aws-sdk');
const meta = new aws.MetadataService();

let id;

function fetchId(){
  return new Promise((resolve, reject) => {
    return meta.request('/latest/meta-data/instance-id', (err, data) => {
      if (err) {
        return reject('EC2 instance unreachable');
      }
      id = data;
      resolve(data);
    });
  });
}

function getInstanceId(){
  if(id){
    return Promise.resolve(id);
  }else{
    return fetchId();
  }
}

module.exports = {
  getInstanceId,
}
