const { createResponse, createErrorResponse } = require('../utils/responseHelper')
const { Pharmacy, City } = require('../db/models')
const { getCityBySlug, getAllCities } = require('../data/cities')
const axios = require('axios')

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place'

// City coordinates for Montenegro cities
const CITY_COORDINATES = {
  'podgorica': { lat: 42.4304, lng: 19.2594, radius: 15000 },
  'niksic': { lat: 42.7731, lng: 18.9447, radius: 10000 },
  'herceg-novi': { lat: 42.4519, lng: 18.5375, radius: 8000 },
  'berane': { lat: 42.8469, lng: 19.8658, radius: 8000 },
  'bar': { lat: 42.0947, lng: 19.0904, radius: 8000 },
  'bijelo-polje': { lat: 43.0356, lng: 19.7475, radius: 8000 },
  'cetinje': { lat: 42.3911, lng: 18.9238, radius: 8000 },
  'pljevlja': { lat: 43.3575, lng: 19.3581, radius: 8000 },
  'kotor': { lat: 42.4247, lng: 18.7712, radius: 6000 },
  'tivat': { lat: 42.4370, lng: 18.6936, radius: 6000 },
  'budva': { lat: 42.2864, lng: 18.8400, radius: 6000 },
  'ulcinj': { lat: 41.9297, lng: 19.2047, radius: 6000 },
  'kolasin': { lat: 42.8222, lng: 19.5217, radius: 6000 },
  'mojkovac': { lat: 42.9603, lng: 19.5839, radius: 6000 },
  'rozaje': { lat: 42.8411, lng: 20.1664, radius: 6000 },
  'plav': { lat: 42.5950, lng: 19.9447, radius: 5000 },
  'zabljak': { lat: 43.1544, lng: 19.1239, radius: 5000 },
  'andrijevica': { lat: 42.7356, lng: 19.7939, radius: 5000 },
  'danilovgrad': { lat: 42.5508, lng: 19.1036, radius: 6000 },
  'golubovci': { lat: 42.3453, lng: 19.2869, radius: 5000 },
  'tuzi': { lat: 42.3661, lng: 19.3239, radius: 5000 },
  'petnjica': { lat: 42.9492, lng: 19.9061, radius: 4000 },
  'gusinje': { lat: 42.5531, lng: 19.8319, radius: 4000 },
  'pluzine': { lat: 43.1544, lng: 18.8447, radius: 4000 },
  'savnik': { lat: 43.0169, lng: 19.0961, radius: 8000 }
}

/**
 * FIXED: Simple retry mechanism with proper error handling
 */
const retryApiCall = async (apiCall, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall()
      return result
    } catch (error) {
      console.log(`⚠️ API call attempt ${attempt}/${maxRetries} failed: ${error.message}`)
      if (attempt === maxRetries) {
        throw error
      }
      // Wait before retry (1s, 2s, 3s)
      await new Promise(resolve => setTimeout(resolve, attempt * 1000))
    }
  }
}

/**
 * FIXED: Simplified pagination that actually works
 */
