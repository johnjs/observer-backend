/**
 * Module streams twitter feed
 **/

import AbstractFeedStream from './../abstract_feed_stream';
import Q from 'q';
import Twit from 'twit';
import { chain, extend } from 'underscore';
import config from '../../config/config';

const TWITTER_REQUEST_TIMEOUT = 1000 * 30; // value in milliseconds

export default class TwitterFeedStream extends AbstractFeedStream {

  constructor() {
    super();
    this.twitterApi = new Twit({
      consumer_key: config.TWITTER_CONSUMER_KEY,
      consumer_secret: config.TWITTER_CONSUMER_SECRET,
      access_token: config.TWITTER_ACCESS_TOKEN,
      access_token_secret: config.TWITTER_ACCESS_TOKEN_SECRET,
      timeout_ms: TWITTER_REQUEST_TIMEOUT,
    });
  }

  /**
   * Builds parameters used by timeline API calls for pages different than
   * the first one.
   * Following piece of Twitter's documentation (https://dev.twitter.com/rest/public/timelines)
   * describes how the max_id should be used:
   * "An application’s first request to a timeline endpoint should only specify a count.
   * When processing this and subsequent responses, keep track of the lowest ID received.
   * This ID should be passed as the value of the max_id parameter for the next request,
   * which will only return Tweets with IDs lower than or equal to the value of the
   * max_id parameter."
   *
   **/
  _buildParametersForNextPageRequest(originalReqParams, lastDataResponse) {
    const maxId = chain(lastDataResponse).pluck('id').min().value();
    return extend({}, originalReqParams, { max_id: maxId });
  }

  streamFeed(urlPath, requestParameters, pagesLeft = 1) {
    Q.denodeify(this.twitterApi.get.bind(this.twitterApi))(urlPath, requestParameters)
      .then(([data]) => {
        this.write(data);

        if (--pagesLeft === 0) { // eslint-disable-line no-param-reassign
          this.emit('finish');
          return;
        }

        this.streamFeed(
          urlPath,
          this._buildParametersForNextPageRequest(requestParameters, data),
          pagesLeft
        );
      })
      .catch((err) => {
        this.emit('error', err);
      });
  }
}
