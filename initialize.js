'use strict'

/**
 * ENHANCED PHARMACY DATABASE INITIALIZATION
 *
 * This script performs a comprehensive one-time initialization of the pharmacy database
 * using improved multi-source data collection with Place Details API integration.
 *
 * Features:
 * - Fetches from all sources (OSM, Google Places with Details, FSQ, HERE, TomTom, FZO, Montefarm, BENU)
 * - Comprehensive deduplication (ID-based, geo-based, fuzzy name matching)
 * - Quality scoring for all pharmacies
 * - Detailed logging with metrics
 * - JSON export of all collected data
 * - Processing statistics and analytics
 *
 * Exports:
 * - logs/pharmacy-init-{timestamp}.log - Detailed text log
 * - logs/pharmacy-init-{timestamp}.json - Complete JSON data dump
 * - logs/pharmacy-stats-{timestamp}.json - Statistics and metrics
 */

const { sequelize } = require('./db/models')
const { Pharmacy, City } = require('./db/models')
const { getAllCities, getCityBySlug } = require('./data/cities')
const fs = require('fs')
const path = require('path')

// Import functions from onlineDataController
const pdf = require('pdf-parse')
const cheerio = require('cheerio')
const h3 = require('h3-js')
const { Op } = require('sequelize')

// ----------------- CONFIG -----------------
const UA = 'pharmacy-harvester-init/1.0'
const COUNTRY_ISO = 'ME'

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API || process.env.GOOGLE_API_KEY || ''
const FSQ_API_KEY    = process.env.FSQ_API_KEY || ''
const HERE_API_KEY   = process.env.HERE_API_KEY || ''
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY || ''

const FETCH_TIMEOUT_MS      = parseInt(process.env.FETCH_TIMEOUT_MS || '25000', 10)
const OVERPASS_TIMEOUT_MS   = parseInt(process.env.OVERPASS_TIMEOUT_MS || '45000', 10)
const H3_RES                = parseInt(process.env.H3_RES || '6', 10)
const GOOGLE_RADIUS_M       = parseInt(process.env.GOOGLE_RADIUS_M || '3000', 10) // Larger radius for init
const EXPANSION_RADIUS_M    = parseInt(process.env.EXPANSION_RADIUS_M || '1000', 10)
const MAX_EXPANSION_SEEDS   = parseInt(process.env.MAX_EXPANSION_SEEDS || '500', 10) // More seeds for init
const CONCURRENCY           = parseInt(process.env.CONCURRENCY || '8', 10) // Higher concurrency
const RETRIES               = parseInt(process.env.RETRIES || '3', 10)
const GOOGLE_PAGE_DELAY_MS  = parseInt(process.env.GOOGLE_PAGE_DELAY_MS || '2500', 10)
const GOOGLE_OQL_SLEEP_MS   = parseInt(process.env.GOOGLE_OQL_SLEEP_MS || '7000', 10)

// No time limit for initialization - process all cities thoroughly
const INIT_TIMEOUT = 60 * 60 * 1000 // 60 minutes max

const OVERPASS_POOL = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter'
]

const FZO_URL        = 'https://fzocg.me/wp-content/uploads/2023/11/Spisak-apoteka-za-sajt.pdf'
const MONTEFARM_URL  = 'https://montefarm.co.me/en/apoteke/'
const BENU_ME_URL    = 'https://www.benu.me/apoteke'

const MUNICIPALITIES = ['Andrijevica','Bar','Berane','Bijelo Polje','Budva','Cetinje','Danilovgrad','Gusinje','Herceg Novi','Kolašin','Kotor','Mojkovac','Nikšić','Petnjica','Plav','Pljevlja','Plužine','Podgorica','Rožaje','Šavnik','Tivat','Tuzi','Ulcinj','Žabljak','Zeta']
const CITY_RE = new RegExp(`\\b(${MUNICIPALITIES.map(x=>x.replace(/[-/\\.^$*+?()[\]{}]/g,'\\$&')).join('|')})\\b`,'i')

const KW_CORE = ['apoteka','апотека','pharmacy','chemist','ljekarna','barnatore']
const KW_QUAL = ['dežurna apoteka','24h apoteka','non stop apoteka','hitna apoteka','24/7 pharmacy','apteka']
const KW_CHAINS = ['Montefarm','BENU','Galenika']
const LANGS = ['sr','hr','en','sq','it','de','bs','me','fr','es']

const CITY_COORDINATES = {
  'podgorica': { lat: 42.4304, lng: 19.2594, radius: 18000 },
  'niksic': { lat: 42.7731, lng: 18.9447, radius: 12000 },
  'herceg-novi': { lat: 42.4519, lng: 18.5375, radius: 10000 },
  'berane': { lat: 42.8469, lng: 19.8658, radius: 10000 },
  'bar': { lat: 42.0947, lng: 19.0904, radius: 10000 },
  'bijelo-polje': { lat: 43.0356, lng: 19.7475, radius: 10000 },
  'cetinje': { lat: 42.3911, lng: 18.9238, radius: 10000 },
  'pljevlja': { lat: 43.3575, lng: 19.3581, radius: 10000 },
  'kotor': { lat: 42.4247, lng: 18.7712, radius: 8000 },
  'tivat': { lat: 42.4370, lng: 18.6936, radius: 8000 },
  'budva': { lat: 42.2864, lng: 18.8400, radius: 8000 },
  'ulcinj': { lat: 41.9297, lng: 19.2047, radius: 8000 },
  'kolasin': { lat: 42.8222, lng: 19.5217, radius: 8000 },
  'mojkovac': { lat: 42.9603, lng: 19.5839, radius: 8000 },
  'rozaje': { lat: 42.8411, lng: 20.1664, radius: 8000 },
  'plav': { lat: 42.5950, lng: 19.9447, radius: 7000 },
  'zabljak': { lat: 43.1544, lng: 19.1239, radius: 7000 },
  'andrijevica': { lat: 42.7356, lng: 19.7939, radius: 7000 },
  'danilovgrad': { lat: 42.5508, lng: 19.1036, radius: 8000 },
  'golubovci': { lat: 42.3453, lng: 19.2869, radius: 7000 },
  'tuzi': { lat: 42.3661, lng: 19.3239, radius: 7000 },
  'petnjica': { lat: 42.9492, lng: 19.9061, radius: 6000 },
  'gusinje': { lat: 42.5531, lng: 19.8319, radius: 6000 },
  'pluzine': { lat: 43.1544, lng: 18.8447, radius: 6000 },
  'savnik': { lat: 43.0169, lng: 19.0961, radius: 6000 }
}
const CITY_ALIASES = { zeta: 'golubovci' }

