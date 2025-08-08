export type PropertyTypeOption = {
  value: string;
  label: string;
  category?: string;
};

// UAE Property Types (Current options)
export const UAE_PROPERTY_TYPES: PropertyTypeOption[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'land', label: 'Land' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'residential', label: 'Residential' },
];

// USA Property Types (Fort Worth, Dallas, Chicago, NYC)
export const USA_PROPERTY_TYPES: PropertyTypeOption[] = [
  // Residential
  { value: 'single-family-home', label: 'Single-Family Home', category: 'Residential' },
  { value: 'condominium', label: 'Condominium', category: 'Residential' },
  { value: 'townhouse', label: 'Townhouse', category: 'Residential' },
  { value: 'multi-family-2-4', label: 'Multi-Family (2-4 Units)', category: 'Residential' },
  { value: 'multi-family-5-plus', label: 'Multi-Family (5+ Units / Apartment Complex)', category: 'Residential' },
  { value: 'manufactured-mobile', label: 'Manufactured/Mobile Home', category: 'Residential' },
  { value: 'farm-ranch', label: 'Farm/Ranch', category: 'Residential' },
  
  // Land
  { value: 'land-residential', label: 'Land (Residential)', category: 'Land' },
  { value: 'land-commercial', label: 'Land (Commercial/Other)', category: 'Land' },
  
  // Commercial
  { value: 'commercial-office', label: 'Commercial - Office', category: 'Commercial' },
  { value: 'commercial-retail', label: 'Commercial - Retail', category: 'Commercial' },
  { value: 'commercial-industrial', label: 'Commercial - Industrial', category: 'Commercial' },
  { value: 'commercial-hospitality', label: 'Commercial - Hospitality', category: 'Commercial' },
  
  // Special
  { value: 'special-purpose', label: 'Special Purpose', category: 'Special' },
  { value: 'mixed-use', label: 'Mixed-Use', category: 'Special' },
];

// UK Property Types (London, Northamptonshire)
export const UK_PROPERTY_TYPES: PropertyTypeOption[] = [
  // Residential
  { value: 'detached-house', label: 'Detached House', category: 'Residential' },
  { value: 'semi-detached-house', label: 'Semi-Detached House', category: 'Residential' },
  { value: 'terraced-house', label: 'Terraced House', category: 'Residential' },
  { value: 'flat-apartment', label: 'Flat/Apartment', category: 'Residential' },
  { value: 'maisonette', label: 'Maisonette', category: 'Residential' },
  { value: 'bungalow', label: 'Bungalow', category: 'Residential' },
  { value: 'cottage', label: 'Cottage', category: 'Residential' },
  { value: 'mansion', label: 'Mansion', category: 'Residential' },
  
  // Commercial
  { value: 'office-space', label: 'Office Space', category: 'Commercial' },
  { value: 'retail-space', label: 'Retail Space', category: 'Commercial' },
  { value: 'industrial-unit', label: 'Industrial Unit', category: 'Commercial' },
  { value: 'warehouse-space', label: 'Warehouse Space', category: 'Commercial' },
  
  // Land
  { value: 'development-land', label: 'Development Land', category: 'Land' },
  { value: 'agricultural-land', label: 'Agricultural Land', category: 'Land' },
];

// Location-based property type mapping
export const LOCATION_PROPERTY_TYPES: Record<string, PropertyTypeOption[]> = {
  // UAE Locations
  'Dubai AE': UAE_PROPERTY_TYPES,
  'Sharjah AE': UAE_PROPERTY_TYPES,
  'Ajman AE': UAE_PROPERTY_TYPES,
  'Abu Dhabi AE': UAE_PROPERTY_TYPES,
  'Ras Al Khaimah AE': UAE_PROPERTY_TYPES,
  'Fujairah AE': UAE_PROPERTY_TYPES,
  'Umm Al Quwain AE': UAE_PROPERTY_TYPES,
  
  // USA Locations
  'Fort Worth TX': USA_PROPERTY_TYPES,
  'Dallas TX': USA_PROPERTY_TYPES,
  'Chicago IL': USA_PROPERTY_TYPES,
  'New York NY': USA_PROPERTY_TYPES,
  'Houston TX': USA_PROPERTY_TYPES,
  'Austin TX': USA_PROPERTY_TYPES,
  'San Antonio TX': USA_PROPERTY_TYPES,
  'Los Angeles CA': USA_PROPERTY_TYPES,
  'Phoenix AZ': USA_PROPERTY_TYPES,
  'Philadelphia PA': USA_PROPERTY_TYPES,
  'San Diego CA': USA_PROPERTY_TYPES,
  'San Jose CA': USA_PROPERTY_TYPES,
  
  // UK Locations
  'London UK': UK_PROPERTY_TYPES,
  'Northamptonshire UK': UK_PROPERTY_TYPES,
  'Manchester UK': UK_PROPERTY_TYPES,
  'Birmingham UK': UK_PROPERTY_TYPES,
  'Leeds UK': UK_PROPERTY_TYPES,
  'Liverpool UK': UK_PROPERTY_TYPES,
  'Sheffield UK': UK_PROPERTY_TYPES,
  'Edinburgh UK': UK_PROPERTY_TYPES,
  'Glasgow UK': UK_PROPERTY_TYPES,
  'Bristol UK': UK_PROPERTY_TYPES,
  
  // Default fallback
  'Other': UAE_PROPERTY_TYPES,
};

