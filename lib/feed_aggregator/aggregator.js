import Q from 'q';
import { extend } from 'underscore';
import * as queue from '../storage/clients/queue';
import * as db from '../storage/clients/db.js';
import logger from '../utils/logger';

const QUEUE_NAME = 'feed';

function saveFeedInDb(data, source, account) {
  const Model = db.getModelClass('mention');
  const bulk = Model.collection.initializeOrderedBulkOp();

  data.forEach((mention) => {
    const toSave = extend(mention, {
      source,
      account,
      lastModificationDate: new Date(),
    });
    bulk.find({ id: mention.id }).upsert().updateOne(toSave);
  });

  return Q.denodeify(bulk.execute.bind(bulk))();
}

function consumeFeedMessage(msg, channel) {
  const entry = JSON.parse(msg.content.toString('utf-8'));
  const { data, account, source } = entry;

  if (data.length === 0) {
    channel.ack(msg);
    return;
  }

  saveFeedInDb(data, source, account).then(() => {
    channel.ack(msg);
  }).catch((err) => {
    logger.logError(err);
    channel.nack(msg);
  });
}

export default {
  start() {
    logger.logInfo('Aggregator started');
    queue.createChannel().then((channel) => {
      channel.prefetch(1);
      channel.consume(QUEUE_NAME, (msg) => {
        consumeFeedMessage(msg, channel);
      }, { noAck: false });
    }).catch((err) => {
      logger.logError(err);
    });
  },
};
