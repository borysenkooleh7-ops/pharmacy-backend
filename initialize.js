const { sequelize } = require('./db/models');
const { Pharmacy, City } = require('./db/models');
const { getAllCities } = require('./data/cities');
const axios = require('axios');
const cheerio = require('cheerio');
const pdf = require('pdf-parse');
const h3 = require('h3-js');
const fs = require('fs');
const path = require('path');

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

// Logging utilities
let logStream = null;
let logFilePath = null;

function initializeLogging() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  logFilePath = path.join(__dirname, 'logs', `pharmacy-init-${timestamp}.log`);

  // Create logs directory if it doesn't exist
  const logDir = path.dirname(logFilePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  logStream = fs.createWriteStream(logFilePath, { flags: 'w' });

  // Write header
  logToFile('='.repeat(80));
  logToFile('PHARMACY INITIALIZATION LOG');
  logToFile(`Started: ${new Date().toISOString()}`);
  logToFile(`Process ID: ${process.pid}`);
  logToFile('='.repeat(80));
  logToFile('');
}

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}`;

  // Write to console
  console.log(message);

  // Write to file
  if (logStream) {
    logStream.write(logLine + '\n');
  }
}

function closeLogging() {
  if (logStream) {
    logToFile('');
    logToFile('='.repeat(80));
    logToFile('INITIALIZATION COMPLETED');
    logToFile(`Ended: ${new Date().toISOString()}`);
    logToFile(`Log saved to: ${logFilePath}`);
    logToFile('='.repeat(80));

    logStream.end();
    logStream = null;
  }
}

async function fetchOSMPharmacies(city) {
  try {
    logToFile(`  🔍 OSM: Starting query for ${city.name_me}...`);

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"]["addr:city"~"${city.name_me}",i];
        way["amenity"="pharmacy"]["addr:city"~"${city.name_me}",i];
        relation["amenity"="pharmacy"]["addr:city"~"${city.name_me}",i];
      );
      out center;
    `;

    logToFile(`  🌐 OSM: Sending request to Overpass API...`);
    const startTime = Date.now();

    const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 30000
    });

    const responseTime = Date.now() - startTime;
    logToFile(`  ⚡ OSM: API response received in ${responseTime}ms`);
    logToFile(`  📊 OSM: Processing ${response.data.elements.length} raw elements...`);

    const pharmacies = response.data.elements.map(element => {
      const tags = element.tags || {};
      let lat, lng;

      if (element.type === 'node') {
        lat = element.lat;
        lng = element.lon;
      } else if (element.center) {
        lat = element.center.lat;
        lng = element.center.lon;
      } else {
        return null;
      }

      return {
        source: 'osm',
        name: tags.name || tags['name:me'] || tags['name:en'] || 'Apoteka',
        address: tags['addr:street'] ?
          `${tags['addr:street']} ${tags['addr:housenumber'] || ''}`.trim() :
          tags['addr:full'] || 'Nepoznata adresa',
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        phone: tags.phone || null,
        website: tags.website || null,
        opening_hours: tags.opening_hours || null,
        city: city.name_me,
        osm_id: element.id
      };
    }).filter(Boolean);

    const validPharmacies = pharmacies.filter(p => p.lat && p.lng);
    logToFile(`  ✅ OSM: Found ${pharmacies.length} pharmacies (${validPharmacies.length} with coordinates) for ${city.name_me}`);

    if (pharmacies.length > 0) {
      logToFile(`  📍 OSM: Sample pharmacy: "${pharmacies[0].name}" at ${pharmacies[0].address}`);
    }

    return pharmacies;
  } catch (error) {
    logToFile(`  ❌ OSM Error for ${city.name_me}: ${error.message}`);
    return [];
  }
}

