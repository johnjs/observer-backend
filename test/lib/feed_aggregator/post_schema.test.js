import { assert } from 'chai';
import mongoose from 'mongoose';
import PostSchema from '../../../lib/feed_aggregator/post_schema';

describe('post_schema', () => {
  it('is an instance of mongoose#Schema', () => {
    assert.instanceOf(PostSchema, mongoose.Schema);
  });
});
