/* eslint-disable camelcase */
const { createResponse, createErrorResponse } = require('../utils/responseHelper')
const { Pharmacy, City } = require('../db/models')
const { getCityBySlug, getAllCities } = require('../data/cities')
const axios = require('axios')

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API
// NOTE: env name kept as provided by you; despite the label, we use this for searchapi.io
const SEARCHAPI_KEY = process.env.OPEN_STREET_MAP_API

const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place'
const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.nextzen.org/api/interpreter',
  'https://overpass-api.de/api/interpreter'
]

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

/* ---------------------------- utils ---------------------------- */

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const retryApiCall = async (apiCall, maxRetries = 3, backoffMs = 1000) => {
  let lastErr
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastErr = error
      console.log(`⚠️ API call attempt ${attempt}/${maxRetries} failed: ${error.message}`)
      await sleep(backoffMs * attempt)
    }
  }
  throw lastErr
}

// Remove diacritics and normalize simple strings
const normalizeStr = (s = '') =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

// Haversine distance in meters
const distMeters = (a, b) => {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s1 = Math.sin(dLat / 2) ** 2
  const s2 = Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s1 + s2))
}

const similarNames = (a, b) => {
  const na = normalizeStr(a).replace(/[^a-z0-9 ]/g, '')
  const nb = normalizeStr(b).replace(/[^a-z0-9 ]/g, '')
  if (!na || !nb) return false
  if (na === nb) return true
  // loose containment helps match “Apoteka Montefarm 5” vs “Montefarm Apoteka”
  return na.includes(nb) || nb.includes(na)
}

/* ------------------------ Google Places ------------------------ */

// Pagination with quota handling
const getAllResults = async (url, params, maxPages = 3) => {
  let allResults = []
  let nextPageToken = null
  let pageCount = 0

  do {
    const currentParams = { ...params }
    if (nextPageToken) {
      currentParams.pagetoken = nextPageToken
      await sleep(3000) // next_page_token warm-up
    }

    let response
    try {
      response = await axios.get(url, { params: currentParams, timeout: 20000 })
    } catch (e) {
      console.error(`❌ Google page ${pageCount + 1} failed: ${e.message}`)
      break
    }

    const { status, results = [], next_page_token, error_message } = response.data || {}

    if (status === 'OVER_QUERY_LIMIT') {
      console.warn('⏳ Google OVER_QUERY_LIMIT. Backing off 10s.')
      await sleep(10000)
      continue
    }
    if (status === 'REQUEST_DENIED') {
      console.error(`🚫 Google REQUEST_DENIED: ${error_message || 'No error message'}`)
      break
    }
    if (status === 'INVALID_REQUEST') {
      console.warn('⚠️ Google INVALID_REQUEST. Waiting 2s and retrying this page once.')
      await sleep(2000)
      continue
    }
    if (status === 'ZERO_RESULTS') {
      console.log('📭 No results found')
      break
    }
    if (status !== 'OK') {
      console.warn(`⚠️ Google status: ${status || 'unknown'}`)
      break
    }

    allResults.push(...results)
    nextPageToken = next_page_token
    pageCount++
    console.log(`📄 Google page ${pageCount}: ${results.length} results (Total: ${allResults.length})`)
  } while (nextPageToken && pageCount < maxPages)

  return allResults
}

const isPharmacy = (place) => {
  if (!place || !place.name) return false

  const name = (place.name || '').toLowerCase()
  const types = (place.types || []).join(' ').toLowerCase()
  const vicinity = (place.vicinity || '').toLowerCase()
  const address = (place.formatted_address || '').toLowerCase()
  const allText = `${name} ${vicinity} ${types} ${address}`

  if (types.includes('pharmacy') || types.includes('drugstore')) return true

  const chains = [
    'montefarm','monte farm','monte-farm',
    'benu','benu apoteka',
    'zegin','žegin',
    'maksima','maxima','maksima pharm','maksima apoteka',
    'tea medica','teamedica','tea-medica',
    'unifarm','uni farm',
    'galenika','galenika apoteka',
    'hemofarm','hemo farm',
    'phoenix','feniks',
    'apotekarska ustanova','zdravlje apoteka',
    'farmamedica','farma medica'
  ]
  if (chains.some(c => allText.includes(c))) return true

  const coreKeywords = [
    'apoteka','apoteke','apoteku','apotekom',
    'ljekarna','ljekarne','ljekarnu','ljekarnom',
    'pharmacy','drogerija','drogerije'
  ]
  if (coreKeywords.some(k => allText.includes(k))) return true

  const exclude = ['veterinar','vet clinic','animal','restaurant','hotel','bank','school','škola','university']
  if (exclude.some(t => allText.includes(t))) {
    return coreKeywords.some(k => allText.includes(k))
  }
  return false
}

