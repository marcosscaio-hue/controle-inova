require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

;(async () => {
  const cfg = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  }
  const c = new Client(cfg)
  try {
    await c.connect()
    console.log('CONNECTED')
    await c.end()
    process.exit(0)
  } catch (e) {
    console.error('ERROR:', e.message)
    process.exit(1)
  }
})()
