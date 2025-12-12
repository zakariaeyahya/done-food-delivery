import React, { useState, useEffect, useCallback } from 'react';
import { getOrdersByClient, submitReview } from '../services/api';
import { formatDateTime, formatPriceInMATIC } from '../utils/formatters';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

const ORDERS_PER_PAGE = 5;

const statusConfig = {
  CREATED: { label: 'Créée', color: 'bg-blue-100 text-blue-700', icon: '📝' },
  PREPARING: { label: 'En préparation', color: 'bg-yellow-100 text-yellow-700', icon: '👨‍🍳' },
  READY: { label: 'Prête', color: 'bg-purple-100 text-purple-700', icon: '✅' },
  IN_DELIVERY: { label: 'En livraison', color: 'bg-orange-100 text-orange-700', icon: '🚴' },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-700', icon: '✓' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: '✕' },
  DISPUTED: { label: 'En litige', color: 'bg-red-100 text-red-700', icon: '⚠️' },
};

const StarRating = ({ rating, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const OrderHistory = ({ clientAddress }) => {
  const { address, isConnected } = useWallet();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewModal, setReviewModal] = useState({ open: false, orderId: null });
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const fetchOrders = useCallback(async () => {
    if (!clientAddress) return;

    try {
      setLoading(true);
      setError('');
      const response = await getOrdersByClient(clientAddress);
      setOrders(response.data.orders || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setOrders([]);
        setError('');
      } else {
        console.error('Failed to fetch order history:', err);
        setError('Impossible de charger l\'historique des commandes.');
      }
    } finally {
      setLoading(false);
    }
  }, [clientAddress]);

  useEffect(() => {
    if (!isConnected) return;
    fetchOrders();
  }, [isConnected, fetchOrders]);

  const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE) || 1;

  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleViewDetails = (orderId) => navigate(`/order/${orderId}`);

  const openReviewModal = (orderId) => {
    setReviewModal({ open: true, orderId });
    setReviewData({ rating: 5, comment: '' });
  };

  const handleSubmitReview = async () => {
    if (!isConnected || !reviewModal.orderId) return;

    try {
      setSubmittingReview(true);
      const response = await submitReview({
        orderId: reviewModal.orderId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        clientAddress: address,
      });

      // Store the submitted review locally
      setSubmittedReviews((prev) => ({
        ...prev,
        [reviewModal.orderId]: {
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: response.data?.review?.createdAt || new Date().toISOString(),
        },
      }));

      setReviewModal({ open: false, orderId: null });
      setSuccessMessage('Avis envoyé avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchOrders();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Check if order has a review (from API or locally submitted)
  const getOrderReview = (order) => {
    const orderId = order.orderId || order.id || order._id;
    // Check locally submitted reviews first
    if (submittedReviews[orderId]) {
      return submittedReviews[orderId];
    }
    // Check if order has review from API
    if (order.review) {
      return order.review;
    }
    if (order.hasReview && order.rating) {
      return { rating: order.rating, comment: order.reviewComment };
    }
    return null;
  };

  const getStatusInfo = (status) => {
    return statusConfig[status] || { label: status || 'Inconnu', color: 'bg-gray-100 text-gray-700', icon: '?' };
  };

  // Not connected state
  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="text-gray-500">Veuillez connecter votre wallet</p>
      </div>
    );
  }

  // Invalid address
  if (!clientAddress) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Adresse client invalide</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500">Chargement de l'historique...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune commande</h3>
        <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          Découvrir les restaurants
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {currentOrders.map((order) => {
          const orderId = order.orderId || order.id || order._id;
          const statusInfo = getStatusInfo(order.status);
          const orderReview = getOrderReview(order);

          return (
            <div
              key={orderId}
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-2xl">
                    {statusInfo.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {order.restaurant?.name || order.restaurantName || 'Restaurant'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Commande #{String(orderId).slice(-8)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">
                    {formatDateTime(order.createdAt || order.date)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Articles</p>
                  <p className="font-medium text-gray-800">
                    {order.items?.length || 0} article{(order.items?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-medium text-gray-800">
                    {formatPriceInMATIC(order.totalAmount || order.total)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Paiement</p>
                  <p className="font-medium text-gray-800">
                    {order.paymentMethod || 'Crypto'}
                  </p>
                </div>
              </div>

              {/* Items Preview */}
              {order.items && order.items.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="bg-white px-2 py-1 rounded text-xs text-gray-600">
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                  {order.items.length > 3 && (
                    <span className="bg-white px-2 py-1 rounded text-xs text-gray-500">
                      +{order.items.length - 3} autres
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(orderId)}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:border-orange-300 hover:text-orange-500 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Détails
                </button>

                {order.status === 'DELIVERED' && !orderReview && (
                  <button
                    onClick={() => openReviewModal(orderId)}
                    className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Laisser un avis
                  </button>
                )}

                {/* Display submitted review */}
                {orderReview && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm text-green-700 font-medium">Votre avis :</span>
                    <StarRating rating={orderReview.rating} />
                    <span className="text-sm text-green-600">({orderReview.rating}/5)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Précédent
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  page === currentPage
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Suivant
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Laisser un avis</h3>
              <button
                onClick={() => setReviewModal({ open: false, orderId: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Votre note</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-10 h-10 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Votre commentaire</p>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="Partagez votre expérience..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setReviewModal({ open: false, orderId: null })}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
              >
                {submittingReview ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