const calculateReliability = (details, place) => {
  let score = 50
  if (details?.formatted_phone_number) score += 15
  if (details?.website) score += 15
  if (details?.formatted_address && details.formatted_address.length > 10) score += 10
  if (details?.opening_hours?.weekday_text) score += 10
  if ((details?.rating || 0) >= 4.0) score += 10
  if ((details?.user_ratings_total || 0) >= 10) score += 5
  if (place?.place_id && place.place_id.length > 10) score += 10
  return Math.min(100, Math.max(0, score))
}

const processOpeningHours = (weekdayText) => {
  if (!weekdayText || weekdayText.length === 0) {
    return { is_24h: false, open_sunday: false, hours_monfri: 'N/A', hours_sat: 'N/A', hours_sun: 'N/A' }
  }
  let is24h = false
  let openSunday = false
  let monfri = 'N/A'
  let sat = 'N/A'
  let sun = 'N/A'

  for (const dayText of weekdayText) {
    const lower = dayText.toLowerCase()
    if (lower.includes('24 hours') || lower.includes('open 24 hours')) { is24h = true; break }
    if (lower.startsWith('sunday')) {
      const hours = dayText.split(': ')[1] || 'Closed'
      sun = hours
      openSunday = hours !== 'Closed' && !hours.toLowerCase().includes('closed')
    } else if (lower.startsWith('saturday')) {
      sat = dayText.split(': ')[1] || 'Closed'
    } else if (lower.startsWith('monday')) {
      monfri = dayText.split(': ')[1] || 'Closed'
    }
  }
  if (is24h) return { is_24h: true, open_sunday: true, hours_monfri: '24/7', hours_sat: '24/7', hours_sun: '24/7' }
  return { is_24h: false, open_sunday: openSunday, hours_monfri: monfri, hours_sat: sat, hours_sun: sun }
}

/* ---------------------- OpenStreetMap (OSM) --------------------- */

const fetchOSMPharmacies = async (citySlug) => {
  const coords = CITY_COORDINATES[citySlug]
  if (!coords) throw new Error(`City coordinates not found for: ${citySlug}`)
  const { lat, lng, radius } = coords

  // Overpass QL: nodes + ways with amenity=pharmacy within radius
  const query = `
    [out:json][timeout:60];
    (
      node["amenity"="pharmacy"](around:${Math.min(radius * 2.5, 50000)},${lat},${lng});
      way["amenity"="pharmacy"](around:${Math.min(radius * 2.5, 50000)},${lat},${lng});
      relation["amenity"="pharmacy"](around:${Math.min(radius * 2.5, 50000)},${lat},${lng});
    );
    out center tags;`

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await retryApiCall(
        () => axios.post(endpoint, query, { headers: { 'Content-Type': 'text/plain' }, timeout: 60000 }),
        2, 1500
      )
      const elements = res?.data?.elements || []
      const mapped = elements.map(el => {
        const tags = el.tags || {}
        const center = el.type === 'node' ? { lat: el.lat, lng: el.lon } : (el.center || {})
        const opening = tags.opening_hours ? [ `Monday: ${tags.opening_hours}` ] : [] // best effort
        const hoursData = processOpeningHours(opening)

        return {
          // match your schema
          name_me: tags.name || 'Apoteka',
          name_en: tags.name || 'Pharmacy',
          address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean).join(' ') || tags['addr:full'] || 'Address not available',
          lat: center.lat,
          lng: center.lng,
          phone: tags.phone || tags['contact:phone'] || null,
          website: tags.website || tags['contact:website'] || null,
          is_24h: hoursData.is_24h,
          open_sunday: hoursData.open_sunday,
          hours_monfri: hoursData.hours_monfri,
          hours_sat: hoursData.hours_sat,
          hours_sun: hoursData.hours_sun,
          google_place_id: null,
          google_rating: null,
          google_reviews_count: 0,
          reliability_score: Math.min(85, 40 + (tags.phone ? 10 : 0) + (tags.website ? 10 : 0) + (tags['addr:street'] ? 10 : 0))
        }
      })
      console.log(`🗺️ OSM fetched ${mapped.length} candidates`)
      return mapped
    } catch (e) {
      console.warn(`OSM endpoint failed ${endpoint}: ${e.message}`)
    }
  }
  console.warn('OSM fetch failed on all endpoints')
  return []
}

