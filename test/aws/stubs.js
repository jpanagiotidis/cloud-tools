'use strict';

function SQSStub(){}

SQSStub.prototype.sendMessage = function(msg) {
  return {
    promise() {
      return Promise.resolve({
        ResponseMetadata: {
          RequestId: 'f56a95a1-9c9a-5e1b-9528-c55c436c242f'
        },
        MD5OfMessageBody: 'ffa3ca183028fe4cf7d6f32bb290bceb',
        MessageId: '8e2b4104-423c-46f0-b718-62616b6918d6',
      });
    }
  }
}

function SQSErrorStub(){}

SQSErrorStub.prototype.sendMessage = function(msg) {
  return {
    promise() {
      const e = new Error()
      e.message = 'The request has failed due to a temporary failure of the server.';
      e.code = 'AWS.SimpleQueueService.ServiceUnavailable';
      e.status = 503;
      return Promise.reject(e);
    }
  }
}

module.exports = {
  SQSStub,
  SQSErrorStub,
}

/*
 * ON SUCCESS
{ ResponseMetadata: { RequestId: 'f56a95a1-9c9a-5e1b-9528-c55c436c242f' },
  MD5OfMessageBody: 'ffa3ca183028fe4cf7d6f32bb290bceb',
  MessageId: '8e2b4104-423c-46f0-b718-62616b6918d6' }

 * QUEUE doesnt exist
 { [AWS.SimpleQueueService.NonExistentQueue: The specified queue does not exist for this wsdl version.]
  message: 'The specified queue does not exist for this wsdl version.',
  code: 'AWS.SimpleQueueService.NonExistentQueue',
  time: Sun Jan 22 2017 00:18:23 GMT+0200 (EET),
  requestId: '9506a769-d049-5ce7-a3bb-f7943026e3fa',
  statusCode: 400,
  retryable: false,
  retryDelay: 20.15042775310576 }
*/
