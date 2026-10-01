// Real facilities and published reference prices for MediPrice.
//
// Facilities: only details stated by the cited source. No provider prices are
// included: no public source gives what a named Bamenda facility charges, so
// those must come from SEED field visits (Admin > Import).
//
// Reference prices: medians quoted from published surveys, with their unit,
// sector, region and year exactly as reported. They describe Cameroon (or a
// region of it), not a specific provider.

const ACTWATCH = {
  sourceTitle: 'ACTwatch Lite Cameroon 2024 report (PSI), pages 33–34',
  sourceUrl: 'https://media.psi.org/wp-content/uploads/2024/09/23153730/ACTwatch-Lite-Cameroon-Report-English.pdf',
  year: 2024,
  region: 'Centre and Littoral regions (Yaoundé, Douala)',
};

const CVD_SOUTH_WEST = {
  sourceTitle:
    'Availability, cost and affordability of essential cardiovascular disease medicines in the South West region of Cameroon (PLOS ONE, 2020), Table 3',
  sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7055918/',
  year: 2016,
  region: 'South West region',
};

const CVD_SOUTH_WEST_TABLE_4 = { ...CVD_SOUTH_WEST, sourceTitle: CVD_SOUTH_WEST.sourceTitle.replace('Table 3', 'Table 4') };

export const providers = [
  {
    name: 'Regional Hospital Bamenda',
    type: 'hospital',
    city: 'Bamenda',
    location: { lat: 5.95555, lng: 10.14379 },
    source: 'https://cm.geoview.info/bamenda_regional_hospital,1082862302n',
  },
  {
    name: 'Nkwen Baptist Hospital',
    type: 'hospital',
    quarter: 'Finance Junction, Nkwen',
    address: 'Finance Junction, Bamenda II Sub Division',
    city: 'Bamenda',
    phone: '675205729 / 683158210',
    source: 'https://cbchealthservices.org/health-centers/north-west-region/nkwen-baptist-hospital/',
  },
  {
    name: 'St. Mary Soledad Hospital',
    type: 'hospital',
    city: 'Bamenda',
    source: 'https://www.msf.org/hospital-heart-north-west-crisis-cameroon',
  },
  {
    name: 'Ringland Medical Center',
    type: 'hospital',
    quarter: 'Foncha Street',
    address: 'Foncha Street',
    city: 'Bamenda',
    source: 'https://www.ringlandsmedical.org/',
  },
  {
    name: 'City Chemist',
    type: 'pharmacy',
    quarter: 'Mankon',
    address: 'City Chemist roundabout, Mankon',
    city: 'Bamenda',
    source: 'https://wap.mukuru.com/cameroon/590/',
  },
  {
    name: 'Mbingo Baptist Hospital',
    type: 'hospital',
    quarter: 'Mbingo',
    address: 'PMB 42, via Bamenda',
    city: 'Mbingo',
    phone: '+237 677 800 681',
    source: 'https://cbchealthservices.org/hospitals/mbingo-baptist-hospital/',
  },
  {
    name: 'Banso Baptist Hospital',
    type: 'hospital',
    city: 'Kumbo',
    source: 'https://cbchealthservices.org/hospitals/banso-baptist-hospital/',
  },
];

