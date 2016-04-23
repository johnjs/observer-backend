import config from './../config/config';
import QueueFeedOutputStream from '../storage/queue_feed_output_stream';
import FeedToJsonTransformer from '../storage/file_feed_output_stream';

const OUTPUT_STREAMS = {
  FILE: FeedToJsonTransformer,
  QUEUE: QueueFeedOutputStream,
};

export default {
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