/* ----------------------- searchapi.io (SERP) -------------------- */
/**
 * We try to pull Google local pack/Maps via searchapi.io to catch stragglers.
 * API varies; we parse both "local_results" and "places_results" if present.
 */
const fetchSearchApiPharmacies = async (citySlug) => {
  if (!SEARCHAPI_KEY) return []
  const coords = CITY_COORDINATES[citySlug]
  const q = `pharmacy apoteka ${citySlug} Montenegro`

  const url = 'https://www.searchapi.io/api/v1/search'
  const params = {
    engine: 'google_local', // fallback to "google" below if needed
    q,
    location: `${citySlug}, Montenegro`,
    hl: 'en'
  }

  const altParams = { engine: 'google', q, hl: 'en' }

  const tryOnce = async (p) => {
    const res = await axios.get(url, {
      params: p,
      headers: { Authorization: `Bearer ${SEARCHAPI_KEY}` },
      timeout: 20000
    })
    return res.data || {}
  }

  let data = {}
  try {
    data = await tryOnce(params)
  } catch (e) {
    console.warn(`searchapi.io google_local failed: ${e.message}`)
    try {
      data = await tryOnce(altParams)
    } catch (e2) {
      console.warn(`searchapi.io google fallback failed: ${e2.message}`)
      return []
    }
  }

  const list = (data.local_results || data.places_results || data.organic_results || [])
  const mapped = list
    .filter(it => {
      const t = (it.title || it.name || '').toLowerCase()
      return t.includes('apoteka') || t.includes('pharmacy') || t.includes('ljekarn')
    })
    .map(it => {
      const lat = it.gps_coordinates?.latitude ?? it.latitude ?? null
      const lng = it.gps_coordinates?.longitude ?? it.longitude ?? null
      const hoursData = processOpeningHours(it.opening_hours?.weekday_text || [])
      return {
        name_me: it.title || it.name || 'Apoteka',
        name_en: it.title || it.name || 'Pharmacy',
        address: it.address || it.formatted_address || 'Address not available',
        lat,
        lng,
        phone: it.phone || it.formatted_phone_number || null,
        website: it.website || it.link || null,
        is_24h: hoursData.is_24h,
        open_sunday: hoursData.open_sunday,
        hours_monfri: hoursData.hours_monfri,
        hours_sat: hoursData.hours_sat,
        hours_sun: hoursData.hours_sun,
        google_place_id: it.place_id || null,
        google_rating: it.rating || null,
        google_reviews_count: it.user_ratings_total || it.reviews || 0,
        reliability_score: 55 + (it.phone ? 10 : 0) + (it.website ? 10 : 0) + (lat && lng ? 10 : 0)
      }
    })

  console.log(`🔎 searchapi.io mapped ${mapped.length} candidates`)
  return mapped
}

/* ------------------- Google aggregation (detailed) --------------- */

