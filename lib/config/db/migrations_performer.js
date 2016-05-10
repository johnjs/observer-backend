import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { Migration } from 'mongration';
import Q from 'q';
import config from '../config';

dotenv.config();

const migrationConfig = {
  hosts: config.get('MONGODB_HOST'),
  db: config.get('MONGODB_DATABASE'),
  user: config.get('MONGODB_USER'),
  password: config.get('MONGODB_PASSWORD'),
  migrationCollection: config.get('MONGODB_MIGRATIONS_COLLECTION'),
};

const migrationsPerformer = {
  getAllMigrationsScripts() {
    return Q.denodeify(fs.readdir)(path.join(__dirname, '/migrations'))
    .then((files) => files.filter((filename) => (/\.js$/i).test(filename)));
  },

  applyMigrations(migrationsIds) {
    const dbMigration = new Migration(migrationConfig);
    const migrationsScripts = migrationsIds.map(
      (filename) => path.join(__dirname, '/migrations', filename)
    );
    dbMigration.add(migrationsScripts);
    return Q.denodeify(dbMigration.migrate.bind(dbMigration))();
  },

  applyAllMigrations() {
    return this.getAllMigrationsScripts()
      .then((migrationsIds) => this.applyMigrations(migrationsIds));
  },

  applyMigrationsUpTo(migrationId) {
    return this.getAllMigrationsScripts().then((migrationsIds) => {
      if (migrationsIds.indexOf(migrationId) === -1) {
        throw new Error(`There is no migration script called: ${migrationId}. `
          + `Allowed scripts are: ${migrationsIds}`);
      }
      const migrationsToApply = migrationsIds.slice(0, migrationsIds.indexOf(migrationId) + 1);
      return this.applyMigrations(migrationsToApply);
    });
  },
};

export default migrationsPerformer;
