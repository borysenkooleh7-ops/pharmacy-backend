'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('pharmacies', [
      // PODGORICA - Capital City (city_id: 1)
      {
        city_id: 1, // podgorica
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
        city_id: 1, // podgorica
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
        city_id: 1, // podgorica
        name_me: 'Монтефарм Сахат Кула',
        name_en: 'Montefarm Sahat Kula',
        address: 'Октобарске револуције бр. 40, Подгорица',
        lat: 42.4421,
        lng: 19.2640,
        is_24h: false,
        open_sunday: false,
        hours_monfri: '07:00–20:00',
        hours_sat: '07:00–20:00',
        hours_sun: 'Затворено',
        phone: '+382 67 148 615',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1, // podgorica
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
        city_id: 1, // podgorica
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
      {
        city_id: 1, // podgorica
        name_me: 'БЕНУ Франца Горња Горица',
        name_en: 'BENU Franca Gornja Gorica',
        address: "Франца д'Епере, Горња Горица, Подгорица",
        lat: 42.4550,
        lng: 19.2750,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 67 212 187',
        website: 'https://benu.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1, // podgorica
        name_me: 'Апотеке Максима Слободе',
        name_en: 'Apoteke Maxima Slobode',
        address: 'Улица Слободе 9, Подгорица',
        lat: 42.4420,
        lng: 19.2630,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–21:00',
        hours_sat: '08:00–21:00',
        hours_sun: '09:00–16:00',
        phone: '+382 69 308 800',
        website: 'https://www.apotekemaxima.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1, // podgorica
        name_me: 'Апотеке Максима Цетињски пут',
        name_en: 'Apoteke Maxima Cetinjski put',
        address: 'Цетињски пут бб, Подгорица',
        lat: 42.4350,
        lng: 19.2580,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–21:00',
        hours_sat: '08:00–21:00',
        hours_sun: '09:00–16:00',
        phone: '+382 69 308 800',
        website: 'https://www.apotekemaxima.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1, // podgorica
        name_me: 'Апотеке Максима Џорџа Вашингтона',
        name_en: 'Apoteke Maxima Džordža Vašingtona',
        address: 'Џорџа Вашингтона 76, Подгорица',
        lat: 42.4480,
        lng: 19.2720,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–21:00',
        hours_sat: '08:00–21:00',
        hours_sun: '09:00–16:00',
        phone: '+382 69 308 800',
        website: 'https://www.apotekemaxima.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1, // podgorica
        name_me: 'Апотеке Максима Идеа центар',
        name_en: 'Apoteke Maxima Idea centar',
        address: 'Ђуље Јованове бб (Идеа центар), Подгорица',
        lat: 42.4600,
        lng: 19.2800,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–21:00',
        hours_sat: '08:00–21:00',
        hours_sun: '09:00–16:00',
        phone: '+382 69 308 800',
        website: 'https://www.apotekemaxima.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1, // podgorica
        name_me: 'Теа Медика Светозара Марковића',
        name_en: 'Tea Medica Svetozara Markovića',
        address: 'Светозара Марковића 33, Подгорица',
        lat: 42.4400,
        lng: 19.2650,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 20 220 545',
        website: 'https://teamedica.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1, // podgorica
        name_me: 'Дрогерија Дама',
        name_en: 'Drogerija Dama',
        address: 'СКОЈ-а бр. 57, Подгорица',
        lat: 42.4430,
        lng: 19.2660,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 20 281 177',
        website: 'https://dama.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 1, // podgorica
        name_me: 'еАпотека.МЕ',
        name_en: 'eApoteka.ME',
        address: 'Подгорица',
        lat: 42.4415,
        lng: 19.2621,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 20 510 023',
        website: 'https://www.eapoteka.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // NIKŠIĆ - Second largest city (city_id: 14)
      {
        city_id: 14, // niksic
        name_me: 'Монтефарм Оногошт',
        name_en: 'Montefarm Onogošt',
        address: 'Новака Рамова 2, Никшић',
        lat: 42.7731,
        lng: 18.9447,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '07:00–21:00',
        hours_sat: '08:00–19:00',
        hours_sun: '09:00–16:00',
        phone: '+382 40 405 920',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 14, // niksic
        name_me: 'Монтефарм Гојко Дарић',
        name_en: 'Montefarm Gojko Darić',
        address: 'Љубљанска бб, Никшић',
        lat: 42.7720,
        lng: 18.9420,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '07:30–21:00',
        hours_sat: '08:00–19:00',
        hours_sun: '09:00–17:00',
        phone: '+382 40 405 920',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 14, // niksic
        name_me: 'Апотека Вигор',
        name_en: 'Vigor Pharmacy',
        address: 'Новака Рамова 3, Никшић',
        lat: 42.7741,
        lng: 18.9457,
        is_24h: false,
        open_sunday: false,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–16:00',
        hours_sun: 'Затворено',
        phone: '+382 40 212 814',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 14, // niksic
        name_me: 'Апотека Никшић',
        name_en: 'Nikšić Pharmacy',
        address: 'Његошева 18, Никшић',
        lat: 42.7751,
        lng: 18.9467,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '10:00–15:00',
        phone: '+382 40 213 279',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 14, // niksic
        name_me: 'Логос Фарм Никшић',
        name_en: 'Logos Pharm Nikšić',
        address: 'Никца од Ровиња бб, Никшић',
        lat: 42.7730,
        lng: 18.9430,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '07:00–22:00',
        hours_sat: '07:00–22:00',
        hours_sun: '08:00–14:00',
        phone: '+382 40 247 427',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 14, // niksic
        name_me: 'Здравствена Установа Латковић',
        name_en: 'Zdravstvena Ustanova Latković',
        address: 'В Пролетерске бб, Никшић',
        lat: 42.7760,
        lng: 18.9480,
        is_24h: false,
        open_sunday: false,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–16:00',
        hours_sun: 'Затворено',
        phone: '+382 40 213 455',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 14, // niksic
        name_me: 'Апотека М Медокард',
        name_en: 'Apoteka M Medocard',
        address: 'Ника Миљанића, Никшић',
        lat: 42.7740,
        lng: 18.9450,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 40 247 427',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 14, // niksic
        name_me: 'Апотека Милена и ми',
        name_en: 'Apoteka Milena i mi',
        address: 'Радоја Дакића 8, Никшић',
        lat: 42.7725,
        lng: 18.9435,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 69 329 670',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // HERCEG NOVI - Coastal city (city_id: 10)
      {
        city_id: 10, // herceg-novi
        name_me: 'Монтефарм Топла',
        name_en: 'Montefarm Topla',
        address: 'ул. Николе Љубибратића бр. 1, Херцег Нови',
        lat: 42.4513,
        lng: 18.5376,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '07:30–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 67 148 302',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 10, // herceg-novi
        name_me: 'Монтефарм Стари Град',
        name_en: 'Montefarm Stari Grad',
        address: 'Ул. 28. октобра бр. 1, Херцег Нови',
        lat: 42.4521,
        lng: 18.5390,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '07:30–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 67 148 513',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 10, // herceg-novi
        name_me: 'Монтефарм Игало',
        name_en: 'Montefarm Igalo',
        address: 'Сава Илића бр. 14, Игало',
        lat: 42.4623,
        lng: 18.5186,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 67 148 468',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 10, // herceg-novi
        name_me: 'Монтефарм Бијела',
        name_en: 'Montefarm Bijela',
        address: 'Бијела, Херцег Нови',
        lat: 42.4700,
        lng: 18.5500,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 31 331 900',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 10, // herceg-novi
        name_me: 'Апотеке Максима Портонови',
        name_en: 'Apoteke Maxima Portonovi',
        address: 'Портонови бб, Херцег Нови',
        lat: 42.4400,
        lng: 18.5200,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–21:00',
        hours_sat: '08:00–21:00',
        hours_sun: '09:00–16:00',
        phone: '+382 31 337 235',
        website: 'https://www.apotekemaxima.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // BAR - Coastal city (city_id: 4)
      {
        city_id: 4, // bar
        name_me: 'Монтефарм Острос',
        name_en: 'Montefarm Ostros',
        address: 'Омладинска бб, Бар',
        lat: 42.0951,
        lng: 19.0914,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '07:30–21:00',
        hours_sat: '08:00–19:00',
        hours_sun: '09:00–17:00',
        phone: '+382 30 405 930',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 4, // bar
        name_me: 'Монтефарм Тополица',
        name_en: 'Montefarm Topolica',
        address: 'Тополица, Бар',
        lat: 42.0800,
        lng: 19.1200,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 30 405 931',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 4, // bar
        name_me: 'Монтефарм Избор',
        name_en: 'Montefarm Izbor',
        address: 'Избор, Бар',
        lat: 42.1100,
        lng: 19.0700,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 30 405 932',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 4, // bar
        name_me: 'БЕНУ Бар Дом Здравља',
        name_en: 'BENU Bar Dom Zdravlja',
        address: 'Јована Томашевића, Пословни центар Г-9, Бар',
        lat: 42.0920,
        lng: 19.0890,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 30 314 209',
        website: 'https://benu.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 4, // bar
        name_me: 'Ивафарм',
        name_en: 'Ivapharm',
        address: 'Македонска А-2, Бар',
        lat: 42.0941,
        lng: 19.0904,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 30 201 291',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 4, // bar
        name_me: 'Апотека Горња Челуга',
        name_en: 'Apoteka Gornja Čeluga',
        address: 'Горња Челуга бб, Бар',
        lat: 42.1000,
        lng: 19.0800,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 30 683 899',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // BUDVA - Tourist center (city_id: 7)
      {
        city_id: 7, // budva
        name_me: 'Монтефарм Могрен',
        name_en: 'Montefarm Mogren',
        address: 'Могрен, Будва',
        lat: 42.2800,
        lng: 18.8300,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–22:00',
        hours_sat: '08:00–22:00',
        hours_sun: '09:00–20:00',
        phone: '+382 33 451 100',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 7, // budva
        name_me: 'Монтефарм Петровац',
        name_en: 'Montefarm Petrovac',
        address: 'Петровац, Будва',
        lat: 42.2050,
        lng: 18.9400,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 33 461 200',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 7, // budva
        name_me: 'БЕНУ Будва Аутобуска',
        name_en: 'BENU Budva Autobuska',
        address: 'Спортска Хала бр 11, Будва',
        lat: 42.2864,
        lng: 18.8361,
        is_24h: true,
        open_sunday: true,
        hours_monfri: '24/7',
        hours_sat: '24/7',
        hours_sun: '24/7',
        phone: '+382 33 455 082',
        website: 'https://benu.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 7, // budva
        name_me: 'БЕНУ Стари Град',
        name_en: 'BENU Stari Grad',
        address: 'Стјепана Митрова Љубише 21, Будва',
        lat: 42.2874,
        lng: 18.8371,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–21:00',
        hours_sat: '08:00–20:00',
        hours_sun: '09:00–18:00',
        phone: '+382 33 453 705',
        website: 'https://benu.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 7, // budva
        name_me: 'БЕНУ Доситејева',
        name_en: 'BENU Dositejeva',
        address: 'Доситејева 43, Будва',
        lat: 42.2850,
        lng: 18.8380,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 33 452 261',
        website: 'https://benu.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 7, // budva
        name_me: 'БЕНУ Јадрански Пут',
        name_en: 'BENU Jadranski Put',
        address: 'Јадрански пут бб, Будва',
        lat: 42.2900,
        lng: 18.8400,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 33 453 813',
        website: 'https://benu.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 7, // budva
        name_me: 'Теа Медика Будва',
        name_en: 'Tea Medica Budva',
        address: 'Жртава фашизма бб, Будва',
        lat: 42.2860,
        lng: 18.8350,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–21:00',
        hours_sat: '08:00–20:00',
        hours_sun: '09:00–18:00',
        phone: '+382 78 119 696',
        website: 'https://teamedica.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // KOTOR - UNESCO Heritage city (city_id: 12)
      {
        city_id: 12, // kotor
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
      {
        city_id: 12, // kotor
        name_me: 'Монтефарм Доброта',
        name_en: 'Montefarm Dobrota',
        address: 'Доброта, Котор',
        lat: 42.4350,
        lng: 18.7650,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 67 148 453',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 12, // kotor
        name_me: 'Монтефарм Рисан',
        name_en: 'Montefarm Risan',
        address: 'Рисан, Котор',
        lat: 42.5150,
        lng: 18.6950,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 67 148 453',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 12, // kotor
        name_me: 'Медикор Котор',
        name_en: 'Medicor Kotor',
        address: 'Котор',
        lat: 42.4250,
        lng: 18.7720,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 32 322 600',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // TIVAT - Airport city (city_id: 20)
      {
        city_id: 20, // tivat
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
      {
        city_id: 20, // tivat
        name_me: 'Медикор Тиват',
        name_en: 'Medicor Tivat',
        address: 'Тиват',
        lat: 42.4320,
        lng: 18.6970,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 32 671 200',
        website: null,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // CETINJE - Old Royal Capital (city_id: 2)
      {
        city_id: 2, // cetinje
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
      {
        city_id: 2, // cetinje
        name_me: 'Теа Медика Цетиње',
        name_en: 'Tea Medica Cetinje',
        address: 'Бајова бб, Цетиње',
        lat: 42.3921,
        lng: 18.9227,
        is_24h: false,
        open_sunday: false,
        hours_monfri: '08:00–18:00',
        hours_sat: '08:00–16:00',
        hours_sun: 'Затворено',
        phone: '+382 41 232 567',
        website: 'https://teamedica.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ULCINJ - Southernmost coastal city (city_id: 22)
      {
        city_id: 22, // ulcinj
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
      {
        city_id: 22, // ulcinj
        name_me: 'Монтефарм Владимир',
        name_en: 'Montefarm Vladimir',
        address: 'Владимир, Улцињ',
        lat: 41.9350,
        lng: 19.2200,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–20:00',
        hours_sat: '08:00–18:00',
        hours_sun: '09:00–16:00',
        phone: '+382 30 412 200',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // BERANE - Northern city (city_id: 5)
      {
        city_id: 5, // berane
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

      // BIJELO POLJE - Northern city (city_id: 6)
      {
        city_id: 6, // bijelo-polje
        name_me: 'Апотека Теа Медика Бијело Поље',
        name_en: 'Tea Medica Bijelo Polje',
        address: '13. јула бб, Бијело Поlje',
        lat: 43.0311,
        lng: 19.7470,
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

      // MOJKOVAC - Northern city (city_id: 13)
      {
        city_id: 13, // mojkovac
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

      // KOLAŠIN - Mountain city (city_id: 11)
      {
        city_id: 11, // kolasin
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
      {
        city_id: 11, // kolasin
        name_me: 'Монтефарм Манастир Морача',
        name_en: 'Montefarm Manastir Morača',
        address: 'Манастир Морача, Колашин',
        lat: 42.8000,
        lng: 19.4800,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 20 864 200',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // PLAV - Northern mountain city (city_id: 16)
      {
        city_id: 16, // plav
        name_me: 'Монтефарм Мурино',
        name_en: 'Montefarm Murino',
        address: 'Мурино, Плав',
        lat: 42.5950,
        lng: 19.9450,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 51 251 100',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        city_id: 16, // plav
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

      // GUSINJE - Northern mountain city (city_id: 9)
      {
        city_id: 9, // gusinje
        name_me: 'Монтефарм Гусиње',
        name_en: 'Montefarm Gusinje',
        address: 'Гусиње',
        lat: 42.5569,
        lng: 19.8331,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 51 271 100',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ANDRIJEVICA - Northern city (city_id: 3)
      {
        city_id: 3, // andrijevica
        name_me: 'Монтефарм Андријевица',
        name_en: 'Montefarm Andrijevica',
        address: 'Андријевица',
        lat: 42.7358,
        lng: 19.7914,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 51 281 100',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // DANILOVGRAD - Central city (city_id: 8)
      {
        city_id: 8, // danilovgrad
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
      {
        city_id: 8, // danilovgrad
        name_me: 'Монтефарм Спуж',
        name_en: 'Montefarm Spuž',
        address: 'Спуж, Данииловград',
        lat: 42.3700,
        lng: 19.1100,
        is_24h: false,
        open_sunday: true,
        hours_monfri: '08:00–19:00',
        hours_sat: '08:00–17:00',
        hours_sun: '09:00–15:00',
        phone: '+382 20 814 200',
        website: 'https://montefarm.co.me',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ŽABLJAK - Mountain resort city (city_id: 24)
      {
        city_id: 24, // zabljak
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

  async down(queryInterface) {
    await queryInterface.bulkDelete('pharmacies', null, {});
  }
};