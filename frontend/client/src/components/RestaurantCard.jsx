import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/ipfs'; // Assuming ipfs.js is in the same services directory

/**
 * A card component to display information about a single restaurant.
 * @param {object} props - The props object.
 * @param {object} props.restaurant - The restaurant data to display.
 * @param {string} props.restaurant.id - Unique ID of the restaurant.
 * @param {string} props.restaurant.name - Name of the restaurant.
 * @param {string} props.restaurant.cuisine - Type of cuisine.
 * @param {string} props.restaurant.ipfsImageHash - IPFS hash for the restaurant's image.
 * @param {number} props.restaurant.rating - Average rating of the restaurant.
 * @param {number} props.restaurant.reviewCount - Total number of reviews.
 * @param {string} props.restaurant.estimatedDeliveryTime - Estimated delivery time (e.g., "30-45 min").
 */
const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  const imageUrl = restaurant.ipfsImageHash ? getImageUrl(restaurant.ipfsImageHash) : 'https://via.placeholder.com/400x200.png?text=Restaurant';
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
