import React, { useState } from 'react';
import RestaurantList from '../components/RestaurantList';
import ConnectWallet from '../components/ConnectWallet';

const HomePage = () => {
  const [searchAddress, setSearchAddress] = useState('');
  const [searchCuisine, setSearchCuisine] = useState('');

  const handleCuisineChange = (e) => {
    setSearchCuisine(e.target.value);
  };

  const handleCategoryClick = (cuisineType) => {
    setSearchCuisine(cuisineType);
  };

  const popularCuisines = ['Italian', 'Mexican', 'Japanese', 'Indian', 'French'];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-96 bg-cover bg-center" style={{ 
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1500&h=500&fit=crop)' 
      }}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Craving something delicious?</h1>
            <p className="text-xl mb-6">Order food from your favorite local restaurants.</p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <input
                type="text"
                placeholder="Enter your delivery address"
                className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg text-gray-800"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Search by cuisine type"
                className="w-full md:w-1/4 p-3 border border-gray-300 rounded-lg text-gray-800"
                value={searchCuisine}
                onChange={handleCuisineChange}
              />
              <button className="w-full md:w-auto p-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
                Find Food
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-6">Explore by Cuisine</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {popularCuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => handleCategoryClick(cuisine)}
                className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              >
                {cuisine}
              </button>
            ))}
          </div>
        </section>

        <section>
          <RestaurantList filters={{ cuisine: searchCuisine, address: searchAddress }} />
        </section>
      </div>
    </div>
  );
};

export default HomePage;