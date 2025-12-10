import React, { useState, useEffect, useCallback } from 'react';
import { getOrdersByClient, submitReview } from '../services/api';
import { formatDateTime, formatPriceInEUR } from '../utils/formatters';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const ORDERS_PER_PAGE = 5;

const OrderHistory = ({ clientAddress }) => {
  const { address, isConnected } = useWallet();
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Fetch orders (mémoïsé pour éviter les re-renders inutiles)
   */
  const fetchOrders = useCallback(async () => {
    if (!clientAddress) return;

    try {
      setLoading(true);
      setError('');
      const response = await getOrdersByClient(clientAddress);
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch order history:', err);
      setError('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  }, [clientAddress]);

  /**
   * Charger l'historique des commandes quand l’adresse change
   */
  useEffect(() => {
    if (!isConnected) return;
    fetchOrders();
  }, [isConnected, fetchOrders]);

  /**
   * Garde si wallet pas connecté
   */
  if (!isConnected) {
    return <p className="text-center text-gray-500">Please connect wallet first.</p>;
  }

  if (!clientAddress) {
    return <p className="text-center text-red-500">Invalid client address.</p>;
  }

  /** PAGINATION CALCULATIONS **/
  const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

  /** HANDLERS **/
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const handleViewDetails = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleReorder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.items.forEach(item => {
      dispatch({ type: 'ADD_ITEM', payload: item });
    });

    navigate('/checkout');
  };

  const handleLeaveReview = async (orderId) => {
    if (!isConnected) {
      alert('Please connect wallet first');
      return;
    }

    const rating = 5;
    const comment = 'Great food!';

    try {
      await submitReview({
        orderId,
        rating,
        comment,
        clientAddress: address,
      });

      alert('Review submitted successfully!');
      fetchOrders(); // Rafraîchir commandes
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    }
  };

  /** RENDER **/
  if (loading) return <p>Loading order history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (orders.length === 0) return <p>You have no past orders.</p>;

  return (
    <div className="p-6 bg-white border rounded-lg shadow-xl">
      <h2 className="mb-4 text-2xl font-bold">Your Order History</h2>

      <div className="space-y-4">
        {currentOrders.map(order => (
          <div 
            key={order.id} 
            className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center"
          >
            <div className="flex-1 mb-4 sm:mb-0">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Restaurant:</strong> {order.restaurantName || 'N/A'}</p>
              <p><strong>Date:</strong> {formatDateTime(order.date)}</p>
              <p><strong>Total:</strong> {formatPriceInEUR(order.total)}</p>
              <p><strong>Status:</strong> <span className="text-blue-600">{order.status}</span></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => handleViewDetails(order.id)} 
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Details
              </button>

              <button 
                onClick={() => handleReorder(order.id)} 
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Reorder
              </button>

              {order.status === 'DELIVERED' && (
                <button 
                  onClick={() => handleLeaveReview(order.id)} 
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={handlePrevPage} 
          disabled={currentPage === 1} 
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>

        <span>Page {currentPage} of {totalPages}</span>

        <button 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages} 
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrderHistory;