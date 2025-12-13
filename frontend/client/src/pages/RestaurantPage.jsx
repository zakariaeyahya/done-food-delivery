import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantById } from '../services/api';
import { formatDateTime, formatPriceInMATIC } from '../utils/formatters';
import MenuItems from '../components/MenuItems';
import { useCart, useCartActions } from '../contexts/CartContext';
import { useWallet } from '../contexts/WalletContext';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [refreshing, setRefreshing] = useState(false);

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
        setError('Impossible de charger les details du restaurant.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const handleRefresh = async () => {
    if (!id) return;
    
    setRefreshing(true);
    try {
      setError('');
      const response = await getRestaurantById(id);
      setRestaurant(response.data.restaurant || response.data);
    } catch (err) {
      console.error(`Failed to refresh restaurant ${id}:`, err);
      setError('Impossible de charger les details du restaurant.');
    } finally {
      setRefreshing(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddToCart = async (item) => {
    if (!isConnected) {
      showToast('Veuillez connecter votre wallet pour ajouter des articles', 'error');
      return;
    }

    setAddingToCart(true);

    try {
      const result = await addToCart(item, restaurant._id, restaurant.address);

      if (result.success) {
        showToast(`${item.name} ajoute au panier !`, 'success');
      } else {
        showToast(result.error || 'Echec de l\'ajout au panier', 'error');
      }
    } catch (err) {
      console.error('[RestaurantPage] Error adding to cart:', err);
      showToast('Erreur lors de l\'ajout au panier', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="container mx-auto px-4 py-8 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
                <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chargement en cours...</h3>
            <p className="text-gray-500">Recuperation des informations du restaurant</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="container mx-auto px-4 py-8 relative">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Restaurant</h1>
                <p className="text-white/80 text-sm">Erreur de chargement</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h3>
              <p className="text-gray-500 mb-6 text-center">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Reessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
          <div className="container mx-auto px-4 py-8 relative">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Restaurant</h1>
                <p className="text-white/80 text-sm">Non trouve</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Restaurant introuvable</h3>
              <p className="text-gray-500 mb-6 text-center">Ce restaurant n'existe pas ou a ete supprime.</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Voir tous les restaurants
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overallRating = restaurant.reviews?.length > 0
    ? (restaurant.reviews.reduce((acc, review) => acc + review.rating, 0) / restaurant.reviews.length).toFixed(1)
    : null;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfStar">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#halfStar)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative h-72 md:h-96">
        {/* Background Image */}
        <div className="absolute inset-0">
          {restaurant.images && restaurant.images.length > 0 ? (
            <img
              src={restaurant.images[0]}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Back Button and Refresh */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Actualiser"
          >
            {refreshing ? (
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">
                    {restaurant.cuisine || 'Restaurant'}
                  </span>
                  {restaurant.isOpen !== false && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Ouvert
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{restaurant.address}</span>
                  </div>
                </div>
              </div>

              {/* Rating Badge */}
              {overallRating && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(parseFloat(overallRating))}</div>
                    <span className="text-white font-bold text-lg">{overallRating}</span>
                  </div>
                  <p className="text-white/80 text-sm">{restaurant.reviews?.length || 0} avis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Summary Bar */}
      {cart.itemCount > 0 && (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold">{cart.itemCount} article{cart.itemCount > 1 ? 's' : ''}</p>
                  <p className="text-white/80 text-sm">{formatPriceInMATIC(cart.total)}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="px-6 py-2 bg-white text-orange-500 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Voir le panier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Menu Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Notre Menu</h2>
                    <p className="text-white/80 text-sm">{restaurant.menu?.length || 0} plats disponibles</p>
                  </div>
                </div>
              </div>

              {/* Menu Content */}
              <div className="p-6">
                <MenuItems
                  menu={restaurant.menu}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={addingToCart}
                />
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Reviews Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Avis clients</h2>
                      <p className="text-white/80 text-sm">{restaurant.reviews?.length || 0} avis</p>
                    </div>
                  </div>
                </div>

                {/* Reviews Content */}
                <div className="p-4 max-h-[500px] overflow-y-auto">
                  {restaurant.reviews && restaurant.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {restaurant.reviews.map((review, index) => (
                        <div key={review.id || index} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {(review.customerName || 'A')[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{review.customerName || 'Anonyme'}</p>
                                <div className="flex">{renderStars(review.rating)}</div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDateTime(review.date, 'dd MMM yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Aucun avis pour le moment</p>
                      <p className="text-gray-400 text-sm mt-1">Soyez le premier a donner votre avis !</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
