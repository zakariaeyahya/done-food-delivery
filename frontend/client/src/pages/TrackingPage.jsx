import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OrderTracking from '../components/OrderTracking';
import { getOrderById } from '../services/api';
import { SocketProvider } from '../contexts/SocketContext'; // Import SocketProvider

const TrackingPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
// OrderTracking.jsx
useEffect(() => {
  // Écouter changements statut
  socket.on('orderStatusChanged', (data) => {
    if (data.orderId === order.id) {
      setCurrentStatus(data.status);
    }
  });

  // Écouter position livreur
  socket.on('gpsUpdate', (data) => {
    if (data.orderId === order.id) {
      setDriverPosition(data.position);
      setEta(data.eta);
    }
  });

  return () => {
    socket.off('orderStatusChanged');
    socket.off('gpsUpdate');
  };
}, [socket, order.id]);
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getOrderById(orderId);
        // Assuming the backend returns the full order object including restaurant, client, and driver info
        setOrder(response.data);
      } catch (err) {
        console.error(`Failed to fetch order ${orderId} details:`, err);
        setError('Failed to load order tracking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

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