/**
* Exports a mongoose schema representing a single post
**/

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  source: String, // social media platform (e.g. Facebook)
  account: String, // social media account name (e.g. barackobama)
  lastModificationDate: Date,
  data: Object, // post properties depending on the platform (e.g. 'created_at', 'text')
});

export default postSchema;