const fetchGooglePharmacies = async (citySlug) => {
  if (!GOOGLE_API_KEY) throw new Error('Google Maps API key not configured')

  const cityCoords = CITY_COORDINATES[citySlug]
  if (!cityCoords) throw new Error(`City coordinates not found for: ${citySlug}`)

  console.log(`📍 Google comprehensive search around ${cityCoords.lat},${cityCoords.lng}`)

  let allPlaces = []
  const ids = new Set()
  let searchCount = 0

  const radii = [
    cityCoords.radius * 0.3,
    cityCoords.radius * 0.6,
    cityCoords.radius,
    cityCoords.radius * 1.3,
    cityCoords.radius * 1.8,
    cityCoords.radius * 2.5,
    cityCoords.radius * 3.5
  ]

  for (const radius of radii) {
    const results = await getAllResults(`${PLACES_API_BASE_URL}/nearbysearch/json`, {
      location: `${cityCoords.lat},${cityCoords.lng}`,
      radius: Math.min(radius, 50000),
      type: 'pharmacy',
      key: GOOGLE_API_KEY
    }, 3)

    searchCount++
    for (const place of results) {
      if (!ids.has(place.place_id) && isPharmacy(place)) {
        allPlaces.push(place); ids.add(place.place_id)
      }
    }
    await sleep(800)
  }

  const gridOffsets = [
    { lat: 0, lng: 0 },
    { lat: 0.01, lng: 0 }, { lat: -0.01, lng: 0 },
    { lat: 0, lng: 0.015 }, { lat: 0, lng: -0.015 },
    { lat: 0.007, lng: 0.01 }, { lat: -0.007, lng: 0.01 },
    { lat: 0.007, lng: -0.01 }, { lat: -0.007, lng: -0.01 }
  ]
  for (const offset of gridOffsets) {
    const searchLat = cityCoords.lat + offset.lat
    const searchLng = cityCoords.lng + offset.lng
    const results = await getAllResults(`${PLACES_API_BASE_URL}/nearbysearch/json`, {
      location: `${searchLat},${searchLng}`,
      radius: cityCoords.radius,
      type: 'pharmacy',
      key: GOOGLE_API_KEY
    }, 2)

    searchCount++
    for (const place of results) {
      if (!ids.has(place.place_id) && isPharmacy(place)) {
        allPlaces.push(place); ids.add(place.place_id)
      }
    }
    await sleep(600)
  }

  const keywords = [
    'apoteka','ljekarna','farmacija','pharmacy','drogerija',
    'montefarm','benu','zegin','maksima','maxima','tea medica',
    'unifarm','galenika','hemofarm','phoenix','feniks'
  ]
  for (const keyword of keywords) {
    const results = await getAllResults(`${PLACES_API_BASE_URL}/nearbysearch/json`, {
      location: `${cityCoords.lat},${cityCoords.lng}`,
      radius: Math.min(cityCoords.radius * 2, 50000),
      keyword,
      key: GOOGLE_API_KEY
    }, 2)

    searchCount++
    for (const place of results) {
      if (!ids.has(place.place_id) && isPharmacy(place)) {
        allPlaces.push(place); ids.add(place.place_id)
      }
    }
    await sleep(500)
  }

  const textQueries = [
    `apoteka ${citySlug}`,
    `ljekarna ${citySlug}`,
    `pharmacy ${citySlug}`,
    `farmacija ${citySlug}`,
    `${citySlug} apoteka montenegro`,
    `${citySlug} pharmacy montenegro`,
    `${citySlug} ljekarna crna gora`,
    `montefarm ${citySlug}`,
    `benu ${citySlug}`,
    `zegin ${citySlug}`,
    `maksima ${citySlug}`
  ]
  for (const query of textQueries) {
    const results = await getAllResults(`${PLACES_API_BASE_URL}/textsearch/json`, {
      query,
      key: GOOGLE_API_KEY
    }, 2)

    searchCount++
    for (const place of results) {
      if (!ids.has(place.place_id) && isPharmacy(place)) {
        allPlaces.push(place); ids.add(place.place_id)
      }
    }
    await sleep(600)
  }

  // details expansion
  const pharmacyData = []
  for (let i = 0; i < allPlaces.length; i++) {
    const place = allPlaces[i]
    try {
      const detailsUrl = `${PLACES_API_BASE_URL}/details/json`
      const detailsParams = {
        place_id: place.place_id,
        fields: 'name,formatted_address,geometry,formatted_phone_number,website,opening_hours,business_status,rating,user_ratings_total',
        key: GOOGLE_API_KEY
      }
      const detailsResponse = await retryApiCall(
        () => axios.get(detailsUrl, { params: detailsParams, timeout: 15000 }),
        3, 1000
      )

      if (detailsResponse.data.status !== 'OK') {
        console.warn(`⚠️ Details not OK for ${place.name}: ${detailsResponse.data.status}`)
        continue
      }
      const details = detailsResponse.data.result
      if (details.business_status === 'CLOSED_PERMANENTLY') continue

      const openingHours = details.opening_hours?.weekday_text || []
      const hoursData = processOpeningHours(openingHours)

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

      if (pharmacy.lat && pharmacy.lng && pharmacy.name_me && pharmacy.name_me.length > 2) {
        pharmacyData.push(pharmacy)
      }
      await sleep(180)
    } catch (e) {
      console.error(`❌ Google details failed for ${place.name}: ${e.message}`)
    }
  }

  const stats = {
    google_raw_places: allPlaces.length,
    google_processed: pharmacyData.length,
    google_search_ops: searchCount
  }
  return { pharmacyData, stats }
}

