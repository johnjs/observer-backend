/**
 * The module runs workers scraping Facebook data.
 **/

import { default as childProcess } from 'child_process';
import logger from '../utils/logger';
import * as db from '../storage/clients/db';

const SCRAPER_DEFINITIONS = {
  facebook: {
    path: `${__dirname}/../scrapers/facebook/facebook_scraper`,
    requiredArguments: ['account', 'token'],
  },
  twitter: {
    path: `${__dirname}/../scrapers/twitter/twitter_scraper`,
    requiredArguments: ['account'],
  },
};

export default {

  /**
  * Retrives from the database all the jobs that should be performed and runs them
  * individually.
  */
  run() {
    const ScrapingJob = db.getModelClass('scraping_job');
    ScrapingJob.findJobsToRun().then((scrapingJobs) => {
      scrapingJobs.forEach((job) => this._runSingleJob(job));
    }).catch((err) => {
      logger.logError(err);
    });
  },

  /**
   * Runs a given job as a child process. When it's finished with sucess new
   * `next_run` date is set in the job.
   * @param {ScrapingJob} job
   **/
  _runSingleJob(job) {
    const scraperDef = SCRAPER_DEFINITIONS[job.type];

    if (!scraperDef) {
      throw new Error(`Allowed types of scraping jobs are: ${Object.keys(SCRAPER_DEFINITIONS)}`);
    }

    const pathToScraper = scraperDef.path;
    const args = scraperDef.requiredArguments.reduce(
      (values, argName) => values.concat(job[argName]), []
    );

    job.markAsRunning().then(() => {
      this._runScraper(pathToScraper, args, job);
    }).catch((err) => {
      logger.logError(err);
    });
  },

  _runScraper(pathToScraper, args, job) {
    const scraperProcess = childProcess.fork(pathToScraper, args, {
      silent: false,
    });
    scraperProcess.on('exit', this._handleScraperExit.bind(null, job));
  },

  _handleScraperExit(job, exitCode) {
    if (exitCode === 0) {
      logger.logInfo(`Scraping of ${job.account} finished with success`);
      job.scheduleNextRun().catch((err) => {
        logger.logError(err);
      });
    } else {
      logger.logInfo(`Scraping of ${job.account} failed`);
    }
  },
};
