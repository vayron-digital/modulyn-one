import React, { useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { FaBed, FaBath, FaRulerCombined, FaRegHeart, FaShareAlt, FaBalanceScale } from 'react-icons/fa';
import { PropertyType } from '../../utils/propertyTypes';
import { getCurrencyDisplay, useCurrencyStore } from '../../utils/currency';
import LazyImage from '../common/LazyImage';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';

interface PropertyCardProps {
  id: string;
  refNo: string;
  title: string;
  price: number;
  type: PropertyType;
  location: string;
  bedrooms: string | number;
  bathrooms: string | number;
  area: string | number;
  status: string;
  listingDate: string;
  owner: string;
  image: string;
  onFavorite?: () => void;
  onShare?: () => void;
  onCompare?: () => void;
  onClick?: () => void;
}

const formatNumber = (value: number | undefined) =>
  typeof value === 'number' && !isNaN(value) ? value.toLocaleString() : 'N/A';

const statusColors: Record<string, string> = {
  Available: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  Sold: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  'Under Offer': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Available':
      return 'default';
    case 'Sold':
      return 'destructive';
    case 'Under Offer':
      return 'secondary';
    default:
      return 'default';
  }
};

const PropertyCard: React.FC<PropertyCardProps> = React.memo(({
  id, refNo, title, price, type, location, bedrooms, bathrooms, area, status, listingDate, owner, image, onFavorite, onShare, onCompare, onClick
}) => {
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const { currency: primaryCurrency, secondary_currencies } = useCurrencyStore();
  const currencyDisplay = getCurrencyDisplay(price ?? 0, primaryCurrency);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <LazyImage
          src={image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
          alt={title}
          className="w-full h-full object-cover"
          placeholder="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={getStatusBadgeColor(status)}>
            {status}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{location}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary">
            {currencyDisplay.primary}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span><FaBed className="inline-block" /> {typeof bedrooms === 'string' ? bedrooms : formatNumber(bedrooms)}</span>
            <span>•</span>
            <span><FaBath className="inline-block" /> {typeof bathrooms === 'string' ? bathrooms : formatNumber(bathrooms)}</span>
            <span>•</span>
            <span><FaRulerCombined className="inline-block" /> {typeof area === 'string' ? area : formatNumber(area)} sqft</span>
          </div>
        </div>
      </div>
      <CardFooter className="flex justify-between gap-2 pt-2 px-6 pb-6">
        <Button size="icon" variant="ghost" className="hover:bg-pink-100" onClick={e => { e.stopPropagation(); onFavorite && onFavorite(); }}><FaRegHeart /></Button>
        <Button size="icon" variant="ghost" className="hover:bg-blue-100" onClick={e => { e.stopPropagation(); onShare && onShare(); }}><FaShareAlt /></Button>
        <Button size="icon" variant="ghost" className="hover:bg-yellow-100" onClick={e => { e.stopPropagation(); onCompare && onCompare(); }}><FaBalanceScale /></Button>
      </CardFooter>
    </motion.div>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
