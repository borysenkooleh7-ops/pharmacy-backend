const pool = require('../config/database')

class Database {
  static async query(text, params) {
    const start = Date.now()
    try {
      const res = await pool.query(text, params)
      const duration = Date.now() - start

      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Database query executed', { text, duration, rows: res.rowCount })
      }

      return res
    } catch (error) {
      console.error('❌ Database query error:', error.message)
      throw error
    }
  }

  static async getClient() {
    return await pool.connect()
  }

  static async transaction(queries) {
    const client = await this.getClient()

    try {
      await client.query('BEGIN')
      const results = []

      for (const query of queries) {
        const result = await client.query(query.text, query.params)
        results.push(result)
      }

      await client.query('COMMIT')
      return results
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

module.exports = Database