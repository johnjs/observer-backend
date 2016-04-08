/**
* Exports a mongoose schema representing a scraping job
**/

import mongoose from 'mongoose';
import Q from 'q';
import moment from 'moment';

const scrapingJobSchema = new mongoose.Schema({
  type: String,
  account: String,
  token: String,
  scraping_interval: Number, // value in minutes
  next_run: Date,
});

/**
* Finds all the scraping jobs that should be performed according to current time.
* @returns {Promise} resolving to the list of jobs
**/
scrapingJobSchema.statics.findJobsToRun = function findJobsToRun() {
  const query = {
    next_run: {
      $lte: new Date(),
    },
  };
  return Q.denodeify(this.find.bind(this))(query);
};

/**
* Updates the `next_run` attribute of the job so that it equals
* the current time + minutes value of the `scraping_interval` attribute.
**/
scrapingJobSchema.methods.scheduleNextRun = function scheduleNextRun() {
  const newNextRun = moment().add({ m: this.scraping_interval }).toDate();
  const updated = { next_run: newNextRun };

  return Q.denodeify(this.update.bind(this))(updated);
};

export default scrapingJobSchema;
