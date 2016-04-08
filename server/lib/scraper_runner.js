/**
 * The module runs workers scraping Facebook data.
 **/

import { default as childProcess } from 'child_process';
import logger from '../utils/logger';
import * as db from '../db';

const SCRAPER_DEFINITIONS = {
  facebook: {
    path: `${__dirname}/facebook/facebook_scraper`,
    requiredArguments: ['account', 'token'],
  },
  twitter: {
    path: `${__dirname}/twitter/twitter_scraper`,
    requiredArguments: ['account'],
  },
};

export default {

  /**
   * Runs a given job as a child process. When it's finished with sucess new
   * `next_run` date is set in the job.
   * @param {ScraingJob} job
   **/
  _runSingleScraper(job) {
    const scraperDef = SCRAPER_DEFINITIONS[job.type];

    if (!scraperDef) {
      throw new Error(`Allowed types of scraping jobs are: ${Object.keys(SCRAPER_DEFINITIONS)}`);
    }

    const args = scraperDef.requiredArguments.reduce(
      (values, argName) => values.concat(job[argName]), []
    );
    const pathToScraper = scraperDef.path;
    const scraperProcess = childProcess.fork(pathToScraper, args, {
      silent: false,
    });

    scraperProcess.on('exit', (code) => {
      if (code === 0) {
        logger.logInfo(`Scraping of ${job.account} finished with success`);
        job.scheduleNextRun().catch((err) => {
          logger.logError(err);
        });
      } else {
        logger.logInfo(`Scraping of ${job.account} failed`);
      }
    });
  },

  /**
   * Retrives from the database all the jobs that should be performed and runs them
   * individually.
   */
  run() {
    const ScrapingJob = db.getModelClass('scraping_job');
    ScrapingJob.findJobsToRun().then((scrapingJobs) => {
      scrapingJobs.forEach((job) => this._runSingleScraper(job));
    }).catch((err) => {
      logger.logError(err);
    });
  },
};
