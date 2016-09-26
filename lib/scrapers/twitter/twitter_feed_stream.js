/**
 * Module streams twitter feed
 **/

const AbstractFeedStream = require('../abstract_feed_stream');
const Q = require('q');
const Twit = require('twit');
const { chain, extend } = require('underscore');
const config = require('../../config/config');

const TWITTER_REQUEST_TIMEOUT = 1000 * 30; // value in milliseconds

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
function buildParametersForNextPageRequest(originalReqParams, lastDataResponse) {
  const maxId = chain(lastDataResponse).pluck('id').min().value();
  return extend({}, originalReqParams, { max_id: maxId });
}

module.exports = class TwitterFeedStream extends AbstractFeedStream {


  /**
   * @constructor
   * @param {string} urlPath - API end point returning facebook data
   * @param {Object} parameters of the twitter API call
   * @param {Integer} number of pages that should be fetched by the stream
   */
  constructor(urlPath, requestParameters, numberOfPagesToFetch = 1) {
    super();

    this._twitterApi = new Twit({
      consumer_key: config.get('TWITTER_CONSUMER_KEY'),
      consumer_secret: config.get('TWITTER_CONSUMER_SECRET'),
      access_token: config.get('TWITTER_ACCESS_TOKEN'),
      access_token_secret: config.get('TWITTER_ACCESS_TOKEN_SECRET'),
      timeout_ms: TWITTER_REQUEST_TIMEOUT,
    });

    this._urlPath = urlPath;
    this._requestParameters = extend({}, requestParameters);
    this._numberOfPagesToFetch = numberOfPagesToFetch;
  }


  /**
   * Fetches data from twitter API and pushes it to the buffer. With every successful
   * downloading "numberOfPagesToFetch" property is decreased. When it reaches 0,
   * the stream signals its end.
   **/
  _read() {
    if (this._numberOfPagesToFetch === 0) {
      this.push(null);
      return;
    }
    Q.denodeify(this._twitterApi.get.bind(this._twitterApi))(this._urlPath, this._requestParameters)
      .then(([data]) => {
        this._numberOfPagesToFetch--;
        this._requestParameters =
              buildParametersForNextPageRequest(this._requestParameters, data);
        this.push(data);
      })
      .catch((err) => {
        this.emit('error', err);
      });
  }
};
