/**
 * Module streas facebook feed
 **/

import AbstractFeedStream from './../abstract_feed_stream';
import graph from './fbgraph';
import Q from 'q';

export default class FacebookFeedStream extends AbstractFeedStream {

  /**
   * Uses fpgraph module to call facebook API. Once the response arrives it's
   * emitted by the stream. When the response consists of a few pages, each page
   * is emitted separately.
   * @param {String} url - an endpoint of Facebook Graph API
   **/
  streamFeed(url) {
    Q.denodeify(graph.get)(url).then(res => {
      this.write(res.data);
      if (res.paging && res.paging.next) {
        this.streamFeed(res.paging.next);
      } else {
        this.end();
      }
    }).catch((err) => {
      this.emit('error', err);
    });
  }
}