// ----------------- LOGGING & REPORTING -----------------
let logStream = null
let logFilePath = null
let jsonOutputPath = null
let statsOutputPath = null
const collectedData = {
  metadata: {
    startTime: null,
    endTime: null,
    durationSeconds: null,
    version: '2.0-enhanced',
    config: {}
  },
  sources: {
    osm: [],
    google: [],
    fsq: [],
    here: [],
    tomtom: [],
    fzo: [],
    montefarm: [],
    benu: []
  },
  deduplication: {
    beforeCount: 0,
    afterCount: 0,
    duplicatesRemoved: 0,
    mergeLog: []
  },
  qualityAnalysis: {
    highQuality: [],
    mediumQuality: [],
    lowQuality: []
  },
  cities: [],
  finalDatabase: []
}

const statistics = {
  totalPharmaciesFound: 0,
  totalPharmaciesSaved: 0,
  totalErrors: 0,
  sourceStats: {},
  cityStats: [],
  apiCallStats: {
    google_nearby: 0,
    google_text: 0,
    google_details: 0,
    osm_overpass: 0,
    fsq: 0,
    here: 0,
    tomtom: 0,
    fzo: 0,
    montefarm: 0,
    benu: 0
  },
  deduplicationStats: {
    byPlaceId: 0,
    byOsmId: 0,
    byGeokey: 0,
    byFuzzyName: 0
  },
  qualityDistribution: {
    score_90_100: 0,
    score_80_89: 0,
    score_70_79: 0,
    score_60_69: 0,
    score_50_59: 0,
    score_below_50: 0
  },
  completenessStats: {
    withPhone: 0,
    withWebsite: 0,
    withOpeningHours: 0,
    withRating: 0,
    withAllDetails: 0
  }
}

function initializeLogging() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const logDir = path.join(__dirname, 'logs')

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  logFilePath = path.join(logDir, `pharmacy-init-${timestamp}.log`)
  jsonOutputPath = path.join(logDir, `pharmacy-init-${timestamp}.json`)
  statsOutputPath = path.join(logDir, `pharmacy-stats-${timestamp}.json`)

  logStream = fs.createWriteStream(logFilePath, { flags: 'w' })

  collectedData.metadata.startTime = new Date().toISOString()
  collectedData.metadata.config = {
    GOOGLE_API_KEY: GOOGLE_API_KEY ? 'SET' : 'NOT_SET',
    FSQ_API_KEY: FSQ_API_KEY ? 'SET' : 'NOT_SET',
    HERE_API_KEY: HERE_API_KEY ? 'SET' : 'NOT_SET',
    TOMTOM_API_KEY: TOMTOM_API_KEY ? 'SET' : 'NOT_SET',
    GOOGLE_RADIUS_M,
    EXPANSION_RADIUS_M,
    MAX_EXPANSION_SEEDS,
    CONCURRENCY,
    H3_RES
  }

  log('='.repeat(100))
  log('ENHANCED PHARMACY DATABASE INITIALIZATION')
  log('='.repeat(100))
  log(`Started: ${collectedData.metadata.startTime}`)
  log(`Process ID: ${process.pid}`)
  log(`Node Version: ${process.version}`)
  log(`Working Directory: ${__dirname}`)
  log(`Log File: ${logFilePath}`)
  log(`JSON Output: ${jsonOutputPath}`)
  log(`Stats Output: ${statsOutputPath}`)
  log('='.repeat(100))
  log('')
}

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString()
  const logLine = `[${timestamp}] [${level}] ${message}`

  console.log(message)

  if (logStream) {
    logStream.write(logLine + '\n')
  }
}

function saveJsonOutput() {
  log('')
  log('💾 Saving JSON data dump...')

  collectedData.metadata.endTime = new Date().toISOString()
  const start = new Date(collectedData.metadata.startTime).getTime()
  const end = new Date(collectedData.metadata.endTime).getTime()
  collectedData.metadata.durationSeconds = Math.round((end - start) / 1000)

  fs.writeFileSync(jsonOutputPath, JSON.stringify(collectedData, null, 2))
  log(`✅ JSON data saved to: ${jsonOutputPath}`)
  log(`   File size: ${(fs.statSync(jsonOutputPath).size / 1024).toFixed(2)} KB`)

  fs.writeFileSync(statsOutputPath, JSON.stringify(statistics, null, 2))
  log(`✅ Statistics saved to: ${statsOutputPath}`)
  log(`   File size: ${(fs.statSync(statsOutputPath).size / 1024).toFixed(2)} KB`)
}

function closeLogging() {
  log('')
  log('='.repeat(100))
  log('INITIALIZATION COMPLETED')
  log(`Total Duration: ${collectedData.metadata.durationSeconds || 0} seconds`)
  log(`Log file: ${logFilePath}`)
  log(`JSON data: ${jsonOutputPath}`)
  log(`Statistics: ${statsOutputPath}`)
  log('='.repeat(100))

  if (logStream) {
    logStream.end()
    logStream = null
  }
}

// ----------------- UTILS -----------------
const SLEEP = ms => new Promise(r => setTimeout(r, ms))
const withTimeout = (p, ms, tag='timeout') => Promise.race([p, new Promise((_,rej)=>setTimeout(()=>rej(new Error(tag)), ms))])
const clamp = s => String(s||'').replace(/\s+/g,' ').trim()
const norm = s => String(s||'').toLowerCase()
  .replace(/[àáâãäåăą]/g,'a').replace(/[çćč]/g,'c').replace(/[đð]/g,'d')
  .replace(/[èéêëę]/g,'e').replace(/[ìíîï]/g,'i').replace(/[ñń]/g,'n')
  .replace(/[òóôõöő]/g,'o').replace(/[š]/g,'s').replace(/[ùúûüű]/g,'u')
  .replace(/[ýÿ]/g,'y').replace(/[ž]/g,'z').replace(/[^a-z0-9 ]+/g,' ')
  .replace(/\s+/g,' ').trim()
const geokey = (lat,lng) => (typeof lat==='number' && typeof lng==='number') ? `${lat.toFixed(5)},${lng.toFixed(5)}` : null

