/**
 * The module exports a class responsible for fetching data from Facebook API
 * using fbgraph library. When the file is run as an individual module it fetches
 * fb data for account passed as a first argument of command line invocation. The
 * valid access token should be defined as a second argument.
 */

import graph from 'fbgraph';
import jsonfile from 'jsonfile';
import logger from '../../utils/logger.js';
import Q from 'q';
import moment from 'moment';

const FEED_DIRECTORY = './feed/facebook/';
const FEED_FILE_FORMATTING_OPTIONS = { spaces: 2 };
const FEED_REQUEST_OPTIONS = {
  fields: 'likes.summary(true)',
  since: moment().subtract({ h: 24 }).format(),
};

export default class FacebookScraper {

  constructor(account, token) {
    this.account = account;
    this.token = token;

    graph.setAccessToken(token);
    graph.setVersion('2.5');
  }

  scrape() {
    Q.denodeify(graph.get)(`${this.account}/feed`, FEED_REQUEST_OPTIONS).then((res) => {
      this._saveFeed(res.data);
    }).catch((err) => {
      logger.logError(err);
    });
  }

  _saveFeed(feed) {
    if (process.env.FEED_DESTINATION === 'FILE') {
      this._saveFeedInFile(feed);
    }
  }

  _saveFeedInFile(feed) {
    const fileName = `${FEED_DIRECTORY}${this.account}_${(new Date()).toISOString()}.json`;
    Q.denodeify(jsonfile.writeFile)(fileName, feed, FEED_FILE_FORMATTING_OPTIONS).catch((e) => {
      logger.logError(e);
    });
  }
}

if (require.main === module) {
  const args = process.argv;
  const scraper = new FacebookScraper(args[2], args[3]);
  scraper.scrape();
}
