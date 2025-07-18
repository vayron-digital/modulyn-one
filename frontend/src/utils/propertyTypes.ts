export type ResidentialType = 
  | 'Apartment'
  | 'Duplex'
  | 'Villa'
  | 'Penthouse'
  | 'Townhouse';

export type CommercialType = 
  | 'Showroom'
  | 'Office'
  | 'Factory'
  | 'Retail'
  | 'Warehouse'
  | 'Land'
  | 'Commercial Building'
  | 'Commercial Floor';

export type PropertyType = ResidentialType | CommercialType;

export const RESIDENTIAL_TYPES: ResidentialType[] = [
  'Apartment',
  'Duplex',
  'Villa',
  'Penthouse',
  'Townhouse'
];

export const COMMERCIAL_TYPES: CommercialType[] = [
  'Showroom',
  'Office',
  'Factory',
  'Retail',
  'Warehouse',
  'Land',
  'Commercial Building',
  'Commercial Floor'
];

export const ALL_PROPERTY_TYPES: PropertyType[] = [
  ...RESIDENTIAL_TYPES,
  ...COMMERCIAL_TYPES
];

export const isResidentialType = (type: PropertyType): type is ResidentialType => {
  return RESIDENTIAL_TYPES.includes(type as ResidentialType);
};

export const isCommercialType = (type: PropertyType): type is CommercialType => {
  return COMMERCIAL_TYPES.includes(type as CommercialType);
};

export const getPropertyTypeCategory = (type: PropertyType): 'Residential' | 'Commercial' => {
  return isResidentialType(type) ? 'Residential' : 'Commercial';
};

// Helper function to get property type icon (you can customize this based on your icon library)
export const getPropertyTypeIcon = (type: PropertyType): string => {
  const iconMap: Record<PropertyType, string> = {
    // Residential
    'Apartment': 'building',
    'Duplex': 'building-2',
    'Villa': 'home',
    'Penthouse': 'building-3',
    'Townhouse': 'building-4',
    // Commercial
    'Showroom': 'store',
    'Office': 'briefcase',
    'Factory': 'factory',
    'Retail': 'shopping-bag',
    'Warehouse': 'warehouse',
    'Land': 'map',
    'Commercial Building': 'building-5',
    'Commercial Floor': 'building-6'
  };
  
  return iconMap[type];
}; 