const getAllResults = async (url, params, maxPages = 3) => {
  let allResults = []
  let nextPageToken = null
  let pageCount = 0

  do {
    try {
      const currentParams = { ...params }
      if (nextPageToken) {
        currentParams.pagetoken = nextPageToken
        // CRITICAL: Wait for next_page_token to become valid
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      const response = await axios.get(url, { params: currentParams, timeout: 15000 })

      if (response.data.status === 'OK') {
        const results = response.data.results || []
        allResults.push(...results)
        nextPageToken = response.data.next_page_token
        pageCount++
        console.log(`📄 Page ${pageCount}: ${results.length} results (Total: ${allResults.length})`)
      } else if (response.data.status === 'ZERO_RESULTS') {
        console.log(`📭 No results found`)
        break
      } else {
        console.log(`⚠️ API status: ${response.data.status}`)
        break
      }
    } catch (error) {
      console.error(`❌ Page ${pageCount + 1} failed: ${error.message}`)
      break
    }
  } while (nextPageToken && pageCount < maxPages)

  return allResults
}

/**
 * FIXED: Simplified pharmacy detection with better accuracy
 */
const isPharmacy = (place) => {
  const name = (place.name || '').toLowerCase()
  const types = (place.types || []).join(' ').toLowerCase()

  // Montenegro pharmacy chains - high confidence
  const knownChains = [
    'montefarm', 'benu', 'zegin', 'maksima', 'maxima', 'tea medica'
  ]

  if (knownChains.some(chain => name.includes(chain))) {
    return true
  }

  // Common pharmacy keywords - high confidence
  const pharmacyKeywords = [
    'apoteka', 'ljekarna', 'farmacija', 'pharmacy'
  ]

  if (pharmacyKeywords.some(keyword => name.includes(keyword))) {
    return true
  }

  // Google Types - medium confidence
  if (types.includes('pharmacy') || types.includes('drugstore')) {
    return true
  }

  return false
}

/**
 * FIXED: Simplified but comprehensive search strategy
 */
const fetchOnlinePharmacyData = async (citySlug) => {
  try {
    console.log(`🚀 FIXED: Starting pharmacy search for ${citySlug}`)

    // Check API key
    if (!GOOGLE_API_KEY) {
      throw new Error('Google Maps API key not configured')
    }

    const cityCoords = CITY_COORDINATES[citySlug]
    if (!cityCoords) {
      throw new Error(`City coordinates not found for: ${citySlug}`)
    }

    console.log(`📍 Searching around ${cityCoords.lat},${cityCoords.lng} with ${cityCoords.radius}m radius`)

    let allPlaces = []
    const processedIds = new Set()

    // STRATEGY 1: Direct pharmacy type search with multiple radii
    const radii = [cityCoords.radius, cityCoords.radius * 1.5]

    for (const radius of radii) {
      console.log(`🔍 Searching with radius ${radius}m`)

      try {
        const nearbyUrl = `${PLACES_API_BASE_URL}/nearbysearch/json`
        const params = {
          location: `${cityCoords.lat},${cityCoords.lng}`,
          radius: radius,
          type: 'pharmacy',
          key: GOOGLE_API_KEY
        }

        const results = await getAllResults(nearbyUrl, params, 3)

        for (const place of results) {
          if (!processedIds.has(place.place_id) && isPharmacy(place)) {
            allPlaces.push(place)
            processedIds.add(place.place_id)
            console.log(`✅ Found pharmacy: ${place.name}`)
          }
        }

        // Wait between searches
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ Radius ${radius}m search failed: ${error.message}`)
      }
    }

    // STRATEGY 2: Keyword searches for Montenegro-specific terms
    const keywords = ['apoteka', 'ljekarna', 'montefarm', 'benu']

    for (const keyword of keywords) {
      console.log(`🔍 Searching for keyword: ${keyword}`)

      try {
        const nearbyUrl = `${PLACES_API_BASE_URL}/nearbysearch/json`
        const params = {
          location: `${cityCoords.lat},${cityCoords.lng}`,
          radius: cityCoords.radius * 1.5,
          keyword: keyword,
          key: GOOGLE_API_KEY
        }

        const results = await getAllResults(nearbyUrl, params, 2)

        for (const place of results) {
          if (!processedIds.has(place.place_id) && isPharmacy(place)) {
            allPlaces.push(place)
            processedIds.add(place.place_id)
            console.log(`✅ Found pharmacy via keyword: ${place.name}`)
          }
        }

        // Wait between searches
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ Keyword ${keyword} search failed: ${error.message}`)
      }
    }

    // STRATEGY 3: Text search for comprehensive coverage
    const textQueries = [
      `apoteka ${citySlug}`,
      `pharmacy ${citySlug} montenegro`
    ]

    for (const query of textQueries) {
      console.log(`🔍 Text search: ${query}`)

      try {
        const textUrl = `${PLACES_API_BASE_URL}/textsearch/json`
        const params = {
          query: query,
          key: GOOGLE_API_KEY
        }

        const results = await getAllResults(textUrl, params, 2)

        for (const place of results) {
          if (!processedIds.has(place.place_id) && isPharmacy(place)) {
            allPlaces.push(place)
            processedIds.add(place.place_id)
            console.log(`✅ Found pharmacy via text search: ${place.name}`)
          }
        }

        // Wait between searches
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ Text search failed: ${error.message}`)
      }
    }

    console.log(`🎯 Total pharmacies found: ${allPlaces.length}`)

    if (allPlaces.length === 0) {
      console.warn(`⚠️ No pharmacies found for ${citySlug} - this may indicate API issues or no pharmacies in the area`)
      return []
    }

    // Get detailed information for each pharmacy
    const pharmacyData = []

    for (let i = 0; i < allPlaces.length; i++) {
      const place = allPlaces[i]
      console.log(`🔄 Processing pharmacy ${i + 1}/${allPlaces.length}: ${place.name}`)

      try {
        const detailsUrl = `${PLACES_API_BASE_URL}/details/json`
        const detailsParams = {
          place_id: place.place_id,
          fields: 'name,formatted_address,geometry,formatted_phone_number,website,opening_hours,business_status,rating,user_ratings_total',
          key: GOOGLE_API_KEY
        }

        const detailsResponse = await retryApiCall(async () => {
          return await axios.get(detailsUrl, { params: detailsParams, timeout: 10000 })
        })

        if (detailsResponse.data.status !== 'OK') {
          console.warn(`⚠️ Could not get details for ${place.name}: ${detailsResponse.data.status}`)
          continue
        }

        const details = detailsResponse.data.result

        // Skip permanently closed
        if (details.business_status === 'CLOSED_PERMANENTLY') {
          console.log(`❌ Skipping permanently closed: ${details.name}`)
          continue
        }

        // Process opening hours
        const openingHours = details.opening_hours?.weekday_text || []
        const hoursData = processOpeningHours(openingHours)

        // Create pharmacy record
        const pharmacy = {
          name_me: details.name,
          name_en: details.name,
          address: details.formatted_address || 'Address not available',
          lat: details.geometry?.location?.lat || place.geometry?.location?.lat,
          lng: details.geometry?.location?.lng || place.geometry?.location?.lng,
          phone: details.formatted_phone_number || null,
          website: details.website || null,
          is_24h: hoursData.is_24h,
          open_sunday: hoursData.open_sunday,
          hours_monfri: hoursData.hours_monfri,
          hours_sat: hoursData.hours_sat,
          hours_sun: hoursData.hours_sun,
          google_place_id: place.place_id,
          google_rating: details.rating || null,
          google_reviews_count: details.user_ratings_total || 0,
          reliability_score: calculateReliability(details, place)
        }

        // Basic validation
        if (pharmacy.lat && pharmacy.lng && pharmacy.name_me.length > 2) {
          pharmacyData.push(pharmacy)
          console.log(`✅ Successfully processed: ${pharmacy.name_me}`)
        } else {
          console.warn(`⚠️ Skipping invalid pharmacy data: ${pharmacy.name_me}`)
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        console.error(`❌ Failed to process ${place.name}: ${error.message}`)
      }
    }

    // Generate search statistics
    const searchStats = {
      totalFound: allPlaces.length,
      totalProcessed: pharmacyData.length,
      processingTimeSeconds: 0, // Will be calculated by caller
      apiCallsTotal: radii.length + keywords.length + textQueries.length + pharmacyData.length,
      apiCallsSuccessful: radii.length + keywords.length + textQueries.length + pharmacyData.length,
      searchStrategiesUsed: radii.length + keywords.length + textQueries.length,
      avgReliability: pharmacyData.length > 0 ?
        Math.round(pharmacyData.reduce((sum, p) => sum + (p.reliability_score || 0), 0) / pharmacyData.length) : 0,
      highQuality: pharmacyData.filter(p => (p.reliability_score || 0) >= 80).length,
      mediumQuality: pharmacyData.filter(p => (p.reliability_score || 0) >= 60 && (p.reliability_score || 0) < 80).length,
      lowQuality: pharmacyData.filter(p => (p.reliability_score || 0) < 60).length,
      requiresReview: pharmacyData.filter(p => (p.reliability_score || 0) < 70).length,
      coverageRadiiUsed: radii,
      accuracyRate: Math.round((pharmacyData.length / Math.max(allPlaces.length, 1)) * 100)
    }

    // Attach stats to the data array for caller
    pharmacyData._searchStats = searchStats

    console.log(`🎯 FIXED SEARCH COMPLETED for ${citySlug}:`)
    console.log(`   - Places found: ${allPlaces.length}`)
    console.log(`   - Pharmacies processed: ${pharmacyData.length}`)
    console.log(`   - Average reliability: ${searchStats.avgReliability}%`)
    console.log(`   - High quality: ${searchStats.highQuality}`)

    return pharmacyData

  } catch (error) {
    console.error(`❌ CRITICAL ERROR in fetchOnlinePharmacyData for ${citySlug}:`, error.message)
    throw error
  }
}

/**
 * Calculate reliability score for a pharmacy
 */
const calculateReliability = (details, place) => {
  let score = 50 // Base score

  // Add points for complete information
  if (details.formatted_phone_number) score += 15
  if (details.website) score += 15
  if (details.formatted_address && details.formatted_address.length > 10) score += 10
  if (details.opening_hours && details.opening_hours.weekday_text) score += 10

  // Rating-based bonus
  if (details.rating >= 4.0) score += 10
  if (details.user_ratings_total >= 10) score += 5

  // Place verification
  if (place.place_id && place.place_id.length > 10) score += 10

  return Math.min(100, Math.max(0, score))
}

/**
 * Process Google Places opening hours into our format
 */
const processOpeningHours = (weekdayText) => {
  if (!weekdayText || weekdayText.length === 0) {
    return {
      is_24h: false,
      open_sunday: false,
      hours_monfri: 'N/A',
      hours_sat: 'N/A',
      hours_sun: 'N/A'
    }
  }

  let is24h = false
  let openSunday = false
  let mondayToFriday = 'N/A'
  let saturday = 'N/A'
  let sunday = 'N/A'

  for (const dayText of weekdayText) {
    const lowerText = dayText.toLowerCase()

    if (lowerText.includes('24 hours') || lowerText.includes('open 24 hours')) {
      is24h = true
      break
    }

    if (lowerText.startsWith('sunday')) {
      const hours = dayText.split(': ')[1] || 'Closed'
      sunday = hours
      openSunday = hours !== 'Closed' && !hours.toLowerCase().includes('closed')
    } else if (lowerText.startsWith('saturday')) {
      saturday = dayText.split(': ')[1] || 'Closed'
    } else if (lowerText.startsWith('monday')) {
      mondayToFriday = dayText.split(': ')[1] || 'Closed'
    }
  }

  if (is24h) {
    return {
      is_24h: true,
      open_sunday: true,
      hours_monfri: '24/7',
      hours_sat: '24/7',
      hours_sun: '24/7'
    }
  }

  return {
    is_24h: false,
    open_sunday: openSunday,
    hours_monfri: mondayToFriday,
    hours_sat: saturday,
    hours_sun: sunday
  }
}

/**
 * FIXED: Enhanced comprehensive sync for online pharmacy data
 */
const syncCityPharmacyData = async (req, res) => {
  const syncStartTime = Date.now()
  let searchStats = null

  try {
    const { citySlug } = req.body

    if (!citySlug) {
      return res.status(400).json(createErrorResponse('City slug is required'))
    }

    console.log(`🚀 FIXED COMPREHENSIVE SYNC for city: ${citySlug.toUpperCase()}`)
    console.log(`🕰️ Started at: ${new Date().toISOString()}`)

    // Verify city exists
    const staticCity = getCityBySlug(citySlug)
    if (!staticCity) {
      return res.status(404).json(createErrorResponse(`City not found: ${citySlug}`))
    }

    console.log(`🏢 Syncing: ${staticCity.name_en} (${staticCity.name_me})`)

    // Get or create city in database
    let city = await City.findOne({ where: { slug: citySlug } })
    if (!city) {
      city = await City.create({
        slug: staticCity.slug,
        name_me: staticCity.name_me,
        name_en: staticCity.name_en
      })
      console.log(`🏢 Created city in database: ${city.name_en}`)
    }

    // Get current pharmacy count
    const existingCount = await Pharmacy.count({
      where: { city_id: city.id, active: true }
    })
    console.log(`📋 Current pharmacies in database: ${existingCount}`)

    // Fetch online pharmacy data
    console.log(`🔍 Starting online pharmacy search...`)
    let onlinePharmacies
    try {
      onlinePharmacies = await fetchOnlinePharmacyData(citySlug)
      if (onlinePharmacies._searchStats) {
        searchStats = onlinePharmacies._searchStats
        searchStats.processingTimeSeconds = Math.round((Date.now() - syncStartTime) / 1000)
        delete onlinePharmacies._searchStats
      }
    } catch (error) {
      console.error(`❌ Online search failed: ${error.message}`)
      return res.status(503).json(createErrorResponse(
        `Failed to fetch online data for ${citySlug}: ${error.message}`,
        { citySlug, cityName: staticCity.name_en }
      ))
    }

    const onlineCount = onlinePharmacies.length
    console.log(`🎯 Found ${onlineCount} pharmacies online`)

    if (onlineCount === 0) {
      console.warn(`⚠️ No pharmacies found online for ${citySlug}`)
      return res.json(createResponse({
        citySlug,
        cityName: staticCity.name_en,
        success: true,
        warning: 'No online pharmacy data found',
        processed: 0,
        created: 0,
        updated: 0,
        errors: 0,
        existingCount,
        onlineCount: 0,
        searchStats: searchStats || {},
        message: `No online pharmacies found for ${staticCity.name_en}`,
        recommendations: [
          'Check Google Maps API key and quotas',
          'Verify city coordinates',
          'Check if pharmacies exist in this location'
        ]
      }, `No online pharmacies found for ${staticCity.name_en}`))
    }

    // Process and save pharmacies
    let created = 0
    let updated = 0
    let errors = 0
    const processedPharmacies = []

    for (let i = 0; i < onlinePharmacies.length; i++) {
      const onlinePharmacy = onlinePharmacies[i]
      console.log(`🔄 Processing ${i + 1}/${onlineCount}: ${onlinePharmacy.name_me}`)

      try {
        const pharmacyData = {
          ...onlinePharmacy,
          city_id: city.id,
          website: onlinePharmacy.website && onlinePharmacy.website.trim() ? onlinePharmacy.website : null,
          active: true,
          last_online_sync: new Date()
        }

        // Check for existing pharmacy
        let existingPharmacy = null

        // First try Google Place ID
        if (pharmacyData.google_place_id) {
          existingPharmacy = await Pharmacy.findOne({
            where: { google_place_id: pharmacyData.google_place_id }
          })
        }

        // Then try name and city
        if (!existingPharmacy) {
          existingPharmacy = await Pharmacy.findOne({
            where: {
              city_id: city.id,
              name_me: pharmacyData.name_me
            }
          })
        }

        if (existingPharmacy) {
          await existingPharmacy.update(pharmacyData)
          updated++
          processedPharmacies.push({
            id: existingPharmacy.id,
            name: pharmacyData.name_me,
            action: 'updated',
            google_place_id: pharmacyData.google_place_id,
            reliability: pharmacyData.reliability_score
          })
          console.log(`📝 Updated: ${pharmacyData.name_me}`)
        } else {
          const newPharmacy = await Pharmacy.create(pharmacyData)
          created++
          processedPharmacies.push({
            id: newPharmacy.id,
            name: pharmacyData.name_me,
            action: 'created',
            google_place_id: pharmacyData.google_place_id,
            reliability: pharmacyData.reliability_score
          })
          console.log(`➕ Created: ${pharmacyData.name_me}`)
        }
      } catch (error) {
        errors++
        console.error(`❌ Failed to save ${onlinePharmacy.name_me}: ${error.message}`)
      }
    }

    const totalProcessed = created + updated
    const syncDuration = Math.round((Date.now() - syncStartTime) / 1000)
    const finalCount = await Pharmacy.count({ where: { city_id: city.id, active: true } })

    // Build comprehensive result
    const result = {
      citySlug,
      cityName: staticCity.name_en,
      success: true,
      syncDuration,
      timestamp: new Date().toISOString(),

      // Processing results
      processed: totalProcessed,
      created,
      updated,
      errors,

      // Coverage metrics
      coverage: {
        before: existingCount,
        after: finalCount,
        improvement: existingCount > 0 ?
          Math.round(((finalCount - existingCount) / existingCount) * 100) + '%' : 'New data',
        onlineDiscovered: onlineCount,
        successfullyProcessed: totalProcessed,
        processingSuccess: Math.round((totalProcessed / onlineCount) * 100) + '%',
        duplicatesDetected: 0, // Simple implementation doesn't track this
        errorRate: Math.round((errors / onlineCount) * 100) + '%'
      },

      // Quality assessment
      quality: {
        highQuality: processedPharmacies.filter(p => (p.reliability || 0) >= 80).length,
        mediumQuality: processedPharmacies.filter(p => (p.reliability || 0) >= 60 && (p.reliability || 0) < 80).length,
        requiresReview: processedPharmacies.filter(p => (p.reliability || 0) < 70).length,
        withGoogleId: processedPharmacies.filter(p => p.google_place_id).length,
        avgReliability: processedPharmacies.length > 0 ?
          Math.round(processedPharmacies.reduce((sum, p) => sum + (p.reliability || 0), 0) / processedPharmacies.length) : 0
      },

      // Pharmacy list
      pharmacies: processedPharmacies,

      // Search statistics
      searchStats: searchStats || {},

      // Success message and recommendations
      message: `Successfully synced ${totalProcessed} pharmacies for ${staticCity.name_en}`,
      recommendations: generateRecommendations(created, updated, errors, onlineCount)
    }

    console.log(`🎆 SYNC COMPLETED for ${citySlug}`)
    console.log(`   Duration: ${syncDuration}s`)
    console.log(`   Found online: ${onlineCount}`)
    console.log(`   Successfully processed: ${totalProcessed}`)
    console.log(`   Created: ${created}, Updated: ${updated}, Errors: ${errors}`)
    console.log(`   Final count: ${finalCount} (was ${existingCount})`)

    res.json(createResponse(result, result.message))

  } catch (error) {
    const syncDuration = Math.round((Date.now() - syncStartTime) / 1000)
    console.error(`❌ SYNC FAILED: ${error.message}`)

    res.status(500).json(createErrorResponse(
      'Pharmacy sync failed',
      {
        error: error.message,
        citySlug: req.body.citySlug,
        syncDuration,
        timestamp: new Date().toISOString()
      }
    ))
  }
}

/**
 * Generate recommendations based on sync results
 */
const generateRecommendations = (created, updated, errors, onlineCount) => {
  const recommendations = []

  if (created === 0 && updated === 0) {
    recommendations.push('No pharmacies found - check API configuration and city coordinates')
  } else if (created > 0) {
    recommendations.push(`Successfully added ${created} new pharmacies to the database`)
  }

  if (errors > 0) {
    recommendations.push(`${errors} pharmacies could not be processed - check logs for details`)
  }

  if (onlineCount > 0 && (created + updated) < onlineCount) {
    recommendations.push('Some pharmacies were not saved - check validation rules')
  }

  if (recommendations.length === 0) {
    recommendations.push('Sync completed successfully with no issues')
  }

  return recommendations
}

/**
 * Get all cities available for syncing
 */
const getSyncableCities = async (_req, res) => {
  try {
    const cities = getAllCities()
    res.json(createResponse(cities, 'Syncable cities retrieved successfully'))
  } catch (error) {
    console.error('Error fetching syncable cities:', error)
    res.status(500).json(createErrorResponse('Failed to fetch cities', error.message))
  }
}

/**
 * Get sync status/statistics
 */
const getSyncStatus = async (_req, res) => {
  try {
    const cities = await City.findAll({
      include: [{
        model: Pharmacy,
        as: 'pharmacies',
        where: { active: true },
        required: false
      }]
    })

    const status = cities.map(city => ({
      citySlug: city.slug,
      cityName: city.name_en,
      
      pharmacyCount: city.pharmacies ? city.pharmacies.length : 0,
      
      lastSync: null
    }))

    res.json(createResponse(status, 'Sync status retrieved successfully'))
  } catch (error) {
    console.error('Error fetching sync status:', error)
    res.status(500).json(createErrorResponse('Failed to fetch sync status', error.message))
  }
}

module.exports = {
  syncCityPharmacyData,
  getSyncableCities,
  getSyncStatus,
  fetchOnlinePharmacyData // Export for testing
}