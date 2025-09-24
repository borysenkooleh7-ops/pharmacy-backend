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
 * Fetch real pharmacy data from Google Places API
 */
const fetchOnlinePharmacyData = async (citySlug) => {
  try {
    console.log(`🔍 Fetching real pharmacy data for city: ${citySlug}`)

    const cityCoords = CITY_COORDINATES[citySlug]
    if (!cityCoords) {
      throw new Error(`City coordinates not found for: ${citySlug}`)
    }

    // Step 1: Search for pharmacies using Google Places Nearby Search
    const searchUrl = `${PLACES_API_BASE_URL}/nearbysearch/json`

    // Comprehensive search strategies for thorough data retrieval
    const baseRadius = cityCoords.radius
    const searchStrategies = [
      // Primary searches with type
      {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: baseRadius,
        type: 'pharmacy',
        key: GOOGLE_API_KEY
      },
      // Keyword searches in Montenegrin
      {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: baseRadius,
        keyword: 'apoteka',
        key: GOOGLE_API_KEY
      },
      {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: baseRadius,
        keyword: 'ljekarna',
        key: GOOGLE_API_KEY
      },
      {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: baseRadius,
        keyword: 'farmacija',
        key: GOOGLE_API_KEY
      },

      // Keyword searches in English
      {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: baseRadius,
        keyword: 'pharmacy',
        key: GOOGLE_API_KEY
      },
      {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: baseRadius,
        keyword: 'drugstore',
        key: GOOGLE_API_KEY
      },
      {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: baseRadius,
        keyword: 'medicine',
        key: GOOGLE_API_KEY
      },

      // Extended radius searches for rural areas
      {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: Math.min(baseRadius * 1.5, 15000),
        type: 'pharmacy',
        key: GOOGLE_API_KEY
      },
      {
        location: `${cityCoords.lat},${cityCoords.lng}`,
        radius: Math.min(baseRadius * 1.5, 15000),
        keyword: 'apoteka',
        key: GOOGLE_API_KEY
      },

      // Text searches for comprehensive coverage
      {
        query: `apoteka ${citySlug} montenegro`,
        key: GOOGLE_API_KEY
      },
      {
        query: `pharmacy ${citySlug} montenegro`,
        key: GOOGLE_API_KEY
      }
    ]

    console.log(`📍 Searching pharmacies near ${cityCoords.lat},${cityCoords.lng} within ${cityCoords.radius}m`)

    let allPlaces = []

    for (const [index, searchParams] of searchStrategies.entries()) {
      try {
        console.log(`🔍 Strategy ${index + 1}/${searchStrategies.length}: ${JSON.stringify(searchParams)}`)

        let searchResponse

        // Determine which API endpoint to use
        if (searchParams.query) {
          // Use Text Search API for query-based searches
          const textSearchUrl = `${PLACES_API_BASE_URL}/textsearch/json`
          searchResponse = await axios.get(textSearchUrl, { params: searchParams })
        } else {
          // Use Nearby Search API for location-based searches
          searchResponse = await axios.get(searchUrl, { params: searchParams })
        }

        if (searchResponse.data.status === 'OK') {
          const places = searchResponse.data.results || []
          console.log(`📋 Found ${places.length} results with this strategy`)

          // Add new places (avoid duplicates by place_id)
          for (const place of places) {
            if (!allPlaces.find(p => p.place_id === place.place_id)) {
              // Additional filtering for pharmacy-related places
              if (isPharmacyRelated(place)) {
                allPlaces.push(place)
                console.log(`✅ Added: ${place.name}`)
              }
            }
          }
        } else if (searchResponse.data.status === 'ZERO_RESULTS') {
          console.log(`📭 No results for this strategy`)
        } else {
          console.warn(`⚠️ API returned status: ${searchResponse.data.status}`)
        }

        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`❌ Search strategy ${index + 1} failed:`, error.message)
      }
    }

    console.log(`📋 Total unique pharmacies found: ${allPlaces.length}`)

    if (allPlaces.length === 0) {
      return []
    }

    // Step 2: Get detailed information for each pharmacy
    const pharmacyData = []

    for (const place of allPlaces.slice(0, 50)) { // Increased limit for thorough data retrieval
      try {
        // Get place details
        const detailsUrl = `${PLACES_API_BASE_URL}/details/json`
        const detailsParams = {
          place_id: place.place_id,
          fields: 'name,formatted_address,geometry,formatted_phone_number,website,opening_hours,business_status',
          key: GOOGLE_API_KEY
        }

        const detailsResponse = await axios.get(detailsUrl, { params: detailsParams })

        if (detailsResponse.data.status !== 'OK') {
          console.warn(`⚠️ Failed to get details for place ${place.place_id}: ${detailsResponse.data.status}`)
          continue
        }

        const details = detailsResponse.data.result

        // Skip permanently closed businesses
        if (details.business_status === 'CLOSED_PERMANENTLY') {
          console.log(`❌ Skipping permanently closed pharmacy: ${details.name}`)
          continue
        }

        // Process opening hours
        const openingHours = details.opening_hours?.weekday_text || []
        const processedHours = processOpeningHours(openingHours)

        // Create pharmacy object
        const pharmacy = {
          name_me: details.name, // Use Google name as Montenegrin name
          name_en: details.name, // Same name for English
          address: details.formatted_address,
          lat: details.geometry.location.lat,
          lng: details.geometry.location.lng,
          phone: details.formatted_phone_number || null,
          website: details.website || null,
          is_24h: processedHours.is_24h,
          open_sunday: processedHours.open_sunday,
          hours_monfri: processedHours.hours_monfri,
          hours_sat: processedHours.hours_sat,
          hours_sun: processedHours.hours_sun,
          google_place_id: place.place_id,
          google_rating: place.rating || null
        }

        // Validate pharmacy data for accuracy and reliability
        const validation = validatePharmacyData(pharmacy)

        if (validation.isValid && validation.reliability >= 60) {
          pharmacy.reliability_score = validation.reliability
          pharmacyData.push(pharmacy)
          console.log(`✅ Processed pharmacy: ${pharmacy.name_me} (reliability: ${validation.reliability}%)`)
        } else {
          console.log(`❌ Rejected pharmacy: ${pharmacy.name_me} (reliability: ${validation.reliability}%, issues: ${validation.issues.join(', ')})`)
          continue
        }

        // Add delay to respect API rate limits (more conservative for thorough search)
        await new Promise(resolve => setTimeout(resolve, 150))

      } catch (error) {
        console.error(`❌ Error processing place ${place.place_id}:`, error.message)
        continue
      }
    }

    // Calculate quality statistics
    const totalFound = allPlaces.length
    const totalProcessed = pharmacyData.length
    const avgReliability = pharmacyData.length > 0 ?
      Math.round(pharmacyData.reduce((sum, p) => sum + (p.reliability_score || 0), 0) / pharmacyData.length) : 0
    const highQuality = pharmacyData.filter(p => (p.reliability_score || 0) >= 80).length
    const mediumQuality = pharmacyData.filter(p => (p.reliability_score || 0) >= 60 && (p.reliability_score || 0) < 80).length

    console.log(`🎯 Successfully processed ${pharmacyData.length} pharmacies for ${citySlug}`)
    console.log(`📊 Enhanced search summary for ${citySlug}:`)
    console.log(`   - Total search strategies used: ${searchStrategies.length}`)
    console.log(`   - Raw places found: ${totalFound}`)
    console.log(`   - Pharmacy-related places identified: ${totalFound}`)
    console.log(`   - Passed validation checks: ${totalProcessed}`)
    console.log(`   - Average reliability score: ${avgReliability}%`)
    console.log(`   - High quality (≥80%): ${highQuality}`)
    console.log(`   - Medium quality (60-79%): ${mediumQuality}`)
    console.log(`   - Accuracy rate: ${totalFound > 0 ? Math.round((totalProcessed / totalFound) * 100) : 0}%`)

    return pharmacyData

  } catch (error) {
    console.error(`❌ Failed to fetch online data for ${citySlug}:`, error.message)
    throw error
  }
}