/* -------------------------- Deduplication ----------------------- */

const dedupeMerge = (lists, cityCenter) => {
  const merged = []
  const byId = new Map() // google_place_id
  const used = []

  const push = (p) => {
    // keep values within schema types
    const safe = {
      name_me: p.name_me || p.name_en || 'Apoteka',
      name_en: p.name_en || p.name_me || 'Pharmacy',
      address: p.address || 'Address not available',
      lat: Number(p.lat),
      lng: Number(p.lng),
      phone: p.phone || null,
      website: p.website && String(p.website).trim() ? p.website : null,
      is_24h: !!p.is_24h,
      open_sunday: !!p.open_sunday,
      hours_monfri: p.hours_monfri || 'N/A',
      hours_sat: p.hours_sat || 'N/A',
      hours_sun: p.hours_sun || 'N/A',
      google_place_id: p.google_place_id || null,
      google_rating: p.google_rating != null ? Number(p.google_rating) : null,
      google_reviews_count: p.google_reviews_count != null ? Number(p.google_reviews_count) : 0,
      reliability_score: Math.min(100, Math.max(0, Math.round(p.reliability_score || 50)))
    }
    merged.push(safe)
    used.push(safe)
    if (safe.google_place_id) byId.set(safe.google_place_id, safe)
  }

  // priority order: Google -> OSM -> searchapi
  const [google, osm, serp] = lists

  // seed with Google
  for (const g of google) push(g)

  const nearDup = (a, b) => {
    if (!a.lat || !a.lng || !b.lat || !b.lng) return false
    const d = distMeters({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng })
    if (d <= 120) return true
    if (d <= 220 && similarNames(a.name_me || a.name_en, b.name_me || b.name_en)) return true
    return false
  }

  const findExisting = (p) => {
    if (p.google_place_id && byId.has(p.google_place_id)) return byId.get(p.google_place_id)
    // fallback: nearest with similar name
    for (const e of used) {
      if (nearDup(e, p)) return e
    }
    return null
  }

  const absorb = (candidate) => {
    const ex = findExisting(candidate)
    if (!ex) { push(candidate); return }
    // merge missing fields only
    if (!ex.phone && candidate.phone) ex.phone = candidate.phone
    if (!ex.website && candidate.website) ex.website = candidate.website
    if (!ex.hours_monfri || ex.hours_monfri === 'N/A') ex.hours_monfri = candidate.hours_monfri || ex.hours_monfri
    if (!ex.hours_sat || ex.hours_sat === 'N/A') ex.hours_sat = candidate.hours_sat || ex.hours_sat
    if (!ex.hours_sun || ex.hours_sun === 'N/A') ex.hours_sun = candidate.hours_sun || ex.hours_sun
    if (!ex.address || ex.address === 'Address not available') ex.address = candidate.address || ex.address
    if (candidate.reliability_score > ex.reliability_score) ex.reliability_score = candidate.reliability_score
  }

  for (const o of osm) absorb(o)
  for (const s of serp) absorb(s)

  // optional: sort by distance to city center then by name
  merged.sort((a, b) => {
    const da = distMeters({ lat: a.lat, lng: a.lng }, cityCenter)
    const db = distMeters({ lat: b.lat, lng: b.lng }, cityCenter)
    if (da !== db) return da - db
    return (a.name_me || '').localeCompare(b.name_me || '')
  })

  return merged
}

