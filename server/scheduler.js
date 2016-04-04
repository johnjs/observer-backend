import { CronJob } from 'cron';
import * as db from './db';
import config from './config/config';
import logger from './utils/logger';
import FacebookRunner from './lib/facebook/facebook_scraper_runner.js';


/**
* Creates a cron job running scrapers in the interval defined in the project config module.
* Also initialises the database connection.
**/
export default function scheduleJobs() {
  const job = new CronJob({
    cronTime: `*/${config.SCHEDULER_POLLING_INTERVAL} * * * * *`,
    onTick: () => {
      logger.logInfo('Crone job triggered...');
      FacebookRunner.run();
    },
    start: false,
    timeZone: 'Europe/Berlin',
  });

  db.connect();
  job.start();
}

if (require.main === module) {
  scheduleJobs();
}
