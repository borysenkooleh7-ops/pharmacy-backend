'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Medicine IDs mapping (based on order in medicines seeder):
    // 1: Панадол, 2: Аспирин, 3: Бруфен, 4: Каффетин, 5: Андол, 6: Налгесин, 7: Диклофен, 8: Кетонал, 9: Вералгин, 10: Тромбопол
    // 11: Витамин C, 12: Витамин D3, 13: Витамин B комплекс, 14: Магнезијум, 15: Цинк, 16: Калцијум, 17: Омега 3, 18: Мултивитамини, 19: Фолна киселина, 20: Гвожђе
    // 21: Лазолван, 22: Синупрет, 23: АЦЦ, 24: Муколитин, 25: Бронхикум, 26: Стоптусин, 27: Колдрекс, 28: Фервекс, 29: Риностоп, 30: Назол
    // 31: Гастал, 32: Рени, 33: Омепразол, 34: Спаzmекс, 35: Но-спа, 36: Лоперамид, 37: Бификол, 38: Линекс, 39: Домперидон, 40: Панкреон
    // 41: Кардиомагнил, 42: Лозап, 43: Амлодипин, 44: Еналаприл, 45: Атенолол, 46: Симвастатин
    // 47: Валијум, 48: Ксанакс, 49: Деприм, 50: Нобен, 51: Танакан, 52: Бромазепам
    // 53: Амоксицилин, 54: Азитромицин, 55: Цефалексин, 56: Доксициклин, 57: Метронидазол
    // 58: Бепантен, 59: Пантенол, 60: Синтомицин, 61: Клотримазол, 62: Фенистил, 63: Акридерм
    // 64: Нистатин, 65: Дуфастон, 66: Утрожестан
    // 67: Цетрин, 68: Лоратадин, 69: Телфаст, 70: Супрастин
    // 71: Визин, 72: Искусственне сузе, 73: Отипакс
    // 74: Метформин, 75: Глибенкламид
    // 76: Еутирокс, 77: Тирозол
    // 78: Активирани угаљ, 79: Регидрон, 80: Парацетамол, 81: Ибупрофен, 82: Дипирон

    await queryInterface.bulkInsert('pharmacy_medicines', [

      // MONTEFARM NETWORK - Major pharmacy chain (High stock, competitive prices)

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
      {
        pharmacy_id: 1,
        medicine_id: 21, // Лазолван
        price: 9.75,
        available: true,
        stock_quantity: 60
      },
      {
        pharmacy_id: 1,
        medicine_id: 22, // Синупрет
        price: 15.20,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 1,
        medicine_id: 31, // Гастал
        price: 7.40,
        available: true,
        stock_quantity: 75
      },
      {
        pharmacy_id: 1,
        medicine_id: 53, // Амоксицилин
        price: 18.90,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 1,
        medicine_id: 58, // Бепантен
        price: 11.30,
        available: true,
        stock_quantity: 40
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
      {
        pharmacy_id: 2,
        medicine_id: 23, // АЦЦ
        price: 12.80,
        available: true,
        stock_quantity: 55
      },
      {
        pharmacy_id: 2,
        medicine_id: 32, // Рени
        price: 6.90,
        available: true,
        stock_quantity: 100
      },
      {
        pharmacy_id: 2,
        medicine_id: 54, // Азитромицин
        price: 25.40,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 2,
        medicine_id: 74, // Метформин
        price: 8.75,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 2,
        medicine_id: 67, // Цетрин
        price: 9.60,
        available: true,
        stock_quantity: 70
      },
      {
        pharmacy_id: 2,
        medicine_id: 80, // Парацетамол
        price: 2.90,
        available: true,
        stock_quantity: 250
      },

      // BENU Network - International standards

      // BENU Moravska (pharmacy_id: 5) - 24/7 Podgorica
      {
        pharmacy_id: 5,
        medicine_id: 1, // Панадол
        price: 4.75,
        available: true,
        stock_quantity: 180
      },
      {
        pharmacy_id: 5,
        medicine_id: 2, // Аспирин
        price: 3.40,
        available: true,
        stock_quantity: 140
      },
      {
        pharmacy_id: 5,
        medicine_id: 11, // Витамин C
        price: 9.20,
        available: true,
        stock_quantity: 160
      },
      {
        pharmacy_id: 5,
        medicine_id: 14, // Магнезијум
        price: 11.80,
        available: true,
        stock_quantity: 75
      },
      {
        pharmacy_id: 5,
        medicine_id: 21, // Лазолван
        price: 10.20,
        available: true,
        stock_quantity: 50
      },
      {
        pharmacy_id: 5,
        medicine_id: 33, // Омепразол
        price: 16.50,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 5,
        medicine_id: 41, // Кардиомагнил
        price: 19.80,
        available: true,
        stock_quantity: 35
      },
      {
        pharmacy_id: 5,
        medicine_id: 68, // Лоратадин
        price: 7.30,
        available: true,
        stock_quantity: 85
      },
      {
        pharmacy_id: 5,
        medicine_id: 71, // Визин
        price: 8.90,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 5,
        medicine_id: 82, // Дипирон
        price: 4.20,
        available: true,
        stock_quantity: 110
      },

      // BENU Budva Autobuska (pharmacy_id: 23) - Tourist area, 24/7
      {
        pharmacy_id: 23,
        medicine_id: 1, // Панадол
        price: 5.20,
        available: true,
        stock_quantity: 120
      },
      {
        pharmacy_id: 23,
        medicine_id: 3, // Бруфен
        price: 7.50,
        available: true,
        stock_quantity: 80
      },
      {
        pharmacy_id: 23,
        medicine_id: 11, // Витамин C
        price: 10.50,
        available: true,
        stock_quantity: 200
      },
      {
        pharmacy_id: 23,
        medicine_id: 22, // Синупрет
        price: 16.80,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 23,
        medicine_id: 58, // Бепантен
        price: 13.20,
        available: true,
        stock_quantity: 60
      },
      {
        pharmacy_id: 23,
        medicine_id: 59, // Пантенол
        price: 9.40,
        available: true,
        stock_quantity: 85
      },
      {
        pharmacy_id: 23,
        medicine_id: 67, // Цетрин
        price: 11.20,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 23,
        medicine_id: 71, // Визин
        price: 10.50,
        available: true,
        stock_quantity: 20
      },
      {
        pharmacy_id: 23,
        medicine_id: 79, // Регидрон
        price: 6.80,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 23,
        medicine_id: 80, // Парацетамол
        price: 3.50,
        available: true,
        stock_quantity: 150
      },

      // TEA MEDICA Network - Private healthcare

      // Tea Medica Svetozara Markovića (pharmacy_id: 12)
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
      {
        pharmacy_id: 12,
        medicine_id: 15, // Цинк
        price: 7.50,
        available: true,
        stock_quantity: 65
      },
      {
        pharmacy_id: 12,
        medicine_id: 24, // Муколитин
        price: 8.90,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 12,
        medicine_id: 34, // Спаzmекс
        price: 12.30,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 12,
        medicine_id: 42, // Лозап
        price: 22.40,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 12,
        medicine_id: 47, // Валијум
        price: 15.60,
        available: true,
        stock_quantity: 20
      },
      {
        pharmacy_id: 12,
        medicine_id: 76, // Еутирокс
        price: 18.90,
        available: true,
        stock_quantity: 35
      },
      {
        pharmacy_id: 12,
        medicine_id: 69, // Телфаст
        price: 13.40,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 12,
        medicine_id: 81, // Ибупрофен
        price: 4.60,
        available: true,
        stock_quantity: 90
      },

      // INDEPENDENT PHARMACIES

      // Apoteke Maxima Slobode (pharmacy_id: 7)
      {
        pharmacy_id: 7,
        medicine_id: 1, // Панадол
        price: 4.40,
        available: true,
        stock_quantity: 80
      },
      {
        pharmacy_id: 7,
        medicine_id: 8, // Кетонал
        price: 11.50,
        available: true,
        stock_quantity: 35
      },
      {
        pharmacy_id: 7,
        medicine_id: 16, // Калцијум
        price: 9.80,
        available: true,
        stock_quantity: 70
      },
      {
        pharmacy_id: 7,
        medicine_id: 25, // Бронхикум
        price: 13.20,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 7,
        medicine_id: 35, // Но-спа
        price: 8.70,
        available: true,
        stock_quantity: 50
      },
      {
        pharmacy_id: 7,
        medicine_id: 55, // Цефалексин
        price: 21.30,
        available: true,
        stock_quantity: 20
      },
      {
        pharmacy_id: 7,
        medicine_id: 48, // Ксанакс
        price: 18.40,
        available: true,
        stock_quantity: 15
      },
      {
        pharmacy_id: 7,
        medicine_id: 75, // Глибенкламид
        price: 12.80,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 7,
        medicine_id: 70, // Супрастин
        price: 6.90,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 7,
        medicine_id: 78, // Активирани угаљ
        price: 3.20,
        available: true,
        stock_quantity: 100
      },

      // Vigor Pharmacy Nikšić (pharmacy_id: 17)
      {
        pharmacy_id: 17,
        medicine_id: 2, // Аспирин
        price: 3.10,
        available: true,
        stock_quantity: 60
      },
      {
        pharmacy_id: 17,
        medicine_id: 9, // Вералгин
        price: 7.80,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 17,
        medicine_id: 17, // Омега 3
        price: 16.50,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 17,
        medicine_id: 26, // Стоптусин
        price: 10.40,
        available: true,
        stock_quantity: 35
      },
      {
        pharmacy_id: 17,
        medicine_id: 36, // Лоперамид
        price: 5.60,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 17,
        medicine_id: 56, // Доксициклин
        price: 19.80,
        available: true,
        stock_quantity: 18
      },
      {
        pharmacy_id: 17,
        medicine_id: 49, // Деприм
        price: 14.20,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 17,
        medicine_id: 77, // Тирозол
        price: 21.50,
        available: true,
        stock_quantity: 15
      },
      {
        pharmacy_id: 17,
        medicine_id: 72, // Искусственне сузе
        price: 7.40,
        available: true,
        stock_quantity: 20
      },
      {
        pharmacy_id: 17,
        medicine_id: 81, // Ибупрофен
        price: 4.20,
        available: false, // Out of stock
        stock_quantity: 0
      },

      // COASTAL PHARMACIES - Different pricing due to location

      // Montefarm Topla Herceg Novi (pharmacy_id: 26)
      {
        pharmacy_id: 26,
        medicine_id: 1, // Панадол
        price: 4.90,
        available: true,
        stock_quantity: 70
      },
      {
        pharmacy_id: 26,
        medicine_id: 11, // Витамин C
        price: 10.20,
        available: true,
        stock_quantity: 120
      },
      {
        pharmacy_id: 26,
        medicine_id: 18, // Мултивитамини
        price: 18.40,
        available: true,
        stock_quantity: 50
      },
      {
        pharmacy_id: 26,
        medicine_id: 27, // Колдрекс
        price: 11.80,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 26,
        medicine_id: 58, // Бепантен
        price: 12.80,
        available: true,
        stock_quantity: 65
      },
      {
        pharmacy_id: 26,
        medicine_id: 61, // Клотримазол
        price: 8.90,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 26,
        medicine_id: 67, // Цетрин
        price: 10.50,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 26,
        medicine_id: 71, // Визин
        price: 9.80,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 26,
        medicine_id: 79, // Регидрон
        price: 6.40,
        available: true,
        stock_quantity: 35
      },

      // NORTHERN PHARMACIES

      // Tea Medica Berane (pharmacy_id: 49)
      {
        pharmacy_id: 49,
        medicine_id: 3, // Бруфен
        price: 6.50,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 49,
        medicine_id: 12, // Витамин D3
        price: 11.90,
        available: true,
        stock_quantity: 35
      },
      {
        pharmacy_id: 49,
        medicine_id: 21, // Лазолван
        price: 9.30,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 49,
        medicine_id: 31, // Гастал
        price: 7.10,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 49,
        medicine_id: 53, // Амоксицилин
        price: 17.80,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 49,
        medicine_id: 43, // Амлодипин
        price: 14.20,
        available: true,
        stock_quantity: 20
      },
      {
        pharmacy_id: 49,
        medicine_id: 74, // Метформин
        price: 8.40,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 49,
        medicine_id: 68, // Лоратадин
        price: 6.90,
        available: true,
        stock_quantity: 35
      },

      // VARIOUS PHARMACIES WITH DIFFERENT STOCK LEVELS

      // Montefarm Farmakon Mojkovac (pharmacy_id: 51)
      {
        pharmacy_id: 51,
        medicine_id: 1, // Панадол
        price: 4.30,
        available: true,
        stock_quantity: 50
      },
      {
        pharmacy_id: 51,
        medicine_id: 11, // Витамин C
        price: 8.50,
        available: true,
        stock_quantity: 80
      },
      {
        pharmacy_id: 51,
        medicine_id: 21, // Лазолван
        price: 9.10,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 51,
        medicine_id: 32, // Рени
        price: 6.50,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 51,
        medicine_id: 54, // Азитромицин
        price: 24.80,
        available: true,
        stock_quantity: 15
      },
      {
        pharmacy_id: 51,
        medicine_id: 80, // Парацетамол
        price: 2.70,
        available: true,
        stock_quantity: 100
      },

      // Random pharmacies with limited stock or unavailable items
      {
        pharmacy_id: 4, // BENU Cvijetna
        medicine_id: 22, // Синупрет
        price: 15.80,
        available: false, // Out of stock
        stock_quantity: 0
      },
      {
        pharmacy_id: 8, // Apoteke Maxima Cetinjski put
        medicine_id: 41, // Кардиомагнил
        price: 20.50,
        available: true,
        stock_quantity: 5 // Low stock
      },
      {
        pharmacy_id: 13, // Drogerija Dama
        medicine_id: 58, // Бепантен
        price: 10.80,
        available: true,
        stock_quantity: 75
      },
      {
        pharmacy_id: 13, // Drogerija Dama
        medicine_id: 59, // Пантенол
        price: 8.20,
        available: true,
        stock_quantity: 95
      },
      {
        pharmacy_id: 13, // Drogerija Dama
        medicine_id: 62, // Фенистил
        price: 12.40,
        available: true,
        stock_quantity: 40
      },

      // Mountain pharmacies with basic medicines
      {
        pharmacy_id: 61, // Medicor Žabljak
        medicine_id: 1, // Панадол
        price: 5.50,
        available: true,
        stock_quantity: 30
      },
      {
        pharmacy_id: 61, // Medicor Žabljak
        medicine_id: 2, // Аспирин
        price: 3.80,
        available: true,
        stock_quantity: 25
      },
      {
        pharmacy_id: 61, // Medicor Žабљак
        medicine_id: 11, // Витамин C
        price: 11.20,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 61, // Medicor Žабљак
        medicine_id: 21, // Лазолван
        price: 10.80,
        available: true,
        stock_quantity: 15
      },
      {
        pharmacy_id: 61, // Medicor Жабљак
        medicine_id: 80, // Парацетамол
        price: 3.20,
        available: true,
        stock_quantity: 60
      },

      // Add some relationships with seasonal availability patterns
      {
        pharmacy_id: 1, // Montefarm Sloboda
        medicine_id: 28, // Фервекс
        price: 8.90,
        available: true,
        stock_quantity: 100 // High winter stock
      },
      {
        pharmacy_id: 5, // BENU Moravska
        medicine_id: 29, // Риностоп
        price: 7.20,
        available: true,
        stock_quantity: 85
      },
      {
        pharmacy_id: 23, // BENU Budva
        medicine_id: 30, // Назол
        price: 8.50,
        available: true,
        stock_quantity: 60
      },

      // Emergency medicines in 24/7 pharmacies
      {
        pharmacy_id: 2, // Montefarm Kruševac (24/7)
        medicine_id: 47, // Валијум
        price: 16.20,
        available: true,
        stock_quantity: 20
      },
      {
        pharmacy_id: 5, // BENU Moravska (24/7)
        medicine_id: 48, // Ксанакс
        price: 19.40,
        available: true,
        stock_quantity: 15
      },
      {
        pharmacy_id: 23, // BENU Budva (24/7)
        medicine_id: 73, // Отипакс
        price: 11.80,
        available: true,
        stock_quantity: 25
      },

      // Additional comprehensive coverage for major pharmacies
      {
        pharmacy_id: 1, // Montefarm Sloboda
        medicine_id: 4, // Каффетин
        price: 5.20,
        available: true,
        stock_quantity: 90
      },
      {
        pharmacy_id: 1, // Montefarm Sloboda
        medicine_id: 6, // Налгесин
        price: 7.90,
        available: true,
        stock_quantity: 70
      },
      {
        pharmacy_id: 1, // Montefarm Sloboda
        medicine_id: 14, // Магнезијум
        price: 11.40,
        available: true,
        stock_quantity: 85
      },
      {
        pharmacy_id: 1, // Montefarm Sloboda
        medicine_id: 33, // Омепразол
        price: 15.80,
        available: true,
        stock_quantity: 50
      },

      // BENU network expansion
      {
        pharmacy_id: 5, // BENU Moravska
        medicine_id: 3, // Бруфен
        price: 7.20,
        available: true,
        stock_quantity: 90
      },
      {
        pharmacy_id: 5, // BENU Moravska
        medicine_id: 15, // Цинк
        price: 8.50,
        available: true,
        stock_quantity: 65
      },
      {
        pharmacy_id: 5, // BENU Moravska
        medicine_id: 25, // Бронхикум
        price: 14.20,
        available: true,
        stock_quantity: 35
      },
      {
        pharmacy_id: 5, // BENU Moravska
        medicine_id: 35, // Но-спа
        price: 9.40,
        available: true,
        stock_quantity: 45
      },

      // More Tea Medica locations
      {
        pharmacy_id: 12, // Tea Medica Svetozara Markovića
        medicine_id: 10, // Тромбопол
        price: 13.90,
        available: true,
        stock_quantity: 40
      },
      {
        pharmacy_id: 12, // Tea Medica Svetozara Markovića
        medicine_id: 19, // Фолна киселина
        price: 6.80,
        available: true,
        stock_quantity: 60
      },
      {
        pharmacy_id: 12, // Tea Medica Svetozara Markovића
        medicine_id: 44, // Еналаприл
        price: 16.50,
        available: true,
        stock_quantity: 30
      },

      // Independent pharmacy coverage
      {
        pharmacy_id: 7, // Apoteke Maxima Slobode
        medicine_id: 11, // Витамин C
        price: 9.50,
        available: true,
        stock_quantity: 110
      },
      {
        pharmacy_id: 7, // Apoteke Maxima Slobode
        medicine_id: 21, // Лазолван
        price: 10.80,
        available: true,
        stock_quantity: 45
      },
      {
        pharmacy_id: 7, // Apoteke Maxima Slobode
        medicine_id: 67, // Цетрин
        price: 10.20,
        available: true,
        stock_quantity: 55
      }

    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('pharmacy_medicines', null, {});
  }
};