'use strict'

/**
 * Multi-provider, seed-expanding pharmacy harvester for Montenegro.
 * Completeness strategy:
 * 1) OSM countrywide baseline
 * 2) City-first Google sweep (H3) + keyword + textsearch
 * 3) Seed expansion: run nearby around every seed (OSM+Google+chains)
 * 4) Optional providers (Foursquare/HERE/TomTom) to close gaps
 * 5) Chain scrapers (Montefarm, BENU) + FZO registry with geocode fan-out
 * 6) Robust dedupe (IDs + geo + fuzzy name) then DB upsert
 */

const { createResponse, createErrorResponse } = require('../utils/responseHelper')
const { Pharmacy, City } = require('../db/models')
const { getCityBySlug, getAllCities } = require('../data/cities')

const pdf = require('pdf-parse')
const cheerio = require('cheerio')
const h3 = require('h3-js')
const { Op } = require('sequelize')

// ----------------- CONFIG -----------------
const UA = 'pharmacy-harvester/5.0'
const COUNTRY_ISO = 'ME'

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API || process.env.GOOGLE_API_KEY || ''
const FSQ_API_KEY    = process.env.FSQ_API_KEY || ''       // Foursquare Places
const HERE_API_KEY   = process.env.HERE_API_KEY || ''      // HERE Discover
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY || ''    // TomTom Search

const FETCH_TIMEOUT_MS      = parseInt(process.env.FETCH_TIMEOUT_MS || '20000', 10)
const OVERPASS_TIMEOUT_MS   = parseInt(process.env.OVERPASS_TIMEOUT_MS || '35000', 10)
const H3_RES                = parseInt(process.env.H3_RES || '6', 10)
const GOOGLE_RADIUS_M       = parseInt(process.env.GOOGLE_RADIUS_M || '2000', 10)
const EXPANSION_RADIUS_M    = parseInt(process.env.EXPANSION_RADIUS_M || '800', 10)
const MAX_EXPANSION_SEEDS   = parseInt(process.env.MAX_EXPANSION_SEEDS || '250', 10)
const CONCURRENCY           = parseInt(process.env.CONCURRENCY || '6', 10)
const RETRIES               = parseInt(process.env.RETRIES || '2', 10)
const GOOGLE_PAGE_DELAY_MS  = parseInt(process.env.GOOGLE_PAGE_DELAY_MS || '2300', 10)
const GOOGLE_OQL_SLEEP_MS   = parseInt(process.env.GOOGLE_OQL_SLEEP_MS || '6000', 10)

const OVERPASS_POOL = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter'
]

const FZO_URL        = 'https://fzocg.me/wp-content/uploads/2023/11/Spisak-apoteka-za-sajt.pdf'
const MONTEFARM_URL  = 'https://montefarm.co.me/en/apoteke/'
const BENU_ME_URL    = 'https://www.benu.me/apoteke' // BENU Montenegro store locator

const MUNICIPALITIES = ['Andrijevica','Bar','Berane','Bijelo Polje','Budva','Cetinje','Danilovgrad','Gusinje','Herceg Novi','Kolašin','Kotor','Mojkovac','Nikšić','Petnjica','Plav','Pljevlja','Plužine','Podgorica','Rožaje','Šavnik','Tivat','Tuzi','Ulcinj','Žabljak','Zeta']
const CITY_RE = new RegExp(`\\b(${MUNICIPALITIES.map(x=>x.replace(/[-/\\.^$*+?()[\]{}]/g,'\\$&')).join('|')})\\b`,'i')

// Core multilingual terms
const KW_CORE = ['apoteka','апотека','pharmacy','chemist','ljekarna','barnatore']
const KW_QUAL = ['dežurna apoteka','24h apoteka','non stop apoteka','hitna apoteka','24/7 pharmacy','apteka']
const KW_CHAINS = ['Montefarm','BENU','Galenika']
const LANGS = ['sr','hr','en','sq','it','de','bs','me','fr','es']

// City coords (slug keys). Alias Zeta→golubovci.
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
const CITY_ALIASES = { zeta: 'golubovci' }

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
const timedOut = d => Date.now() > d

