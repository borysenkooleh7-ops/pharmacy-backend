// scripts/bootstrapPharmacies.js
/* eslint-disable camelcase */
'use strict';

const fs = require('fs');
const path = require('path');

const { Pharmacy, City } = require('../db/models');
const { getAllCities, getCityBySlug } = require('../data/cities');

// ⬇️ Direct import of the function you created first
const { fetchOnlinePharmacyData } = require('../controllers/onlineDataController'); // <-- change path if needed

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function upsertPharmacy(cityId, p) {
  const pharmacyData = {
    name_me: p.name_me,
    name_en: p.name_en,
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
    reliability_score: Math.min(100, Math.max(0, Math.round(p.reliability_score || 50))),
    city_id: cityId,
    active: true,
    last_online_sync: new Date()
  };

  let existing = null;
  if (pharmacyData.google_place_id) {
    existing = await Pharmacy.findOne({ where: { google_place_id: pharmacyData.google_place_id } });
  }
  if (!existing) {
    existing = await Pharmacy.findOne({ where: { city_id: cityId, name_me: pharmacyData.name_me } });
  }

  if (existing) {
    await existing.update(pharmacyData);
    return { id: existing.id, action: 'updated', data: pharmacyData };
  }
  const created = await Pharmacy.create(pharmacyData);
  return { id: created.id, action: 'created', data: pharmacyData };
}

async function ensureCity(slug) {
  const staticCity = getCityBySlug(slug);
  if (!staticCity) throw new Error(`City not found in static list: ${slug}`);
  let city = await City.findOne({ where: { slug } });
  if (!city) {
    city = await City.create({ slug: staticCity.slug, name_me: staticCity.name_me, name_en: staticCity.name_en });
  }
  return city;
}

async function bootstrapPharmacies({ exportDir = 'exports', delayMsBetweenCities = 1500 } = {}) {
  const t0 = Date.now();
  const cities = getAllCities();
  const byCity = [];
  let grandCreated = 0, grandUpdated = 0, grandErrors = 0, grandOnline = 0;

  for (const c of cities) {
    const slug = c.slug;
    const cityName = c.name_en;
    const start = Date.now();
    let created = 0, updated = 0, errors = 0, onlineCount = 0;
    let lines = [];

    try {
      const city = await ensureCity(slug);
      const found = await fetchOnlinePharmacyData(slug);
      onlineCount = Array.isArray(found) ? found.length : 0;
      grandOnline += onlineCount;

      for (let i = 0; i < onlineCount; i++) {
        const p = found[i];
        try {
          const res = await upsertPharmacy(city.id, p);
          if (res.action === 'created') created += 1; else updated += 1;

          const line = [
            slug,
            res.action.toUpperCase(),
            (p.name_me || '').replace(/\s+/g, ' ').trim(),
            `${Number(p.lat)},${Number(p.lng)}`,
            (p.address || '').replace(/\s+/g, ' ').trim(),
            p.phone || '',
            p.website || '',
            p.google_place_id || '',
            `R=${Math.round(p.reliability_score || 0)}`
          ].join(' | ');
          lines.push(line);
        } catch (e) {
          errors += 1;
          lines.push(`${slug} | ERROR | ${(p.name_me || '').trim()} | ${e.message}`);
        }
      }
    } catch (e) {
      errors += 1;
      byCity.push({
        citySlug: slug,
        cityName,
        onlineDiscovered: 0,
        created, updated, errors,
        durationSec: Math.round((Date.now() - start) / 1000),
        message: `Failed: ${e.message}`
      });
      grandErrors += errors;
      continue;
    }

    grandCreated += created;
    grandUpdated += updated;
    grandErrors += errors;

    byCity.push({
      citySlug: slug,
      cityName,
      onlineDiscovered: onlineCount,
      created, updated, errors,
      durationSec: Math.round((Date.now() - start) / 1000)
    });

    await writeCityLines(exportDir, slug, lines);
    await sleep(delayMsBetweenCities);
  }

  const summary = buildSummaryText({
    totalCities: cities.length,
    grandCreated, grandUpdated, grandErrors, grandOnline, byCity,
    durationSec: Math.round((Date.now() - t0) / 1000)
  });
  const exportPath = await writeSummary(exportDir, summary);

  return { exportPath, summary, byCity };
}

function buildSummaryText({ totalCities, grandCreated, grandUpdated, grandErrors, grandOnline, byCity, durationSec }) {
  const lines = [];
  lines.push(`# Pharmacy bootstrap summary`);
  lines.push(`Timestamp: ${new Date().toISOString()}`);
  lines.push(`Cities: ${totalCities}`);
  lines.push(`Discovered online: ${grandOnline}`);
  lines.push(`Created: ${grandCreated}`);
  lines.push(`Updated: ${grandUpdated}`);
  lines.push(`Errors: ${grandErrors}`);
  lines.push(`Duration(s): ${durationSec}`);
  lines.push('');
  lines.push('## Per-city');
  byCity.forEach(c => {
    lines.push([
      c.citySlug,
      `online=${c.onlineDiscovered}`,
      `created=${c.created}`,
      `updated=${c.updated}`,
      `errors=${c.errors}`,
      `t=${c.durationSec}s`,
      c.message ? `msg=${c.message}` : ''
    ].filter(Boolean).join(' | '));
  });
  lines.push('');
  lines.push('Note: Detailed per-city lines are saved in exports/city_logs/*.txt');
  return lines.join('\n');
}

async function writeCityLines(exportDir, slug, lines) {
  const dir = path.join(process.cwd(), exportDir, 'city_logs');
  await fs.promises.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${slug}.txt`);
  await fs.promises.writeFile(file, lines.join('\n') + '\n', { flag: 'a', encoding: 'utf8' });
}

async function writeSummary(exportDir, text) {
  const dir = path.join(process.cwd(), exportDir);
  await fs.promises.mkdir(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(dir, `pharmacies_summary_${ts}.txt`);
  await fs.promises.writeFile(file, text, 'utf8');
  return file;
}

module.exports = { bootstrapPharmacies };

if (require.main === module) {
  bootstrapPharmacies()
    .then(({ exportPath }) => { console.log(`Export written: ${exportPath}`); process.exit(0); })
    .catch(err => { console.error(`Bootstrap failed: ${err.message}`); process.exit(1); });
}