let fetchFn = global.fetch
if (!fetchFn) fetchFn = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
const fetch = (...args) => fetchFn(...args)

async function pool(items, fn, concurrency=CONCURRENCY){
  const ret=[]; let i=0; const running=[]
  const run = async (idx) => {
    const r = fn(items[idx]).then(v => {ret[idx]=v}).catch(()=>{ret[idx]=null})
    running.push(r)
    await r
    running.splice(running.indexOf(r),1)
  }
  while (i<items.length){
    while (running.length<concurrency && i<items.length) { run(i++) }
    await Promise.race(running).catch(()=>{})
  }
  await Promise.allSettled(running)
  return ret
}

async function retry(fn, retries=RETRIES, delay=500){
  let last
  for (let a=0;a<=retries;a++){
    try { return await fn() } catch(e){ last=e; if (a<retries) await SLEEP(delay*(a+1)) }
  }
  throw last
}

function sim(a,b){
  a=norm(a||''); b=norm(b||''); if(!a||!b) return 0
  const maxLen=Math.max(a.length,b.length)
  let matches=0
  const usedB=new Array(b.length).fill(false)
  for(let i=0;i<a.length;i++){
    const ch=a[i]; const window=1
    for(let j=Math.max(0,i-window); j<Math.min(b.length,i+window+1); j++){
      if(!usedB[j] && b[j]===ch){ usedB[j]=true; matches++; break }
    }
  }
  return matches/maxLen
}

function bboxToH3(b, res = H3_RES) {
  const poly = [[[b.minlat,b.minlon],[b.minlat,b.maxlon],[b.maxlat,b.maxlon],[b.maxlat,b.minlon],[b.minlat,b.minlon]]]
  const cells = typeof h3.polygonToCells === 'function' ? h3.polygonToCells(poly, res) : h3.polyfill(poly, res, false)
  return cells.map(c => { const [lat, lon] = h3.cellToLatLng(c); return { lat, lon } })
}

// ----------------- OSM -----------------
async function postOverpassOnce(endpoint, q) {
  const res = await withTimeout(fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8', 'User-Agent': UA },
    body: 'data=' + encodeURIComponent(q),
  }), OVERPASS_TIMEOUT_MS, 'overpass-timeout')
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`)
  const json = await res.json()
  if (!json || typeof json !== 'object') throw new Error('Overpass bad json')
  return json
}
async function postOverpass(q) {
  let lastErr = null
  for (const ep of OVERPASS_POOL) {
    try { return await postOverpassOnce(ep, q) }
    catch (e) { lastErr = e }
  }
  throw lastErr || new Error('Overpass all endpoints failed')
}
async function getBBoxME() {
  const q = `[out:json][timeout:120];rel["ISO3166-1"="${COUNTRY_ISO}"]["admin_level"="2"];out ids bb;`
  try {
    const d = await postOverpass(q)
    const b = d?.elements?.[0]?.bounds
    if (b) return { minlat:b.minlat,minlon:b.minlon,maxlat:b.maxlat,maxlon:b.maxlon }
  } catch(_e){}
  return { minlat:41.85, minlon:18.40, maxlat:43.60, maxlon:20.35 }
}
async function fetchOSMPharmacies() {
  statistics.apiCallStats.osm_overpass++
  log('🗺️  [OSM] Fetching country-wide pharmacy data from OpenStreetMap...')

  const q = `
[out:json][timeout:240];
area["ISO3166-1"="${COUNTRY_ISO}"]->.a;
(
  node["amenity"="pharmacy"](area.a);
  way["amenity"="pharmacy"](area.a);
  relation["amenity"="pharmacy"](area.a);
  node["healthcare"="pharmacy"](area.a);
  way["healthcare"="pharmacy"](area.a);
  relation["healthcare"="pharmacy"](area.a);
  node["shop"="chemist"](area.a);
  way["shop"="chemist"](area.a);
);
out tags center;`
  try {
    const d = await postOverpass(q)
    const arr = Array.isArray(d?.elements) ? d.elements : []
    const results = arr.flatMap(el=>{
      const isNode = el.type==='node'
      const lat = isNode?el.lat:el.center?.lat
      const lon = isNode?el.lon:el.center?.lon
      if (lat==null || lon==null) return []
      const t = el.tags || {}
      return [pharmacyItem({
        source_type:'OSM',
        name_me: t.name || null,
        address: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ') || null,
        city_name: t['addr:city'] || null,
        lat, lon,
        phone: t.phone || null,
        website: t.website || null,
        opening_hours: t.opening_hours || null,
        osm_type: el.type, osm_id: el.id, coord_source:'OSM'
      })]
    })

    collectedData.sources.osm = results
    log(`✅ [OSM] Found ${results.length} pharmacies`)
    return results
  } catch(e){
    log(`❌ [OSM] Error: ${e.message}`, 'ERROR')
    return []
  }
}

// ----------------- Provider: Google with Place Details -----------------
async function gFetch(url) {
  try {
    const r = await withTimeout(fetch(url, { headers:{'User-Agent':UA}}), FETCH_TIMEOUT_MS, 'google-timeout')
    const j = await r.json().catch(()=>({}))
    return { ok:true, j }
  } catch(_e){ return { ok:false, j:{} } }
}

async function googlePlaceDetails(placeId) {
  if (!GOOGLE_API_KEY || !placeId) return null
  statistics.apiCallStats.google_details++

  const fields = 'place_id,name,formatted_address,geometry,formatted_phone_number,international_phone_number,website,opening_hours,rating,user_ratings_total,business_status,types'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}&language=sr`
  const { ok, j } = await gFetch(url)
  if (!ok || j?.status !== 'OK') return null
  return j.result
}

function fromPlaces(r, hasDetails = false){
  const loc = r.geometry?.location || {}
  let phone = null
  if (r.international_phone_number) {
    phone = r.international_phone_number
  } else if (r.formatted_phone_number) {
    phone = r.formatted_phone_number
  }
  let opening_hours = null
  if (r.opening_hours?.weekday_text) {
    opening_hours = r.opening_hours.weekday_text.join('; ')
  }

  return pharmacyItem({
    source_type: 'GOOGLE',
    place_id: r.place_id,
    name_me: r.name || null,
    address: r.formatted_address || r.vicinity || null,
    lat: typeof loc.lat==='number' ? loc.lat : null,
    lon: typeof loc.lng==='number' ? loc.lng : null,
    phone: phone,
    website: r.website || null,
    opening_hours: opening_hours,
    google_rating: r.rating || null,
    coord_source: 'GOOGLE'
  })
}

async function googleNearby(lat, lng, { kw=null, lang='sr', radius=GOOGLE_RADIUS_M, fetchDetails=true } = {}){
  if (!GOOGLE_API_KEY) return []
  statistics.apiCallStats.google_nearby++

  const base = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${GOOGLE_API_KEY}&location=${lat},${lng}&radius=${radius}${kw?`&keyword=${encodeURIComponent(kw)}`:''}&language=${lang}${kw?'':'&type=pharmacy'}`
  const out=[]; const seen=new Set(); let token=null; let page=0
  do{
    const url = token ? `${base}&pagetoken=${token}` : base
    if (token) await SLEEP(GOOGLE_PAGE_DELAY_MS)
    const { j } = await gFetch(url)
    if (j?.status==='OVER_QUERY_LIMIT'){ await SLEEP(GOOGLE_OQL_SLEEP_MS); continue }
    if (!['OK','ZERO_RESULTS','INVALID_REQUEST'].includes(j?.status)) break
    for (const r of (j?.results||[])){
      if (!r.place_id || seen.has(r.place_id)) continue
      seen.add(r.place_id)
      if (fetchDetails) {
        await SLEEP(100)
        const details = await googlePlaceDetails(r.place_id)
        if (details) {
          out.push(fromPlaces(details, true))
        } else {
          out.push(fromPlaces(r, false))
        }
      } else {
        out.push(fromPlaces(r, false))
      }
    }
    token = j?.next_page_token || null; page++
  } while(token && page<3)
  return out
}

async function googleText(q, lang='sr', fetchDetails=true){
  if (!GOOGLE_API_KEY) return []
  statistics.apiCallStats.google_text++

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${GOOGLE_API_KEY}&query=${encodeURIComponent(q)}&region=me&language=${lang}`
  const { j } = await gFetch(url)
  if (!['OK','ZERO_RESULTS'].includes(j?.status)) return []

  const results = j.results || []
  const out = []
  for (const r of results) {
    if (!r.place_id) continue
    if (fetchDetails) {
      await SLEEP(100)
      const details = await googlePlaceDetails(r.place_id)
      if (details) {
        out.push(fromPlaces(details, true))
      } else {
        out.push(fromPlaces(r, false))
      }
    } else {
      out.push(fromPlaces(r, false))
    }
  }
  return out
}

// ----------------- Provider: Foursquare -----------------
async function fsqSearch(lat,lng,query, radius){
  if (!FSQ_API_KEY) return []
  statistics.apiCallStats.fsq++

  const url = `https://api.foursquare.com/v3/places/search?ll=${lat}%2C${lng}&radius=${radius}&categories=13032&query=${encodeURIComponent(query||'pharmacy')}&limit=50`
  try{
    const r = await withTimeout(fetch(url,{ headers:{'Authorization':FSQ_API_KEY,'Accept':'application/json','User-Agent':UA}}), FETCH_TIMEOUT_MS, 'fsq-timeout')
    const j = await r.json().catch(()=>({}))
    const results = j?.results||[]
    return results.map(x=>pharmacyItem({
      source_type:'FSQ',
      name_me: x.name||null,
      address: x.location?.formatted_address||null,
      lat: x.geocodes?.main?.latitude ?? null,
      lon: x.geocodes?.main?.longitude ?? null,
      website: x.website||null,
      opening_hours: null,
      coord_source:'FSQ'
    }))
  }catch(_e){ return [] }
}

// ----------------- Provider: HERE -----------------
async function hereDiscover(lat,lng,query, radius){
  if (!HERE_API_KEY) return []
  statistics.apiCallStats.here++

  const url = `https://discover.search.hereapi.com/v1/discover?at=${lat},${lng}&q=${encodeURIComponent(query||'pharmacy')}&limit=50&apiKey=${HERE_API_KEY}`
  try{
    const r = await withTimeout(fetch(url,{ headers:{'User-Agent':UA}}), FETCH_TIMEOUT_MS, 'here-timeout')
    const j = await r.json().catch(()=>({}))
    const items = j?.items||[]
    return items.map(x=>pharmacyItem({
      source_type:'HERE',
      name_me: x.title||null,
      address: x.address?.label||null,
      lat: x.position?.lat ?? null,
      lon: x.position?.lng ?? null,
      website: x.contacts?.[0]?.www?.[0]?.value || null,
      coord_source:'HERE'
    }))
  }catch(_e){ return [] }
}

// ----------------- Provider: TomTom -----------------
async function tomtomSearch(lat,lng,query, radius){
  if (!TOMTOM_API_KEY) return []
  statistics.apiCallStats.tomtom++

  const url = `https://api.tomtom.com/search/2/nearbySearch/.json?key=${TOMTOM_API_KEY}&lat=${lat}&lon=${lng}&radius=${radius}&categorySet=9554&limit=100`
  try{
    const r = await withTimeout(fetch(url,{ headers:{'User-Agent':UA}}), FETCH_TIMEOUT_MS, 'tt-timeout')
    const j = await r.json().catch(()=>({}))
    const results = j?.results||[]
    return results.map(x=>pharmacyItem({
      source_type:'TOMTOM',
      name_me: x.poi?.name||null,
      address: x.address?.freeformAddress||null,
      lat: x.position?.lat ?? null,
      lon: x.position?.lon ?? null,
      website: null,
      coord_source:'TOMTOM'
    }))
  }catch(_e){ return [] }
}

