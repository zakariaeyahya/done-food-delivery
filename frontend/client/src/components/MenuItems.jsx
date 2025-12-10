import React, { useState, useMemo } from 'react';
import { formatPriceInEUR, formatPriceInMATIC, truncateText } from '../utils/formatters';
import { getImageUrl } from '../services/ipfs';

/**
 * A component to display a restaurant's menu with category filters.
 * @param {object} props - The props object.
 * @param {Array<object>} props.menu - The list of menu items for the restaurant.
 * @param {Function} props.onAddToCart - Function to handle adding an item to the cart.
 */
const MenuItems = ({ menu = [], onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const allCategories = menu.map(item => item.category);
    return ['All', ...new Set(allCategories)];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'All') {
      return menu;
    }
    return menu.filter(item => item.category === activeCategory);
  }, [menu, activeCategory]);

  const handleAddToCart = (item) => {
    console.log('Added to cart:', item);
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  return (
    <div className="w-full">
      {/* Category Filters */}
      <div className="flex justify-center mb-6 space-x-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              activeCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Item List */}
      <div className="space-y-4">
        {filteredMenu.map(item => (
          <div key={item.id} className="flex p-4 bg-white border rounded-lg shadow-sm">
            <img 
              src={item.ipfsImageHash ? getImageUrl(item.ipfsImageHash) : 'https://via.placeholder.com/100'} 
              alt={item.name}
              className="object-cover w-24 h-24 mr-4 rounded-md"
            />
            <div className="flex-grow">
              <h4 className="font-bold text-md">{item.name}</h4>
              <p className="text-sm text-gray-600">{truncateText(item.description, 80)}</p>
              <div className="mt-2 text-sm font-semibold">
                <span>{formatPriceInEUR(item.priceEUR)}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span>{formatPriceInMATIC(item.priceMATIC)}</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => handleAddToCart(item)}
                className="px-3 py-1 ml-4 text-sm font-bold text-white bg-green-500 rounded-lg hover:bg-green-600"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuItems;