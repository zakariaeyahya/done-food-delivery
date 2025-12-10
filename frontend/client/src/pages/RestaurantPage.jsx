import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantById } from '../services/api';
import { getImageUrl } from '../services/ipfs';
import { formatDateTime } from '../utils/formatters';
import MenuItems from '../components/MenuItems';

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getRestaurantById(id);
        setRestaurant(response.data);
      } catch (err) {
        console.error(`Failed to fetch restaurant ${id}:`, err);
        setError('Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  if (loading) return <p className="text-center mt-8">Loading restaurant...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
  if (!restaurant) return <p className="text-center mt-8">Restaurant not found.</p>;
  
  const overallRating = restaurant.reviews?.length > 0 
    ? (restaurant.reviews.reduce((acc, review) => acc + review.rating, 0) / restaurant.reviews.length).toFixed(1)
    : 'No reviews yet';


  return (
    <div className="container mx-auto p-4 sm:p-8">
      {/* Restaurant Header */}
      <header className="mb-8">
        <img 
          src={restaurant.ipfsImageHash ? getImageUrl(restaurant.ipfsImageHash) : 'https://via.placeholder.com/1200x400'} 
          alt={restaurant.name}
          className="w-full h-64 object-cover rounded-lg shadow-lg"
        />
        <h1 className="mt-4 text-4xl font-bold">{restaurant.name}</h1>
        <p className="text-lg text-gray-600">{restaurant.cuisine}</p>
        <p className="text-sm text-gray-500">{restaurant.address}</p>
        <div className="flex items-center mt-2">
            <span className="text-yellow-500">{'★'.repeat(Math.round(overallRating))}</span>
            <span className="text-gray-400">{'★'.repeat(5 - Math.round(overallRating))}</span>
            <span className="ml-2 text-gray-600">{overallRating} ({restaurant.reviews?.length || 0} reviews)</span>
        </div>
      </header>

      {/* Main Content: Menu and Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Section */}
        <main className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-4">Menu</h2>
          <MenuItems menu={restaurant.menu} onAddToCart={(item) => console.log('Add to cart:', item)} />
        </main>

        {/* Reviews Section */}
        <aside>
          <div className="sticky top-8">
            <h2 className="text-3xl font-bold mb-4">Customer Reviews</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {restaurant.reviews && restaurant.reviews.length > 0 ? (
                restaurant.reviews.map(review => (
                  <div key={review.id} className="p-4 bg-gray-50 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{review.customerName || 'Anonymous'}</p>
                      <div className="text-yellow-500">{'★'.repeat(review.rating)}</div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">"{review.comment}"</p>
                    <p className="text-xs text-gray-400 text-right mt-2">{formatDateTime(review.date, 'dd MMM yyyy')}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RestaurantPage;