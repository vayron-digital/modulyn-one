import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { FaBed, FaBath, FaRulerCombined, FaRegHeart, FaShareAlt, FaBalanceScale } from 'react-icons/fa';
import { PropertyType } from '../../utils/propertyTypes';
import { getCurrencyDisplay, useCurrencyStore } from '../../utils/currency';

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

const PropertyCard: React.FC<PropertyCardProps> = ({
  id, refNo, title, price, type, location, bedrooms, bathrooms, area, status, listingDate, owner, image, onFavorite, onShare, onCompare, onClick
}) => {
  const { primaryCurrency, secondary_currencies } = useCurrencyStore();
  const currencyDisplay = getCurrencyDisplay(price ?? 0, primaryCurrency);
  return (
    <Card
      className="group cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-border dark:border-border-dark rounded-2xl overflow-hidden min-w-[300px] max-w-[500px] w-full h-full bg-card dark:bg-card-dark"
      onClick={onClick}
      style={{ minHeight: 420 }}
    >
      <div className="relative w-full aspect-[16/9] bg-muted dark:bg-muted-dark flex items-center justify-center overflow-hidden">
        <img
          src={image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
          alt={title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          style={{ minHeight: 180 }}
        />
        <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded ${statusColors[status] || 'bg-muted dark:bg-muted-dark text-foreground dark:text-foreground-dark'}`}>{status}</span>
      </div>
      <CardHeader className="pb-2 pt-6 px-6">
        <CardTitle className="text-xl font-bold text-foreground dark:text-foreground-dark truncate">{title}</CardTitle>
        <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark font-medium">Ref: {refNo}</div>
        <div className="text-base font-semibold text-primary dark:text-primary-dark mt-1">{currencyDisplay.primary}</div>
        <div className="text-xs text-muted-foreground dark:text-muted-foreground-dark space-y-0.5">
          {currencyDisplay.secondary.map((display, idx) => (
            <div key={idx}>{display}</div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-6 pb-4">
        <div className="text-sm text-gray-600 mb-2 truncate">{location}</div>
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-2">
          <span className="flex items-center gap-1"><FaBed className="inline-block" /> {typeof bedrooms === 'string' ? bedrooms : formatNumber(bedrooms)}</span>
          <span className="flex items-center gap-1"><FaBath className="inline-block" /> {typeof bathrooms === 'string' ? bathrooms : formatNumber(bathrooms)}</span>
          <span className="flex items-center gap-1"><FaRulerCombined className="inline-block" /> {typeof area === 'string' ? area : formatNumber(area)} sqft</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Type: <span className="font-medium text-gray-700">{type}</span></span>
          <span>Listed: {listingDate}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">Owner: <span className="font-medium text-gray-700">{owner}</span></div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-2 px-6 pb-6">
        <Button size="icon" variant="ghost" className="hover:bg-pink-100" onClick={e => { e.stopPropagation(); onFavorite && onFavorite(); }}><FaRegHeart /></Button>
        <Button size="icon" variant="ghost" className="hover:bg-blue-100" onClick={e => { e.stopPropagation(); onShare && onShare(); }}><FaShareAlt /></Button>
        <Button size="icon" variant="ghost" className="hover:bg-yellow-100" onClick={e => { e.stopPropagation(); onCompare && onCompare(); }}><FaBalanceScale /></Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
