/**
 * Module streams twitter feed
 **/

import AbstractFeedStream from './../abstract_feed_stream';
import Q from 'q';
import Twit from 'twit';
import { chain, extend } from 'underscore';
import config from '../../config/config';

export default class TwitterFeedStream extends AbstractFeedStream {

  constructor() {
    super();
    this.twitterApi = new Twit({
      consumer_key: config.TWITTER_CONSUMER_KEY,
      consumer_secret: config.TWITTER_CONSUMER_SECRET,
      access_token: config.TWITTER_ACCESS_TOKEN,
      access_token_secret: config.TWITTER_ACCESS_TOKEN_SECRET,
    });
  }

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
