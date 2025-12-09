import React, { useState, useEffect } from 'react';
import { getRestaurants } from '../services/api';
import RestaurantCard from './RestaurantCard';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState({
    cuisine: '',
    priceRange: '',
    rating: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getRestaurants(filters);
        // Assuming the API returns an array of restaurants in response.data
        setRestaurants(response.data);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [filters]); // Refetch when filters change

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="container p-4 mx-auto">
      <h2 className="mb-6 text-3xl font-bold text-center">Our Restaurants</h2>

      {/* Filter Section */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <select name="cuisine" value={filters.cuisine} onChange={handleFilterChange} className="p-2 border rounded">
          <option value="">All Cuisines</option>
          {/* These would typically come from an API or a predefined list */}
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
          <option value="Japanese">Japanese</option>
          <option value="Indian">Indian</option>
        </select>
        <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange} className="p-2 border rounded">
          <option value="">All Prices</option>
          <option value="$">$</option>
          <option value="$$">$$</option>
          <option value="$$$">$$$</option>
        </select>
        <select name="rating" value={filters.rating} onChange={handleFilterChange} className="p-2 border rounded">
          <option value="">All Ratings</option>
          <option value="4">4 Stars & Up</option>
          <option value="3">3 Stars & Up</option>
          <option value="2">2 Stars & Up</option>
          <option value="1">1 Star & Up</option>
        </select>
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <p className="text-center">Loading restaurants...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;