import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/ipfs';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    const restaurantId = restaurant.id || restaurant._id || restaurant.address;
    navigate(`/restaurant/${restaurantId}`);
  };

  const imageUrl = restaurant.ipfsImageHash 
    ? getImageUrl(restaurant.ipfsImageHash) 
    : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop';
  
  const displayRating = (restaurant.rating || 0).toFixed(1);
  const displayReviewCount = restaurant.reviewCount !== undefined ? `(${restaurant.reviewCount} reviews)` : '';
  const displayDeliveryTime = restaurant.estimatedDeliveryTime ? `~${restaurant.estimatedDeliveryTime}` : 'N/A';

  return (
    <div
      className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={handleCardClick}
    >
      <img className="object-cover w-full h-48" src={imageUrl} alt={restaurant.name} />
      <div className="p-4">
        <h3 className="text-xl font-bold">{restaurant.name}</h3>
        <p className="mt-1 text-sm text-gray-600">{restaurant.cuisine || 'Cuisine not specified'}</p>
        <div className="flex items-center mt-2 text-sm">
          <span className="text-yellow-500">{'★'.repeat(Math.round(restaurant.rating || 0))}</span>
          <span className="text-gray-400">{'★'.repeat(5 - Math.round(restaurant.rating || 0))}</span>
          <span className="ml-1 text-gray-500">{displayRating} {displayReviewCount}</span>
        </div>
        <p className="mt-2 text-sm">
          Estimated Delivery: <span className="font-semibold">{displayDeliveryTime}</span>
        </p>
      </div>
    </div>
  );
};

export default RestaurantCard;