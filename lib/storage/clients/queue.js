/**
 * Module establishes connection with RabbitMQ.
 **/

import ampq from 'amqplib';
import config from '../../config/config';


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

  return ampq.connect(uri);
}

export { createConnection };
