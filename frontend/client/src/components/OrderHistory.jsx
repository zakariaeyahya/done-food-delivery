import React, { useState, useEffect } from 'react';
import { getOrdersByClient } from '../services/api';
import { formatDateTime, formatPriceInEUR } from '../utils/formatters';

const ORDERS_PER_PAGE = 5;

/**
 * A component to display a user's order history with pagination.
 * @param {object} props - The props object.
 * @param {string} props.clientAddress - The blockchain address of the client.
 */
const OrderHistory = ({ clientAddress }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!clientAddress) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getOrdersByClient(clientAddress);
        // Assuming API returns orders sorted by date descending
        setOrders(response.data);
      } catch (err) {
        console.error('Failed to fetch order history:', err);
        setError('Failed to load order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [clientAddress]);

  // Pagination logic
  const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Placeholder action handlers
  const handleViewDetails = (orderId) => alert(`Viewing details for order ${orderId}`);
  const handleReorder = (orderId) => alert(`Reordering items from order ${orderId}`);
  const handleLeaveReview = (orderId) => alert(`Leaving a review for order ${orderId}`);


  if (loading) return <p>Loading order history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (orders.length === 0) return <p>You have no past orders.</p>;

  return (
    <div className="p-6 bg-white border rounded-lg shadow-xl">
      <h2 className="mb-4 text-2xl font-bold">Your Order History</h2>
      <div className="space-y-4">
        {currentOrders.map(order => (
          <div key={order.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex-1 mb-4 sm:mb-0">
              <p className="font-bold">Order ID: <span className="font-normal text-gray-600">{order.id}</span></p>
              <p className="font-bold">Restaurant: <span className="font-normal text-gray-600">{order.restaurantName || 'N/A'}</span></p>
              <p className="font-bold">Date: <span className="font-normal text-gray-600">{formatDateTime(order.date)}</span></p>
              <p className="font-bold">Total: <span className="font-normal text-green-600">{formatPriceInEUR(order.total)}</span></p>
              <p className="font-bold">Status: <span className="font-semibold text-blue-600">{order.status}</span></p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button onClick={() => handleViewDetails(order.id)} className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">Details</button>
              <button onClick={() => handleReorder(order.id)} className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600">Reorder</button>
              {order.status === 'DELIVERED' && <button onClick={() => handleLeaveReview(order.id)} className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600">Review</button>}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 text-white bg-gray-500 rounded disabled:bg-gray-300">Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 text-white bg-gray-500 rounded disabled:bg-gray-300">Next</button>
      </div>
    </div>
  );
};

export default OrderHistory;