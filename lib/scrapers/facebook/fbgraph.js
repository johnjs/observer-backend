const graph = require('fbgraph');

const FACEBOOK_REQUEST_TIMEOUT = 1000 * 30; // value in milliseconds

graph.setVersion('2.5');
graph.setOptions({
  timeout: FACEBOOK_REQUEST_TIMEOUT,
});

module.exports = graph;
