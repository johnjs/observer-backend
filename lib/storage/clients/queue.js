/**
 * Module establishes connection with RabbitMQ.
 **/
const ampq = require('amqplib');
const diehard = require('diehard');
const logger = require('../../utils/logger');
const config = require('../../config/config');

/**
 * Creates a RabbitMQ connection basing on paramters taken from the config module.
 * @returns {Promise} promise resolves with a RabbitMQ connection.
 **/
function createConnection() {
  const user = config.get('RABBIT_USER');
  const pwd = config.get('RABBIT_PASSWORD');
  const host = config.get('RABBIT_HOST');
  const port = config.get('RABBIT_PORT');
  const uri = `amqp://${user}:${pwd}@${host}:${port}`;

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

module.exports = { createConnection };
