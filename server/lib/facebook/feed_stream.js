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

  callGraphAPI(address) {
    const self = this;
    Q.denodeify(graph.get)(address).then(res => {
      self.write(res.data);
      if (res.paging && res.paging.next) {
        self.callGraphAPI(res.paging.next);
      } else {
        self.end();
      }
    }).catch((err) => {
      self.emit('error', err);
    });
  }
}