// ----------------- Third-party/Chains -----------------
async function fetchFZO(){
  statistics.apiCallStats.fzo++
  log('📄 [FZO] Fetching government registry PDF...')

  try{
    const r = await withTimeout(fetch(FZO_URL,{headers:{'User-Agent':UA}}), FETCH_TIMEOUT_MS, 'fzo-timeout')
    if (!r.ok) throw new Error(`FZO HTTP ${r.status}`)
    const buf = Buffer.from(await r.arrayBuffer())
    const text = (await pdf(buf)).text
    const rows=[]
    for (const line of text.split(/\r?\n/)){
      const t=line.trim(); if(!t) continue; if(/(apoteka|апотека|pharmacy)/i.test(t)) rows.push(t)
    }
    const seen = new Set()
    const results = rows.map(raw=>{
      const k = norm(raw)
      if (seen.has(k)) return null
      seen.add(k); return { raw }
    }).filter(Boolean)

    collectedData.sources.fzo = results
    log(`✅ [FZO] Found ${results.length} registry entries`)
    return results
  }catch(e){
    log(`❌ [FZO] Error: ${e.message}`, 'ERROR')
    return []
  }
}
async function fetchMontefarm(){
  statistics.apiCallStats.montefarm++
  log('🏪 [Montefarm] Scraping pharmacy chain website...')

  try{
    const r=await withTimeout(fetch(MONTEFARM_URL,{headers:{'User-Agent':UA}}), FETCH_TIMEOUT_MS, 'mf-timeout')
    if (!r.ok) throw new Error(`MF HTTP ${r.status}`)
    const $=cheerio.load(await r.text()); const rows=[]
    $('li,p,h2,h3,.pharmacy,.elementor-widget-container').each((_,el)=>{ const t=$(el).text().replace(/\s+/g,' ').trim(); if(t && /Pharmacy|Apoteka/i.test(t)) rows.push(t) })
    const seen=new Set(); const out=[]
    for (const raw of rows){
      const k=norm(raw); if (seen.has(k)) continue; seen.add(k); out.push({ raw })
    }
    collectedData.sources.montefarm = out
    log(`✅ [Montefarm] Found ${out.length} entries`)
    return out
  }catch(e){
    log(`❌ [Montefarm] Error: ${e.message}`, 'ERROR')
    return []
  }
}
async function fetchBENU(){
  statistics.apiCallStats.benu++
  log('💊 [BENU] Scraping BENU Montenegro website...')

  try{
    const r=await withTimeout(fetch(BENU_ME_URL,{headers:{'User-Agent':UA}}), FETCH_TIMEOUT_MS, 'benu-timeout')
    if (!r.ok) throw new Error(`BENU HTTP ${r.status}`)
    const html=await r.text()
    const $=cheerio.load(html)
    const rows=[]
    $('a,li,p,div').each((_,el)=>{
      const t=$(el).text().replace(/\s+/g,' ').trim()
      if(t && /(BENU|Apoteka|Pharmacy)/i.test(t)) rows.push(t)
    })
    const seen=new Set(), out=[]
    for(const raw of rows){ const k=norm(raw); if(seen.has(k)) continue; seen.add(k); out.push({ raw }) }
    collectedData.sources.benu = out
    log(`✅ [BENU] Found ${out.length} entries`)
    return out
  }catch(e){
    log(`❌ [BENU] Error: ${e.message}`, 'ERROR')
    return []
  }
}

// ----------------- Parsing -----------------
function parseContacts(raw){
  const emails=[...raw.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig)].map(m=>m[0])
  const phones=[...raw.matchAll(/\+?\d[\d/\s\-().]{4,}\d/g)]
    .map(m=>clamp(m[0]).replace(/[()\s\/\-]/g,''))
    .filter(p=>p.length>=7 && p.length<=15)
  return { email:[...new Set(emails)], phone:[...new Set(phones)] }
}
function parseFZOrow(raw){
  const { email, phone } = parseContacts(raw)
  const name = (raw.match(/"([^"]+)"/)?.[1]) || (raw.match(/\bApoteka\s+([^,;]+)/i)?.[1]) || null
  const city = (raw.match(CITY_RE)?.[1]) || null
  const addr = (raw.match(/((Ulica|Ul\.|Bulevar|Trg|Put|Maršala|Mojsija|Nika|Vladimira)[^,;]+(?:\b(?:bb|br\.\s*\d+|\d+\w?)\b)?)/i)?.[1]) || null
  return { name_me: name?clamp(name):null, address: addr?clamp(addr):null, city_name: city, email, phone }
}
function parseMFrow(raw){
  const { email, phone } = parseContacts(raw)
  let name=null, city=null; const m=raw.match(/Pharmacy\s+(.+?)\s+([A-ZČĆĐŠŽ][\wšđžćč]+)$/i)
  if (m){ name=clamp(m[1]); city=clamp(m[2]) } else { city=(raw.match(CITY_RE)?.[1])||null }
  return { name_me: name, address:null, city_name: city, email, phone }
}
function parseBENUrow(raw){
  const { email, phone } = parseContacts(raw)
  const city = (raw.match(CITY_RE)?.[1]) || null
  return { name_me: /BENU/i.test(raw)?'BENU Apoteka':null, address:null, city_name: city, email, phone }
}
function processOpeningHoursFromText(hoursText) {
  if (!hoursText || typeof hoursText !== 'string') {
    return { is_24h:false, open_sunday:false, hours_monfri:'N/A', hours_sat:'N/A', hours_sun:'N/A' }
  }
  const t = hoursText.toLowerCase()
  const is24 = /(24\/7|24 sata|non[- ]?stop|0:00[-–]24:00)/.test(t)
  if (is24) return { is_24h:true, open_sunday:true, hours_monfri:'24/7', hours_sat:'24/7', hours_sun:'24/7' }
  const timePattern = /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/g
  const match = [...hoursText.matchAll(timePattern)]
  const def = match.length ? match[0][0] : '08:00-20:00'
  const openSunday = /(sun|ned(elja|jelja)|ned)/i.test(hoursText) && !/(closed|zatvoreno|ne radi)/i.test(hoursText)
  return { is_24h:false, open_sunday:openSunday, hours_monfri:def, hours_sat:def, hours_sun: openSunday? def : 'Zatvoreno' }
}

