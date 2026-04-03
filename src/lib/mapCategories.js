export const MAP_CATEGORIES = {
  dog_park: {
    key: 'dog_park',
    label: 'Parkovi za pse',
    icon: '🐕',
    mode: 'nearby',
    includedTypes: ['dog_park'],
  },
  veterinary_care: {
    key: 'veterinary_care',
    label: 'Veterinari',
    icon: '🩺',
    mode: 'nearby',
    includedTypes: ['veterinary_care'],
  },
  pet_store: {
    key: 'pet_store',
    label: 'Pet centri',
    icon: '🛍️',
    mode: 'nearby',
    includedTypes: ['pet_store'],
  },
  pet_boarding_service: {
    key: 'pet_boarding_service',
    label: 'Dnevni odmor / hotel za pse',
    icon: '🏡',
    mode: 'nearby',
    includedTypes: ['pet_boarding_service'],
  },
  pet_care: {
    key: 'pet_care',
    label: 'Pet care usluge',
    icon: '🐾',
    mode: 'nearby',
    includedTypes: ['pet_care'],
  },

  // Text search kategorije
  groomer: {
    key: 'groomer',
    label: 'Grumeri',
    icon: '✂️',
    mode: 'text',
    queryTemplate: 'dog groomer in {city}',
  },
  shelter: {
    key: 'shelter',
    label: 'Azili',
    icon: '❤️',
    mode: 'text',
    queryTemplate: 'animal shelter in {city}',
  },
  pet_friendly_cafe: {
    key: 'pet_friendly_cafe',
    label: 'Pet friendly kafići',
    icon: '☕',
    mode: 'text',
    queryTemplate: 'pet friendly cafe in {city}',
  },
  pet_friendly_apartment: {
    key: 'pet_friendly_apartment',
    label: 'Pet friendly smještaj',
    icon: '🏨',
    mode: 'text',
    queryTemplate: 'pet friendly apartment in {city}',
  },
  dog_daycare: {
    key: 'dog_daycare',
    label: 'Dnevni boravak za pse',
    icon: '🦴',
    mode: 'text',
    queryTemplate: 'dog daycare in {city}',
  },
}
