import React, { useState, useMemo } from 'react';
import { formatPriceInMATIC, truncateText } from '../utils/formatters';

/**
 * Composant pour afficher le menu d'un restaurant avec filtres par categorie.
 */
const MenuItems = ({ menu = [], onAddToCart, isAddingToCart = false }) => {
  const [activeCategory, setActiveCategory] = useState('Tout');

  const categories = useMemo(() => {
    const allCategories = menu.map(item => item.category);
    return ['Tout', ...new Set(allCategories)];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'Tout') {
      return menu;
    }
    return menu.filter(item => item.category === activeCategory);
  }, [menu, activeCategory]);

  const handleAddToCart = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  if (!menu || menu.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Aucun plat disponible</p>
        <p className="text-gray-400 text-sm mt-1">Le menu sera bientot mis a jour</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              activeCategory === category
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredMenu.length} plat{filteredMenu.length > 1 ? 's' : ''} {activeCategory !== 'Tout' ? `dans "${activeCategory}"` : 'disponible' + (filteredMenu.length > 1 ? 's' : '')}
      </p>

      {/* Menu Item List */}
      <div className="space-y-4">
        {filteredMenu.map((item, index) => (
          <div
            key={item._id || item.id || index}
            className="group flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {/* Item Image */}
            <div className="relative w-full sm:w-28 h-28 flex-shrink-0">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              {/* Category badge */}
              {item.category && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-600 rounded-full">
                  {item.category}
                </span>
              )}
            </div>

            {/* Item Info */}
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {truncateText(item.description || 'Delicieux plat prepare avec soin', 100)}
                </p>
              </div>

              {/* Price and Add Button */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-orange-500">
                    {formatPriceInMATIC(item.price)}
                  </span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPriceInMATIC(item.originalPrice)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={isAddingToCart}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    isAddingToCart
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Ajout...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Ajouter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results for filter */}
      {filteredMenu.length === 0 && activeCategory !== 'Tout' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Aucun plat dans cette categorie</p>
          <button
            onClick={() => setActiveCategory('Tout')}
            className="mt-3 text-orange-500 font-medium hover:underline"
          >
            Voir tous les plats
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuItems;
