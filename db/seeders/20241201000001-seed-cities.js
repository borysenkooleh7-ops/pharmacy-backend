'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('cities', [
      // Capital City
      {
        slug: 'podgorica',
        name_me: 'Подгорица',
        name_en: 'Podgorica',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Old Royal Capital
      {
        slug: 'cetinje',
        name_me: 'Цетиње',
        name_en: 'Cetinje',
        created_at: new Date(),
        updated_at: new Date()
      },
      // Major Cities (alphabetical)
      {
        slug: 'andrijevica',
        name_me: 'Андријевица',
        name_en: 'Andrijevica',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'bar',
        name_me: 'Бар',
        name_en: 'Bar',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'berane',
        name_me: 'Беране',
        name_en: 'Berane',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'bijelo-polje',
        name_me: 'Бијело Поље',
        name_en: 'Bijelo Polje',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'budva',
        name_me: 'Будва',
        name_en: 'Budva',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'danilovgrad',
        name_me: 'Даниловград',
        name_en: 'Danilovgrad',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'gusinje',
        name_me: 'Гусиње',
        name_en: 'Gusinje',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'herceg-novi',
        name_me: 'Херцег Нови',
        name_en: 'Herceg Novi',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'kolasin',
        name_me: 'Колашин',
        name_en: 'Kolašin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'kotor',
        name_me: 'Котор',
        name_en: 'Kotor',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'mojkovac',
        name_me: 'Мојковац',
        name_en: 'Mojkovac',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'niksic',
        name_me: 'Никшић',
        name_en: 'Nikšić',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'petnjica',
        name_me: 'Петњица',
        name_en: 'Petnjica',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'plav',
        name_me: 'Плав',
        name_en: 'Plav',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'pljevlja',
        name_me: 'Пљевља',
        name_en: 'Pljevlja',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'pluzine',
        name_me: 'Плужине',
        name_en: 'Plužine',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'rozaje',
        name_me: 'Рожаје',
        name_en: 'Rožaje',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'savnik',
        name_me: 'Шавник',
        name_en: 'Šavnik',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'tivat',
        name_me: 'Тиват',
        name_en: 'Tivat',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'tuzi',
        name_me: 'Тузи',
        name_en: 'Tuzi',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'ulcinj',
        name_me: 'Улцињ',
        name_en: 'Ulcinj',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        slug: 'zabljak',
        name_me: 'Жабљак',
        name_en: 'Žabljak',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cities', null, {});
  }
};