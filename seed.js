require('dotenv').config()
const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'apoteka24',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
})

async function createTables() {
  try {
    // Read and execute database schema
    const schema = fs.readFileSync(path.join(__dirname, '../database.sql'), 'utf8')
    await pool.query(schema)
    console.log('✅ Database schema created successfully')
  } catch (error) {
    console.error('❌ Error creating schema:', error.message)
  }
}

async function seedCities() {
  try {
    const cities = [
      { slug: 'podgorica', name_me: 'Подгорица', name_en: 'Podgorica' },
      { slug: 'niksic', name_me: 'Никшић', name_en: 'Nikšić' },
      { slug: 'pljevlja', name_me: 'Пљевља', name_en: 'Pljevlja' },
      { slug: 'bijelo-polje', name_me: 'Бијело Поље', name_en: 'Bijelo Polje' },
      { slug: 'cetinje', name_me: 'Цетиње', name_en: 'Cetinje' },
      { slug: 'bar', name_me: 'Бар', name_en: 'Bar' },
      { slug: 'herceg-novi', name_me: 'Херцег Нови', name_en: 'Herceg Novi' },
      { slug: 'berane', name_me: 'Беране', name_en: 'Berane' },
      { slug: 'budva', name_me: 'Будва', name_en: 'Budva' },
      { slug: 'ulcinj', name_me: 'Улцињ', name_en: 'Ulcinj' },
      { slug: 'tivat', name_me: 'Тиват', name_en: 'Tivat' },
      { slug: 'rozaje', name_me: 'Рожаје', name_en: 'Rozaje' },
      { slug: 'kotor', name_me: 'Котор', name_en: 'Kotor' },
      { slug: 'mojkovac', name_me: 'Мојковац', name_en: 'Mojkovac' },
      { slug: 'plav', name_me: 'Плав', name_en: 'Plav' },
      { slug: 'kolasin', name_me: 'Колашин', name_en: 'Kolašin' },
      { slug: 'zabljak', name_me: 'Жабљак', name_en: 'Žabljak' },
      { slug: 'pluzine', name_me: 'Плужине', name_en: 'Plužine' },
      { slug: 'savnik', name_me: 'Шавник', name_en: 'Šavnik' },
      { slug: 'andrijevica', name_me: 'Андријевица', name_en: 'Andrijevica' },
    ]

    for (const city of cities) {
      await pool.query(
        'INSERT INTO cities (slug, name_me, name_en) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING',
        [city.slug, city.name_me, city.name_en]
      )
    }
    console.log('✅ Cities seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding cities:', error.message)
  }
}

async function seedPharmacies() {
  try {
    // Get Podgorica city ID
    const podgoricaResult = await pool.query("SELECT id FROM cities WHERE slug = 'podgorica'")
    const podgoricaId = podgoricaResult.rows[0]?.id

    if (!podgoricaId) {
      console.log('❌ Podgorica city not found')
      return
    }

    const pharmacies = [
      {
        name_me: 'Апотека Центар',
        name_en: 'Pharmacy Center',
        address: 'Херцеговачка 24, Подгорица',
        lat: 42.4415,
        lng: 19.2621,
        is_24h: true,
        open_sunday: true,
        hours_monfri: '00:00–24:00',
        hours_sat: '00:00–24:00',
        hours_sun: '00:00–24:00',
        phone: '+382 20 123 456',
        website: 'https://apoteka-centar.me'
      },
      {
        name_me: 'Апотека Здравље',
        name_en: 'Health Pharmacy',
        address: 'Слободе 47, Подгорица',
        lat: 42.4425,
        lng: 19.2635,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '09:00–17:00',
        hours_sun: '10:00–14:00',
        phone: '+382 20 234 567',
        website: null
      },
      {
        name_me: 'Апотека Медика',
        name_en: 'Medica Pharmacy',
        address: 'Булевар Револуције 8, Подгорица',
        lat: 42.4435,
        lng: 19.2645,
        is_24h: false,
        open_sunday: false,
        hours_monfri: '07:30–21:00',
        hours_sat: '08:00–16:00',
        hours_sun: 'Затворено',
        phone: '+382 20 345 678',
        website: 'https://medica.me'
      },
      {
        name_me: 'Апотека Плус',
        name_en: 'Plus Pharmacy',
        address: 'Треница бб, Подгорица',
        lat: 42.4445,
        lng: 19.2655,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '09:00–15:00',
        hours_sun: '10:00–13:00',
        phone: '+382 20 456 789',
        website: null
      },
      {
        name_me: 'Апотека Монтефарм',
        name_en: 'Montefarm Pharmacy',
        address: 'Октобарске револуције 92, Подгорица',
        lat: 42.4455,
        lng: 19.2665,
        is_24h: true,
        open_sunday: true,
        hours_monfri: '00:00–24:00',
        hours_sat: '00:00–24:00',
        hours_sun: '00:00–24:00',
        phone: '+382 20 567 890',
        website: 'https://montefarm.me'
      }
    ]

    for (const pharmacy of pharmacies) {
      await pool.query(`
        INSERT INTO pharmacies (city_id, name_me, name_en, address, lat, lng, is_24h, open_sunday, hours_monfri, hours_sat, hours_sun, phone, website)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        podgoricaId,
        pharmacy.name_me,
        pharmacy.name_en,
        pharmacy.address,
        pharmacy.lat,
        pharmacy.lng,
        pharmacy.is_24h,
        pharmacy.open_sunday,
        pharmacy.hours_monfri,
        pharmacy.hours_sat,
        pharmacy.hours_sun,
        pharmacy.phone,
        pharmacy.website
      ])
    }
    console.log('✅ Pharmacies seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding pharmacies:', error.message)
  }
}

async function seedAds() {
  try {
    const ads = [
      {
        name: 'Farmacia Online - Najbolje cijene u Crnoj Gori',
        image_url: 'https://via.placeholder.com/300x150/8168f0/ffffff?text=Farmacia+Online',
        target_url: 'https://farmacia.me',
        weight: 3
      },
      {
        name: 'Zdravlje Plus - Dostava lijekova na kućnu adresu',
        image_url: 'https://via.placeholder.com/300x150/31c2a7/ffffff?text=Zdravlje+Plus',
        target_url: 'https://zdravlje-plus.me',
        weight: 2
      },
      {
        name: 'MediCare Montenegro - 24/7 medicinska pomoć',
        image_url: 'https://via.placeholder.com/300x150/f08c1a/ffffff?text=MediCare+24%2F7',
        target_url: 'https://medicare.me',
        weight: 1
      }
    ]

    for (const ad of ads) {
      await pool.query(`
        INSERT INTO ads (name, image_url, target_url, weight)
        VALUES ($1, $2, $3, $4)
      `, [ad.name, ad.image_url, ad.target_url, ad.weight])
    }
    console.log('✅ Ads seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding ads:', error.message)
  }
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...')

    await createTables()
    await seedCities()
    await seedPharmacies()
    await seedAds()

    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message)
  } finally {
    await pool.end()
  }
}

main()