export const id = '000002-posts-collection';

export function up(db, cb) {
  db.createCollection('posts', cb);
}

export function down(db, cb) {
  db.collection('posts').drop(cb);
}
