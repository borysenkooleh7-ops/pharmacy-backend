'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('pharmacies', [
      // Podgorica pharmacies (city_id: 1)
      {
        city_id: 1,
        name_me: 'Montefarm Centar',
        name_en: 'Montefarm Center',
        address: 'Slobode 17, Podgorica, Montenegro',
        lat: 42.4304,
        lng: 19.2594,
        is_24h: true,
        open_sunday: true,
        hours_monfri: '24/7',
        hours_sat: '24/7',
        hours_sun: '24/7',
        phone: '+382 20 123456',
        website: 'https://montefarm.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1,
        name_me: 'BENU Apoteka Delta City',
        name_en: 'BENU Pharmacy Delta City',
        address: 'Delta City, Podgorica, Montenegro',
        lat: 42.4404,
        lng: 19.2694,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00 - 22:00',
        hours_sat: '09:00 - 22:00',
        hours_sun: '10:00 - 20:00',
        phone: '+382 20 234567',
        website: 'https://benu.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1,
        name_me: 'Apoteka Zdravlje',
        name_en: 'Health Pharmacy',
        address: 'Njegoševa 25, Podgorica, Montenegro',
        lat: 42.4204,
        lng: 19.2494,
        is_24h: false,
        open_sunday: false,
        hours_monfri: '07:00 - 20:00',
        hours_sat: '08:00 - 16:00',
        hours_sun: 'Zatvoreno',
        phone: '+382 20 345678',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1,
        name_me: 'Farmacija Montenegro',
        name_en: 'Montenegro Pharmacy',
        address: 'Bulevar Svetog Petra Cetinjskog 1, Podgorica, Montenegro',
        lat: 42.4354,
        lng: 19.2544,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00 - 20:00',
        hours_sat: '09:00 - 18:00',
        hours_sun: '10:00 - 16:00',
        phone: '+382 20 456789',
        website: 'https://farmacija-montenegro.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Nikšić pharmacies (city_id: 2)
      {
        city_id: 2,
        name_me: 'Montefarm Nikšić',
        name_en: 'Montefarm Niksic',
        address: 'Trg Slobode 5, Nikšić, Montenegro',
        lat: 42.7731,
        lng: 18.9447,
        is_24h: false,
        open_sunday: false,
        hours_monfri: '08:00 - 19:00',
        hours_sat: '08:00 - 16:00',
        hours_sun: 'Zatvoreno',
        phone: '+382 40 123456',
        website: 'https://montefarm.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 2,
        name_me: 'Zegin Apoteka',
        name_en: 'Zegin Pharmacy',
        address: 'Njegoševa 10, Nikšić, Montenegro',
        lat: 42.7831,
        lng: 18.9547,
        is_24h: true,
        open_sunday: true,
        hours_monfri: '24/7',
        hours_sat: '24/7',
        hours_sun: '24/7',
        phone: '+382 40 234567',
        website: 'https://zegin.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pharmacies', null, {});
  }
};