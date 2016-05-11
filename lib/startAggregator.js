import * as db from './storage/clients/db';
import aggragator from './feed_aggregator/aggregator';
import mentionSchema from './feed_aggregator/mention_schema';
import config from './config/config';
import diehard from 'diehard';
diehard.listen();

config.init();

db.connect();
db.registerModel('mention', 'mentions', mentionSchema);

aggragator.start();
