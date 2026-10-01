// Sample data for local development, matching mediprice-web/src/data.
// Provider phone numbers are placeholders, not real contact details.
// `daysAgo` sets each price's updatedAt relative to when the seed runs.

export const providers = [
  {
    "name": "Commercial Avenue Pharmacy",
    "type": "pharmacy",
    "quarter": "Commercial Avenue",
    "phone": "+237 600 000 001"
  },
  {
    "name": "Nkwen Community Pharmacy",
    "type": "pharmacy",
    "quarter": "Nkwen",
    "phone": "+237 600 000 002"
  },
  {
    "name": "Up Station Pharmacy",
    "type": "pharmacy",
    "quarter": "Up Station",
    "phone": "+237 600 000 003"
  },
  {
    "name": "Regional Hospital Pharmacy",
    "type": "pharmacy",
    "quarter": "Azire",
    "phone": "+237 600 000 004"
  },
  {
    "name": "Mile 4 Pharmacy",
    "type": "pharmacy",
    "quarter": "Nkwen",
    "phone": "+237 600 000 005"
  },
  {
    "name": "Regional Hospital Bamenda",
    "type": "hospital",
    "quarter": "Azire",
    "phone": "+237 600 000 006"
  },
  {
    "name": "Bingo Health Center",
    "type": "hospital",
    "quarter": "Bingo",
    "phone": "+237 600 000 007"
  },
  {
    "name": "Nkwen Medical Laboratory",
    "type": "lab",
    "quarter": "Nkwen",
    "phone": "+237 600 000 008"
  },
  {
    "name": "St. Mary's Soledad",
    "type": "hospital",
    "quarter": "Soledad",
    "phone": "+237 600 000 009"
  },
  {
    "name": "Mbingo Baptist Hospital",
    "type": "hospital",
    "quarter": "Mbingo",
    "phone": "+237 600 000 010"
  },
  {
    "name": "Banso Baptist Hospital",
    "type": "hospital",
    "quarter": "Kumbo",
    "phone": "+237 600 000 011"
  }
];

export const medications = [
  {
    "name": "Paracetamol 500mg",
    "genericName": "Paracetamol",
    "category": "Pain relief",
    "description": "Relieves mild to moderate pain and reduces fever. One of the most commonly bought medicines in the region.",
    "form": "Tablets, pack of 10",
    "requiresPrescription": false
  },
  {
    "name": "Amoxicillin 500mg",
    "genericName": "Amoxicillin",
    "category": "Antibiotic",
    "description": "An antibiotic used to treat bacterial infections such as chest, ear and urinary infections. Requires a prescription.",
    "form": "Capsules, pack of 21",
    "requiresPrescription": true
  },
  {
    "name": "Ibuprofen 400mg",
    "genericName": "Ibuprofen",
    "category": "Pain relief",
    "description": "Relieves pain, reduces fever and decreases inflammation. Take with food.",
    "form": "Tablets, pack of 10",
    "requiresPrescription": false
  },
  {
    "name": "Artemether/Lumefantrine 20/120mg",
    "genericName": "Artemether/Lumefantrine",
    "category": "Antimalarial",
    "description": "The first-line treatment for uncomplicated malaria, often sold as Coartem. Complete the full course.",
    "form": "Tablets, adult course of 24",
    "requiresPrescription": false
  },
  {
    "name": "Metformin 500mg",
    "genericName": "Metformin",
    "category": "Diabetes",
    "description": "Controls blood sugar in type 2 diabetes. Usually taken with meals every day.",
    "form": "Tablets, pack of 30",
    "requiresPrescription": true
  },
  {
    "name": "Oral Rehydration Salts",
    "genericName": "Oral rehydration salts",
    "category": "Rehydration",
    "description": "Replaces fluids and salts lost through diarrhoea or vomiting. Especially important for children.",
    "form": "Sachet, 1 litre",
    "requiresPrescription": false
  }
];

