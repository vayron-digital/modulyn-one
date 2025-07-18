// Service to match properties to a lead's preferences

interface Property {
  id: string;
  current_price: number;
  bedroom_options?: number[];
  bedroom_range?: [number, number];
  bathroom_options?: number[];
  bathroom_range?: [number, number];
  size_options?: number[];
  size_range?: [number, number];
  matchType?: string;
}

interface Lead {
  budget?: number;
  preferred_bedrooms?: number;
  preferred_bathrooms?: number;
  preferred_size?: number;
}

function isValueMatch(leadPref: number, propertyOptions?: number[], propertyRange?: [number, number]): boolean {
  if (Array.isArray(propertyOptions) && propertyOptions.length > 0) {
    return propertyOptions.includes(leadPref);
  } else if (Array.isArray(propertyRange) && propertyRange.length === 2) {
    return leadPref >= propertyRange[0] && leadPref <= propertyRange[1];
  }
  return false;
}

function isSizeMatch(leadPref: number, propertyOptions?: number[], propertyRange?: [number, number]): boolean {
  if (Array.isArray(propertyOptions) && propertyOptions.length > 0) {
    return propertyOptions.some(size => Math.abs(size - leadPref) < 1e-2); // float comparison
  } else if (Array.isArray(propertyRange) && propertyRange.length === 2) {
    return leadPref >= propertyRange[0] && leadPref <= propertyRange[1];
  }
  return false;
}

/**
 * Returns properties that match the lead's preferences, prioritizing budget matches.
 * @param {Lead} lead - The lead object with preferences.
 * @param {Property[]} properties - Array of property objects.
 * @returns {Property[]} - Array of matching properties with matchType.
 */
function matchPropertiesToLead(lead: Lead, properties: Property[]): Property[] {
  return properties.filter(property => {
    // Budget match is the primary filter
    const budgetMatch = lead.budget && property.current_price <= lead.budget;
    
    // If no budget specified, check other parameters
    if (!lead.budget) {
      // Bedrooms
      let bedroomMatch = true;
      if (lead.preferred_bedrooms) {
        bedroomMatch = isValueMatch(
          lead.preferred_bedrooms,
          property.bedroom_options,
          property.bedroom_range
        );
      }
      // Bathrooms
      let bathroomMatch = true;
      if (lead.preferred_bathrooms) {
        bathroomMatch = isValueMatch(
          lead.preferred_bathrooms,
          property.bathroom_options,
          property.bathroom_range
        );
      }
      // Size
      let sizeMatch = true;
      if (lead.preferred_size) {
        sizeMatch = isSizeMatch(
          lead.preferred_size,
          property.size_options,
          property.size_range
        );
      }
      return bedroomMatch && bathroomMatch && sizeMatch;
    }

    // If budget is specified, include the property if it's within budget
    // and add matchType based on other parameters
    if (budgetMatch) {
      const matchTypes: string[] = [];
      
      // Check other parameters for matchType
      if (lead.preferred_bedrooms && isValueMatch(
        lead.preferred_bedrooms,
        property.bedroom_options,
        property.bedroom_range
      )) {
        matchTypes.push('bedrooms');
      }
      
      if (lead.preferred_bathrooms && isValueMatch(
        lead.preferred_bathrooms,
        property.bathroom_options,
        property.bathroom_range
      )) {
        matchTypes.push('bathrooms');
      }
      
      if (lead.preferred_size && isSizeMatch(
        lead.preferred_size,
        property.size_options,
        property.size_range
      )) {
        matchTypes.push('size');
      }

      // Add matchType to property
      property.matchType = matchTypes.length > 0 ? matchTypes.join(', ') : 'budget';
      return true;
    }

    return false;
  });
}

module.exports = { matchPropertiesToLead }; 