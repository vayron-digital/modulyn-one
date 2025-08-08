import React, { useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { FaBed, FaBath, FaRulerCombined, FaRegHeart, FaShareAlt, FaBalanceScale } from 'react-icons/fa';
import { PropertyType } from '../../utils/propertyTypes';
import { getCurrencyDisplay, useCurrencyStore } from '../../utils/currency';
import { formatPropertyTypeDisplay } from '../../utils/propertyTypesByLocation';
import LazyImage from '../common/LazyImage';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { MapPin, Building, DollarSign, Calendar, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'Available':
      return 'default';
    case 'Sold':
      return 'destructive';
    case 'Under Offer':
      return 'secondary';
    case 'Rented':
      return 'outline';
    case 'Off Market':
      return 'outline';
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
      className="group"
    >
      <Card className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group-hover:border-blue-300">
        <div className="relative">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            <LazyImage
              src={image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              placeholder="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
            />
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant={getStatusBadgeColor(status)} className="text-xs font-medium">
                {status}
              </Badge>
            </div>
            
            {/* Property Type Badge */}
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-xs font-medium">
                {formatPropertyTypeDisplay(type)}
              </Badge>
            </div>
            
            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={(e) => { e.stopPropagation(); onFavorite?.(); }}
                      >
                        <FaRegHeart className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add to Favorites</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 bg-white/90 hover:bg-white"
                        onClick={(e) => { e.stopPropagation(); onShare?.(); }}
                      >
                        <FaShareAlt className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share Property</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <CardContent className="p-4" onClick={handleClick}>
            {/* Title and Location */}
            <div className="mb-3">
              <h3 className="font-semibold text-slate-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-1 text-slate-600 text-sm">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-1">{location}</span>
              </div>
            </div>
            
            {/* Price */}
            <div className="mb-3">
              <div className="text-xl font-bold text-slate-900">
                {currencyDisplay.primary}
              </div>
              {secondary_currencies.length > 0 && (
                <div className="text-xs text-slate-500">
                  {currencyDisplay.secondary}
                </div>
              )}
            </div>
            
            {/* Property Details */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                  <FaBed className="h-3 w-3" />
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {typeof bedrooms === 'string' ? bedrooms : formatNumber(bedrooms)}
                </div>
                <div className="text-xs text-slate-500">Beds</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                  <FaBath className="h-3 w-3" />
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {typeof bathrooms === 'string' ? bathrooms : formatNumber(bathrooms)}
                </div>
                <div className="text-xs text-slate-500">Baths</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                  <FaRulerCombined className="h-3 w-3" />
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {typeof area === 'string' ? area : formatNumber(area)}
                </div>
                <div className="text-xs text-slate-500">Sqft</div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Listed {listingDate}</span>
              </div>
              {owner && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-20">{owner}</span>
                </div>
              )}
            </div>
          </CardContent>
          
          {/* Footer Actions */}
          <CardFooter className="px-4 pb-4 pt-0">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                onClick={(e) => { e.stopPropagation(); onCompare?.(); }}
              >
                <FaBalanceScale className="h-3 w-3 mr-1" />
                Compare
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={handleClick}
              >
                View Details
              </Button>
            </div>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