// ----------------- Model shaping -----------------
function calculateReliabilityFromItem(r) {
  let score = 50
  if (r.phone) score += 15
  if (r.website) score += 15
  if (r.address && r.address.length > 10) score += 10
  if (r.opening_hours) score += 10
  if (r.source_type === 'OSM') score += 10
  if (r.place_id) score += 10
  return Math.min(100, Math.max(0, score))
}
function pharmacyItem(r){
  const hoursData = processOpeningHoursFromText(r.opening_hours)
  return {
    model: 'Pharmacy',
    name_me: r.name_me || 'Unknown Pharmacy',
    name_en: r.name_en || r.name_me || 'Unknown Pharmacy',
    address: r.address || 'Address not available',
    city_name: r.city_name || null,
    lat: r.lat ?? null,
    lng: (r.lng ?? r.lon) ?? null,
    phone: Array.isArray(r.phone) ? r.phone.join(', ') : (r.phone || null),
    email: Array.isArray(r.email) ? r.email.join(', ') : (r.email || null),
    website: r.website || null,
    is_24h: hoursData.is_24h,
    open_sunday: hoursData.open_sunday,
    hours_monfri: hoursData.hours_monfri,
    hours_sat: hoursData.hours_sat,
    hours_sun: hoursData.hours_sun,
    opening_hours: r.opening_hours || null,
    source_type: r.source_type || null,
    place_id: r.place_id || null,
    google_place_id: r.place_id || r.google_place_id || null,
    osm_type: r.osm_type || null,
    osm_id: r.osm_id || null,
    coord_source: r.coord_source || null,
    reliability_score: calculateReliabilityFromItem(r)
  }
}

// ----------------- Dedupe -----------------
function dedupe(items){
  const out=[]; const seenPID=new Set(); const seenOSM=new Set(); const seenGeo=new Set()
  for (const r of items){
    const pid = r.google_place_id || r.place_id
    if (pid){
      if (seenPID.has(pid)) {
        statistics.deduplicationStats.byPlaceId++
        continue
      }
      seenPID.add(pid)
    }
    if (r.osm_type && r.osm_id){
      const ok=`${r.osm_type}:${r.osm_id}`
      if (seenOSM.has(ok)) {
        statistics.deduplicationStats.byOsmId++
        continue
      }
      seenOSM.add(ok)
    }
    const gk=geokey(r.lat, r.lng ?? r.lon)
    if (gk){
      if (seenGeo.has(gk)) {
        statistics.deduplicationStats.byGeokey++
        continue
      }
      seenGeo.add(gk)
    }
    out.push(r)
  }
  return out
}

function fuzzyMerge(items){
  const byGeo = new Map()
  for(const r of items){
    const key = geokey(r.lat, r.lng ?? r.lon) || `~${norm(r.name_me||'')}`
    if(!byGeo.has(key)) byGeo.set(key, [])
    byGeo.get(key).push(r)
  }
  const merged=[]
  for(const arr of byGeo.values()){
    arr.sort((a,b)=> (norm(a.name_me||'').localeCompare(norm(b.name_me||''))))
    const kept=[]
    for(const x of arr){
      const near = kept.find(y => sim(x.name_me,y.name_me)>=0.8)
      if (!near) {
        kept.push(x)
      } else {
        statistics.deduplicationStats.byFuzzyName++
      }
    }
    merged.push(...kept)
  }
  return merged
}

