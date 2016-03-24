/**
 * The module runs workers scraping Facebook data.
 */

import { default as childProcess } from 'child_process';
import config from '../../config/config';

function run() {
  const args = [config.FACEBOOK_ACCOUNT, config.FACEBOOK_TOKEN];
  const pathToScraper = `${__dirname}/facebook_scraper`;
  childProcess.fork(pathToScraper, args, {
    silent: false,
  });
}

export { run };