// fetch polyfill
let fetchFn = global.fetch
if (!fetchFn) fetchFn = (...args) => import('node-fetch').then(({ default: f }) => f(...args))
const fetch = (...args) => fetchFn(...args)

// simple promise pool
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

// retry wrapper
async function retry(fn, retries=RETRIES, delay=400){
  let last
  for (let a=0;a<=retries;a++){
    try { return await fn() } catch(e){ last=e; if (a<retries) await SLEEP(delay*(a+1)) }
  }
  throw last
}

// fuzzy name similarity (Jaro-Winkler lite)
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

// ----------------- H3 -----------------
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
    return arr.flatMap(el=>{
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
        website: t.website || null,
        opening_hours: t.opening_hours || null,
        osm_type: el.type, osm_id: el.id, coord_source:'OSM'
      })]
    })
  } catch(_e){ return [] }
}

// ----------------- Provider: Google -----------------
async function gFetch(url) {
  try {
    const r = await withTimeout(fetch(url, { headers:{'User-Agent':UA}}), FETCH_TIMEOUT_MS, 'google-timeout')
    const j = await r.json().catch(()=>({}))
    return { ok:true, j }
  } catch(_e){ return { ok:false, j:{} } }
}
function fromPlaces(r){
  const loc = r.geometry?.location || {}
  return pharmacyItem({
    source_type: 'GOOGLE',
    place_id: r.place_id,
    name_me: r.name || null,
    address: r.vicinity || r.formatted_address || null,
    lat: typeof loc.lat==='number' ? loc.lat : null,
    lon: typeof loc.lng==='number' ? loc.lng : null,
    website: r.website || null,
    opening_hours: r.opening_hours?.weekday_text?.join('; ') || null,
    coord_source: 'GOOGLE'
  })
}
async function googleNearby(lat, lng, { kw=null, lang='sr', radius=GOOGLE_RADIUS_M } = {}){
  if (!GOOGLE_API_KEY) return []
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
      seen.add(r.place_id); out.push(fromPlaces(r))
    }
    token = j?.next_page_token || null; page++
  } while(token && page<3)
  return out
}
async function googleText(q, lang='sr'){
  if (!GOOGLE_API_KEY) return []
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${GOOGLE_API_KEY}&query=${encodeURIComponent(q)}&region=me&language=${lang}`
  const { j } = await gFetch(url)
  if (!['OK','ZERO_RESULTS'].includes(j?.status)) return []
  return (j.results||[]).map(fromPlaces)
}

// ----------------- Provider: Foursquare -----------------
async function fsqSearch(lat,lng,query, radius){
  if (!FSQ_API_KEY) return []
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
    return rows.map(raw=>{
      const k = norm(raw)
      if (seen.has(k)) return null
      seen.add(k); return { raw }
    }).filter(Boolean)
  }catch(_e){ return [] }
}
async function fetchMontefarm(){
  try{
    const r=await withTimeout(fetch(MONTEFARM_URL,{headers:{'User-Agent':UA}}), FETCH_TIMEOUT_MS, 'mf-timeout')
    if (!r.ok) throw new Error(`MF HTTP ${r.status}`)
    const $=cheerio.load(await r.text()); const rows=[]
    $('li,p,h2,h3,.pharmacy,.elementor-widget-container').each((_,el)=>{ const t=$(el).text().replace(/\s+/g,' ').trim(); if(t && /Pharmacy|Apoteka/i.test(t)) rows.push(t) })
    const seen=new Set(); const out=[]
    for (const raw of rows){
      const k=norm(raw); if (seen.has(k)) continue; seen.add(k); out.push({ raw })
    }
    return out
  }catch(_e){ return [] }
}
async function fetchBENU(){
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
    return out
  }catch(_e){ return [] }
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
    if (pid){ if (seenPID.has(pid)) continue; seenPID.add(pid) }
    if (r.osm_type && r.osm_id){
      const ok=`${r.osm_type}:${r.osm_id}`; if (seenOSM.has(ok)) continue; seenOSM.add(ok)
    }
    const gk=geokey(r.lat, r.lng ?? r.lon)
    if (gk){ if (seenGeo.has(gk)) continue; seenGeo.add(gk) }
    out.push(r)
  }
  return out
}

// Name+geo fuzzy dedupe for remaining near-duplicates
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
      if (!near) kept.push(x)
    }
    merged.push(...kept)
  }
  return merged
}

// ----------------- City search plans -----------------
async function sweepGoogleCity(center, deadline){
  if (!GOOGLE_API_KEY) return []
  let all=[]
  // base
  all.push(...await googleNearby(center.lat, center.lng, { kw:null, lang:'sr', radius:center.radius }))
  // core kws in 2 langs
  for (const lang of LANGS.slice(0,2)){
    for (const kw of KW_CORE.slice(0,5)){
      if (timedOut(deadline)) break
      all.push(...await googleNearby(center.lat, center.lng, { kw, lang, radius:center.radius }))
    }
  }
  // text search chain + qualifiers with municipality names
  for (const m of MUNICIPALITIES){
    for (const lang of LANGS.slice(0,2)){
      for (const kw of [...KW_CHAINS.slice(0,3), ...KW_QUAL.slice(0,3)]){
        if (timedOut(deadline)) break
        all.push(...await googleText(`${kw} ${m}`, lang))
      }
    }
  }
  return dedupe(all)
}

async function sweepGoogleCountry(bbox, deadline){
  if (!GOOGLE_API_KEY) return []
  const hex = bboxToH3(bbox, H3_RES)
  const results = await pool(hex, async (c)=>{
    if (timedOut(deadline)) return []
    return googleNearby(c.lat,c.lon,{kw:null})
  }, Math.max(2, Math.floor(CONCURRENCY/2)))
  return dedupe(results.flat())
}

// expand around seeds (capture clusters missed by grid)
async function expandSeeds(seeds, deadline){
  const take = seeds.slice(0, MAX_EXPANSION_SEEDS)
  const out=[]
  await pool(take, async (s)=>{
    if (timedOut(deadline)) return
    const lat=s.lat, lng=s.lng ?? s.lon
    const tasks=[]
    tasks.push(googleNearby(lat,lng,{kw:null,radius:EXPANSION_RADIUS_M}))
    for (const kw of KW_CORE.slice(0,3)) tasks.push(googleNearby(lat,lng,{kw, radius:EXPANSION_RADIUS_M}))
    out.push(...(await Promise.all(tasks)).flat())
  }, CONCURRENCY)
  return dedupe(out)
}

// optional providers around city center to close gaps
async function sweepOptionals(center){
  const tasks=[]
  if (FSQ_API_KEY) tasks.push(fsqSearch(center.lat, center.lng, 'pharmacy', center.radius))
  if (HERE_API_KEY) tasks.push(hereDiscover(center.lat, center.lng, 'pharmacy', center.radius))
  if (TOMTOM_API_KEY) tasks.push(tomtomSearch(center.lat, center.lng, 'pharmacy', center.radius))
  if (!tasks.length) return []
  const sets = await Promise.all(tasks.map(t=>t.catch(()=>[])))
  return dedupe(sets.flat())
}

// ----------------- Comprehensive fetch -----------------
async function fetchOnlinePharmacyData(citySlug) {
  const deadline = Date.now() + 6 * 60 * 1000 // 6 minutes
  const key = CITY_ALIASES[citySlug] ?? citySlug
  const center = CITY_COORDINATES[key]
  if (!center) throw new Error(`City coordinates not found for: ${citySlug}`)

  // 1) OSM baseline
  const osm = await retry(() => fetchOSMPharmacies()).catch(()=>[])

  // 2) Google city-first
  let googleCity = await sweepGoogleCity(center, deadline)

  // 3) If weak, add country H3 sweep
  if (!timedOut(deadline) && googleCity.length < 15) {
    const bbox = await getBBoxME()
    const extra = await sweepGoogleCountry(bbox, deadline)
    googleCity = dedupe([...googleCity, ...extra])
  }

  // 4) Seed expansion around every unique seed
  const seeds = dedupe([...osm, ...googleCity])
  const expansion = await expandSeeds(seeds, deadline)

  // 5) Optional providers to close gaps
  const optionalSet = await sweepOptionals(center)

  // 6) Chains + FZO, then geocode fan-out through Google/Foursquare/HERE/TomTom text
  const [fzo, mf, benu] = await Promise.all([fetchFZO(), fetchMontefarm(), fetchBENU()].map(p=>p.catch(()=>[])))
  const parsed = [
    ...fzo.map(x=>parseFZOrow(x.raw || x)),
    ...mf.map(x=>parseMFrow(x.raw || x)),
    ...benu.map(x=>parseBENUrow(x.raw || x))
  ]

  const textHits=[]
  for (const r of parsed){
    if (timedOut(deadline)) break
    const q1 = r.name_me && r.city_name ? `Apoteka ${r.name_me} ${r.city_name}, Montenegro` : null
    const q2 = r.city_name ? `apoteka ${r.city_name} Crna Gora` : null
    const queries = [q1,q2].filter(Boolean)

    for (const q of queries){
      const hits = [
        ...(await googleText(q,'sr')),
        ...(await (FSQ_API_KEY ? fsqSearch(center.lat,center.lng,q,center.radius) : [])),
        ...(await (HERE_API_KEY ? hereDiscover(center.lat,center.lng,q,center.radius) : [])),
        ...(await (TOMTOM_API_KEY ? tomtomSearch(center.lat,center.lng,q,center.radius) : [])),
      ]
      const best = hits.find(x=>typeof x.lat==='number' && typeof (x.lng ?? x.lon)==='number')
      if (best){
        textHits.push(pharmacyItem({
          ...best,
          name_me: r.name_me || best.name_me,
          address: r.address || best.address,
          city_name: r.city_name || best.city_name,
          email: r.email || [],
          phone: r.phone || []
        }))
        break
      }
      await SLEEP(120)
    }
  }

  // Merge all
  const merged = dedupe([
    ...osm, ...googleCity, ...expansion, ...optionalSet, ...textHits
  ])
  const fuzzy = fuzzyMerge(merged)
  const withCoords = fuzzy.filter(r => typeof r.lat==='number' && typeof (r.lng ?? r.lon)==='number')

  // City clip (3× radius)
  const cityLat = center.lat, cityLng = center.lng, maxDistance = center.radius * 3
  const cityPharmacies = withCoords.filter(p => {
    const lng = p.lng ?? p.lon
    if (p.lat==null || lng==null) return false
    const distance = Math.sqrt(
      Math.pow((p.lat - cityLat) * 111000, 2) +
      Math.pow((lng - cityLng) * 111000 * Math.cos(cityLat * Math.PI / 180), 2)
    )
    return distance <= maxDistance
  })

  return cityPharmacies
}

// ----------------- Stats wrapper (light) -----------------
async function fetchOnlinePharmacyDataWithStats(citySlug) {
  const t0 = Date.now()
  const rows = await fetchOnlinePharmacyData(citySlug).catch(()=>[])
  const stats = {
    totalFound: rows.length,
    highQuality: rows.filter(p => (p.reliability_score||0) >= 80).length,
    mediumQuality: rows.filter(p => (p.reliability_score||0) >= 60 && (p.reliability_score||0) < 80).length,
    lowQuality: rows.filter(p => (p.reliability_score||0) < 60).length,
    requiresReview: rows.filter(p => (p.reliability_score||0) < 70).length,
    avgReliability: rows.length ? Math.round(rows.reduce((s,p)=>s+(p.reliability_score||0),0)/rows.length) : 0,
    processingTimeSeconds: Math.round((Date.now()-t0)/1000)
  }
  return { pharmacies: rows, searchStats: stats }
}

// ----------------- Recommendations -----------------
function generateRecommendations(created, updated, errors, onlineCount) {
  const rec=[]
  if (created>0) rec.push(`Successfully added ${created} new pharmacies to your database`)
  if (updated>0) rec.push(`Updated ${updated} existing pharmacies with fresh data`)
  if (errors>0){
    const rate = onlineCount? Math.round((errors/onlineCount)*100) : 0
    if (rate>20) rec.push(`High error rate (${rate}%) - check API quotas and DB schema`)
    else rec.push(`Minor processing errors (${errors}) - review error log`)
  }
  if (onlineCount===0){
    rec.push('Verify city coordinates and search parameters')
    rec.push('Check Google/HERE/TomTom/Foursquare API keys and quotas')
  } else if (created===0 && updated===0){
    rec.push('No changes made - database may already be up to date')
  }
  if (created+updated>10) rec.push('Large dataset processed - consider quality review')
  return rec.length? rec : ['Sync completed successfully']
}

// ----------------- Sync endpoint -----------------
const syncCityPharmacyData = async (req, res) => {
  const syncStart = Date.now()
  try {
    const { citySlug } = req.body
    if (!citySlug) return res.status(400).json(createErrorResponse('City slug is required'))

    const staticCity = getCityBySlug(citySlug)
    if (!staticCity) return res.status(404).json(createErrorResponse(`City not found: ${citySlug}`))

    let city = await City.findOne({ where: { slug: citySlug } })
    if (!city) {
      city = await City.create({ slug: staticCity.slug, name_me: staticCity.name_me, name_en: staticCity.name_en })
    }

    const beforeCount = await Pharmacy.count({ where: { city_id: city.id, active: true } })

    const fetchResult = await fetchOnlinePharmacyDataWithStats(citySlug)
    const onlinePharmacies = fetchResult.pharmacies
    const searchStats = {
      ...fetchResult.searchStats,
      processingTimeSeconds: Math.round((Date.now() - syncStart)/1000)
    }

    if (!onlinePharmacies.length){
      return res.json(createResponse({
        citySlug,
        cityName: staticCity.name_en,
        success: true,
        warning: 'No online pharmacy data found',
        processed: 0, created: 0, updated: 0, errors: 0,
        existingCount: beforeCount, onlineCount: 0,
        searchStats,
        message: `No online pharmacies found for ${staticCity.name_en}`,
        recommendations: [
          'Add/verify provider API keys (Google/HERE/TomTom/FSQ)',
          'Increase sweep radius or H3 resolution',
          'Re-run with higher MAX_EXPANSION_SEEDS'
        ]
      }, `No online pharmacies found for ${staticCity.name_en}`))
    }

    // Persist
    let created=0, updated=0, errors=0
    const processedPharmacies=[], errorLog=[], duplicates=[]
    const onlineCount = onlinePharmacies.length

    for (const src of onlinePharmacies){
      try{
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

        if (!pharmacyData.lat || !pharmacyData.lng) { errors++; continue }
        if (!pharmacyData.name_me) { errors++; continue }
        if (!pharmacyData.address) { errors++; continue }

        let existing = null
        if (pharmacyData.google_place_id){
          existing = await Pharmacy.findOne({ where: { google_place_id: pharmacyData.google_place_id } })
        }
        if (!existing){
          existing = await Pharmacy.findOne({
            where: { city_id: city.id, name_me: pharmacyData.name_me }
          })
        }
        if (!existing){
          const dLat = 0.001, dLng = 0.001
          const near = await Pharmacy.findAll({
            where: {
              city_id: city.id,
              lat: { [Op.between]: [pharmacyData.lat - dLat, pharmacyData.lat + dLat] },
              lng: { [Op.between]: [pharmacyData.lng - dLng, pharmacyData.lng + dLng] }
            }
          })
          if (near.length) existing = near[0]
        }

        if (existing){
          const old = existing.toJSON()
          const changes=[]
          for (const k of Object.keys(pharmacyData)){
            if (k==='last_online_sync') continue
            if (old[k] !== pharmacyData[k]) changes.push({ field:k, old:old[k], new:pharmacyData[k] })
          }
          await existing.update(pharmacyData)
          updated++
          processedPharmacies.push({
            id: existing.id,
            name: pharmacyData.name_me,
            action: 'updated',
            matchMethod: pharmacyData.google_place_id && old.google_place_id === pharmacyData.google_place_id ? 'google_place_id'
              : (Math.abs(old.lat - pharmacyData.lat) < 0.001 && Math.abs(old.lng - pharmacyData.lng) < 0.001 ? 'coordinates' : 'name_match'),
            google_place_id: pharmacyData.google_place_id,
            reliability: src.reliability_score || 70,
            requiresReview: (src.reliability_score || 70) < 70,
            changes
          })
        } else {
          const newPh = await Pharmacy.create(pharmacyData)
          created++
          processedPharmacies.push({
            id: newPh.id,
            name: pharmacyData.name_me,
            action: 'created',
            google_place_id: pharmacyData.google_place_id,
            reliability: src.reliability_score || 70,
            requiresReview: (src.reliability_score || 70) < 70,
            changes: []
          })
        }
      } catch(e){
        errors++
        errorLog.push({ pharmacy: src.name_me || 'Unknown', error: e.message, google_place_id: src.google_place_id || null })
      }
    }

    const processed = created + updated
    const duration = Math.round((Date.now()-syncStart)/1000)
    const afterCount = await Pharmacy.count({ where: { city_id: city.id, active: true } })

    const result = {
      citySlug,
      cityName: staticCity.name_en,
      success: true,
      syncDuration: duration,
      timestamp: new Date().toISOString(),
      processed, created, updated, skipped: 0, errors,
      coverage: {
        before: beforeCount,
        after: afterCount,
        improvement: beforeCount>0 ? Math.round(((afterCount-beforeCount)/beforeCount)*100)+'%' : 'New data',
        onlineDiscovered: onlineCount,
        successfullyProcessed: processed,
        processingSuccess: Math.round((processed/onlineCount)*100)+'%',
        duplicatesDetected: duplicates.length,
        errorRate: Math.round((errors/onlineCount)*100)+'%'
      },
      quality: {
        highQuality: processedPharmacies.filter(p => (p.reliability||0) >= 70).length,
        mediumQuality: processedPharmacies.filter(p => (p.reliability||0) >= 50 && (p.reliability||0) < 70).length,
        requiresReview: processedPharmacies.filter(p => p.requiresReview).length,
        withGoogleId: processedPharmacies.filter(p => p.google_place_id).length,
        avgReliability: processedPharmacies.length ? Math.round(processedPharmacies.reduce((s,p)=>s+(p.reliability||0),0)/processedPharmacies.length) : 0
      },
      pharmacies: processedPharmacies,
      searchStats: {
        ...searchStats,
        totalProcessed: processed,
        accuracyRate: onlineCount ? Math.round((processed/onlineCount)*100) : 0
      },
      errorLog,
      duplicates,
      message: `Successfully synced ${processed} pharmacies for ${staticCity.name_en}`,
      recommendations: generateRecommendations(created, updated, errors, onlineCount),
      searchSummary: {
        strategiesUsed: 5,
        uniquePlacesFound: onlineCount,
        pharmacyRelatedPlaces: onlineCount,
        apiCallsSuccessful: true,
        processingTimeSeconds: duration
      }
    }

    return res.json(createResponse(result, result.message))
  } catch (error) {
    const duration = Math.round((Date.now()-syncStart)/1000)
    return res.status(500).json(createErrorResponse('Pharmacy sync failed', {
      error: error.message,
      citySlug: req.body?.citySlug,
      syncDuration: duration,
      timestamp: new Date().toISOString()
    }))
  }
}

// ----------------- Status endpoints -----------------
const getSyncableCities = async (_req, res) => {
  try {
    const cities = getAllCities()
    res.json(createResponse(cities, 'Syncable cities retrieved successfully'))
  } catch (error) {
    res.status(500).json(createErrorResponse('Failed to fetch cities', error.message))
  }
}
const getSyncStatus = async (_req, res) => {
  try {
    const cities = await City.findAll({
      include: [{ model: Pharmacy, as: 'pharmacies', where: { active: true }, required: false }]
    })
    const status = cities.map(c => ({
      citySlug: c.slug,
      cityName: c.name_en,
      pharmacyCount: c.pharmacies ? c.pharmacies.length : 0,
      lastSync: c.pharmacies && c.pharmacies.length
        ? c.pharmacies.map(p=>p.last_online_sync).filter(Boolean).sort().slice(-1)[0] || null
        : null,
      multiSource: true
    }))
    res.json(createResponse(status, 'Multi-source sync status retrieved successfully'))
  } catch (error) {
    res.status(500).json(createErrorResponse('Failed to fetch sync status', error.message))
  }
}

// ----------------- Exports -----------------
module.exports = {
  syncCityPharmacyData,
  getSyncableCities,
  getSyncStatus,
  fetchOnlinePharmacyData
}
