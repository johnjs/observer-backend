import { CronJob } from 'cron';
import config from '../config/config';
import logger from '../utils/logger';
import ScraperRunner from './scraper_runner.js';


/**
* Creates a cron job running scrapers in the interval defined in the project config module.
* Also initialises the database connection.
**/
export default {
  scheduleJobs() {
    const job = new CronJob({
      cronTime: `*/${config.get('SCHEDULER_POLLING_INTERVAL')} * * * * *`,
      onTick: () => {
        logger.logInfo('Crone job triggered...');
        ScraperRunner.run();
      },
      start: false,
      timeZone: 'Europe/Berlin',
    });

    job.start();
  },
};
