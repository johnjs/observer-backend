/**
 * Module establishes connection with RabbitMQ.
 **/
import ampq from 'amqplib';
import diehard from 'diehard';
import logger from '../../utils/logger';
import config from '../../config/config';

const QUEUE_NAME = 'feed';
const EXCHANGE_NAME = 'observer';
/**
 * Creates a RabbitMQ connection basing on paramters taken from the config module.
 * @returns {Promise} promise resolves with a RabbitMQ connection.
 **/
function createConnection() {
  const user = config.get('RABBIT_USER');
  const pwd = config.get('RABBIT_PASSWORD');
  const host = config.get('RABBIT_HOST');
  const port = config.get('RABBIT_PORT');
  const uri = `amqp://${user}:${pwd}@${host}:${port}?heartbeat=10`;

  return ampq.connect(uri).then((connection) => {
    diehard.register((done) => {
      connection.close().then(() => {
        logger.logInfo('RabbitMQ connection disconnected due to app termination');
        done();
      });
    });
    return connection;
  });
}

function createChannel() {
  let channel;
  return createConnection()
    .then(connection => connection.createConfirmChannel())
    .then((ch) => {
      channel = ch;
      return channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    })
    .then(() => channel.assertQueue(QUEUE_NAME, { durable: true }))
    .then(() => channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ''))
    .then(() => channel);
}

export { createConnection, createChannel };
