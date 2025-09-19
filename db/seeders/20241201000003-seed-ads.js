'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ads', [
      // Major Pharmacy Chains
      {
        name: 'Montefarm - Najveća mreža apoteka u Crnoj Gori',
        image_url: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=150&fit=crop&crop=center',
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
        image_url: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=300&h=150&fit=crop&crop=center',
        target_url: 'https://medicinska-oprema.me',
        active: true,
        weight: 1,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 23,
        impression_count: 378
      },
      // Emergency & Special Services
      {
        name: 'Dežurne apoteke - Uvijek dostupno',
        image_url: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=300&h=150&fit=crop&crop=center',
        target_url: 'https://apoteka24.me/dezurne',
        active: true,
        weight: 4,
        start_date: new Date(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        click_count: 189,
        impression_count: 2567
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ads', null, {});
  }
};