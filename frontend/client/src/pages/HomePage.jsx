import React, { useState, useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import RestaurantList from '../components/RestaurantList';
import ConnectWallet from '../components/ConnectWallet'; // Assuming you want this on the homepage

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your Google Maps API Key
const LIBRARIES = ['places'];

const HomePage = () => {
  const [searchAddress, setSearchAddress] = useState('');
  const [searchCuisine, setSearchCuisine] = useState('');
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setSearchAddress(place.formatted_address);
    }
  };

  const handleCuisineChange = (e) => {
    setSearchCuisine(e.target.value);
  };

  const handleCategoryClick = (cuisineType) => {
    setSearchCuisine(cuisineType);
  };

  const popularCuisines = ['Italian', 'Mexican', 'Japanese', 'Indian', 'French']; // Example categories

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: 'url("https://via.placeholder.com/1500x500/cccccc/ffffff?text=Delicious+Food")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Craving something delicious?</h1>
            <p className="text-xl mb-6">Order food from your favorite local restaurants.</p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <div className="w-full md:w-1/2">
                {loadError && <p>Error loading Google Maps</p>}
                {isLoaded && (
                  <Autocomplete
                    onLoad={(ref) => (autocompleteRef.current = ref)}
                    onPlaceChanged={handlePlaceChanged}
                  >
                    <input
                      type="text"
                      placeholder="Enter your delivery address"
                      className="w-full p-3 border border-gray-300 rounded-lg text-gray-800"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                    />
                  </Autocomplete>
                )}
              </div>
              <input
                type="text"
                placeholder="Search by cuisine type (e.g., Italian)"
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
        {/* Featured Cuisine Categories */}
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

        {/* Popular Restaurants List (Filtered by search/category) */}
        <section>
          {/* You might pass the searchAddress and searchCuisine to RestaurantList as props */}
          <RestaurantList filters={{ cuisine: searchCuisine, address: searchAddress }} />
        </section>
        
        {/* Example of ConnectWallet on homepage, remove if not desired here */}
        <section className="mt-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;