export const services = [
  {
    "name": "Malaria rapid diagnostic test",
    "type": "lab",
    "category": "Infectious disease",
    "description": "A finger-prick blood test that shows whether you have malaria in about 20 minutes."
  },
  {
    "name": "Obstetric ultrasound",
    "type": "lab",
    "category": "Imaging",
    "description": "An ultrasound scan during pregnancy to check the baby’s growth, position and heartbeat."
  },
  {
    "name": "Full blood count",
    "type": "lab",
    "category": "Blood tests",
    "description": "Measures red cells, white cells and platelets to check for infection, anaemia and other conditions."
  },
  {
    "name": "H. pylori test",
    "type": "lab",
    "category": "Blood tests",
    "description": "Checks for the stomach bacteria that commonly cause ulcers and persistent indigestion."
  },
  {
    "name": "Antenatal profile",
    "type": "care",
    "category": "Maternity",
    "description": "The standard set of first-visit pregnancy tests, including blood group, HIV, syphilis and haemoglobin."
  },
  {
    "name": "Emergency consultation",
    "type": "care",
    "category": "Emergency",
    "description": "An assessment by a doctor in the emergency unit. Medicines and tests are charged separately."
  },
  {
    "name": "General consultation",
    "type": "care",
    "category": "Outpatient",
    "description": "A routine visit with a general doctor for a new health problem or follow-up."
  }
];

