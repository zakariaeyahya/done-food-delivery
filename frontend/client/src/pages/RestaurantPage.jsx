import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantById } from '../services/api';
import { formatDateTime } from '../utils/formatters';
import MenuItems from '../components/MenuItems';
import { useCart, useCartActions } from '../contexts/CartContext';
import { useWallet } from '../contexts/WalletContext';

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  const { isConnected } = useWallet();
  const cart = useCart();
  const { addToCart } = useCartActions();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getRestaurantById(id);
        setRestaurant(response.data.restaurant || response.data);
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

  const handleAddToCart = async (item) => {
    console.log('[RestaurantPage] Add to cart clicked:', item);

    if (!isConnected) {
      setCartMessage('Please connect your wallet to add items to cart');
      setTimeout(() => setCartMessage(''), 3000);
      return;
    }

    setAddingToCart(true);
    setCartMessage('');

    try {
      const result = await addToCart(item, restaurant._id, restaurant.address);

      if (result.success) {
        console.log('[RestaurantPage] Item added successfully:', result);
        setCartMessage(`${item.name} added to cart!`);
      } else {
        console.error('[RestaurantPage] Failed to add item:', result.error);
        setCartMessage(result.error || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('[RestaurantPage] Error adding to cart:', err);
      setCartMessage('Error adding item to cart');
    } finally {
      setAddingToCart(false);
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8">
      {/* Restaurant Header */}
      <header className="mb-8">
        <img 
          src={restaurant.images && restaurant.images.length > 0 ? restaurant.images[0] : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400"%3E%3Crect fill="%23e5e7eb" width="1200" height="400"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="32" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image Available%3C/text%3E%3C/svg%3E'} 
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

          {/* Cart Message */}
          {cartMessage && (
            <div className={`mb-4 p-3 rounded-lg ${
              cartMessage.includes('added') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {cartMessage}
            </div>
          )}

          {/* Cart Summary */}
          {cart.itemCount > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold">Cart: {cart.itemCount} item(s) - {cart.total.toFixed(4)} MATIC</p>
            </div>
          )}

          <MenuItems
            menu={restaurant.menu}
            onAddToCart={handleAddToCart}
            isAddingToCart={addingToCart}
          />
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