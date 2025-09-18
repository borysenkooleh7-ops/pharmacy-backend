'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get all cities and create a map
    const cities = await queryInterface.sequelize.query(
      `SELECT id, slug FROM cities;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const cityMap = {};
    cities.forEach(city => {
      cityMap[city.slug] = city.id;
    });

    await queryInterface.bulkInsert('pharmacies', [
      // PODGORICA - Capital City
      {
        city_id: cityMap['podgorica'],
        name_me: 'Монтефарм Слобода',
        name_en: 'Montefarm Sloboda',
        address: 'ул. Слободе бр. 24, Подгорица',
        lat: 42.4415,
        lng: 19.2621,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '07:00–22:00',
        hours_sat: '07:00–22:00',
        hours_sun: '07:00–22:00',
        phone: '+382 67 148 471',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: cityMap['podgorica'],
        name_me: 'Монтефарм Крушевац',
        name_en: 'Montefarm Kruševac',
        address: 'Бул. Св. Петра Цетињског бр. 45/а, Подгорица',
        lat: 42.4500,
        lng: 19.2700,
        is_24h: true,
        open_sunday: true,
        hours_monfri: '24/7',
        hours_sat: '24/7',
        hours_sun: '24/7',
        phone: '+382 67 148 331',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: cityMap['podgorica'],
        name_me: 'БЕНУ Цвијетна',
        name_en: 'BENU Cvijetna',
        address: 'ул. Критског одреда 4/1, Подгорица',
        lat: 42.4425,
        lng: 19.2635,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–16:00',
        hours_sun: '09:00–15:00',
        phone: '+382 20 664 400',
        website: 'https://benu.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: cityMap['podgorica'],
        name_me: 'БЕНУ Моравска',
        name_en: 'BENU Moravska',
        address: 'Моравска 22, Подгорица',
        lat: 42.4390,
        lng: 19.2610,
        is_24h: true,
        open_sunday: true,
        hours_monfri: '24/7',
        hours_sat: '24/7',
        hours_sun: '24/7',
        phone: '+382 20 245 205',
        website: 'https://benu.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // BUDVA
      {
        city_id: cityMap['budva'],
        name_me: 'Монтефарм Роса',
        name_en: 'Montefarm Rosa',
        address: '13. јула бр. 7, Будва',
        lat: 42.2868,
        lng: 18.8349,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–21:00',
        hours_sat: '08:00–20:00',
        hours_sun: '09:00–18:00',
        phone: '+382 33 402 502',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // BAR
      {
        city_id: cityMap['bar'],
        name_me: 'Монтефарм Центар',
        name_en: 'Montefarm Centar',
        address: 'Јововића пут бб, Бар',
        lat: 42.0930,
        lng: 19.0940,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–20:00',
        hours_sun: '09:00–17:00',
        phone: '+382 30 347 202',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // HERCEG NOVI
      {
        city_id: cityMap['herceg-novi'],
        name_me: 'Монтефарм Игало',
        name_en: 'Montefarm Igalo',
        address: 'Игало, Херцег Нови',
        lat: 42.4590,
        lng: 18.5090,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 31 658 116',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // NIKSIC
      {
        city_id: cityMap['niksic'],
        name_me: 'Монтефарм Никшић',
        name_en: 'Montefarm Nikšić',
        address: 'Трг Краља Николе, Никшић',
        lat: 42.7731,
        lng: 18.9446,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 40 213 585',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // PLJEVLJA
      {
        city_id: cityMap['pljevlja'],
        name_me: 'Монтефарм Пљевља',
        name_en: 'Montefarm Pljevlja',
        address: 'Пљевља',
        lat: 43.3561,
        lng: 19.3584,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 52 323 145',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // KOTOR
      {
        city_id: cityMap['kotor'],
        name_me: 'Монтефарм Стари Град',
        name_en: 'Montefarm Stari Grad',
        address: 'Трг од Оружја бб, Котор',
        lat: 42.4242,
        lng: 18.7712,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 32 322 567',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // TIVAT
      {
        city_id: cityMap['tivat'],
        name_me: 'Монтефарм Рива',
        name_en: 'Montefarm Riva',
        address: 'Перашка улица бб, Сељано, Тиват',
        lat: 42.4300,
        lng: 18.6950,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 32 663 318',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // CETINJE
      {
        city_id: cityMap['cetinje'],
        name_me: 'Монтефарм Јово Дреч',
        name_en: 'Montefarm Jovo Dreč',
        address: 'Његошева 17, Цетиње',
        lat: 42.3911,
        lng: 18.9217,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 41 231 456',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ULCINJ
      {
        city_id: cityMap['ulcinj'],
        name_me: 'Монтефарм Јадран',
        name_en: 'Montefarm Jadran',
        address: 'Јадран, Улцињ',
        lat: 41.9295,
        lng: 19.2122,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 30 412 100',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // BERANE
      {
        city_id: cityMap['berane'],
        name_me: 'Апотека Теа Медика Беране',
        name_en: 'Tea Medica Berane',
        address: 'Мустафе Реџепагића бб, Беране',
        lat: 42.8451,
        lng: 19.8704,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 51 234 567',
        website: 'https://teamedica.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // BIJELO POLJE
      {
        city_id: cityMap['bijelo-polje'],
        name_me: 'Апотека Теа Медика Бијело Поље',
        name_en: 'Tea Medica Bijelo Polje',
        address: '13. јула бб, Бијело Поlje',
        lat: 43.0311,
        lng: 19.747,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 50 431 234',
        website: 'https://teamedica.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // MOJKOVAC
      {
        city_id: cityMap['mojkovac'],
        name_me: 'Монтефарм Фармакон',
        name_en: 'Montefarm Farmakon',
        address: 'Мојковац',
        lat: 42.9609,
        lng: 19.5837,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 50 471 100',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // KOLASIN
      {
        city_id: cityMap['kolasin'],
        name_me: 'Монтефарм Ремедија',
        name_en: 'Montefarm Remedija',
        address: 'Колашин',
        lat: 42.8226,
        lng: 19.5213,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 20 864 100',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // PLAV
      {
        city_id: cityMap['plav'],
        name_me: 'Монтефарм Здравље',
        name_en: 'Montefarm Zdravlje',
        address: 'Плав',
        lat: 42.5989,
        lng: 19.9483,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 51 251 200',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ROZAJE
      {
        city_id: cityMap['rozaje'],
        name_me: 'Апотека Рожаје',
        name_en: 'Pharmacy Rožaje',
        address: 'Маршала Тита бб, Рожаје',
        lat: 42.8409,
        lng: 20.1678,
        is_24h: false,
        open_sunday: false,
        hours_monfri: '08:00–18:00',
        hours_sat: '08:00–16:00',
        hours_sun: 'Затворено',
        phone: '+382 51 271 234',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // DANILOVGRAD
      {
        city_id: cityMap['danilovgrad'],
        name_me: 'Монтефарм Хигија',
        name_en: 'Montefarm Higija',
        address: 'Данииловград',
        lat: 42.5469,
        lng: 19.1069,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 20 814 100',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ZABLJAK
      {
        city_id: cityMap['zabljak'],
        name_me: 'Медикор Жабљак',
        name_en: 'Medicor Žabljak',
        address: 'Жабљак',
        lat: 43.1547,
        lng: 19.1189,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 52 361 100',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('pharmacies', null, {});
  }
};