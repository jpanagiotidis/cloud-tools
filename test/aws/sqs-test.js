'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const aws = require('aws-sdk');
const SQSProducer = require('../../source/aws/sqs/producer.js').SQSProducer;

describe('AWS SQS Tests Suite', function(){
  it('sendMessage stub', sinon.test(function(done){
    this.stub(aws, 'SQS', AWSStub);

    const sqs = new aws.SQS();

    sqs.sendMessage()
    .then(() => {
      done();
    })
    .catch((err) => {
      done(err);
    })
  }));
});

function AWSStub(){
  console.log('This is AWS Stub constructor');
}

AWSStub.prototype.sendMessage = function(msg) {
  console.log('sendMessageStub', msg);
  return Promise.resolve('OKOK');
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