/* ---------------------- Unified data fetcher -------------------- */

const fetchOnlinePharmacyData = async (citySlug) => {
  try {
    console.log(`🚀 COMPREHENSIVE: Starting exhaustive pharmacy search for ${citySlug}`)

    const coords = CITY_COORDINATES[citySlug]
    if (!coords) throw new Error(`City coordinates not found for: ${citySlug}`)

    const t0 = Date.now()
    const [googleRes, osmRes, serpRes] = await Promise.allSettled([
      fetchGooglePharmacies(citySlug),
      fetchOSMPharmacies(citySlug),
      fetchSearchApiPharmacies(citySlug)
    ])

    const googleList = googleRes.status === 'fulfilled' ? googleRes.value.pharmacyData : []
    const googleStats = googleRes.status === 'fulfilled' ? googleRes.value.stats : { google_raw_places: 0, google_processed: 0, google_search_ops: 0 }
    const osmList = osmRes.status === 'fulfilled' ? osmRes.value : []
    const serpList = serpRes.status === 'fulfilled' ? serpRes.value : []

    const merged = dedupeMerge([googleList, osmList, serpList], { lat: coords.lat, lng: coords.lng })

    const stats = {
      totalFound: merged.length,
      google_raw_places: googleStats.google_raw_places,
      google_processed: googleStats.google_processed,
      google_search_ops: googleStats.google_search_ops,
      osm_candidates: osmList.length,
      serp_candidates: serpList.length,
      sources_used: {
        google: googleList.length,
        osm: osmList.length,
        searchapi: serpList.length
      },
      processingTimeSeconds: Math.round((Date.now() - t0) / 1000),
      avgReliability: merged.length ? Math.round(merged.reduce((s, p) => s + (p.reliability_score || 0), 0) / merged.length) : 0,
      highQuality: merged.filter(p => (p.reliability_score || 0) >= 80).length,
      mediumQuality: merged.filter(p => (p.reliability_score || 0) >= 60 && (p.reliability_score || 0) < 80).length,
      lowQuality: merged.filter(p => (p.reliability_score || 0) < 60).length
    }

    merged._searchStats = stats
    console.log(`🎯 Unified search -> ${merged.length} unique pharmacies`)
    return merged
  } catch (e) {
    console.error(`❌ CRITICAL ERROR in fetchOnlinePharmacyData for ${citySlug}: ${e.message}`)
    throw e
  }
}

/* ------------------------- Sync pipeline ------------------------ */

const generateRecommendations = (created, updated, errors, onlineCount) => {
  const r = []
  if (created === 0 && updated === 0) r.push('No pharmacies found - check API keys, billing, and city coordinates')
  if (created > 0) r.push(`Added ${created} new pharmacies`)
  if (errors > 0) r.push(`${errors} records failed to persist - inspect logs`)
  if (onlineCount > 0 && (created + updated) < onlineCount) r.push('Some items not saved - validate schema mapping and constraints')
  if (!r.length) r.push('Sync completed successfully')
  return r
}

