import { Property } from '../../pages/properties/Properties';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in Downtown',
    description: 'A beautiful and modern apartment located in the heart of the city.',
    address: '123 Main St, Anytown, USA',
    price: 500000,
    status: 'available',
    property_type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    created_by: 'dev-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    developer: {
      id: 'dev-1',
      name: 'Devloper Inc.',
    }
  },
  {
    id: '2',
    title: 'Cozy House with a Big Backyard',
    description: 'A cozy house perfect for a family, with a large backyard and a two-car garage.',
    address: '456 Oak Ave, Anytown, USA',
    price: 750000,
    status: 'sold',
    property_type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    area: 2000,
    created_by: 'dev-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    developer: {
      id: 'dev-2',
      name: 'Builder Co.',
    }
  },
];
