export const PROPERTY_STATUSES = {
  // Core Property Statuses
  CORE: ['Available', 'Under Offer', 'Sold', 'Rented', 'Off Market'],
  
  // Development & Off-Plan Statuses
  DEVELOPMENT: ['Off-Plan', 'Under Construction', 'Completed', 'Delayed'],
  
  // Transactional & Legal Statuses
  TRANSACTIONAL: ['Reserved', 'Mortgaged', 'Restrained', 'Pending DLD Approval'],
  
  // Rental-Specific Statuses
  RENTAL: ['Vacant', 'Leasehold', 'Active Rental Dispute'],
  
  // Additional Market-Driven Statuses
  MARKET: ['Price Reduced', 'Exclusive Listing', 'Coming Soon']
} as const;

export type PropertyStatus = typeof PROPERTY_STATUSES.CORE[number] | 
                           typeof PROPERTY_STATUSES.DEVELOPMENT[number] | 
                           typeof PROPERTY_STATUSES.TRANSACTIONAL[number] | 
                           typeof PROPERTY_STATUSES.RENTAL[number] | 
                           typeof PROPERTY_STATUSES.MARKET[number];

export const getStatusBadgeColor = (status: PropertyStatus): string => {
  const colors: Record<PropertyStatus, string> = {
    // Core Statuses
    'Available': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'Under Offer': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    'Sold': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    'Rented': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'Off Market': 'bg-muted dark:bg-muted-dark text-foreground dark:text-foreground-dark',
    
    // Development Statuses
    'Off-Plan': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    'Under Construction': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    'Completed': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'Delayed': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    
    // Transactional Statuses
    'Reserved': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    'Mortgaged': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'Restrained': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    'Pending DLD Approval': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    
    // Rental Statuses
    'Vacant': 'bg-muted dark:bg-muted-dark text-foreground dark:text-foreground-dark',
    'Leasehold': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'Active Rental Dispute': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    
    // Market Statuses
    'Price Reduced': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'Exclusive Listing': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    'Coming Soon': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
  };
  
  return colors[status] || 'bg-muted dark:bg-muted-dark text-foreground dark:text-foreground-dark';
};

export const getStatusCategory = (status: PropertyStatus): 'CORE' | 'DEVELOPMENT' | 'TRANSACTIONAL' | 'RENTAL' | 'MARKET' => {
  if (PROPERTY_STATUSES.CORE.includes(status as any)) return 'CORE';
  if (PROPERTY_STATUSES.DEVELOPMENT.includes(status as any)) return 'DEVELOPMENT';
  if (PROPERTY_STATUSES.TRANSACTIONAL.includes(status as any)) return 'TRANSACTIONAL';
  if (PROPERTY_STATUSES.RENTAL.includes(status as any)) return 'RENTAL';
  return 'MARKET';
};

export const isStatusActive = (status: PropertyStatus): boolean => {
  return ['Available', 'Under Offer', 'Under Construction', 'Coming Soon'].includes(status);
};

export const isStatusCompleted = (status: PropertyStatus): boolean => {
  return ['Sold', 'Rented', 'Completed'].includes(status);
};

export const isStatusOnHold = (status: PropertyStatus): boolean => {
  return ['Off Market', 'Delayed', 'Restrained', 'Pending DLD Approval'].includes(status);
}; 