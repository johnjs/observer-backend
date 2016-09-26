const id = '000001-scraping_jobs-collection';

function up(db, cb) {
  db.createCollection('scraping_jobs', cb);
}

function down(db, cb) {
  db.collection('scraping_jobs').drop(cb);
}

module.exports = { id, up, down };
