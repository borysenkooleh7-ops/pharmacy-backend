'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('medicines', [
      // Pain Relief & Fever Reducers
      {
        name_me: 'Панадол',
        name_en: 'Panadol',
        description: 'Paracetamol-based pain reliever and fever reducer',
        active: true
      },
      {
        name_me: 'Аспирин',
        name_en: 'Aspirin',
        description: 'Acetylsalicylic acid for pain, fever, and inflammation',
        active: true
      },
      {
        name_me: 'Бруфен',
        name_en: 'Brufen',
        description: 'Ibuprofen-based anti-inflammatory pain reliever',
        active: true
      },
      {
        name_me: 'Каффетин',
        name_en: 'Caffetin',
        description: 'Combination pain reliever with caffeine',
        active: true
      },
      {
        name_me: 'Андол',
        name_en: 'Andol',
        description: 'Local paracetamol brand',
        active: true
      },
      {
        name_me: 'Налгесин',
        name_en: 'Nalgesin',
        description: 'Naproxen-based anti-inflammatory medication',
        active: true
      },
      {
        name_me: 'Диклофен',
        name_en: 'Diclofen',
        description: 'Diclofenac for inflammation and pain relief',
        active: true
      },
      {
        name_me: 'Кетонал',
        name_en: 'Ketonal',
        description: 'Ketoprofen anti-inflammatory medication',
        active: true
      },
      {
        name_me: 'Вералгин',
        name_en: 'Veralgin',
        description: 'Metamizole sodium for severe pain',
        active: true
      },
      {
        name_me: 'Тромбопол',
        name_en: 'Trombopol',
        description: 'Low-dose aspirin for cardiovascular protection',
        active: true
      },

      // Vitamins & Supplements
      {
        name_me: 'Витамин C',
        name_en: 'Vitamin C',
        description: 'Ascorbic acid supplement for immune support',
        active: true
      },
      {
        name_me: 'Витамин D3',
        name_en: 'Vitamin D3',
        description: 'Cholecalciferol for bone health and immunity',
        active: true
      },
      {
        name_me: 'Витамин B комплекс',
        name_en: 'Vitamin B Complex',
        description: 'Complete B-vitamin supplement for energy metabolism',
        active: true
      },
      {
        name_me: 'Магнезијум',
        name_en: 'Magnesium',
        description: 'Essential mineral for muscle and nerve function',
        active: true
      },
      {
        name_me: 'Цинк',
        name_en: 'Zinc',
        description: 'Essential trace element for immune function',
        active: true
      },
      {
        name_me: 'Калцијум',
        name_en: 'Calcium',
        description: 'Essential mineral for bone and teeth health',
        active: true
      },
      {
        name_me: 'Омега 3',
        name_en: 'Omega 3',
        description: 'Essential fatty acids for cardiovascular health',
        active: true
      },
      {
        name_me: 'Мултивитамини',
        name_en: 'Multivitamins',
        description: 'Complete vitamin and mineral supplement',
        active: true
      },
      {
        name_me: 'Фолна киселина',
        name_en: 'Folic Acid',
        description: 'Essential B-vitamin for pregnancy and health',
        active: true
      },
      {
        name_me: 'Гвожђе',
        name_en: 'Iron',
        description: 'Essential mineral for blood formation',
        active: true
      },

      // Respiratory & Cold/Flu
      {
        name_me: 'Лазолван',
        name_en: 'Lasolvan',
        description: 'Mucolytic agent for respiratory conditions',
        active: true
      },
      {
        name_me: 'Синупрет',
        name_en: 'Sinupret',
        description: 'Herbal remedy for sinus conditions',
        active: true
      },
      {
        name_me: 'АЦЦ',
        name_en: 'ACC',
        description: 'Acetylcysteine for mucus clearance',
        active: true
      },
      {
        name_me: 'Муколитин',
        name_en: 'Mucolitin',
        description: 'Mucolytic for productive cough',
        active: true
      },
      {
        name_me: 'Бронхикум',
        name_en: 'Bronchicum',
        description: 'Herbal cough syrup for respiratory comfort',
        active: true
      },
      {
        name_me: 'Стоптусин',
        name_en: 'Stoptussin',
        description: 'Antitussive and mucolytic combination',
        active: true
      },
      {
        name_me: 'Колдрекс',
        name_en: 'Coldrex',
        description: 'Multi-symptom cold and flu relief',
        active: true
      },
      {
        name_me: 'Фервекс',
        name_en: 'Fervex',
        description: 'Hot drink for cold and flu symptoms',
        active: true
      },
      {
        name_me: 'Риностоп',
        name_en: 'Rinostop',
        description: 'Nasal decongestant spray',
        active: true
      },
      {
        name_me: 'Назол',
        name_en: 'Nazol',
        description: 'Oxymetazoline nasal spray',
        active: true
      },

      // Digestive System
      {
        name_me: 'Гастал',
        name_en: 'Gastal',
        description: 'Antacid for stomach acid neutralization',
        active: true
      },
      {
        name_me: 'Рени',
        name_en: 'Rennie',
        description: 'Calcium carbonate antacid tablets',
        active: true
      },
      {
        name_me: 'Омепразол',
        name_en: 'Omeprazole',
        description: 'Proton pump inhibitor for acid reduction',
        active: true
      },
      {
        name_me: 'Спаzmекс',
        name_en: 'Spazmeks',
        description: 'Antispasmodic for digestive discomfort',
        active: true
      },
      {
        name_me: 'Но-спа',
        name_en: 'No-spa',
        description: 'Drotaverine for smooth muscle spasms',
        active: true
      },
      {
        name_me: 'Лоперамид',
        name_en: 'Loperamide',
        description: 'Anti-diarrheal medication',
        active: true
      },
      {
        name_me: 'Бификол',
        name_en: 'Bifikol',
        description: 'Probiotic for digestive health',
        active: true
      },
      {
        name_me: 'Линекс',
        name_en: 'Linex',
        description: 'Probiotic supplement for gut health',
        active: true
      },
      {
        name_me: 'Домперидон',
        name_en: 'Domperidone',
        description: 'Prokinetic agent for nausea and vomiting',
        active: true
      },
      {
        name_me: 'Панкреон',
        name_en: 'Pankreon',
        description: 'Pancreatic enzyme supplement',
        active: true
      },

      // Cardiovascular
      {
        name_me: 'Кардиомагнил',
        name_en: 'Cardiomagnil',
        description: 'Aspirin + magnesium for cardiovascular protection',
        active: true
      },
      {
        name_me: 'Лозап',
        name_en: 'Lozap',
        description: 'Losartan for hypertension treatment',
        active: true
      },
      {
        name_me: 'Амлодипин',
        name_en: 'Amlodipine',
        description: 'Calcium channel blocker for hypertension',
        active: true
      },
      {
        name_me: 'Еналаприл',
        name_en: 'Enalapril',
        description: 'ACE inhibitor for blood pressure control',
        active: true
      },
      {
        name_me: 'Атенолол',
        name_en: 'Atenolol',
        description: 'Beta-blocker for cardiovascular conditions',
        active: true
      },
      {
        name_me: 'Симвастатин',
        name_en: 'Simvastatin',
        description: 'Statin for cholesterol management',
        active: true
      },

      // Nervous System & Mental Health
      {
        name_me: 'Валијум',
        name_en: 'Valium',
        description: 'Diazepam for anxiety and muscle spasms',
        active: true
      },
      {
        name_me: 'Ксанакс',
        name_en: 'Xanax',
        description: 'Alprazolam for anxiety disorders',
        active: true
      },
      {
        name_me: 'Деприм',
        name_en: 'Deprim',
        description: 'St. Johns wort for mild depression',
        active: true
      },
      {
        name_me: 'Нобен',
        name_en: 'Noben',
        description: 'Idebenone for cognitive enhancement',
        active: true
      },
      {
        name_me: 'Танакан',
        name_en: 'Tanakan',
        description: 'Ginkgo biloba for circulation and memory',
        active: true
      },
      {
        name_me: 'Бромазепам',
        name_en: 'Bromazepam',
        description: 'Benzodiazepine for anxiety treatment',
        active: true
      },

      // Antibiotics & Antimicrobials
      {
        name_me: 'Амоксицилин',
        name_en: 'Amoxicillin',
        description: 'Penicillin antibiotic for bacterial infections',
        active: true
      },
      {
        name_me: 'Азитромицин',
        name_en: 'Azithromycin',
        description: 'Macrolide antibiotic for respiratory infections',
        active: true
      },
      {
        name_me: 'Цефалексин',
        name_en: 'Cefalexin',
        description: 'Cephalosporin antibiotic for various infections',
        active: true
      },
      {
        name_me: 'Доксициклин',
        name_en: 'Doxycycline',
        description: 'Tetracycline antibiotic for multiple indications',
        active: true
      },
      {
        name_me: 'Метронидазол',
        name_en: 'Metronidazole',
        description: 'Antibiotic for anaerobic bacterial infections',
        active: true
      },

      // Topical & Dermatological
      {
        name_me: 'Бепантен',
        name_en: 'Bepanthen',
        description: 'Dexpanthenol cream for skin healing',
        active: true
      },
      {
        name_me: 'Пантенол',
        name_en: 'Panthenol',
        description: 'Pantothenic acid for skin care',
        active: true
      },
      {
        name_me: 'Синтомицин',
        name_en: 'Sintomycin',
        description: 'Chloramphenicol ointment for skin infections',
        active: true
      },
      {
        name_me: 'Клотримазол',
        name_en: 'Clotrimazole',
        description: 'Antifungal cream for skin infections',
        active: true
      },
      {
        name_me: 'Фенистил',
        name_en: 'Fenistil',
        description: 'Antihistamine gel for allergic skin reactions',
        active: true
      },
      {
        name_me: 'Акридерм',
        name_en: 'Akriderm',
        description: 'Topical corticosteroid for skin inflammation',
        active: true
      },

      // Gynecological & Hormonal
      {
        name_me: 'Нистатин',
        name_en: 'Nystatin',
        description: 'Antifungal medication for vaginal infections',
        active: true
      },
      {
        name_me: 'Дуфастон',
        name_en: 'Duphaston',
        description: 'Dydrogesterone for hormonal support',
        active: true
      },
      {
        name_me: 'Утрожестан',
        name_en: 'Utrogestan',
        description: 'Natural progesterone supplement',
        active: true
      },

      // Allergy & Antihistamines
      {
        name_me: 'Цетрин',
        name_en: 'Cetrin',
        description: 'Cetirizine antihistamine for allergies',
        active: true
      },
      {
        name_me: 'Лоратадин',
        name_en: 'Loratadine',
        description: 'Non-sedating antihistamine',
        active: true
      },
      {
        name_me: 'Телфаст',
        name_en: 'Telfast',
        description: 'Fexofenadine for allergic rhinitis',
        active: true
      },
      {
        name_me: 'Супрастин',
        name_en: 'Suprastin',
        description: 'Chlorpheniramine for allergic reactions',
        active: true
      },

      // Eye & Ear Care
      {
        name_me: 'Визин',
        name_en: 'Visine',
        description: 'Eye drops for redness and irritation',
        active: true
      },
      {
        name_me: 'Искусственне сузе',
        name_en: 'Artificial Tears',
        description: 'Lubricating eye drops for dry eyes',
        active: true
      },
      {
        name_me: 'Отипакс',
        name_en: 'Otipax',
        description: 'Ear drops for pain and inflammation',
        active: true
      },

      // Diabetes Management
      {
        name_me: 'Метформин',
        name_en: 'Metformin',
        description: 'Oral antidiabetic medication',
        active: true
      },
      {
        name_me: 'Глибенкламид',
        name_en: 'Glibenclamide',
        description: 'Sulfonylurea for diabetes management',
        active: true
      },

      // Thyroid
      {
        name_me: 'Еутирокс',
        name_en: 'Euthyrox',
        description: 'Levothyroxine for thyroid hormone replacement',
        active: true
      },
      {
        name_me: 'Тирозол',
        name_en: 'Thyrozol',
        description: 'Methimazole for hyperthyroidism',
        active: true
      },

      // Other Common Medications
      {
        name_me: 'Активирани угаљ',
        name_en: 'Activated Charcoal',
        description: 'Adsorbent for digestive detoxification',
        active: true
      },
      {
        name_me: 'Регидрон',
        name_en: 'Rehydron',
        description: 'Oral rehydration salts',
        active: true
      },
      {
        name_me: 'Парацетамол',
        name_en: 'Paracetamol',
        description: 'Generic paracetamol for pain and fever',
        active: true
      },
      {
        name_me: 'Ибупрофен',
        name_en: 'Ibuprofen',
        description: 'Generic ibuprofen anti-inflammatory',
        active: true
      },
      {
        name_me: 'Дипирон',
        name_en: 'Dipyrone',
        description: 'Metamizole for pain and fever relief',
        active: true
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('medicines', null, {});
  }
};