const syncCityPharmacyData = async (req, res) => {
  const syncStartTime = Date.now()
  let searchStats = null

  try {
    const { citySlug } = req.body
    if (!citySlug) return res.status(400).json(createErrorResponse('City slug is required'))

    const staticCity = getCityBySlug(citySlug)
    if (!staticCity) return res.status(404).json(createErrorResponse(`City not found: ${citySlug}`))

    let city = await City.findOne({ where: { slug: citySlug } })
    if (!city) {
      city = await City.create({ slug: staticCity.slug, name_me: staticCity.name_me, name_en: staticCity.name_en })
    }

    const existingCount = await Pharmacy.count({ where: { city_id: city.id, active: true } })

    let onlinePharmacies
    try {
      onlinePharmacies = await fetchOnlinePharmacyData(citySlug)
      if (onlinePharmacies._searchStats) {
        searchStats = onlinePharmacies._searchStats
        searchStats.processingTimeSeconds = Math.round((Date.now() - syncStartTime) / 1000)
        delete onlinePharmacies._searchStats
      }
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
        `Failed to fetch online data for ${citySlug}: ${error.message}`,
        { citySlug, cityName: staticCity.name_en }
      ))
    }

    const onlineCount = onlinePharmacies.length
    if (onlineCount === 0) {
      return res.json(createResponse({
        citySlug,
        cityName: staticCity.name_en,
        success: true,
        warning: 'No online pharmacy data found',
        processed: 0, created: 0, updated: 0, errors: 0,
        existingCount, onlineCount: 0, searchStats: searchStats || {},
        message: `No online pharmacies found for ${staticCity.name_en}`,
        recommendations: [
          'Enable Places API, Places Details, and Maps SDK on your Google project with billing',
          'Verify API referrer/IP restrictions',
          'Validate city coordinates and increase search radius'
        ]
      }, `No online pharmacies found for ${staticCity.name_en}`))
    }

    let created = 0, updated = 0, errors = 0
    const processedPharmacies = []

    for (let i = 0; i < onlinePharmacies.length; i++) {
      const p = onlinePharmacies[i]
      try {
        const pharmacyData = {
          ...p,
          city_id: city.id,
          website: p.website && String(p.website).trim() ? p.website : null,
          active: true,
          last_online_sync: new Date()
        }

        let existingPharmacy = null
        if (pharmacyData.google_place_id) {
          existingPharmacy = await Pharmacy.findOne({ where: { google_place_id: pharmacyData.google_place_id } })
        }
        if (!existingPharmacy) {
          existingPharmacy = await Pharmacy.findOne({
            where: { city_id: city.id, name_me: pharmacyData.name_me }
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
        }
      } catch (e) {
        errors++
        console.error(`❌ Persist failed for ${p.name_me}: ${e.message}`)
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

      processed: totalProcessed, created, updated, errors,

      coverage: {
        before: existingCount,
        after: finalCount,
        improvement: existingCount > 0 ? Math.round(((finalCount - existingCount) / existingCount) * 100) + '%' : 'New data',
        onlineDiscovered: onlineCount,
        successfullyProcessed: totalProcessed,
        processingSuccess: Math.round((totalProcessed / onlineCount) * 100) + '%',
        duplicatesDetected: 0,
        errorRate: Math.round((errors / onlineCount) * 100) + '%'
      },

      quality: {
        highQuality: processedPharmacies.filter(p => (p.reliability || 0) >= 80).length,
        mediumQuality: processedPharmacies.filter(p => (p.reliability || 0) >= 60 && (p.reliability || 0) < 80).length,
        requiresReview: processedPharmacies.filter(p => (p.reliability || 0) < 70).length,
        withGoogleId: processedPharmacies.filter(p => p.google_place_id).length,
        avgReliability: processedPharmacies.length > 0 ?
          Math.round(processedPharmacies.reduce((sum, p) => sum + (p.reliability || 0), 0) / processedPharmacies.length) : 0
      },

      pharmacies: processedPharmacies,
      searchStats: searchStats || {},
      message: `Successfully synced ${totalProcessed} pharmacies for ${staticCity.name_en}`,
      recommendations: generateRecommendations(created, updated, errors, onlineCount)
    }

    return res.json(createResponse(result, result.message))
  } catch (error) {
    const syncDuration = Math.round((Date.now() - syncStartTime) / 1000)
    return res.status(500).json(createErrorResponse(
      'Pharmacy sync failed',
      { error: error.message, citySlug: req.body.citySlug, syncDuration, timestamp: new Date().toISOString() }
    ))
  }
}

/* --------------------------- status APIs ------------------------ */

const getSyncableCities = async (_req, res) => {
  try {
    const cities = getAllCities()
    res.json(createResponse(cities, 'Syncable cities retrieved successfully'))
  } catch (error) {
    console.error('Error fetching syncable cities:', error)
    res.status(500).json(createErrorResponse('Failed to fetch cities', error.message))
  }
}

const getSyncStatus = async (_req, res) => {
  try {
    const cities = await City.findAll({
      include: [{ model: Pharmacy, as: 'pharmacies', where: { active: true }, required: false }]
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
