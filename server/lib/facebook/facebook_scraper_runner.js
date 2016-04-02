/**
 * The module runs workers scraping Facebook data.
 **/

import { default as childProcess } from 'child_process';
import logger from '../../utils/logger';
import * as db from '../../db';

export default {

  /**
   * Runs a given job as a child process. When it's finished with sucess new
   * `next_run` date is set in the job.
   * @param {FacebookJob} job
   **/
  _runSingleScraper(job) {
    const args = [job.facebook_account, job.facebook_token];
    const pathToScraper = `${__dirname}/facebook_scraper`;
    const scraperProcess = childProcess.fork(pathToScraper, args, {
      silent: false,
    });

    scraperProcess.on('exit', (code) => {
      if (code === 0) {
        logger.logInfo(`Scraping of ${job.facebook_account} finished with success`);
        job.scheduleNextRun().catch((err) => {
          logger.logError(err);
        });
      } else {
        logger.logInfo(`Scraping of ${job.facebook_account} failed`);
      }
    });
  },

  /**
   * Retrives from the database all the jobs that should be performed and runs them
   * individually.
   */
  run() {
    const FacebookJob = db.getModelClass('facebook_job');
    FacebookJob.findJobsToRun().then((facebookJobs) => {
      facebookJobs.forEach((job) => this._runSingleScraper(job));
    }).catch((err) => {
      logger.logError(err);
    });
  },
};
