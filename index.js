require('dotenv').config()
const express = require('express')
const cors = require('cors')

// Import configuration
const config = require('./config')

// Initialize Sequelize
const { sequelize } = require('./db/models')

// Import initialization function
// const { initializePharmacyData } = require('./initialize')

// Import middleware
const {
  requestLogger,
  securityHeaders,
  errorHandler,
  notFoundHandler
} = require('./middleware')

// Import routes
const apiRoutes = require('./routes')

// Create Express app
const app = express()

// Global middleware
app.use(securityHeaders)
app.use(requestLogger)
app.use(cors(config.cors))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check (before API routes)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      environment: config.nodeEnv
    }
  })
})

// API routes
app.use(config.api.prefix, apiRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Apoteka24.me API',
    data: {
      version: '1.0.0',
      environment: config.nodeEnv,
      documentation: `${req.protocol}://${req.get('host')}${config.api.prefix}/docs`,
      health: `${req.protocol}://${req.get('host')}/health`
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  })
})

// 404 handler for non-API routes
app.use(notFoundHandler)

// Global error handler (must be last)
app.use(errorHandler)

// Start server with database connection
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection established successfully')

    // Initialize pharmacy data if needed
    // if (config.nodeEnv === 'development' || config.nodeEnv === 'production') {
    //   try {
    //     await initializePharmacyData()
    //   } catch (initError) {
    //     console.error('⚠️  Pharmacy initialization failed, but server will continue:', initError.message)
    //   }
    // }

    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`)
      console.log(`📚 API Documentation: http://localhost:${config.port}${config.api.prefix}/docs`)
      console.log(`💚 Health Check: http://localhost:${config.port}/health`)
      console.log(`🌍 Environment: ${config.nodeEnv}`)
    })

    return server
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
    process.exit(1)
  }
}

const serverPromise = startServer()

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...')
  const server = await serverPromise
  server.close(async () => {
    await sequelize.close()
    console.log('✅ Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received. Shutting down gracefully...')
  const server = await serverPromise
  server.close(async () => {
    await sequelize.close()
    console.log('✅ Process terminated')
    process.exit(0)
  })
})

module.exports = app