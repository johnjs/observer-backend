/**
 * Module extends the Writable stream and is used to forward feed chunks
 * to RabbitMQ.
 **/

const { Writable } = require('stream');
const queue = require('./clients/queue');

const QUEUE_NAME = 'feed';
const EXCHANGE_NAME = 'observer';

class QueueFeedOutputStream extends Writable {

  /**
   * @constructor
   * @param accountName - name of the account whose feed is being saved
   * @param source - source of the data (e.g. facebook)
   **/
  constructor(account, source) {
    super({
      objectMode: true,
    });

    this.accountName = account;
    this.source = source;

    this.on('finish', () => this._cleanUpConnection());
  }

  /**
   * Initialises a RabbitMQ channel and returns a promise resolved with a
   * QueueFeedOutputStream instance.
   * @returns {Promise}
   **/
  init() {
    return queue.createConnection()
      .then(connection => connection.createConfirmChannel())
      .then((channel) => {
        this.channel = channel;
        return channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
      })
      .then(() => this.channel.assertQueue(QUEUE_NAME, { durable: true }))
      .then(() => this.channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ''))
      .then(() => this);
  }

  /**
   * Implementation of Writable._write method. Sends the input data chunk
   * extended with account name and source to the queue channel.
   **/
  _write(data, encoding, next) {
    const message = new Buffer(JSON.stringify({
      account: this.accountName,
      source: this.source,
      data,
    }));
    this.channel.publish(EXCHANGE_NAME, '', message, { persistent: true }, (err) => {
      next(err);
    });
  }

  /**
   * Closes the RabbitMQ connection.
   **/
  _cleanUpConnection() {
    this.channel.connection.close();
  }

  /**
   * Returns a promise resolved with initialised instance of the stream.
   * @returns {Promise}
   **/
  static getInstance(account, source) {
    const stream = new QueueFeedOutputStream(account, source);
    return stream.init();
  }
}

module.exports = QueueFeedOutputStream;
