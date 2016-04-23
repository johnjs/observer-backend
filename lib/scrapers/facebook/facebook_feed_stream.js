/**
 * Module streams facebook feed
 **/
import AbstractFeedStream from '../abstract_feed_stream';
import graph from './fbgraph';
import Q from 'q';

export default class FacebookFeedStream extends AbstractFeedStream {


  /**
   * @constructor
   * @param {string} url - API end point returning facebook data
   */
  constructor(url) {
    super();
    this._url = url;
    this._feedFetched = false;
  }

  /**
   * Uses fpgraph module to call facebook API. Once the response arrives it's
   * pushed to the stream's buffer. When the response consists of few pages, each page
   * is emitted separately. If the fetching result does not contain a link to the next page,
   * "_feedFetched" flag is set to true and next call of the "_read" method will
   * signal end of the stream.
   **/
  _read() {
    if (this._feedFetched) {
      this.push(null);
      return;
    }

    Q.denodeify(graph.get)(this._url).then(res => {
      const { data, paging } = res;

      if (paging && paging.next) {
        this._url = res.paging.next;
      } else {
        this._feedFetched = true;
      }

      this.push(data);
    }).catch((err) => {
      this.emit('error', err);
    });
  }
}
