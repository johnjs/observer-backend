/**
* Exports a mongoose schema representing a scraping job
**/

const mongoose = require('mongoose');
const Q = require('q');
const moment = require('moment');

const scrapingJobSchema = new mongoose.Schema({
  type: String,
  account: String,
  token: String,
  scraping_interval: Number, // value in minutes
  next_run: Date,
  is_running: Boolean,
});

/**
* Finds all the scraping jobs that should be performed according to current time.
* Only jobs which are not currently performed are returned.
* @returns {Promise} resolving to the list of jobs
**/
scrapingJobSchema.statics.findJobsToRun = function findJobsToRun() {
  const query = {
    next_run: {
      $lte: new Date(),
    },
    is_running: {
      $eq: false,
    },
  };
  return Q.denodeify(this.find.bind(this))(query);
};

/**
* Updates the `next_run` attribute of the job so that it equals
* the current time + minutes value of the `scraping_interval` attribute.
* @returns {Promise}
**/
scrapingJobSchema.methods.scheduleNextRun = function scheduleNextRun() {
  const newNextRun = moment().add({ m: this.scraping_interval }).toDate();
  const updated = {
    next_run: newNextRun,
    is_running: false,
  };

  return Q.denodeify(this.update.bind(this))(updated);
};

/**
* Marks the scraping job as running.
* @returns {Promise}
**/
scrapingJobSchema.methods.markAsRunning = function markAsRunning() {
  const updated = { is_running: true };
  return Q.denodeify(this.update.bind(this))(updated);
};

module.exports = scrapingJobSchema;
