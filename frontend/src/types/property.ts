export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built: number;
  lot_size: number;
  features: string[];
  images: string[];
  created_at: string;
  updated_at: string;
  owner_id: string;
  agent_id: string;
  listing_date: string;
  last_sold_date?: string;
  last_sold_price?: number;
  tax_history?: {
    year: number;
    amount: number;
  }[];
  price_history?: {
    date: string;
    price: number;
    event: string;
  }[];
  location: {
    lat: number;
    lng: number;
  };
  virtual_tour_url?: string;
  documents?: {
    name: string;
    url: string;
    type: string;
  }[];
  amenities: string[];
  hoa_fee?: number;
  property_tax?: number;
  insurance?: number;
  estimated_mortgage?: number;
  neighborhood_info?: {
    name: string;
    description: string;
    schools: {
      name: string;
      rating: number;
      distance: number;
    }[];
    crime_rate?: number;
    walk_score?: number;
    transit_score?: number;
  };
} 