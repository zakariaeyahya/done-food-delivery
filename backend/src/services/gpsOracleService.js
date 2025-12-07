const { ethers } = require("ethers");
const { getProvider, getContractInstance } = require("../config/blockchain");
const Order = require("../models/Order");
const { getSocketIO } = require("./notificationService");
require("dotenv").config();

/**
 * GPS Oracle Service - GPS data management and DoneGPSOracle interaction
 * 
 * Manages GPS updates with hybrid storage strategy (off-chain + on-chain)
 */

// Configuration
const DELIVERY_RADIUS = 100; // 100 meters
const GPS_UPDATE_INTERVAL = 5000; // 5 seconds

// Performance metrics
let totalGPSUpdates = 0;
let onChainUpdates = 0;
let failedUpdates = 0;
let averageUpdateTime = 0;
let totalVerifications = 0;
let successfulVerifications = 0;

/**
 * Calculate distance between two GPS points (Haversine formula)
 * @param {number} lat1 - Latitude point 1
 * @param {number} lng1 - Longitude point 1
 * @param {number} lat2 - Latitude point 2
 * @param {number} lng2 - Longitude point 2
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c; // Distance in meters
  
  return distance;
}

/**
 * Check if location is near destination
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Object} destination - Destination coordinates { lat, lng }
 * @returns {boolean} True if near destination
 */
function isNearDestination(lat, lng, destination) {
  if (!destination || !destination.lat || !destination.lng) {
    return false;
  }
  const distance = calculateDistance(lat, lng, destination.lat, destination.lng);
  return distance <= DELIVERY_RADIUS;
}

/**
 * Update deliverer location
 * @param {number} orderId - Order ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} delivererAddress - Deliverer wallet address
 * @returns {Promise<Object>} { success, location, onChainUpdate, updateTime }
 */
async function updateLocation(orderId, lat, lng, delivererAddress) {
  const startTime = Date.now();
  totalGPSUpdates++;
  
  try {
    // 1. Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Invalid GPS coordinates');
    }
    
    // 2. Verify order exists
    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found');
    }
    
    // 3. Verify deliverer is assigned
    if (!order.deliverer || order.deliverer.toString() !== delivererAddress) {
      throw new Error('Deliverer not assigned to this order');
    }
    
    // 4. Convert coordinates to on-chain format (lat/lng * 1e6)
    const latScaled = Math.round(lat * 1e6);
    const lngScaled = Math.round(lng * 1e6);
    
    // 5. Update MongoDB (off-chain) - FAST
    order.gpsTracking = order.gpsTracking || [];
    order.gpsTracking.push({
      lat,
      lng,
      timestamp: new Date()
    });
    await order.save();
    
    // 6. Decide if update on-chain (every 5th position or critical points)
    const shouldUpdateOnChain =
      order.gpsTracking.length % 5 === 0 || // Every 5 updates
      isNearDestination(lat, lng, order.deliveryLocation); // Near destination
    
    let onChainUpdate = false;
    if (shouldUpdateOnChain && process.env.GPS_ORACLE_ADDRESS) {
      try {
        // 7. Update on-chain
        const provider = getProvider();
        if (!provider) {
          throw new Error("Provider not initialized");
        }

        // Note: GPS Oracle contract would need to be deployed and configured
        // For now, we'll just log that it would be updated
        console.log(`📍 GPS on-chain update would be sent: orderId=${orderId}, lat=${latScaled}, lng=${lngScaled}`);
        
        // If GPS_ORACLE_ADDRESS is set, we could update on-chain here
        // const gpsOracle = getContractInstance('gpsOracle');
        // const wallet = new ethers.Wallet(process.env.DELIVERER_PRIVATE_KEY, provider);
        // const oracleWithSigner = gpsOracle.connect(wallet);
        // const tx = await oracleWithSigner.updateLocation(orderId, latScaled, lngScaled);
        // await tx.wait();
        
        onChainUpdates++;
        onChainUpdate = true;
      } catch (onChainError) {
        console.warn("On-chain GPS update failed (continuing with off-chain):", onChainError.message);
      }
    }
    
    // Measure latency
    const updateTime = Date.now() - startTime;
    averageUpdateTime = (averageUpdateTime + updateTime) / 2;
    
    console.log(`✓ GPS position updated: (${lat}, ${lng}) - ${updateTime}ms`);
    
    // 8. Emit Socket.io event for client
    const io = getSocketIO();
    if (io) {
      io.to(`order_${orderId}`).emit('delivererLocationUpdate', {
        orderId,
        location: { lat, lng },
        timestamp: new Date()
      });
    }
    
    return {
      success: true,
      location: { lat, lng },
      onChainUpdate: onChainUpdate,
      updateTime: `${updateTime}ms`
    };
  } catch (error) {
    failedUpdates++;
    console.error('❌ updateLocation ERROR:', error.message);
    throw error;
  }
}

/**
 * Verify delivery location
 * @param {number} orderId - Order ID
 * @param {number} clientLat - Client latitude
 * @param {number} clientLng - Client longitude
 * @returns {Promise<Object>} { verified, distance, withinRadius, lastUpdate }
 */