// ----------------- ALL CITIES PARALLEL FETCH -----------------
async function fetchAllCitiesData() {
  log('')
  log('🌍 Starting comprehensive data collection for all cities...')
  log('Note: Processing ALL cities in parallel without time constraints')
  log('')

  const cities = getAllCities()
  log(`Found ${cities.length} cities to process`)

  const bbox = await getBBoxME()
  log(`Country bounding box: ${JSON.stringify(bbox)}`)

  // Fetch global data sources first
  log('')
  log('='.repeat(80))
  log('PHASE 1: Global Data Sources')
  log('='.repeat(80))

  const [osm, fzo, mf, benu] = await Promise.all([
    fetchOSMPharmacies(),
    fetchFZO(),
    fetchMontefarm(),
    fetchBENU()
  ])

  log('')
  log('='.repeat(80))
  log('PHASE 2: City-Specific Data Collection')
  log('='.repeat(80))

  // Process each city thoroughly
  for (let i = 0; i < cities.length; i++) {
    const cityStatic = cities[i]
    const citySlug = cityStatic.slug
    const key = CITY_ALIASES[citySlug] ?? citySlug
    const center = CITY_COORDINATES[key]

    if (!center) {
      log(`⚠️  [${i+1}/${cities.length}] ${cityStatic.name_en}: No coordinates found, skipping`)
      continue
    }

    log('')
    log(`🏙️  [${i+1}/${cities.length}] Processing ${cityStatic.name_en} (${cityStatic.name_me})`)
    log(`   Coordinates: ${center.lat}, ${center.lng} | Radius: ${center.radius}m`)

    const cityStartTime = Date.now()
    const enrichedCenter = {
      ...center,
      name: citySlug,
      name_me: cityStatic.name_me,
      name_en: cityStatic.name_en
    }

    try {
      // Google comprehensive search
      log(`   🔍 [Google] Starting comprehensive search...`)
      const googleResults = []

      // Base nearby with details
      const baseResults = await googleNearby(enrichedCenter.lat, enrichedCenter.lng, {
        kw: null,
        lang: 'sr',
        radius: enrichedCenter.radius,
        fetchDetails: true
      })
      googleResults.push(...baseResults)
      log(`      ✓ Base search: ${baseResults.length} pharmacies`)

      // Keyword searches in 4 languages
      for (const lang of LANGS.slice(0, 4)) {
        for (const kw of KW_CORE) {
          const kwResults = await googleNearby(enrichedCenter.lat, enrichedCenter.lng, {
            kw,
            lang,
            radius: enrichedCenter.radius,
            fetchDetails: true
          })
          googleResults.push(...kwResults)
        }
      }
      log(`      ✓ Keyword searches completed`)

      // Additional patterns
      const additionalPatterns = [
        'ljekarna', 'дежурна апотека', 'non stop apoteka',
        'pharmacy near me', 'farmacia', 'аптека'
      ]
      for (const pattern of additionalPatterns) {
        const patResults = await googleNearby(enrichedCenter.lat, enrichedCenter.lng, {
          kw: pattern,
          lang: 'sr',
          radius: enrichedCenter.radius,
          fetchDetails: true
        })
        googleResults.push(...patResults)
      }
      log(`      ✓ Additional patterns searched`)

      // Text searches
      const textResults = []
      for (const m of [cityStatic.name_me, cityStatic.name_en]) {
        textResults.push(...await googleText(`apoteka ${m}`, 'sr', true))
        textResults.push(...await googleText(`pharmacy ${m}`, 'en', true))
      }
      googleResults.push(...textResults)
      log(`      ✓ Text searches completed`)

      const googleDeduped = dedupe(googleResults)
      log(`   ✅ [Google] Total: ${googleDeduped.length} unique pharmacies`)

      // Optional providers
      log(`   🔍 [Optional Providers] Checking FSQ/HERE/TomTom...`)
      const optionalResults = []
      if (FSQ_API_KEY) {
        const fsqResults = await fsqSearch(enrichedCenter.lat, enrichedCenter.lng, 'pharmacy', enrichedCenter.radius)
        optionalResults.push(...fsqResults)
        log(`      ✓ Foursquare: ${fsqResults.length} pharmacies`)
      }
      if (HERE_API_KEY) {
        const hereResults = await hereDiscover(enrichedCenter.lat, enrichedCenter.lng, 'pharmacy', enrichedCenter.radius)
        optionalResults.push(...hereResults)
        log(`      ✓ HERE: ${hereResults.length} pharmacies`)
      }
      if (TOMTOM_API_KEY) {
        const ttResults = await tomtomSearch(enrichedCenter.lat, enrichedCenter.lng, 'pharmacy', enrichedCenter.radius)
        optionalResults.push(...ttResults)
        log(`      ✓ TomTom: ${ttResults.length} pharmacies`)
      }

      // Merge all sources for this city
      const cityOSM = osm.filter(p => {
        if (!p.lat || !p.lng) return false
        const lng = p.lng ?? p.lon
        const distance = Math.sqrt(
          Math.pow((p.lat - enrichedCenter.lat) * 111000, 2) +
          Math.pow((lng - enrichedCenter.lng) * 111000 * Math.cos(enrichedCenter.lat * Math.PI / 180), 2)
        )
        return distance <= enrichedCenter.radius * 3
      })

      log(`   📊 Source breakdown:`)
      log(`      OSM: ${cityOSM.length}`)
      log(`      Google: ${googleDeduped.length}`)
      log(`      Optional: ${optionalResults.length}`)

      const beforeMerge = cityOSM.length + googleDeduped.length + optionalResults.length
      let allPharmacies = [...cityOSM, ...googleDeduped, ...optionalResults]
      allPharmacies = dedupe(allPharmacies)
      allPharmacies = fuzzyMerge(allPharmacies)

      const withCoords = allPharmacies.filter(p => typeof p.lat === 'number' && typeof (p.lng ?? p.lon) === 'number')

      log(`   🔧 Deduplication: ${beforeMerge} → ${allPharmacies.length} → ${withCoords.length} (with coordinates)`)

      const cityDuration = Math.round((Date.now() - cityStartTime) / 1000)
      log(`   ⏱️  Completed in ${cityDuration}s`)

      // Store city results
      collectedData.cities.push({
        slug: citySlug,
        name_me: cityStatic.name_me,
        name_en: cityStatic.name_en,
        pharmacies: withCoords,
        stats: {
          osm: cityOSM.length,
          google: googleDeduped.length,
          optional: optionalResults.length,
          total: withCoords.length,
          duration: cityDuration
        }
      })

      statistics.cityStats.push({
        city: cityStatic.name_en,
        found: withCoords.length,
        duration: cityDuration
      })

      statistics.totalPharmaciesFound += withCoords.length

    } catch (err) {
      log(`   ❌ Error processing ${cityStatic.name_en}: ${err.message}`, 'ERROR')
      statistics.totalErrors++
    }

    // Brief delay between cities
    await SLEEP(500)
  }

  log('')
  log('='.repeat(80))
  log('PHASE 3: Final Deduplication & Quality Analysis')
  log('='.repeat(80))

  // Collect all pharmacies from all cities
  const allCollected = []
  for (const city of collectedData.cities) {
    allCollected.push(...city.pharmacies)
  }

  collectedData.deduplication.beforeCount = allCollected.length
  log(`Total pharmacies collected: ${allCollected.length}`)

  // Final global deduplication
  const finalDeduped = dedupe(allCollected)
  const finalMerged = fuzzyMerge(finalDeduped)

  collectedData.deduplication.afterCount = finalMerged.length
  collectedData.deduplication.duplicatesRemoved = allCollected.length - finalMerged.length

  log(`After final deduplication: ${finalMerged.length} unique pharmacies`)
  log(`Duplicates removed: ${collectedData.deduplication.duplicatesRemoved}`)

  // Quality analysis
  for (const pharmacy of finalMerged) {
    const score = pharmacy.reliability_score || 0

    if (score >= 80) {
      collectedData.qualityAnalysis.highQuality.push(pharmacy)
      statistics.qualityDistribution.score_80_89++
      if (score >= 90) statistics.qualityDistribution.score_90_100++
    } else if (score >= 60) {
      collectedData.qualityAnalysis.mediumQuality.push(pharmacy)
      if (score >= 70) statistics.qualityDistribution.score_70_79++
      else statistics.qualityDistribution.score_60_69++
    } else {
      collectedData.qualityAnalysis.lowQuality.push(pharmacy)
      if (score >= 50) statistics.qualityDistribution.score_50_59++
      else statistics.qualityDistribution.score_below_50++
    }

    // Completeness stats
    if (pharmacy.phone) statistics.completenessStats.withPhone++
    if (pharmacy.website) statistics.completenessStats.withWebsite++
    if (pharmacy.opening_hours) statistics.completenessStats.withOpeningHours++
    if (pharmacy.google_rating) statistics.completenessStats.withRating++
    if (pharmacy.phone && pharmacy.website && pharmacy.opening_hours) {
      statistics.completenessStats.withAllDetails++
    }
  }

  log(`Quality distribution:`)
  log(`   High (≥80): ${collectedData.qualityAnalysis.highQuality.length}`)
  log(`   Medium (60-79): ${collectedData.qualityAnalysis.mediumQuality.length}`)
  log(`   Low (<60): ${collectedData.qualityAnalysis.lowQuality.length}`)

  log(`Completeness:`)
  log(`   With phone: ${statistics.completenessStats.withPhone}`)
  log(`   With website: ${statistics.completenessStats.withWebsite}`)
  log(`   With hours: ${statistics.completenessStats.withOpeningHours}`)
  log(`   With rating: ${statistics.completenessStats.withRating}`)
  log(`   With all details: ${statistics.completenessStats.withAllDetails}`)

  return finalMerged
}