// Function to get property types based on location
export function getPropertyTypesByLocation(location: string): PropertyTypeOption[] {
  // Direct match
  if (LOCATION_PROPERTY_TYPES[location]) {
    return LOCATION_PROPERTY_TYPES[location];
  }
  
  // Partial match for USA locations
  if (location.includes('TX') || location.includes('TX')) {
    return USA_PROPERTY_TYPES;
  }
  
  if (location.includes('CA') || location.includes('NY') || location.includes('IL') || location.includes('PA') || location.includes('AZ')) {
    return USA_PROPERTY_TYPES;
  }
  
  // Partial match for UK locations
  if (location.includes('UK')) {
    return UK_PROPERTY_TYPES;
  }
  
  // Partial match for UAE locations
  if (location.includes('AE')) {
    return UAE_PROPERTY_TYPES;
  }
  
  // Default fallback
  return UAE_PROPERTY_TYPES;
}

// Function to map detailed property type to database enum
export function mapPropertyTypeToDatabaseEnum(detailedType: string): 'residential' | 'commercial' | 'land' {
  // Residential types
  const residentialTypes = [
    'apartment', 'villa', 'townhouse', 'penthouse', 'studio', 'duplex',
    'single-family-home', 'condominium', 'multi-family-2-4', 'multi-family-5-plus',
    'manufactured-mobile', 'farm-ranch', 'detached-house', 'semi-detached-house',
    'terraced-house', 'flat-apartment', 'maisonette', 'bungalow', 'cottage', 'mansion'
  ];
  
  // Commercial types
  const commercialTypes = [
    'office', 'retail', 'warehouse', 'hotel', 'restaurant', 'commercial',
    'commercial-office', 'commercial-retail', 'commercial-industrial', 'commercial-hospitality',
    'office-space', 'retail-space', 'industrial-unit', 'warehouse-space'
  ];
  
  // Land types
  const landTypes = [
    'land', 'land-residential', 'land-commercial', 'development-land', 'agricultural-land'
  ];
  
  if (residentialTypes.includes(detailedType)) {
    return 'residential';
  } else if (commercialTypes.includes(detailedType)) {
    return 'commercial';
  } else if (landTypes.includes(detailedType)) {
    return 'land';
  }
  
  // Default fallback
  return 'residential';
}

// Function to format property type for display
export function formatPropertyTypeDisplay(detailedType: string): string {
  // Map detailed types to display labels
  const typeLabels: Record<string, string> = {
    // USA Residential
    'single-family-home': 'Single-Family Home',
    'condominium': 'Condominium',
    'townhouse': 'Townhouse',
    'multi-family-2-4': 'Multi-Family (2-4 Units)',
    'multi-family-5-plus': 'Multi-Family (5+ Units)',
    'manufactured-mobile': 'Manufactured/Mobile Home',
    'farm-ranch': 'Farm/Ranch',
    
    // USA Commercial
    'commercial-office': 'Commercial - Office',
    'commercial-retail': 'Commercial - Retail',
    'commercial-industrial': 'Commercial - Industrial',
    'commercial-hospitality': 'Commercial - Hospitality',
    
    // USA Land
    'land-residential': 'Land (Residential)',
    'land-commercial': 'Land (Commercial)',
    'land-development': 'Development Land',
    'land-agricultural': 'Agricultural Land',
    
    // UAE/International
    'apartment': 'Apartment',
    'villa': 'Villa',
    'penthouse': 'Penthouse',
    'studio': 'Studio',
    'duplex': 'Duplex',
    'office': 'Office',
    'retail': 'Retail',
    'warehouse': 'Warehouse',
    'hotel': 'Hotel',
    'restaurant': 'Restaurant',
    'land': 'Land',
    
    // UK
    'detached-house': 'Detached House',
    'semi-detached-house': 'Semi-Detached House',
    'terraced-house': 'Terraced House',
    'flat-apartment': 'Flat/Apartment',
    'maisonette': 'Maisonette',
    'bungalow': 'Bungalow',
    'cottage': 'Cottage',
    'mansion': 'Mansion',
    
    // Special Purpose
    'mixed-use': 'Mixed-Use',
    'special-purpose': 'Special Purpose'
  };
  
  // Get the display label
  const displayLabel = typeLabels[detailedType] || detailedType;
  
  // Get the category
  const category = mapPropertyTypeToDatabaseEnum(detailedType);
  
  // Format as "Category (Specific Type)"
  return `${category.charAt(0).toUpperCase() + category.slice(1)} (${displayLabel})`;
}

// Function to get property types grouped by category
export function getPropertyTypesGroupedByLocation(location: string): Record<string, PropertyTypeOption[]> {
  const propertyTypes = getPropertyTypesByLocation(location);
  const grouped: Record<string, PropertyTypeOption[]> = {};
  
  propertyTypes.forEach(type => {
    const category = type.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(type);
  });
  
  return grouped;
} 