export const MAP_CATEGORIES = {
  dog_park: {
    key: 'dog_park',
    label: 'Parkovi za pse',
    icon: '🐕',
    mode: 'nearby',
    includedTypes: ['dog_park'],
    color: '#d97706',
  },

  veterinary: {
    key: 'veterinary',
    label: 'Veterinari',
    icon: '🩺',
    mode: 'nearby',
    includedTypes: ['veterinary_care'],
    color: '#2563eb',
  },

  pet_store: {
    key: 'pet_store',
    label: 'Pet centri',
    icon: '🛍️',
    mode: 'nearby',
    includedTypes: ['pet_store'],
    color: '#7c3aed',
  },

  groomer: {
    key: 'groomer',
    label: 'Grumeri',
    icon: '✂️',
    mode: 'text',
    queryTemplate: 'dog groomer in {city}',
    color: '#db2777',
  },

  shelter: {
    key: 'shelter',
    label: 'Azili',
    icon: '❤️',
    mode: 'text',
    queryTemplate: 'animal shelter in {city}',
    color: '#dc2626',
  },

  pet_friendly_cafe: {
    key: 'pet_friendly_cafe',
    label: 'Pet friendly kafići',
    icon: '☕',
    mode: 'text',
    queryTemplate: 'pet friendly cafe in {city}',
    color: '#059669',
  },

  pet_friendly_stay: {
    key: 'pet_friendly_stay',
    label: 'Pet friendly smještaj',
    icon: '🏨',
    mode: 'text',
    queryTemplate: 'pet friendly stay in {city}',
    color: '#0f766e',
  },

  dog_daycare: {
    key: 'dog_daycare',
    label: 'Dnevni boravak za pse',
    icon: '🦴',
    mode: 'text',
    queryTemplate: 'dog daycare in {city}',
    color: '#ea580c',
  },
}
