import React, { useState, useEffect, useMemo } from 'react';
import { getRestaurants } from '../services/api';
import RestaurantCard from './RestaurantCard';

const RestaurantList = () => {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [filters, setFilters] = useState({
    cuisine: '',
    rating: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getRestaurants();

        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.restaurants)) {
          data = response.data.restaurants;
        } else {
          console.error('Invalid response format:', response.data);
          setError('Format de données invalide');
        }
        setAllRestaurants(data);
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        setError('Impossible de charger les restaurants. Veuillez réessayer.');
        setAllRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const availableCuisines = useMemo(() => {
    const cuisines = allRestaurants
      .map((r) => r.cuisine)
      .filter((cuisine) => cuisine && cuisine.trim() !== '');
    return [...new Set(cuisines)].sort();
  }, [allRestaurants]);

  const filteredRestaurants = useMemo(() => {
    return allRestaurants.filter((restaurant) => {
      if (filters.cuisine && restaurant.cuisine !== filters.cuisine) {
        return false;
      }
      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        const restaurantRating = restaurant.rating || restaurant.averageRating || 0;
        if (restaurantRating < minRating) {
          return false;
        }
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = restaurant.name?.toLowerCase().includes(searchLower);
        const cuisineMatch = restaurant.cuisine?.toLowerCase().includes(searchLower);
        if (!nameMatch && !cuisineMatch) {
          return false;
        }
      }
      return true;
    });
  }, [allRestaurants, filters]);

  const handleCuisineClick = (cuisine) => {
    setFilters((prev) => ({
      ...prev,
      cuisine: prev.cuisine === cuisine ? '' : cuisine,
    }));
  };

  const handleRatingClick = (rating) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === rating ? '' : rating,
    }));
  };

  const clearFilters = () => {
    setFilters({ cuisine: '', rating: '', search: '' });
  };

  const hasActiveFilters = filters.cuisine || filters.rating || filters.search;

  const ratingOptions = [
    { value: '4', label: '4+', stars: 4 },
    { value: '3', label: '3+', stars: 3 },
    { value: '2', label: '2+', stars: 2 },
  ];

  const StarIcon = ({ filled }) => (
    <svg
      className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <div className="container px-4 mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Nos Restaurants
        </h2>
        <p className="text-gray-600">
          Découvrez les meilleurs restaurants près de chez vous
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher un restaurant ou une cuisine..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Effacer tout
            </button>
          )}
        </div>

        {/* Cuisine Filter */}
        {availableCuisines.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Type de cuisine</p>
            <div className="flex flex-wrap gap-2">
              {availableCuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => handleCuisineClick(cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.cuisine === cuisine
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rating Filter */}
        <div>
          <p className="text-sm text-gray-500 mb-2">Note minimum</p>
          <div className="flex flex-wrap gap-2">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRatingClick(option.value)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filters.rating === option.value
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                }`}
              >
                <span>{option.label}</span>
                <StarIcon filled={true} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-800">{filteredRestaurants.length}</span>
            {' '}restaurant{filteredRestaurants.length !== 1 ? 's' : ''} trouvé{filteredRestaurants.length !== 1 ? 's' : ''}
          </p>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Filtres actifs:</span>
              {filters.cuisine && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  {filters.cuisine}
                </span>
              )}
              {filters.rating && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                  {filters.rating}+ <StarIcon filled={true} />
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Chargement des restaurants...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRestaurants.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun restaurant trouvé</h3>
          <p className="text-gray-500 mb-6">Essayez de modifier vos critères de recherche</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {/* Restaurant Grid */}
      {!loading && !error && filteredRestaurants.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id || restaurant._id || restaurant.address}
              restaurant={restaurant}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