// ----------------- DATABASE SAVE -----------------
async function saveToDB(pharmacies) {
  log('')
  log('='.repeat(80))
  log('PHASE 4: Database Population')
  log('='.repeat(80))

  log(`💾 Saving ${pharmacies.length} pharmacies to database...`)

  for (let i = 0; i < pharmacies.length; i++) {
    const src = pharmacies[i]

    try {
      // Find or create city
      const cityName = src.city_name || 'Unknown'
      const cityData = getAllCities().find(c =>
        c.name_me.toLowerCase().includes(cityName.toLowerCase()) ||
        c.name_en.toLowerCase().includes(cityName.toLowerCase())
      )

      let city
      if (cityData) {
        [city] = await City.findOrCreate({
          where: { slug: cityData.slug },
          defaults: {
            slug: cityData.slug,
            name_me: cityData.name_me,
            name_en: cityData.name_en
          }
        })
      } else {
        // Use first city as fallback
        [city] = await City.findOrCreate({
          where: { slug: 'podgorica' },
          defaults: {
            slug: 'podgorica',
            name_me: 'Podgorica',
            name_en: 'Podgorica'
          }
        })
      }

      const pharmacyData = {
        name_me: src.name_me || 'Unknown Pharmacy',
        name_en: src.name_en || src.name_me || 'Unknown Pharmacy',
        address: src.address || 'Address not available',
        lat: src.lat,
        lng: src.lng ?? src.lon,
        phone: src.phone || null,
        email: src.email || null,
        website: src.website?.trim() ? src.website : null,
        is_24h: src.is_24h || false,
        open_sunday: src.open_sunday || false,
        hours_monfri: src.hours_monfri || 'N/A',
        hours_sat: src.hours_sat || 'N/A',
        hours_sun: src.hours_sun || 'N/A',
        google_place_id: src.google_place_id || src.place_id || null,
        google_rating: src.google_rating || null,
        opening_hours: src.opening_hours || null,
        city_id: city.id,
        active: true,
        last_online_sync: new Date()
      }

      if (!pharmacyData.lat || !pharmacyData.lng) continue

      // Try to find existing
      let existing = null
      if (pharmacyData.google_place_id) {
        existing = await Pharmacy.findOne({ where: { google_place_id: pharmacyData.google_place_id } })
      }
      if (!existing) {
        existing = await Pharmacy.findOne({
          where: { city_id: city.id, name_me: pharmacyData.name_me }
        })
      }

      if (existing) {
        await existing.update(pharmacyData)
        log(`   [${i+1}/${pharmacies.length}] ✏️  Updated: ${src.name_me}`)
      } else {
        const newPh = await Pharmacy.create(pharmacyData)
        statistics.totalPharmaciesSaved++
        collectedData.finalDatabase.push({
          id: newPh.id,
          ...pharmacyData
        })
        log(`   [${i+1}/${pharmacies.length}] ✅ Created: ${src.name_me}`)
      }

    } catch (e) {
      statistics.totalErrors++
      log(`   [${i+1}/${pharmacies.length}] ❌ Error: ${src.name_me} - ${e.message}`, 'ERROR')
    }
  }

  log(`✅ Database save completed: ${statistics.totalPharmaciesSaved} new pharmacies created`)
}

// ----------------- MAIN -----------------
async function initializePharmacyData() {
  initializeLogging()

  const timeoutId = setTimeout(() => {
    log('⏰ Maximum timeout reached (60 minutes)', 'WARN')
    closeLogging()
    process.exit(1)
  }, INIT_TIMEOUT)

  try {
    await sequelize.authenticate()
    log('✅ Database connection established')

    const existingCount = await Pharmacy.count()
    log(`📊 Current database: ${existingCount} pharmacies`)

    if (existingCount > 200) {
      log(`⚠️  Database already has ${existingCount} pharmacies`)
      log(`   Set force=true in code to reinitialize`)
      clearTimeout(timeoutId)
      closeLogging()
      return
    }

    // Comprehensive fetch
    const allPharmacies = await fetchAllCitiesData()

    // Save to database
    await saveToDB(allPharmacies)

    // Save JSON outputs
    saveJsonOutput()

    // Final summary
    log('')
    log('='.repeat(100))
    log('📊 FINAL SUMMARY')
    log('='.repeat(100))
    log(`Total pharmacies found: ${statistics.totalPharmaciesFound}`)
    log(`Total pharmacies saved: ${statistics.totalPharmaciesSaved}`)
    log(`Total errors: ${statistics.totalErrors}`)
    log(`Success rate: ${statistics.totalPharmaciesFound > 0 ? ((statistics.totalPharmaciesSaved / statistics.totalPharmaciesFound) * 100).toFixed(1) : 0}%`)
    log('')
    log('API Calls:')
    log(`   Google Nearby: ${statistics.apiCallStats.google_nearby}`)
    log(`   Google Text: ${statistics.apiCallStats.google_text}`)
    log(`   Google Details: ${statistics.apiCallStats.google_details}`)
    log(`   OSM Overpass: ${statistics.apiCallStats.osm_overpass}`)
    log(`   Foursquare: ${statistics.apiCallStats.fsq}`)
    log(`   HERE: ${statistics.apiCallStats.here}`)
    log(`   TomTom: ${statistics.apiCallStats.tomtom}`)
    log('')
    log('Deduplication:')
    log(`   By Place ID: ${statistics.deduplicationStats.byPlaceId}`)
    log(`   By OSM ID: ${statistics.deduplicationStats.byOsmId}`)
    log(`   By Geokey: ${statistics.deduplicationStats.byGeokey}`)
    log(`   By Fuzzy Name: ${statistics.deduplicationStats.byFuzzyName}`)
    log('')
    log('Quality Distribution:')
    log(`   90-100: ${statistics.qualityDistribution.score_90_100}`)
    log(`   80-89: ${statistics.qualityDistribution.score_80_89}`)
    log(`   70-79: ${statistics.qualityDistribution.score_70_79}`)
    log(`   60-69: ${statistics.qualityDistribution.score_60_69}`)
    log(`   50-59: ${statistics.qualityDistribution.score_50_59}`)
    log(`   <50: ${statistics.qualityDistribution.score_below_50}`)
    log('='.repeat(100))

    clearTimeout(timeoutId)
    closeLogging()

  } catch (error) {
    clearTimeout(timeoutId)
    log(`❌ FATAL ERROR: ${error.message}`, 'ERROR')
    log(error.stack, 'ERROR')
    closeLogging()
    throw error
  }
}

module.exports = { initializePharmacyData }