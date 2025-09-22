'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert cities in the exact same order as static data to ensure matching IDs
    await queryInterface.bulkInsert('cities', [
      { id: 1, slug: 'podgorica', name_en: 'Podgorica', name_me: 'Podgorica', created_at: new Date(), updated_at: new Date() },
      { id: 2, slug: 'niksic', name_en: 'Nikšić', name_me: 'Nikšić', created_at: new Date(), updated_at: new Date() },
      { id: 3, slug: 'bar', name_en: 'Bar', name_me: 'Bar', created_at: new Date(), updated_at: new Date() },
      { id: 4, slug: 'budva', name_en: 'Budva', name_me: 'Budva', created_at: new Date(), updated_at: new Date() },
      { id: 5, slug: 'herceg-novi', name_en: 'Herceg Novi', name_me: 'Herceg Novi', created_at: new Date(), updated_at: new Date() },
      { id: 6, slug: 'kotor', name_en: 'Kotor', name_me: 'Kotor', created_at: new Date(), updated_at: new Date() },
      { id: 7, slug: 'tivat', name_en: 'Tivat', name_me: 'Tivat', created_at: new Date(), updated_at: new Date() },
      { id: 8, slug: 'cetinje', name_en: 'Cetinje', name_me: 'Cetinje', created_at: new Date(), updated_at: new Date() },
      { id: 9, slug: 'berane', name_en: 'Berane', name_me: 'Berane', created_at: new Date(), updated_at: new Date() },
      { id: 10, slug: 'bijelo-polje', name_en: 'Bijelo Polje', name_me: 'Bijelo Polje', created_at: new Date(), updated_at: new Date() },
      { id: 11, slug: 'pljevlja', name_en: 'Pljevlja', name_me: 'Pljevlja', created_at: new Date(), updated_at: new Date() },
      { id: 12, slug: 'ulcinj', name_en: 'Ulcinj', name_me: 'Ulcinj', created_at: new Date(), updated_at: new Date() },
      { id: 13, slug: 'kolasin', name_en: 'Kolašin', name_me: 'Kolašin', created_at: new Date(), updated_at: new Date() },
      { id: 14, slug: 'mojkovac', name_en: 'Mojkovac', name_me: 'Mojkovac', created_at: new Date(), updated_at: new Date() },
      { id: 15, slug: 'rozaje', name_en: 'Rožaje', name_me: 'Rožaje', created_at: new Date(), updated_at: new Date() },
      { id: 16, slug: 'plav', name_en: 'Plav', name_me: 'Plav', created_at: new Date(), updated_at: new Date() },
      { id: 17, slug: 'zabljak', name_en: 'Žabljak', name_me: 'Žabljak', created_at: new Date(), updated_at: new Date() },
      { id: 18, slug: 'andrijevica', name_en: 'Andrijevica', name_me: 'Andrijevica', created_at: new Date(), updated_at: new Date() },
      { id: 19, slug: 'danilovgrad', name_en: 'Danilovgrad', name_me: 'Danilovgrad', created_at: new Date(), updated_at: new Date() },
      { id: 20, slug: 'golubovci', name_en: 'Golubovci', name_me: 'Golubovci', created_at: new Date(), updated_at: new Date() },
      { id: 21, slug: 'tuzi', name_en: 'Tuzi', name_me: 'Tuzi', created_at: new Date(), updated_at: new Date() },
      { id: 22, slug: 'petnjica', name_en: 'Petnjica', name_me: 'Petnjica', created_at: new Date(), updated_at: new Date() },
      { id: 23, slug: 'gusinje', name_en: 'Gusinje', name_me: 'Gusinje', created_at: new Date(), updated_at: new Date() },
      { id: 24, slug: 'pluzine', name_en: 'Plužine', name_me: 'Plužine', created_at: new Date(), updated_at: new Date() },
      { id: 25, slug: 'savnik', name_en: 'Šavnik', name_me: 'Šavnik', created_at: new Date(), updated_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cities', null, {});
  }
};