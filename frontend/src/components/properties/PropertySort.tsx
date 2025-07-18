import React from 'react';

interface PropertySortProps {
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
  onChange: (sort: PropertySortProps['sort']) => void;
}

const PropertySort: React.FC<PropertySortProps> = ({ sort, onChange }) => {
  const handleFieldChange = (field: string) => {
    onChange({ field, order: sort.order });
  };

  const handleOrderChange = (order: 'asc' | 'desc') => {
    onChange({ field: sort.field, order });
  };

  return (
    <div className="flex items-center gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sort By
        </label>
        <select
          value={sort.field}
          onChange={(e) => handleFieldChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="created_at">Date Added</option>
          <option value="price">Price</option>
          <option value="title">Title</option>
          <option value="bedrooms">Bedrooms</option>
          <option value="bathrooms">Bathrooms</option>
          <option value="square_feet">Square Feet</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Order
        </label>
        <select
          value={sort.order}
          onChange={(e) => handleOrderChange(e.target.value as 'asc' | 'desc')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
};

export default PropertySort; 