export const medications = [
  {
    name: 'Artemether/Lumefantrine 20/120mg',
    genericName: 'Artemether/Lumefantrine',
    category: 'Antimalarial',
    form: 'Adult treatment course (24 tablets)',
    description: 'First-line treatment for uncomplicated malaria, often sold as Coartem. Take the full 3-day course.',
    references: [
      {
        ...ACTWATCH,
        amount: 3300,
        unit: 'per adult treatment course',
        sector: 'Private sector, WHO-prequalified brands',
        note: 'Median. Non-prequalified ACTs: 3,000 FCFA. The page 34 text gives 2,900 FCFA for prequalified ACTs.',
      },
    ],
  },
  {
    name: 'Quinine tablets',
    genericName: 'Quinine',
    category: 'Antimalarial',
    form: 'Adult treatment course',
    description: 'An older malaria treatment, usually used when first-line medicines cannot be.',
    references: [{ ...ACTWATCH, amount: 5204, unit: 'per adult treatment course', sector: 'Private sector', note: 'Median.' }],
  },
  {
    name: 'Sulfadoxine-pyrimethamine (SP)',
    genericName: 'Sulfadoxine-pyrimethamine',
    category: 'Antimalarial',
    form: 'Adult dose (3 tablets)',
    description: 'Used mainly to prevent malaria during pregnancy, as advised at antenatal care.',
    references: [{ ...ACTWATCH, amount: 500, unit: 'per adult dose', sector: 'Private sector', note: 'Median.' }],
  },
  {
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine',
    category: 'Blood pressure',
    form: 'Tablets',
    description: 'Lowers high blood pressure. Usually taken once a day, every day.',
    references: [{ ...CVD_SOUTH_WEST, amount: 116.83, unit: 'per tablet', sector: 'All outlet types surveyed', note: 'Median.' }],
  },
  {
    name: 'Atenolol 50mg',
    genericName: 'Atenolol',
    category: 'Blood pressure',
    form: 'Tablets',
    description: 'A beta blocker for high blood pressure and some heart conditions.',
    references: [{ ...CVD_SOUTH_WEST, amount: 107, unit: 'per tablet', sector: 'All outlet types surveyed', note: 'Median.' }],
  },
  {
    name: 'Captopril 25mg',
    genericName: 'Captopril',
    category: 'Blood pressure',
    form: 'Tablets',
    description: 'Lowers high blood pressure and helps with heart failure.',
    references: [
      { ...CVD_SOUTH_WEST, amount: 50, unit: 'per tablet', sector: 'All outlet types surveyed', note: 'Median.' },
      { ...CVD_SOUTH_WEST_TABLE_4, amount: 94.3, unit: 'per tablet', sector: 'Community pharmacies', note: 'Median.' },
    ],
  },
  {
    name: 'Enalapril 10mg',
    genericName: 'Enalapril',
    category: 'Blood pressure',
    form: 'Tablets',
    description: 'Lowers high blood pressure and helps with heart failure.',
    references: [{ ...CVD_SOUTH_WEST, amount: 210, unit: 'per tablet', sector: 'All outlet types surveyed', note: 'Median.' }],
  },
  {
    name: 'Nifedipine 20mg',
    genericName: 'Nifedipine',
    category: 'Blood pressure',
    form: 'Tablets',
    description: 'Lowers high blood pressure.',
    references: [{ ...CVD_SOUTH_WEST, amount: 27.5, unit: 'per tablet', sector: 'All outlet types surveyed', note: 'Median.' }],
  },
  {
    name: 'Hydrochlorothiazide 25mg',
    genericName: 'Hydrochlorothiazide',
    category: 'Blood pressure',
    form: 'Tablets',
    description: 'A "water pill" that lowers high blood pressure.',
    references: [{ ...CVD_SOUTH_WEST, amount: 39, unit: 'per tablet', sector: 'All outlet types surveyed', note: 'Median.' }],
  },
  {
    name: 'Furosemide 40mg',
    genericName: 'Furosemide',
    category: 'Heart and kidneys',
    form: 'Tablets',
    description: 'A "water pill" that removes extra fluid, used for heart failure and swelling.',
    references: [
      { ...CVD_SOUTH_WEST, amount: 20, unit: 'per tablet', sector: 'All outlet types surveyed', note: 'Median.' },
      { ...CVD_SOUTH_WEST_TABLE_4, amount: 76.6, unit: 'per tablet', sector: 'Community pharmacies', note: 'Median.' },
    ],
  },
  {
    name: 'Simvastatin 20mg',
    genericName: 'Simvastatin',
    category: 'Cholesterol',
    form: 'Tablets',
    description: 'Lowers cholesterol to reduce the risk of heart attack and stroke.',
    references: [{ ...CVD_SOUTH_WEST, amount: 360.71, unit: 'per tablet', sector: 'All outlet types surveyed', note: 'Median.' }],
  },
  {
    name: 'Aspirin 100mg',
    genericName: 'Aspirin',
    category: 'Heart',
    form: 'Tablets',
    description: 'Low-dose aspirin, taken daily to help prevent heart attack and stroke when a doctor advises it.',
    references: [
      { ...CVD_SOUTH_WEST, amount: 43.33, unit: 'per tablet', sector: 'All outlet types surveyed', note: 'Median.' },
      { ...CVD_SOUTH_WEST_TABLE_4, amount: 45.5, unit: 'per tablet', sector: 'Community pharmacies', note: 'Median.' },
    ],
  },
  // Common medicines with no published Cameroon price found yet; prices come
  // from SEED field visits.
  { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Pain relief', form: 'Tablets, pack of 10', description: 'Relieves mild to moderate pain and reduces fever.' },
  { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', form: 'Capsules, pack of 21', description: 'An antibiotic for bacterial infections such as chest, ear and urinary infections.' },
  { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Pain relief', form: 'Tablets, pack of 10', description: 'Relieves pain, reduces fever and inflammation. Take with food.' },
  { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Diabetes', form: 'Tablets, pack of 30', description: 'Controls blood sugar in type 2 diabetes.' },
  { name: 'Oral Rehydration Salts', genericName: 'Oral rehydration salts', category: 'Rehydration', form: 'Sachet, 1 litre', description: 'Replaces fluids and salts lost through diarrhoea or vomiting.' },
];

export const services = [
  {
    name: 'Malaria rapid diagnostic test',
    type: 'lab',
    category: 'Infectious disease',
    description: 'A finger-prick blood test that shows whether you have malaria in about 20 minutes.',
    references: [
      { ...ACTWATCH, amount: 1000, unit: 'per test', sector: 'All private-sector outlet types', note: 'Median, the same in every outlet type.' },
    ],
  },
  {
    name: 'Malaria microscopy',
    type: 'lab',
    category: 'Infectious disease',
    description: 'A blood sample is checked under a microscope for malaria parasites.',
    references: [
      { ...ACTWATCH, amount: 1000, unit: 'per test', sector: 'Private outlets offering microscopy', note: 'Median for adults and children, in all outlet types reporting it.' },
    ],
  },
  { name: 'Full blood count', type: 'lab', category: 'Blood tests', description: 'Measures red cells, white cells and platelets to check for infection, anaemia and other conditions.' },
  { name: 'Fasting blood sugar', type: 'lab', category: 'Blood tests', description: 'Measures blood sugar after not eating, to check for or monitor diabetes.' },
  { name: 'Obstetric ultrasound', type: 'lab', category: 'Imaging', description: 'An ultrasound scan during pregnancy to check the baby’s growth, position and heartbeat.' },
  { name: 'General consultation', type: 'care', category: 'Outpatient', description: 'A visit with a general doctor for a new health problem or follow-up.' },
];
