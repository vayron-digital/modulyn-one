export type PropertyStatusOption = { 
  value: string; 
  label: string; 
  category?: string; 
};

// USA Property Statuses (Real Estate Industry Standard)
export const USA_PROPERTY_STATUSES: PropertyStatusOption[] = [
  // Active Statuses
  { value: 'active', label: 'Active', category: 'Active' },
  { value: 'coming_soon', label: 'Coming Soon', category: 'Active' },
  { value: 'active_under_contract', label: 'Active Under Contract / Pending', category: 'Active' },
  { value: 'contingent', label: 'Contingent', category: 'Active' },
  
  // Closed Statuses
  { value: 'sold', label: 'Sold', category: 'Closed' },
  { value: 'leased_rented', label: 'Leased / Rented', category: 'Closed' },
  
  // Inactive Statuses
  { value: 'withdrawn', label: 'Withdrawn', category: 'Inactive' },
  { value: 'expired', label: 'Expired', category: 'Inactive' },
  { value: 'canceled', label: 'Canceled', category: 'Inactive' },
  { value: 'temporarily_off_market', label: 'Temporarily Off Market', category: 'Inactive' }
];

// UAE Property Statuses
export const UAE_PROPERTY_STATUSES: PropertyStatusOption[] = [
  { value: 'available', label: 'Available', category: 'Active' },
  { value: 'pending', label: 'Pending', category: 'Active' },
  { value: 'sold', label: 'Sold', category: 'Closed' },
  { value: 'off_market', label: 'Off Market', category: 'Inactive' }
];

// UK Property Statuses
export const UK_PROPERTY_STATUSES: PropertyStatusOption[] = [
  { value: 'available', label: 'Available', category: 'Active' },
  { value: 'pending', label: 'Under Offer', category: 'Active' },
  { value: 'sold', label: 'Sold', category: 'Closed' },
  { value: 'leased_rented', label: 'Let', category: 'Closed' },
  { value: 'withdrawn', label: 'Withdrawn', category: 'Inactive' },
  { value: 'off_market', label: 'Off Market', category: 'Inactive' }
];

// Location-based status mapping
export const LOCATION_PROPERTY_STATUSES: Record<string, PropertyStatusOption[]> = {
  'Dubai AE': UAE_PROPERTY_STATUSES,
  'Sharjah AE': UAE_PROPERTY_STATUSES,
  'Ajman AE': UAE_PROPERTY_STATUSES,
  'Fort Worth TX': USA_PROPERTY_STATUSES,
  'Dallas TX': USA_PROPERTY_STATUSES,
  'Chicago IL': USA_PROPERTY_STATUSES,
  'New York NY': USA_PROPERTY_STATUSES,
  'London UK': UK_PROPERTY_STATUSES,
  'Northamptonshire UK': UK_PROPERTY_STATUSES
};

// Function to get property statuses based on location
export function getPropertyStatusesByLocation(location: string): PropertyStatusOption[] {
  // Direct match
  if (LOCATION_PROPERTY_STATUSES[location]) {
    return LOCATION_PROPERTY_STATUSES[location];
  }
  
  // Partial match for USA locations
  if (location.includes('TX') || location.includes('CA') || location.includes('NY') || 
      location.includes('IL') || location.includes('PA') || location.includes('AZ') ||
      location.includes('FL') || location.includes('GA') || location.includes('NC')) {
    return USA_PROPERTY_STATUSES;
  }
  
  // Partial match for UK locations
  if (location.includes('UK')) {
    return UK_PROPERTY_STATUSES;
  }
  
  // Partial match for UAE locations
  if (location.includes('AE')) {
    return UAE_PROPERTY_STATUSES;
  }
  
  // Default fallback
  return UAE_PROPERTY_STATUSES;
}

// Function to get property statuses grouped by category
export function getPropertyStatusesGroupedByLocation(location: string): Record<string, PropertyStatusOption[]> {
  const statuses = getPropertyStatusesByLocation(location);
  const grouped: Record<string, PropertyStatusOption[]> = {};
  
  statuses.forEach(status => {
    const category = status.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(status);
  });
  
  return grouped;
}

// Function to format property status for display
export function formatPropertyStatusDisplay(detailedStatus: string): string {
  // Map detailed statuses to display labels
  const statusLabels: Record<string, string> = {
    // USA Statuses
    'active': 'Active',
    'coming_soon': 'Coming Soon',
    'active_under_contract': 'Active Under Contract / Pending',
    'contingent': 'Contingent',
    'sold': 'Sold',
    'leased_rented': 'Leased / Rented',
    'withdrawn': 'Withdrawn',
    'expired': 'Expired',
    'canceled': 'Canceled',
    'temporarily_off_market': 'Temporarily Off Market',
    
    // Legacy/International Statuses
    'available': 'Available',
    'pending': 'Pending',
    'off_market': 'Off Market'
  };
  
  return statusLabels[detailedStatus] || detailedStatus;
}

// Function to get status badge color
export function getStatusBadgeColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  // Active statuses
  if (['active', 'coming_soon', 'available'].includes(status)) {
    return 'success';
  }
  
  // Pending/Contract statuses
  if (['active_under_contract', 'pending', 'contingent'].includes(status)) {
    return 'warning';
  }
  
  // Closed statuses
  if (['sold', 'leased_rented'].includes(status)) {
    return 'destructive';
  }
  
  // Inactive statuses
  if (['withdrawn', 'expired', 'canceled', 'temporarily_off_market', 'off_market'].includes(status)) {
    return 'outline';
  }
  
  // Default
  return 'default';
} 