async function fetchGooglePharmacies(city) {
  const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (!GOOGLE_API_KEY) {
    logToFile(`  ⚠️ Google Maps API key not found, skipping Google search for ${city.name_me}`);
    return [];
  }

  try {
    logToFile(`  🔍 Google: Starting search for pharmacies in ${city.name_me}...`);
    const pharmacies = [];
    let nextPageToken = null;
    let pageCount = 0;

    do {
      pageCount++;
      logToFile(`  🌐 Google: Making API request (page ${pageCount})...`);

      const params = new URLSearchParams({
        query: `pharmacy in ${city.name_me} Montenegro`,
        key: GOOGLE_API_KEY,
        fields: 'place_id,name,formatted_address,geometry,rating,opening_hours,formatted_phone_number,website'
      });

      if (nextPageToken) {
        params.append('pagetoken', nextPageToken);
        logToFile(`  📄 Google: Using page token for additional results...`);
      }

      const startTime = Date.now();
      const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`, {
        timeout: 15000
      });

      const responseTime = Date.now() - startTime;
      logToFile(`  ⚡ Google: API response received in ${responseTime}ms (status: ${response.data.status})`);

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        logToFile(`  ❌ Google API error for ${city.name_me}: ${response.data.status} - ${response.data.error_message}`);
        break;
      }

      if (response.data.results && response.data.results.length > 0) {
        logToFile(`  📊 Google: Processing ${response.data.results.length} places from this page...`);

        for (const place of response.data.results) {
          pharmacies.push({
            source: 'google',
            name: place.name,
            address: place.formatted_address,
            lat: place.geometry?.location?.lat,
            lng: place.geometry?.location?.lng,
            phone: place.formatted_phone_number || null,
            website: place.website || null,
            opening_hours: place.opening_hours?.weekday_text?.join('; ') || null,
            rating: place.rating || null,
            google_place_id: place.place_id,
            city: city.name_me
          });
        }
      }

      nextPageToken = response.data.next_page_token;
      if (nextPageToken) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } while (nextPageToken);

    logToFile(`  ✅ Google: Found ${pharmacies.length} pharmacies for ${city.name_me}`);
    return pharmacies;
  } catch (error) {
    logToFile(`  ❌ Google Error for ${city.name_me}: ${error.message}`);
    return [];
  }
}

async function fetchFZOPharmacies() {
  try {
    const fzoUrl = 'https://www.fzcg.me/images/stories/2024/10/Registar%20apoteka%2031.10.2024.pdf';
    const response = await axios.get(fzoUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    const pdfData = await pdf(response.data);
    const text = pdfData.text;

    const pharmacies = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.toLowerCase().includes('apoteka') || line.toLowerCase().includes('pharmacy')) {
        const addressLine = lines[i + 1];
        const cityLine = lines[i + 2];

        if (addressLine && cityLine) {
          pharmacies.push({
            source: 'fzo',
            name: line,
            address: addressLine,
            city: cityLine,
            lat: null,
            lng: null,
            phone: null,
            website: null,
            opening_hours: null
          });
        }
      }
    }

    logToFile(`  ✅ FZO: Found ${pharmacies.length} pharmacies`);
    return pharmacies;
  } catch (error) {
    logToFile(`  ❌ FZO Error: ${error.message}`);
    return [];
  }
}

async function fetchMontefarmPharmacies() {
  try {
    const response = await axios.get('https://montefarm.me/apoteke', {
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const pharmacies = [];

    $('.pharmacy-location, .apoteka, .location').each((index, element) => {
      const $elem = $(element);
      const name = $elem.find('.name, .title, h3, h4').first().text().trim();
      const address = $elem.find('.address, .adresa').first().text().trim();
      const phone = $elem.find('.phone, .telefon').first().text().trim();

      if (name && address) {
        pharmacies.push({
          source: 'montefarm',
          name: name || 'Montefarm Apoteka',
          address: address,
          phone: phone || null,
          city: null,
          lat: null,
          lng: null,
          website: 'https://montefarm.me',
          opening_hours: null
        });
      }
    });

    logToFile(`  ✅ Montefarm: Found ${pharmacies.length} pharmacies`);
    return pharmacies;
  } catch (error) {
    logToFile(`  ❌ Montefarm Error: ${error.message}`);
    return [];
  }
}

function processOpeningHoursFromText(hoursText) {
  if (!hoursText || typeof hoursText !== 'string') {
    return {
      is_24h: false,
      open_sunday: false,
      hours_monfri: 'N/A',
      hours_sat: 'N/A',
      hours_sun: 'N/A'
    };
  }

  const normalizedHours = hoursText.toLowerCase();

  const is24h = normalizedHours.includes('24/7') ||
               normalizedHours.includes('24 sata') ||
               normalizedHours.includes('non-stop') ||
               normalizedHours.includes('0:00-24:00');

  if (is24h) {
    return {
      is_24h: true,
      open_sunday: true,
      hours_monfri: '24/7',
      hours_sat: '24/7',
      hours_sun: '24/7'
    };
  }

  const timePattern = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g;
  const matches = [...hoursText.matchAll(timePattern)];
  const defaultHours = matches.length > 0 ? matches[0][0] : '08:00-20:00';

  const openSunday = !normalizedHours.includes('zatvoreno') &&
                    !normalizedHours.includes('closed') &&
                    !normalizedHours.includes('ne radi');

  return {
    is_24h: false,
    open_sunday: openSunday,
    hours_monfri: defaultHours,
    hours_sat: defaultHours,
    hours_sun: openSunday ? defaultHours : 'Zatvoreno'
  };
}

function createPharmacyItem(pharmacy, cityId) {
  const hours = processOpeningHoursFromText(pharmacy.opening_hours);

  return {
    city_id: cityId,
    name_me: pharmacy.name || 'Apoteka',
    name_en: pharmacy.name || 'Pharmacy',
    address: pharmacy.address || 'Nepoznata adresa',
    lat: pharmacy.lat || 0,
    lng: pharmacy.lng || 0,
    is_24h: hours.is_24h,
    open_sunday: hours.open_sunday,
    hours_monfri: hours.hours_monfri,
    hours_sat: hours.hours_sat,
    hours_sun: hours.hours_sun,
    phone: pharmacy.phone,
    website: pharmacy.website,
    google_place_id: pharmacy.google_place_id,
    google_rating: pharmacy.rating,
    active: true
  };
}

function deduplicatePharmacies(pharmacies) {
  const DISTANCE_THRESHOLD = 50; // meters
  const unique = [];

  for (const pharmacy of pharmacies) {
    const isDuplicate = unique.some(existing => {
      if (!pharmacy.lat || !pharmacy.lng || !existing.lat || !existing.lng) {
        return false;
      }

      const distance = calculateDistance(
        pharmacy.lat, pharmacy.lng,
        existing.lat, existing.lng
      );

      return distance < DISTANCE_THRESHOLD;
    });

    if (!isDuplicate) {
      unique.push(pharmacy);
    }
  }

  return unique;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function initializePharmacyData() {
  // Initialize logging system
  initializeLogging();

  const startTime = Date.now();
  logToFile('🚀 Starting pharmacy database initialization...');

  const timeoutId = setTimeout(() => {
    logToFile('⏰ Initialization timeout reached (30 minutes)');
    closeLogging();
    process.exit(1);
  }, TIMEOUT_DURATION);

  try {
    await sequelize.authenticate();
    logToFile('✅ Database connection established');

    const existingCount = await Pharmacy.count();
    if (existingCount > 100) {
      logToFile(`📊 Database already has ${existingCount} pharmacies, skipping initialization`);
      clearTimeout(timeoutId);
      closeLogging();
      return;
    }

    const cities = getAllCities();
    let totalFound = 0;
    let totalSaved = 0;
    let totalErrors = 0;

    logToFile(`🏙️ Processing ${cities.length} cities in Montenegro...`);

    const fzoPharmacies = await fetchFZOPharmacies();
    const montefarmPharmacies = await fetchMontefarmPharmacies();
    logToFile(`📊 Found ${fzoPharmacies.length} FZO pharmacies and ${montefarmPharmacies.length} Montefarm pharmacies`);

    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      logToFile(`\n🏙️ [${i + 1}/${cities.length}] Processing ${city.name_me}...`);

      try {
        const [osmPharmacies, googlePharmacies] = await Promise.all([
          fetchOSMPharmacies(city),
          fetchGooglePharmacies(city)
        ]);

        logToFile(`  📋 Merging pharmacy data from all sources...`);
        let allPharmacies = [...osmPharmacies, ...googlePharmacies];
        logToFile(`  🔄 Initial merge: ${allPharmacies.length} pharmacies (OSM: ${osmPharmacies.length}, Google: ${googlePharmacies.length})`);

        const cityFzo = fzoPharmacies.filter(p =>
          p.city && p.city.toLowerCase().includes(city.name_me.toLowerCase())
        );
        const cityMontefarm = montefarmPharmacies.filter(p =>
          p.address && p.address.toLowerCase().includes(city.name_me.toLowerCase())
        );

        logToFile(`  📄 FZO filter: ${cityFzo.length} pharmacies found for ${city.name_me}`);
        logToFile(`  🏪 Montefarm filter: ${cityMontefarm.length} pharmacies found for ${city.name_me}`);

        const beforeDedup = allPharmacies.length + cityFzo.length + cityMontefarm.length;
        allPharmacies = [...allPharmacies, ...cityFzo, ...cityMontefarm];
        logToFile(`  🔧 Before deduplication: ${beforeDedup} total pharmacies`);

        allPharmacies = deduplicatePharmacies(allPharmacies);
        const duplicatesRemoved = beforeDedup - allPharmacies.length;
        logToFile(`  🎯 After deduplication: ${allPharmacies.length} unique pharmacies (removed ${duplicatesRemoved} duplicates)`);

        totalFound += allPharmacies.length;

        if (allPharmacies.length > 0) {
          logToFile(`  💾 Saving ${allPharmacies.length} pharmacies to database...`);
        }

        for (let j = 0; j < allPharmacies.length; j++) {
          const pharmacy = allPharmacies[j];
          try {
            const pharmacyData = createPharmacyItem(pharmacy, city.id);

            const [savedPharmacy, created] = await Pharmacy.findOrCreate({
              where: {
                name_me: pharmacyData.name_me,
                address: pharmacyData.address,
                city_id: city.id
              },
              defaults: pharmacyData
            });

            if (created) {
              totalSaved++;
              logToFile(`    ➕ [${j+1}/${allPharmacies.length}] Created: "${pharmacy.name}" at ${pharmacy.address}`);
            } else {
              logToFile(`    📝 [${j+1}/${allPharmacies.length}] Updated: "${pharmacy.name}" (already exists)`);
            }
          } catch (saveError) {
            totalErrors++;
            logToFile(`   ❌ Error saving pharmacy ${pharmacy.name}: ${saveError.message}`);
          }
        }

        logToFile(`   ✅ Processed ${city.name_me}: ${allPharmacies.length} found`);
      } catch (cityError) {
        totalErrors++;
        logToFile(`   ❌ Error processing ${city.name_me}: ${cityError.message}`);
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    const successRate = totalFound > 0 ? ((totalSaved / totalFound) * 100).toFixed(1) : 0;

    logToFile('\n📊 Initialization Summary:');
    logToFile(`   📝 Total pharmacies found: ${totalFound}`);
    logToFile(`   ✅ Total pharmacies saved: ${totalSaved}`);
    logToFile(`   ❌ Total errors: ${totalErrors}`);
    logToFile(`   ✅ Success rate: ${successRate}%`);
    logToFile(`   ⏱️ Duration: ${duration.toFixed(1)} seconds`);
    logToFile('🎉 Pharmacy database initialization completed!');

    clearTimeout(timeoutId);
    closeLogging();
  } catch (error) {
    clearTimeout(timeoutId);
    logToFile(`❌ Initialization failed: ${error.message}`);
    closeLogging();
    throw error;
  }
}

module.exports = { initializePharmacyData };