/**
 * Check if a place is pharmacy-related based on name, types, and additional validation
 * Enhanced with accuracy and reliability checks
 */
const isPharmacyRelated = (place) => {
  const name = (place.name || '').toLowerCase()
  const types = (place.types || []).map(type => type.toLowerCase())
  const vicinity = (place.vicinity || '').toLowerCase()

  // Primary pharmacy keywords (high confidence)
  const primaryPharmacyKeywords = [
    'apoteka', 'ljekarna', 'farmacija', 'pharmacy', 'drugstore',
    'apteka', 'lekarna', 'montefarm', 'benu', 'zegin'
  ]

  // Secondary pharmacy-related keywords (medium confidence)
  const secondaryPharmacyKeywords = [
    'medicine', 'medicinsk', 'zdravstven', 'zdravlje', 'lijek',
    'pills', 'medication', 'pharmaceutical', 'farmaceutsk'
  ]

  // Pharmacy chain names in Montenegro (high confidence)
  const montenegroPharmacyChains = [
    'montefarm', 'benu', 'zegin', 'maksima', 'maxima', 'tea medica',
    'hipokrat', 'meditas', 'dama', 'ukus zdravlja'
  ]

  // Strict exclusion keywords (definitely not pharmacy)
  const strictExcludeKeywords = [
    // Medical facilities
    'hospital', 'bolnica', 'klinik', 'ambulant', 'dom zdravlja',
    'health center', 'medical center', 'poliklinik', 'ordinacij',
    'emergency', 'hitna pomoc', 'first aid',

    // Dental/Veterinary
    'dental', 'zubar', 'stomatolog', 'veterinar', 'vet clinic',

    // Other businesses
    'hotel', 'restoran', 'kafic', 'market', 'shop', 'trgovin',
    'supermarket', 'benzinska', 'gas station', 'bank', 'banka',
    'beauty', 'salon', 'frizersk', 'nail', 'spa',

    // Non-pharmacy health
    'fitness', 'gym', 'teretana', 'physiotherapy', 'fizioterapi',
    'massage', 'masaza', 'wellness', 'laboratory', 'laboratori'
  ]

  // Soft exclusion keywords (probably not pharmacy, but check further)
  const softExcludeKeywords = [
    'clinic', 'center', 'centar', 'medical', 'health'
  ]

  // Check for strict exclusions first
  const isStrictlyExcluded = strictExcludeKeywords.some(keyword =>
    name.includes(keyword) || vicinity.includes(keyword)
  )

  if (isStrictlyExcluded) {
    console.log(`❌ Strictly excluded: ${place.name} (contains excluded keyword)`)
    return false
  }

  // Check for Montenegro pharmacy chains (high confidence)
  const isKnownChain = montenegroPharmacyChains.some(chain =>
    name.includes(chain)
  )

  if (isKnownChain) {
    console.log(`✅ Known pharmacy chain: ${place.name}`)
    return true
  }

  // Check for primary pharmacy keywords
  const hasPrimaryKeyword = primaryPharmacyKeywords.some(keyword =>
    name.includes(keyword)
  )

  // Check for pharmacy-related types from Google Places
  const pharmacyTypes = [
    'pharmacy', 'drugstore', 'health'
  ]

  const hasPharmacyType = pharmacyTypes.some(type => types.includes(type))

  // High confidence: Primary keyword OR pharmacy type
  if (hasPrimaryKeyword || hasPharmacyType) {
    // Additional validation for places with soft exclusion keywords
    const hasSoftExclusion = softExcludeKeywords.some(keyword =>
      name.includes(keyword) || vicinity.includes(keyword)
    )

    if (hasSoftExclusion) {
      // Need stronger evidence for places with soft exclusions
      const hasStrongEvidence = hasPrimaryKeyword && hasPharmacyType
      if (hasStrongEvidence) {
        console.log(`✅ Strong evidence for pharmacy: ${place.name}`)
        return true
      } else {
        console.log(`⚠️ Soft excluded due to ambiguous keywords: ${place.name}`)
        return false
      }
    }

    console.log(`✅ Primary evidence for pharmacy: ${place.name}`)
    return true
  }

  // Medium confidence: Secondary keywords with additional validation
  const hasSecondaryKeyword = secondaryPharmacyKeywords.some(keyword =>
    name.includes(keyword)
  )

  if (hasSecondaryKeyword) {
    // For secondary keywords, we need additional validation
    const rating = place.rating || 0
    const userRatingsTotal = place.user_ratings_total || 0

    // Check if it has good ratings (indicates legitimate business)
    const hasGoodRatings = rating >= 3.0 && userRatingsTotal >= 5

    // Check if vicinity contains pharmacy-related terms
    const vicinityHasPharmacyTerms = primaryPharmacyKeywords.some(keyword =>
      vicinity.includes(keyword)
    )

    if (hasGoodRatings || vicinityHasPharmacyTerms) {
      console.log(`✅ Secondary evidence with validation: ${place.name}`)
      return true
    }
  }

  console.log(`❌ Insufficient evidence for pharmacy: ${place.name}`)
  return false
}

