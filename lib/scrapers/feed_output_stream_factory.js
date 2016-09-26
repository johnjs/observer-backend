const config = require('./../config/config');
const QueueFeedOutputStream = require('../storage/queue_feed_output_stream');
const FeedToJsonTransformer = require('../storage/file_feed_output_stream');

const OUTPUT_STREAMS = {
  FILE: FeedToJsonTransformer,
  QUEUE: QueueFeedOutputStream,
};

module.exports = {
  getStream(accountName, source) {
    const feedDest = config.get('FEED_DESTINATION').toUpperCase();
    const StreamClass = OUTPUT_STREAMS[feedDest];

    if (!StreamClass) {
      const availableFeedDest = Object.keys(OUTPUT_STREAMS);
      throw new Error(`No streams defined for ${feedDest}. Use one of: [${availableFeedDest}].`);
    }
    return StreamClass.getInstance(accountName, source);
  },
};