export const prices = [
  {
    "itemType": "medication",
    "item": "Paracetamol 500mg",
    "provider": "Commercial Avenue Pharmacy",
    "amount": 500,
    "trustBadge": "seed_verified",
    "daysAgo": 2
  },
  {
    "itemType": "medication",
    "item": "Paracetamol 500mg",
    "provider": "Nkwen Community Pharmacy",
    "amount": 600,
    "trustBadge": "provider_verified",
    "daysAgo": 5
  },
  {
    "itemType": "medication",
    "item": "Paracetamol 500mg",
    "provider": "Up Station Pharmacy",
    "amount": 550,
    "trustBadge": "community_reported",
    "daysAgo": 11
  },
  {
    "itemType": "medication",
    "item": "Amoxicillin 500mg",
    "provider": "Commercial Avenue Pharmacy",
    "amount": 1500,
    "trustBadge": "provider_verified",
    "daysAgo": 3
  },
  {
    "itemType": "medication",
    "item": "Amoxicillin 500mg",
    "provider": "Regional Hospital Pharmacy",
    "amount": 1300,
    "trustBadge": "seed_verified",
    "daysAgo": 7
  },
  {
    "itemType": "medication",
    "item": "Amoxicillin 500mg",
    "provider": "Mile 4 Pharmacy",
    "amount": 1700,
    "trustBadge": "community_reported",
    "daysAgo": 14
  },
  {
    "itemType": "medication",
    "item": "Ibuprofen 400mg",
    "provider": "Nkwen Community Pharmacy",
    "amount": 800,
    "trustBadge": "provider_verified",
    "daysAgo": 4
  },
  {
    "itemType": "medication",
    "item": "Ibuprofen 400mg",
    "provider": "Up Station Pharmacy",
    "amount": 900,
    "trustBadge": "community_reported",
    "daysAgo": 9
  },
  {
    "itemType": "medication",
    "item": "Artemether/Lumefantrine 20/120mg",
    "provider": "Regional Hospital Pharmacy",
    "amount": 1800,
    "trustBadge": "seed_verified",
    "daysAgo": 1
  },
  {
    "itemType": "medication",
    "item": "Artemether/Lumefantrine 20/120mg",
    "provider": "Commercial Avenue Pharmacy",
    "amount": 2000,
    "trustBadge": "seed_verified",
    "daysAgo": 2
  },
  {
    "itemType": "medication",
    "item": "Artemether/Lumefantrine 20/120mg",
    "provider": "Nkwen Community Pharmacy",
    "amount": 2200,
    "trustBadge": "provider_verified",
    "daysAgo": 6
  },
  {
    "itemType": "medication",
    "item": "Artemether/Lumefantrine 20/120mg",
    "provider": "Mile 4 Pharmacy",
    "amount": 2600,
    "trustBadge": "community_reported",
    "daysAgo": 46
  },
  {
    "itemType": "medication",
    "item": "Metformin 500mg",
    "provider": "Regional Hospital Pharmacy",
    "amount": 1200,
    "trustBadge": "seed_verified",
    "daysAgo": 8
  },
  {
    "itemType": "medication",
    "item": "Metformin 500mg",
    "provider": "Commercial Avenue Pharmacy",
    "amount": 1500,
    "trustBadge": "provider_verified",
    "daysAgo": 10
  },
  {
    "itemType": "medication",
    "item": "Oral Rehydration Salts",
    "provider": "Up Station Pharmacy",
    "amount": 150,
    "trustBadge": "community_reported",
    "daysAgo": 3
  },
  {
    "itemType": "medication",
    "item": "Oral Rehydration Salts",
    "provider": "Nkwen Community Pharmacy",
    "amount": 200,
    "trustBadge": "provider_verified",
    "daysAgo": 5
  },
  {
    "itemType": "service",
    "item": "Malaria rapid diagnostic test",
    "provider": "Regional Hospital Bamenda",
    "amount": 1500,
    "trustBadge": "seed_verified",
    "daysAgo": 2
  },
  {
    "itemType": "service",
    "item": "Malaria rapid diagnostic test",
    "provider": "Bingo Health Center",
    "amount": 1000,
    "trustBadge": "provider_verified",
    "daysAgo": 5
  },
  {
    "itemType": "service",
    "item": "Malaria rapid diagnostic test",
    "provider": "Nkwen Medical Laboratory",
    "amount": 2000,
    "trustBadge": "community_reported",
    "daysAgo": 12
  },
  {
    "itemType": "service",
    "item": "Obstetric ultrasound",
    "provider": "St. Mary's Soledad",
    "amount": 10000,
    "trustBadge": "provider_verified",
    "daysAgo": 6
  },
  {
    "itemType": "service",
    "item": "Obstetric ultrasound",
    "provider": "Regional Hospital Bamenda",
    "amount": 8000,
    "trustBadge": "seed_verified",
    "daysAgo": 9
  },
  {
    "itemType": "service",
    "item": "Full blood count",
    "provider": "Mbingo Baptist Hospital",
    "amount": 4500,
    "trustBadge": "community_reported",
    "daysAgo": 15
  },
  {
    "itemType": "service",
    "item": "Full blood count",
    "provider": "Nkwen Medical Laboratory",
    "amount": 3500,
    "trustBadge": "provider_verified",
    "daysAgo": 4
  },
  {
    "itemType": "service",
    "item": "Full blood count",
    "provider": "Regional Hospital Bamenda",
    "amount": 3000,
    "trustBadge": "seed_verified",
    "daysAgo": 3
  },
  {
    "itemType": "service",
    "item": "H. pylori test",
    "provider": "Bingo Health Center",
    "amount": 5000,
    "trustBadge": "seed_verified",
    "daysAgo": 7
  },
  {
    "itemType": "service",
    "item": "H. pylori test",
    "provider": "Nkwen Medical Laboratory",
    "amount": 6000,
    "trustBadge": "provider_verified",
    "daysAgo": 11
  },
  {
    "itemType": "service",
    "item": "Antenatal profile",
    "provider": "Banso Baptist Hospital",
    "amount": 25000,
    "trustBadge": "provider_verified",
    "daysAgo": 10
  },
  {
    "itemType": "service",
    "item": "Antenatal profile",
    "provider": "St. Mary's Soledad",
    "amount": 22000,
    "trustBadge": "community_reported",
    "daysAgo": 40
  },
  {
    "itemType": "service",
    "item": "Emergency consultation",
    "provider": "Regional Hospital Bamenda",
    "amount": 5000,
    "trustBadge": "provider_verified",
    "daysAgo": 4
  },
  {
    "itemType": "service",
    "item": "Emergency consultation",
    "provider": "Mbingo Baptist Hospital",
    "amount": 6000,
    "trustBadge": "seed_verified",
    "daysAgo": 8
  },
  {
    "itemType": "service",
    "item": "General consultation",
    "provider": "Bingo Health Center",
    "amount": 2000,
    "trustBadge": "seed_verified",
    "daysAgo": 3
  },
  {
    "itemType": "service",
    "item": "General consultation",
    "provider": "Regional Hospital Bamenda",
    "amount": 3000,
    "trustBadge": "provider_verified",
    "daysAgo": 5
  }
];
