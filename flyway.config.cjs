const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') })

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
} = process.env

module.exports = function () {
  return {
    flywayArgs: {
      url: `jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}`,
      user: DB_USER,
      password: DB_PASSWORD,
      locations: `filesystem:${path.resolve(__dirname, 'db/migrations')}`,
      defaultSchema: 'public',
      table: 'flyway_schema_history',
      baselineOnMigrate: true,
      validateOnMigrate: true,
    },
    downloads: {
      storageDirectory: path.resolve(__dirname, 'node_modules/.flyway'),
      expirationTimeInMs: -1,
    },
  }
}
