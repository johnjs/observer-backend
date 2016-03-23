/**
 * The module exports a class responsible for fetching data from Facebook API
 * using fbgraph library. When the file is run as an individual module it fetches
 * fb data for account passed as a first argument of command line invocation. The
 * valid access token should be defined as a second argument.
 */

import graph from 'fbgraph';

export default class FacebookScraper {

  constructor(account, token) {
    this.account = account;
    this.token = token;

    graph.setAccessToken(token);
    graph.setVersion('2.5');
  }

  getFeed() {
    /*
     *  TODO should use fbgraph module to access fb /{account}/feed API endpoint
     */
  }
}

if (require.main === module) {
  const args = process.argv;
  const scraper = new FacebookScraper(args[2], args[3]);
  scraper.getFeed();
}
