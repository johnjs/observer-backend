import logger from '../../utils/logger';
import migrationsPerformer from './migrations_performer';

migrationsPerformer.applyAllMigrations().then((results) => {
  logger.logInfo(`Migration performed successfully:\n${JSON.stringify(results)}`);
}).catch((err) => {
  logger.logError(err);
});
