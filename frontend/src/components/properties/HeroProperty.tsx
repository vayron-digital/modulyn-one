import React from 'react';

const HeroProperty = ({ property, onAddToMetamask, onViewDetails }) => {
  if (!property) return null;
  return (
    <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
      <div className="flex-1 min-w-[320px] max-w-[600px] relative">
        <img src={property.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'} alt={property.title} className="object-cover w-full h-80 lg:h-full" />
        <span className="absolute bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow">{property.status || 'Available'}</span>
      </div>
      <div className="flex-1 flex flex-col justify-between p-8 bg-gray-50 text-gray-900">
        <div>
          <h2 className="text-2xl font-bold mb-2">{property.title}</h2>
          <div className="flex items-center gap-2 text-sm mb-4">
            <span className="text-yellow-600">{property.location}</span>
            <span className="text-gray-500">| {property.distance || '7 mins from city center'}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Market Cap</div>
              <div className="font-bold text-lg">${property.marketCap?.toLocaleString() || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Token NAV</div>
              <div className="font-bold text-lg">${property.tokenNAV?.toLocaleString() || '0.00'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Current Price</div>
              <div className="font-bold text-lg">${property.currentPrice?.toLocaleString() || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Floor Size</div>
              <div className="font-bold text-lg">{property.floorSize?.toLocaleString() || 'N/A'} ft²</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">IRO Sale Price</div>
              <div className="font-bold text-lg">${property.iroSalePrice?.toLocaleString() || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">IRO Participants</div>
              <div className="font-bold text-lg">{property.iroParticipants || 'N/A'}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={onAddToMetamask} className="bg-lime-500 hover:bg-lime-600 text-black font-bold px-6 py-2 rounded-full shadow">Add to Metamask</button>
          <button onClick={onViewDetails} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold px-6 py-2 rounded-full">View property details</button>
        </div>
      </div>
    </div>
  );
};

export default HeroProperty; 