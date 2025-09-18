'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ads', [
      // Major Pharmacy Chains
      {
        name: 'Montefarm - Najveća mreža apoteka u Crnoj Gori',
        image_url: 'https://via.placeholder.com/300x150/0066cc/ffffff?text=Montefarm+Apoteke',
        target_url: 'https://montefarm.co.me',
        active: true,
        weight: 5,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        click_count: 127,
        impression_count: 2340
      },
      {
        name: 'BENU Apoteke - Europski standard u Crnoj Gori',
        image_url: 'https://via.placeholder.com/300x150/00a651/ffffff?text=BENU+Apoteke',
        target_url: 'https://benu.me',
        active: true,
        weight: 4,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 98,
        impression_count: 1890
      },
      {
        name: 'Tea Medica - Vaša privatna zdravstvena ustanova',
        image_url: 'https://via.placeholder.com/300x150/8e24aa/ffffff?text=Tea+Medica',
        target_url: 'https://teamedica.me',
        active: true,
        weight: 3,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 76,
        impression_count: 1456
      },
      {
        name: 'Apoteke Maxima - Lokacije u Podgorici i primorju',
        image_url: 'https://via.placeholder.com/300x150/ff5722/ffffff?text=Apoteke+Maxima',
        target_url: 'https://www.apotekemaxima.me',
        active: true,
        weight: 2,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 54,
        impression_count: 987
      },

      // Health & Medical Services
      {
        name: 'Hipokrat Poliklinike - Kompleksna medicinska dijagnostika',
        image_url: 'https://via.placeholder.com/300x150/1976d2/ffffff?text=Hipokrat+Poliklinike',
        target_url: 'https://hipokrat.me',
        active: true,
        weight: 3,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 89,
        impression_count: 1234
      },
      {
        name: 'Meditas - Medicinska oprema i usluge',
        image_url: 'https://via.placeholder.com/300x150/388e3c/ffffff?text=Meditas+Medical',
        target_url: 'https://www.meditas.me',
        active: true,
        weight: 2,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 43,
        impression_count: 678
      },

      // Online Pharmacy Services
      {
        name: 'eApoteka.ME - Online naručivanje lijekova',
        image_url: 'https://via.placeholder.com/300x150/607d8b/ffffff?text=eApoteka.ME',
        target_url: 'https://www.eapoteka.me',
        active: true,
        weight: 4,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 112,
        impression_count: 1876
      },

      // Health & Beauty Products
      {
        name: 'Drogerija Dama - Njega, ljepota i zdravlje',
        image_url: 'https://via.placeholder.com/300x150/e91e63/ffffff?text=Drogerija+Dama',
        target_url: 'https://dama.me',
        active: true,
        weight: 2,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 67,
        impression_count: 1123
      },
      {
        name: 'Ukus Zdravlja - Prirodni proizvodi i suplementi',
        image_url: 'https://via.placeholder.com/300x150/4caf50/ffffff?text=Ukus+Zdravlja',
        target_url: 'https://www.ukuszdravlja.me',
        active: true,
        weight: 2,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 38,
        impression_count: 789
      },

      // Generic Health Services
      {
        name: 'Farmacia Online - Najbolje cijene u Crnoj Gori',
        image_url: 'https://via.placeholder.com/300x150/8168f0/ffffff?text=Farmacia+Online',
        target_url: 'https://farmacia.me',
        active: true,
        weight: 3,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 91,
        impression_count: 1567
      },
      {
        name: 'Zdravlje Plus - Dostava lijekova na kućnu adresu',
        image_url: 'https://via.placeholder.com/300x150/31c2a7/ffffff?text=Zdravlje+Plus',
        target_url: 'https://zdravlje-plus.me',
        active: true,
        weight: 2,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 58,
        impression_count: 934
      },
      {
        name: 'MediCare Montenegro - 24/7 medicinska pomoć',
        image_url: 'https://via.placeholder.com/300x150/f08c1a/ffffff?text=MediCare+24%2F7',
        target_url: 'https://medicare.me',
        active: true,
        weight: 1,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 29,
        impression_count: 456
      },

      // Seasonal/Special Promotions
      {
        name: 'Zimska promocija - Vitamini i imunitet',
        image_url: 'https://via.placeholder.com/300x150/2196f3/ffffff?text=Zimska+Promocija',
        target_url: 'https://apoteka24.me/promocije/zima',
        active: true,
        weight: 4,
        start_date: new Date(),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
        click_count: 145,
        impression_count: 2890
      },
      {
        name: 'Besplatna dostava za narudžbe preko 50€',
        image_url: 'https://via.placeholder.com/300x150/ff9800/ffffff?text=Besplatna+Dostava',
        target_url: 'https://apoteka24.me/dostava',
        active: true,
        weight: 3,
        start_date: new Date(),
        end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
        click_count: 203,
        impression_count: 3456
      },
      {
        name: 'Rezervišite lijek online - garantovana dostupnost',
        image_url: 'https://via.placeholder.com/300x150/9c27b0/ffffff?text=Rezervacija+Online',
        target_url: 'https://apoteka24.me/rezervacija',
        active: true,
        weight: 2,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 87,
        impression_count: 1345
      },

      // Medical Equipment & Devices
      {
        name: 'Medicinska oprema - Kućni monitoring',
        image_url: 'https://via.placeholder.com/300x150/795548/ffffff?text=Med+Oprema',
        target_url: 'https://medicinska-oprema.me',
        active: true,
        weight: 1,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 23,
        impression_count: 378
      },
      {
        name: 'Ortopedski proizvodi - Podrška i rehabilitacija',
        image_url: 'https://via.placeholder.com/300x150/607d8b/ffffff?text=Ortopedija',
        target_url: 'https://ortopedija.me',
        active: true,
        weight: 1,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 16,
        impression_count: 234
      },

      // Emergency & Special Services
      {
        name: 'Hitna dostava lijekova - 2h u Podgorici',
        image_url: 'https://via.placeholder.com/300x150/f44336/ffffff?text=Hitna+Dostava',
        target_url: 'https://apoteka24.me/hitna-dostava',
        active: true,
        weight: 3,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 134,
        impression_count: 2123
      },
      {
        name: 'Dežurne apoteke - Uvijek dostupno',
        image_url: 'https://via.placeholder.com/300x150/3f51b5/ffffff?text=Dezurne+Apoteke',
        target_url: 'https://apoteka24.me/dezurne',
        active: true,
        weight: 4,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 189,
        impression_count: 2567
      },

      // Inactive/Expired Ads for Testing
      {
        name: 'Ljeto 2024 - Zaštita od sunca (ISTEKLA)',
        image_url: 'https://via.placeholder.com/300x150/ffeb3b/333333?text=Ljeto+2024',
        target_url: 'https://apoteka24.me/ljeto-2024',
        active: false,
        weight: 2,
        start_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
        end_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        click_count: 456,
        impression_count: 7890
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ads', null, {});
  }
};