export const id = '000001-scraping_jobs-collection';

export function up(db, cb) {
  db.createCollection('scraping_jobs', cb);
}

export function down(db, cb) {
  db.collection('scraping_jobs').drop(cb);
}
