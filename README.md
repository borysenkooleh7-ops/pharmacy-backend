# Apoteka24.me Backend API

RESTful API server for the Montenegro pharmacy aggregator platform.

## 🏗️ Architecture

This backend follows a clean MVC (Model-View-Controller) architecture with separation of concerns:

```
backend/
├── config/              # Configuration files
│   ├── database.js      # Database connection
│   └── index.js         # App configuration
├── controllers/         # Business logic
│   ├── cityController.js
│   ├── pharmacyController.js
│   ├── submissionController.js
│   ├── adController.js
│   └── index.js
├── db/                  # Database layer
│   ├── models/          # Data models
│   │   ├── City.js
│   │   ├── Pharmacy.js
│   │   ├── PharmacySubmission.js
│   │   ├── Ad.js
│   │   └── index.js
│   └── index.js         # Database connection wrapper
├── middleware/          # Express middleware
│   ├── auth.js          # Authentication
│   ├── validation.js    # Input validation
│   ├── errorHandler.js  # Error handling
│   ├── logger.js        # Request logging
│   └── index.js
├── routes/             # API routes
│   ├── cityRoutes.js
│   ├── pharmacyRoutes.js
│   ├── submissionRoutes.js
│   ├── adRoutes.js
│   └── index.js
├── utils/              # Utility functions
│   └── responseHelper.js
├── index.js            # Main application file
├── seed.js             # Database seeding
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Seed the database
npm run seed

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=apoteka24
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
ADMIN_KEY=your_secure_admin_key

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Database Setup
```bash
# Create database
createdb apoteka24

# Run migrations (schema is in ../database.sql)
psql -d apoteka24 -f ../database.sql

# Seed with sample data
npm run seed
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
Admin endpoints require the `x-admin-key` header:
```bash
curl -H "x-admin-key: your_admin_key" http://localhost:3001/api/admin/...
```

### Endpoints

#### Cities
- `GET /cities` - Get all cities
- `GET /cities/:id` - Get city by ID
- `GET /cities/slug/:slug` - Get city by slug
- `POST /cities` - Create city (admin)
- `PUT /cities/:id` - Update city (admin)
- `DELETE /cities/:id` - Delete city (admin)

#### Pharmacies
- `GET /pharmacies` - Get pharmacies with filters
  - Query params: `cityId`, `is24h`, `openSunday`, `search`, `page`, `limit`
- `GET /pharmacies/:id` - Get pharmacy by ID
- `GET /pharmacies/city/:cityId` - Get pharmacies by city
- `GET /pharmacies/nearby/:lat/:lng` - Get nearby pharmacies
- `POST /pharmacies` - Create pharmacy (admin)
- `PUT /pharmacies/:id` - Update pharmacy (admin)
- `DELETE /pharmacies/:id` - Delete pharmacy (admin)

#### Pharmacy Submissions
- `POST /pharmacy-submissions` - Submit pharmacy suggestion
- `GET /pharmacy-submissions` - Get all submissions (admin)
- `GET /pharmacy-submissions/:id` - Get submission by ID (admin)
- `PUT /pharmacy-submissions/:id` - Update submission status (admin)
- `DELETE /pharmacy-submissions/:id` - Delete submission (admin)

#### Advertisements
- `GET /ads` - Get active ads
- `GET /ads/all` - Get all ads (admin)
- `POST /ads` - Create ad (admin)
- `PUT /ads/:id` - Update ad (admin)
- `DELETE /ads/:id` - Delete ad (admin)

#### Utility
- `GET /docs` - API documentation
- `GET /health` - Health check

### Response Format
All responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "pagination": {
      "total": 100,
      "totalPages": 5,
      "currentPage": 1,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation error",
  "details": "Missing required field: name",
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🛡️ Security Features

- **Helmet.js** for security headers
- **CORS** protection
- **Rate limiting** (configurable)
- **Input validation** and sanitization
- **SQL injection** prevention
- **Admin authentication** via API key
- **Error handling** without exposing stack traces

## 🔍 Validation

### Input Validation
- Email format validation
- Coordinate range validation (-90 to 90 for lat, -180 to 180 for lng)
- Phone number format validation
- URL format validation
- Required field validation

### Data Sanitization
- String trimming and special character removal
- SQL parameter binding to prevent injection
- Request size limits (10MB)

## 📊 Database Models

### City
```javascript
{
  id: INTEGER,
  slug: STRING (unique),
  name_me: STRING,
  name_en: STRING
}
```

### Pharmacy
```javascript
{
  id: INTEGER,
  city_id: INTEGER,
  name_me: STRING,
  name_en: STRING,
  address: STRING,
  lat: DECIMAL,
  lng: DECIMAL,
  is_24h: BOOLEAN,
  open_sunday: BOOLEAN,
  hours_monfri: STRING,
  hours_sat: STRING,
  hours_sun: STRING,
  phone: STRING,
  website: STRING,
  active: BOOLEAN,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### PharmacySubmission
```javascript
{
  id: INTEGER,
  name: STRING,
  address: STRING,
  city_slug: STRING,
  phone: STRING,
  website: STRING,
  is_24h: BOOLEAN,
  open_sunday: BOOLEAN,
  lat: DECIMAL,
  lng: DECIMAL,
  email: STRING,
  status: STRING, // 'received', 'reviewed', 'approved', 'rejected'
  created_at: TIMESTAMP
}
```

## 🚀 Development

### Scripts
```bash
npm run dev          # Start development server
npm run dev:watch    # Start with nodemon (auto-restart)
npm run start        # Start production server
npm run seed         # Seed database
npm run seed:dev     # Seed with development data
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Adding New Features

1. **Model**: Create in `db/models/`
2. **Controller**: Add business logic in `controllers/`
3. **Routes**: Define endpoints in `routes/`
4. **Middleware**: Add validation/auth in `middleware/`
5. **Update**: Add to main exports in respective index files

### Error Handling
All errors are handled by the global error handler that:
- Logs errors with context
- Returns consistent error responses
- Hides sensitive information in production
- Maps database errors to HTTP status codes

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3001/health

# Get cities
curl http://localhost:3001/api/cities

# Get pharmacies
curl "http://localhost:3001/api/pharmacies?cityId=1&is24h=true"

# Submit pharmacy (POST with JSON)
curl -X POST http://localhost:3001/api/pharmacy-submissions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Pharmacy","address":"Test Address","city_slug":"podgorica","email":"test@example.com"}'

# Admin endpoint
curl -H "x-admin-key: admin123" http://localhost:3001/api/pharmacy-submissions
```

## 📈 Performance

### Database Optimization
- Indexes on frequently queried columns
- Connection pooling (max 20 connections)
- Query parameter binding
- Pagination for large datasets

### Caching Strategy
- In-memory response caching (future enhancement)
- Database query result caching
- Static asset caching via reverse proxy

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database exists
psql -l | grep apoteka24

# Test connection
psql -h localhost -U postgres -d apoteka24
```

**Permission Errors:**
```bash
# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE apoteka24 TO your_user;"
```

**Port Already in Use:**
```bash
# Find process using port
sudo lsof -i :3001

# Kill process
sudo kill -9 PID
```

## 🔄 Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Use secure database credentials
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS
- [ ] Configure reverse proxy (nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure logging
- [ ] Set up monitoring

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_NAME=apoteka24_prod
DB_USER=secure_user
DB_PASSWORD=secure_password
ADMIN_KEY=very_secure_admin_key
CORS_ORIGIN=https://yourdomain.com
```

---

For more information, see the main project [README](../README.md) or [Docker setup guide](../DOCKER_SETUP.md).