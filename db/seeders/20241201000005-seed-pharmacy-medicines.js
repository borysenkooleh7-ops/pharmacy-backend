'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('pharmacy_medicines', [

      // Montefarm Sloboda (pharmacy_id: 1) - Main Podgorica location
      {
        pharmacy_id: 1,
        medicine_id: 1, // Панадол
        price: 4.50,
        available: true,
        stock_quantity: 150
      },
      {
        pharmacy_id: 1,
        medicine_id: 2, // Аспирин
        price: 3.25,
        available: true,
        stock_quantity: 120
      },
      {
        pharmacy_id: 1,
        medicine_id: 3, // Бруфен
        price: 6.80,
        available: true,
        stock_quantity: 95
      },
      {
        pharmacy_id: 1,
        medicine_id: 11, // Витамин C
        price: 8.90,
        available: true,
        stock_quantity: 200
      },
      {
        pharmacy_id: 1,
        medicine_id: 12, // Витамин D3
        price: 12.50,
        available: true,
        stock_quantity: 85
      },

      // Montefarm Kruševac (pharmacy_id: 2) - 24/7 location
      {
        pharmacy_id: 2,
        medicine_id: 1, // Панадол
        price: 4.60,
        available: true,
        stock_quantity: 200
      },
      {
        pharmacy_id: 2,
        medicine_id: 4, // Каффетин
        price: 5.50,
        available: true,
        stock_quantity: 80
      },
      {
        pharmacy_id: 2,
        medicine_id: 6, // Налгесин
        price: 8.20,
        available: true,
        stock_quantity: 65
      },
      {
        pharmacy_id: 2,
        medicine_id: 13, // Витамин B комплекс
        price: 14.50,
        available: true,
        stock_quantity: 90
      },

      // BENU Cvijetna (pharmacy_id: 3) - Podgorica
      {
        pharmacy_id: 3,
        medicine_id: 1, // Панадол
        price: 4.75,
        available: true,
        stock_quantity: 180
      },
      {
        pharmacy_id: 3,
        medicine_id: 2, // Аспирин
        price: 3.40,
        available: true,
        stock_quantity: 140
      },
      {
        pharmacy_id: 3,
        medicine_id: 11, // Витамин C
        price: 9.20,
        available: true,
        stock_quantity: 160
      },
      {
        pharmacy_id: 3,
        medicine_id: 14, // Магнезијум
        price: 11.80,
        available: true,
        stock_quantity: 75
      },

      // BENU Moravska (pharmacy_id: 4) - 24/7 Podgorica
      {
        pharmacy_id: 4,
        medicine_id: 22, // Синупрет
        price: 15.80,
        available: false, // Out of stock
        stock_quantity: 0
      },
      {
        pharmacy_id: 4,
        medicine_id: 21, // Лазолван
        price: 10.20,
        available: true,
        stock_quantity: 50
      },
      {
        pharmacy_id: 4,
        medicine_id: 33, // Омепразол
        price: 16.50,
        available: true,
        stock_quantity: 40
      },

      // Montefarm Rosa Budva (pharmacy_id: 5)
      {
        pharmacy_id: 5,
        medicine_id: 1, // Панадол
        price: 5.20,
        available: true,
        stock_quantity: 120
      },
      {
        pharmacy_id: 5,
        medicine_id: 3, // Бруфен
        price: 7.50,
        available: true,
        stock_quantity: 80
      },
      {
        pharmacy_id: 5,
        medicine_id: 11, // Витамин C
        price: 10.50,
        available: true,
        stock_quantity: 200
      },

      // Montefarm Centar Bar (pharmacy_id: 6)
      {
        pharmacy_id: 6,
        medicine_id: 1, // Панадол
        price: 4.40,
        available: true,
        stock_quantity: 80
      },
      {
        pharmacy_id: 6,
        medicine_id: 8, // Кетонал
        price: 11.50,
        available: true,
        stock_quantity: 35
      },
      {
        pharmacy_id: 6,
        medicine_id: 16, // Калцијум
        price: 9.80,
        available: true,
        stock_quantity: 70
      },

      // Montefarm Igalo Herceg Novi (pharmacy_id: 7)
      {
        pharmacy_id: 7,
        medicine_id: 1, // Панадол
        price: 4.90,
        available: true,
        stock_quantity: 70
      },
      {
        pharmacy_id: 7,
        medicine_id: 11, // Витамин C
        price: 10.20,
        available: true,
        stock_quantity: 120
      },
      {
        pharmacy_id: 7,
        medicine_id: 18, // Мултивитамини
        price: 18.40,
        available: true,
        stock_quantity: 50
      },

      // Montefarm Nikšić (pharmacy_id: 8)
      {
        pharmacy_id: 8,
        medicine_id: 2, // Аспирин
        price: 3.10,
        available: true,
        stock_quantity: 60
      },
      {
        pharmacy_id: 8,
        medicine_id: 9, // Вералгин
        price: 7.80,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 8,
        medicine_id: 41, // Кардиомагнил
        price: 20.50,
        available: true,
        stock_quantity: 5 // Low stock
      },

      // Montefarm Pljevlja (pharmacy_id: 9)
      {
        pharmacy_id: 9,
        medicine_id: 3, // Бруфен
        price: 6.50,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 9,
        medicine_id: 12, // Витамин D3
        price: 11.90,
        available: true,
        stock_quantity: 35
      },

      // Montefarm Stari Grad Kotor (pharmacy_id: 10)
      {
        pharmacy_id: 10,
        medicine_id: 58, // Бепантен
        price: 10.80,
        available: true,
        stock_quantity: 75
      },
      {
        pharmacy_id: 10,
        medicine_id: 59, // Пантенол
        price: 8.20,
        available: true,
        stock_quantity: 95
      },
      {
        pharmacy_id: 10,
        medicine_id: 62, // Фенистил
        price: 12.40,
        available: true,
        stock_quantity: 40
      },

      // Montefarm Riva Tivat (pharmacy_id: 11)
      {
        pharmacy_id: 11,
        medicine_id: 1, // Панадол
        price: 4.30,
        available: true,
        stock_quantity: 50
      },
      {
        pharmacy_id: 11,
        medicine_id: 11, // Витамин C
        price: 8.50,
        available: true,
        stock_quantity: 80
      },

      // Montefarm Jovo Dreč Cetinje (pharmacy_id: 12)
      {
        pharmacy_id: 12,
        medicine_id: 5, // Андол
        price: 3.80,
        available: true,
        stock_quantity: 100
      },
      {
        pharmacy_id: 12,
        medicine_id: 7, // Диклофен
        price: 9.20,
        available: true,
        stock_quantity: 55
      },

      // Tea Medica Berane (pharmacy_id: 13)
      {
        pharmacy_id: 13,
        medicine_id: 15, // Цинк
        price: 7.50,
        available: true,
        stock_quantity: 65
      },
      {
        pharmacy_id: 13,
        medicine_id: 24, // Муколитин
        price: 8.90,
        available: true,
        stock_quantity: 40
      },

      // Tea Medica Bijelo Polje (pharmacy_id: 14)
      {
        pharmacy_id: 14,
        medicine_id: 21, // Лазолван
        price: 9.30,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 14,
        medicine_id: 31, // Гастал
        price: 7.10,
        available: true,
        stock_quantity: 40
      },

      // Montefarm Farmakon Mojkovac (pharmacy_id: 15)
      {
        pharmacy_id: 15,
        medicine_id: 21, // Лазолван
        price: 9.10,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 15,
        medicine_id: 32, // Рени
        price: 6.50,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 15,
        medicine_id: 80, // Парацетамол
        price: 2.70,
        available: true,
        stock_quantity: 100
      },

      // Montefarm Remedija Kolašin (pharmacy_id: 16)
      {
        pharmacy_id: 16,
        medicine_id: 1, // Панадол
        price: 4.75,
        available: true,
        stock_quantity: 60
      },
      {
        pharmacy_id: 16,
        medicine_id: 80, // Парацетамол
        price: 3.10,
        available: true,
        stock_quantity: 85
      },

      // Montefarm Zdravlje Plav (pharmacy_id: 17)
      {
        pharmacy_id: 17,
        medicine_id: 2, // Аспирин
        price: 3.50,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 17,
        medicine_id: 11, // Витамин C
        price: 9.80,
        available: true,
        stock_quantity: 30
      },

      // Pharmacy Rožaje (pharmacy_id: 18)
      {
        pharmacy_id: 18,
        medicine_id: 1, // Панадол
        price: 5.00,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 18,
        medicine_id: 80, // Парацетамол
        price: 3.50,
        available: true,
        stock_quantity: 40
      },

      // Montefarm Higija Danilovgrad (pharmacy_id: 19)
      {
        pharmacy_id: 19,
        medicine_id: 3, // Бруфен
        price: 6.90,
        available: true,
        stock_quantity: 50
      },
      {
        pharmacy_id: 19,
        medicine_id: 12, // Витамин D3
        price: 12.20,
        available: true,
        stock_quantity: 35
      },

      // Montefarm Žabljak (pharmacy_id: 20)
      {
        pharmacy_id: 20,
        medicine_id: 1, // Панадол
        price: 5.20,
        available: true,
        stock_quantity: 20
      },
      {
        pharmacy_id: 20,
        medicine_id: 80, // Парацетамол
        price: 3.80,
        available: true,
        stock_quantity: 30
      },

      // Medicor Žabljak (pharmacy_id: 21)
      {
        pharmacy_id: 21,
        medicine_id: 1, // Панадол
        price: 5.50,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 21,
        medicine_id: 2, // Аспирин
        price: 3.80,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 21,
        medicine_id: 11, // Витамин C
        price: 11.20,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 21,
        medicine_id: 21, // Лазолван
        price: 10.80,
        available: true,
        stock_quantity: 15
      },
      {
        pharmacy_id: 21,
        medicine_id: 80, // Парацетамол
        price: 3.20,
        available: true,
        stock_quantity: 60
      }

    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pharmacy_medicines', null, {});
  }
};