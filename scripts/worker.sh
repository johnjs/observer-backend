#!/usr/bin/env node
var colors = require('colors');
var amqp = require('amqplib/callback_api');

var EXCHANGE_NAME = 'observer';
var QUEUE_NAME = 'feed';
var count = 0;
var logMsg = {
  twitter: logTwitterMsg,
  facebook: logFacebookMsg
};

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    ch.assertExchange(EXCHANGE_NAME, 'direct', {durable: true});

    ch.assertQueue(QUEUE_NAME, {durable: true}, function(err, q) {
      ch.bindQueue(QUEUE_NAME, EXCHANGE_NAME, '');
      ch.consume(QUEUE_NAME, function(msg) {
        var entry = JSON.parse(msg.content.toString('utf-8'));
        logMsg[entry.source](entry);
        ch.ack(msg);
      }, {noAck: false});
    });
  });
});

function logTwitterMsg(entry) {
  var msg = "["+ (++count) +"][" + entry.source + "][" + (entry.data[0] ? entry.data[0].created_at : '') + "]";
  console.log(msg.blue);
}

function logFacebookMsg(entry) {
  var msg = "["+ (++count) +"][" + entry.source + "][" + (entry.data[0] ? entry.data[0].created_time : '') + "]";
  console.log(msg.green);
}
