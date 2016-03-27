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
