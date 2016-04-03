/**
 * Module streas facebook feed
 **/

import { PassThrough } from 'stream';
import graph from './fbgraph';
import Q from 'q';

export default class FeedStream extends PassThrough {

  constructor() {
    super({
      decodeStrings: true,
      objectMode: true,
    });
  }

  /**
   * Uses fpgraph module to call facebook API. Once the response arrives it's
   * emitted by the stream. When the response consists of a few pages, each page
   * is emitted separately.
   * @param {String} url - an endpoint of Facebook Graph API
   **/
  callGraphAPI(url) {
    Q.denodeify(graph.get)(url).then(res => {
      this.write(res.data);
      if (res.paging && res.paging.next) {
        this.callGraphAPI(res.paging.next);
      } else {
        this.end();
      }
    }).catch((err) => {
      this.emit('error', err);
    });
  }
}
