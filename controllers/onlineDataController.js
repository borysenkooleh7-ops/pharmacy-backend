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
  'savnik': { lat: 43.0169, lng: 19.0961, radius: 4000 }
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
    const searchParams = {
      location: `${cityCoords.lat},${cityCoords.lng}`,
      radius: cityCoords.radius,
      type: 'pharmacy',
      key: GOOGLE_API_KEY
    }

    console.log(`📍 Searching pharmacies near ${cityCoords.lat},${cityCoords.lng} within ${cityCoords.radius}m`)

    const searchResponse = await axios.get(searchUrl, { params: searchParams })

    if (searchResponse.data.status !== 'OK' && searchResponse.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${searchResponse.data.status} - ${searchResponse.data.error_message || 'Unknown error'}`)
    }

    const places = searchResponse.data.results || []
    console.log(`📋 Found ${places.length} pharmacies from Google Places API`)

    if (places.length === 0) {
      return []
    }

    // Step 2: Get detailed information for each pharmacy
    const pharmacyData = []

    for (const place of places.slice(0, 20)) { // Limit to 20 to avoid API quota issues
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

        pharmacyData.push(pharmacy)
        console.log(`✅ Processed pharmacy: ${pharmacy.name_me}`)

        // Add small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`❌ Error processing place ${place.place_id}:`, error.message)
        continue
      }
    }

    console.log(`🎯 Successfully processed ${pharmacyData.length} pharmacies for ${citySlug}`)
    return pharmacyData

  } catch (error) {
    console.error(`❌ Failed to fetch online data for ${citySlug}:`, error.message)
    throw error
  }
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
  try {
    const { citySlug } = req.body

    if (!citySlug) {
      return res.status(400).json(createErrorResponse('City slug is required'))
    }

    console.log(`🚀 Starting pharmacy data sync for city: ${citySlug}`)

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
      message: `Successfully synced ${processedPharmacies.length} pharmacies for ${staticCity.name_en}`
    }

    console.log(`✅ Completed sync for ${citySlug}: ${created} created, ${updated} updated`)
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