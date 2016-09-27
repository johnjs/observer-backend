const { CronJob } = require('cron');
const config = require('../config/config');
const logger = require('../utils/logger');
const ScraperRunner = require('./scraper_runner.js');


/**
* Creates a cron job running scrapers in the interval defined in the project config module.
* Also initialises the database connection.
**/
module.exports = {
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
