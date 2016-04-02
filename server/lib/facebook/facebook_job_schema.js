/**
* Exports a mongoose schema representing a facebook job
**/

import mongoose from 'mongoose';
import Q from 'q';
import moment from 'moment';

const facebookJobSchema = new mongoose.Schema({
  facebook_account: String,
  facebook_token: String,
  scraping_interval: Number, // value in minutes
  next_run: Date,
});

/**
* Finds all the facebook jobs that should be performed
* @returns {Promise} resolving to the list of jobs
**/
facebookJobSchema.statics.findJobsToRun = function findJobsToRun() {
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
facebookJobSchema.methods.scheduleNextRun = function scheduleNextRun() {
  const newNextRun = moment().add({ m: this.scraping_interval }).toDate();
  const updated = { next_run: newNextRun };

  return Q.denodeify(this.update.bind(this))(updated);
};

export default facebookJobSchema;