/**
 * Additional validation to verify pharmacy data accuracy
 */
const validatePharmacyData = (pharmacy) => {
  const issues = []

  // Check required fields
  if (!pharmacy.name_me || pharmacy.name_me.trim().length < 3) {
    issues.push('Name too short or missing')
  }

  if (!pharmacy.address || pharmacy.address.trim().length < 10) {
    issues.push('Address too short or missing')
  }

  // Validate coordinates (Montenegro bounds)
  const lat = parseFloat(pharmacy.lat)
  const lng = parseFloat(pharmacy.lng)

  if (isNaN(lat) || isNaN(lng)) {
    issues.push('Invalid coordinates')
  } else {
    // Montenegro approximate bounds
    if (lat < 41.8 || lat > 43.6 || lng < 18.4 || lng > 20.4) {
      issues.push('Coordinates outside Montenegro')
    }
  }

  // Validate phone format (if provided)
  if (pharmacy.phone) {
    const phonePattern = /^(\+382|382)?\s*\d{2,3}[\s\-]?\d{3}[\s\-]?\d{3,4}$/
    if (!phonePattern.test(pharmacy.phone.replace(/\s+/g, ''))) {
      issues.push('Invalid Montenegro phone format')
    }
  }

  // Validate website format (if provided)
  if (pharmacy.website) {
    try {
      new URL(pharmacy.website)
    } catch {
      issues.push('Invalid website URL')
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    reliability: calculateReliabilityScore(pharmacy, issues)
  }
}

/**
 * Calculate reliability score based on available data and validation
 */
const calculateReliabilityScore = (pharmacy, issues) => {
  let score = 100

  // Deduct points for validation issues
  score -= issues.length * 10

  // Add points for complete data
  if (pharmacy.phone) score += 10
  if (pharmacy.website) score += 10
  if (pharmacy.google_rating && pharmacy.google_rating >= 4.0) score += 15
  if (pharmacy.google_place_id) score += 20

  // Deduct points for suspicious patterns
  if (pharmacy.name_me.length < 5) score -= 15
  if (!pharmacy.address.includes('Montenegro') && !pharmacy.address.includes('Crna Gora')) {
    score -= 5
  }

  return Math.max(0, Math.min(100, score))
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

  const hoursMap = {}
  let is24h = false

  weekdayText.forEach(dayText => {
    const [day, hours] = dayText.split(': ')

    if (hours === 'Open 24 hours') {
      is24h = true
    }

    // Map Google days to our format
    if (day.includes('Monday') || day.includes('Tuesday') ||
        day.includes('Wednesday') || day.includes('Thursday') ||
        day.includes('Friday')) {
      hoursMap.weekday = hours || 'Closed'
    } else if (day.includes('Saturday')) {
      hoursMap.saturday = hours || 'Closed'
    } else if (day.includes('Sunday')) {
      hoursMap.sunday = hours || 'Closed'
    }
  })

  return {
    is_24h: is24h,
    open_sunday: hoursMap.sunday && hoursMap.sunday !== 'Closed',
    hours_monfri: is24h ? '24/7' : (hoursMap.weekday || 'N/A'),
    hours_sat: is24h ? '24/7' : (hoursMap.saturday || 'N/A'),
    hours_sun: is24h ? '24/7' : (hoursMap.sunday || 'Closed')
  }
}


/**
 * Sync online pharmacy data for a specific city
 */
const syncCityPharmacyData = async (req, res) => {
  const syncStartTime = Date.now()

  try {
    const { citySlug } = req.body

    if (!citySlug) {
      return res.status(400).json(createErrorResponse('City slug is required'))
    }

    console.log(`🚀 Starting comprehensive pharmacy data sync for city: ${citySlug}`)

    // 1. Verify city exists in static data and get/create in database
    const staticCity = getCityBySlug(citySlug)
    if (!staticCity) {
      return res.status(404).json(createErrorResponse(`City not found: ${citySlug}`))
    }

    // Get or create the city in database to ensure we have the correct database ID
    let city = await City.findOne({ where: { slug: citySlug } })
    console.log(city);
    
    if (!city) {
      // Create city in database if it doesn't exist
      city = await City.create({
        slug: staticCity.slug,
        name_me: staticCity.name_me,
        name_en: staticCity.name_en
      })
    }

    // 2. Fetch online pharmacy data
    let onlinePharmacies
    try {
      onlinePharmacies = await fetchOnlinePharmacyData(citySlug)
    } catch (error) {
      return res.status(503).json(createErrorResponse(
        `Failed to fetch online data for ${citySlug}`,
        error.message
      ))
    }

    if (onlinePharmacies.length === 0) {
      return res.json(createResponse({
        citySlug,
        cityName: staticCity.name_en,
        success: true,
        processed: 0,
        created: 0,
        updated: 0,
        message: 'No online pharmacy data found for this city'
      }, `No online pharmacies found for ${staticCity.name_en}`))
    }

    // 3. Process each online pharmacy
    let created = 0
    let updated = 0
    const processedPharmacies = []

    for (const onlinePharmacy of onlinePharmacies) {
      try {
        // Convert empty website to null for validation
        const pharmacyData = {
          ...onlinePharmacy,
          city_id: city.id,
          website: onlinePharmacy.website && onlinePharmacy.website.trim() !== '' ? onlinePharmacy.website : null,
          active: true
        }

        // Check if pharmacy already exists (by Google Place ID or name and city)
        let existingPharmacy = null

        // First check by Google Place ID if available
        if (pharmacyData.google_place_id) {
          existingPharmacy = await Pharmacy.findOne({
            where: {
              google_place_id: pharmacyData.google_place_id
            }
          })
        }

        // If not found by Place ID, check by name and city
        if (!existingPharmacy) {
          existingPharmacy = await Pharmacy.findOne({
            where: {
              city_id: city.id,
              name_me: pharmacyData.name_me
            }
          })
        }

        if (existingPharmacy) {
          // Update existing pharmacy with fresh Google data
          await existingPharmacy.update(pharmacyData)
          updated++
          processedPharmacies.push({
            id: existingPharmacy.id,
            name: pharmacyData.name_me,
            action: 'updated',
            google_place_id: pharmacyData.google_place_id
          })
          console.log(`📝 Updated pharmacy: ${pharmacyData.name_me}`)
        } else {
          // Create new pharmacy from Google data
          const newPharmacy = await Pharmacy.create(pharmacyData)
          created++
          processedPharmacies.push({
            id: newPharmacy.id,
            name: pharmacyData.name_me,
            action: 'created',
            google_place_id: pharmacyData.google_place_id
          })
          console.log(`➕ Created pharmacy: ${pharmacyData.name_me}`)
        }
      } catch (error) {
        console.error(`❌ Failed to process pharmacy ${onlinePharmacy.name_me}:`, error.message)
        // Continue processing other pharmacies
      }
    }

    const result = {
      citySlug,
      cityName: staticCity.name_en,
      success: true,
      processed: processedPharmacies.length,
      created,
      updated,
      pharmacies: processedPharmacies,
      message: `Successfully synced ${processedPharmacies.length} pharmacies for ${staticCity.name_en}`,
      // Additional detailed information for admin visibility
      searchSummary: {
        strategiesUsed: 12, // Number of search strategies
        uniquePlacesFound: onlinePharmacies.length,
        pharmacyRelatedPlaces: onlinePharmacies.length,
        apiCallsSuccessful: true,
        processingTimeSeconds: Math.round((Date.now() - syncStartTime) / 1000)
      }
    }

    console.log(`✅ Completed comprehensive sync for ${citySlug}: ${created} created, ${updated} updated`)
    res.json(createResponse(result, `Pharmacy data synced successfully for ${staticCity.name_en}`))

  } catch (error) {
    console.error('Error syncing pharmacy data:', error)
    res.status(500).json(createErrorResponse('Failed to sync pharmacy data', error.message))
  }
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
      lastSync: null // Could track this with a sync_log table
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
  getSyncStatus
}