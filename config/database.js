const { Pool } = require('pg')

// Determine if we're using local or network database
const isLocalDB = process.env.DB_LOCAL === 'true'

// Select database configuration based on DB_LOCAL flag
const getDbConfig = () => {
  if (isLocalDB) {
    // Local database configuration (no SSL)
    return {
      host: process.env.DB_LOCAL_HOST || 'localhost',
      port: parseInt(process.env.DB_LOCAL_PORT) || 5432,
      database: process.env.DB_LOCAL_NAME || 'apoteka24',
      user: process.env.DB_LOCAL_USER || 'postgres',
      password: process.env.DB_LOCAL_PASSWORD || 'password',
      ssl: false, // No SSL for local database
    }
  } else {
    // Network database configuration (with SSL)
    return {
      host: process.env.DB_NETWORK_HOST,
      port: parseInt(process.env.DB_NETWORK_PORT) || 5432,
      database: process.env.DB_NETWORK_NAME,
      user: process.env.DB_NETWORK_USER,
      password: process.env.DB_NETWORK_PASSWORD,
      ssl: { rejectUnauthorized: false }, // SSL required for network database
    }
  }
}

const dbConfig = {
  ...getDbConfig(),
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // how long to wait when connecting a new client
}

const pool = new Pool(dbConfig)

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Gracefully shutting down database connection...')
  await pool.end()
  process.exit(0)
})

module.exports = pool