import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderTracking from '../components/OrderTracking';
import { getOrderById } from '../services/api';
import { SocketProvider } from '../contexts/SocketContext';

const TrackingPage = () => {
  const { orderId, id } = useParams();
  const navigate = useNavigate();
  const actualOrderId = orderId || id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!actualOrderId) {
      setError('Identifiant de commande requis');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getOrderById(actualOrderId);
        const orderData = response.data.order || response.data;
        setOrder(orderData);
      } catch (err) {
          setError('Impossible de charger les details de la commande.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [actualOrderId]);

  const handleRefresh = async () => {
    if (!actualOrderId) return;
    
    setRefreshing(true);
    try {
      setError('');
      const response = await getOrderById(actualOrderId);
      const orderData = response.data.order || response.data;
      setOrder(orderData);
    } catch (err) {
      setError('Impossible de charger les details de la commande.');
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
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

        {/* Loading content */}
        <div className="container mx-auto px-4 py-8 -mt-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Chargement en cours...</h3>
              <p className="text-gray-500">Recuperation des details de votre commande</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
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
                <h1 className="text-2xl md:text-3xl font-bold text-white">Suivi de commande</h1>
                <p className="text-white/80 text-sm">Une erreur est survenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error content */}
        <div className="container mx-auto px-4 py-8 -mt-4">
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

  // Order not found state
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
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
                <h1 className="text-2xl md:text-3xl font-bold text-white">Suivi de commande</h1>
                <p className="text-white/80 text-sm">Commande introuvable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Not found content */}
        <div className="container mx-auto px-4 py-8 -mt-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Commande introuvable</h3>
              <p className="text-gray-500 mb-6 text-center">
                Nous n'avons pas pu trouver cette commande. Verifiez l'identifiant et reessayez.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Retour a l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

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
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Suivi de commande</h1>
              <p className="text-white/80 text-sm">Commande #{actualOrderId}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="hidden md:flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium">En direct</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 -mt-4">
        <SocketProvider>
          <OrderTracking order={order} />
        </SocketProvider>
      </div>
    </div>
  );
};

export default TrackingPage;
