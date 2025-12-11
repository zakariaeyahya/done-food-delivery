import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderTracking from '../components/OrderTracking';
import { getOrderById } from '../services/api';
import { SocketProvider } from '../contexts/SocketContext'; // Import SocketProvider

const TrackingPage = () => {
  const { orderId, id } = useParams();
  // Gérer les deux formats de paramètres : orderId (depuis /tracking/:orderId) ou id (depuis /order/:id)
  const actualOrderId = orderId || id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!actualOrderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getOrderById(actualOrderId);
        // Le backend retourne { success: true, order: {...} }
        const orderData = response.data.order || response.data;
        setOrder(orderData);
      } catch (err) {
        console.error(`Failed to fetch order ${actualOrderId} details:`, err);
        setError('Failed to load order tracking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [actualOrderId]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading order details...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!order) return <div className="flex justify-center items-center h-screen">Order not found.</div>;

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      <SocketProvider> {/* Wrap OrderTracking with SocketProvider */}
        <OrderTracking order={order} />
      </SocketProvider>
    </div>
  );
};

export default TrackingPage;