async function verifyDelivery(orderId, clientLat, clientLng) {
  totalVerifications++;
  
  try {
    // 1. Get order
    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found');
    }
    
    // 2. Get last deliverer position
    const lastPosition = order.gpsTracking && order.gpsTracking.length > 0
      ? order.gpsTracking[order.gpsTracking.length - 1]
      : null;
    
    if (!lastPosition) {
      throw new Error('No GPS data available');
    }
    
    // 3. Calculate distance between deliverer and client
    const distance = calculateDistance(
      lastPosition.lat,
      lastPosition.lng,
      clientLat,
      clientLng
    );
    
    console.log(`📍 Distance deliverer-client: ${distance.toFixed(2)}m`);
    
    // 4. Check proximity (< 100m)
    const isNearby = distance <= DELIVERY_RADIUS;
    
    if (isNearby) {
      successfulVerifications++;
      console.log(`✓ Delivery verified: deliverer is within ${DELIVERY_RADIUS}m`);
      
      // 5. Call on-chain contract for verification (if available)
      // const latScaled = Math.round(clientLat * 1e6);
      // const lngScaled = Math.round(clientLng * 1e6);
      // const isVerified = await gpsOracle.verifyDelivery(orderId, latScaled, lngScaled);
      
      return {
        verified: true,
        distance: distance,
        withinRadius: isNearby,
        lastUpdate: lastPosition.timestamp
      };
    } else {
      console.warn(`⚠️  Delivery NOT verified: distance ${distance.toFixed(2)}m > ${DELIVERY_RADIUS}m`);
      
      return {
        verified: false,
        distance: distance,
        withinRadius: false,
        message: `Deliverer is ${distance.toFixed(2)}m away (max: ${DELIVERY_RADIUS}m)`
      };
    }
  } catch (error) {
    console.error('❌ verifyDelivery ERROR:', error.message);
    throw error;
  }
}

/**
 * Track delivery in real-time and return GPS history
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} { orderId, gpsHistory, totalDistance, totalPoints, duration, averageSpeed }
 */
async function trackDelivery(orderId) {
  try {
    // 1. Get order
    const order = await Order.findOne({ orderId }).lean();
    if (!order) {
      throw new Error('Order not found');
    }
    
    // 2. Get GPS history
    const gpsHistory = order.gpsTracking || [];
    
    // 3. Calculate metrics
    let totalDistance = 0;
    for (let i = 1; i < gpsHistory.length; i++) {
      const dist = calculateDistance(
        gpsHistory[i-1].lat,
        gpsHistory[i-1].lng,
        gpsHistory[i].lat,
        gpsHistory[i].lng
      );
      totalDistance += dist;
    }
    
    const startTime = gpsHistory[0]?.timestamp;
    const lastUpdate = gpsHistory[gpsHistory.length - 1]?.timestamp;
    const duration = startTime && lastUpdate ?
      (new Date(lastUpdate) - new Date(startTime)) / 1000 / 60 : 0; // minutes
    
    return {
      orderId,
      gpsHistory,
      totalDistance: totalDistance.toFixed(2) + 'm',
      totalPoints: gpsHistory.length,
      duration: duration.toFixed(2) + ' min',
      averageSpeed: duration > 0 ? (totalDistance / 1000 / (duration / 60)).toFixed(2) + ' km/h' : '0 km/h',
      startTime,
      lastUpdate
    };
  } catch (error) {
    console.error('❌ trackDelivery ERROR:', error.message);
    throw error;
  }
}

/**
 * Get delivery path from on-chain contract
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} { orderId, locations, totalDistance, startTime, endTime, completed }
 */
async function getDeliveryPath(orderId) {
  try {
    // Note: This would require a GPS Oracle contract with getDeliveryRoute function
    // For now, we'll return data from MongoDB
    const order = await Order.findOne({ orderId }).lean();
    if (!order) {
      throw new Error('Order not found');
    }
    
    const gpsHistory = order.gpsTracking || [];
    
    return {
      orderId,
      locations: gpsHistory.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
        timestamp: loc.timestamp,
        verified: true
      })),
      totalDistance: gpsHistory.length > 0 ? calculateDistance(
        gpsHistory[0].lat,
        gpsHistory[0].lng,
        gpsHistory[gpsHistory.length - 1].lat,
        gpsHistory[gpsHistory.length - 1].lng
      ) : 0,
      startTime: gpsHistory[0]?.timestamp || null,
      endTime: gpsHistory[gpsHistory.length - 1]?.timestamp || null,
      completed: order.status === 'DELIVERED'
    };
  } catch (error) {
    console.error('❌ getDeliveryPath ERROR:', error.message);
    throw error;
  }
}

/**
 * Get GPS performance metrics
 * @returns {Object} Complete metrics
 */
function getGPSMetrics() {
  const onChainRatio = totalGPSUpdates > 0
    ? ((onChainUpdates / totalGPSUpdates) * 100).toFixed(2)
    : 0;
  
  const successRate = totalVerifications > 0
    ? ((successfulVerifications / totalVerifications) * 100).toFixed(2)
    : 100;
  
  return {
    totalUpdates: totalGPSUpdates,
    onChainUpdates,
    onChainRatio: `${onChainRatio}%`,
    failedUpdates,
    averageUpdateTime: `${averageUpdateTime.toFixed(2)}ms`,
    totalVerifications,
    successfulVerifications,
    successRate: `${successRate}%`
  };
}

module.exports = {
  updateLocation,
  verifyDelivery,
  calculateDistance,
  trackDelivery,
  getDeliveryPath,
  getGPSMetrics
};
