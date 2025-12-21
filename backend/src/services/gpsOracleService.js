const { ethers } = require("ethers");
const { getProvider, getContractInstance } = require("../config/blockchain");
const Order = require("../models/Order");
const { getSocketIO } = require("./notificationService");
require("dotenv").config();

const DELIVERY_RADIUS = 100;
const GPS_UPDATE_INTERVAL = 5000;
const GPS_ORACLE_ADDRESS = process.env.GPS_ORACLE_ADDRESS;

const GPS_ORACLE_ABI = [
  "function updateLocation(uint256 orderId, int256 lat, int256 lng) external",
  "function verifyDelivery(uint256 orderId, int256 clientLat, int256 clientLng) external view returns (bool)",
  "function calculateDistance(int256 lat1, int256 lng1, int256 lat2, int256 lng2) public pure returns (uint256)",
  "function getDeliveryRoute(uint256 orderId) external view returns (tuple(int256 latitude, int256 longitude, uint256 timestamp, address deliverer, bool verified)[] locations, uint256 totalDistance, uint256 startTime, uint256 endTime)",
  "function currentLocations(uint256 orderId) external view returns (int256 latitude, int256 longitude, uint256 timestamp, address deliverer, bool verified)",
  "function deliveryRadius() external view returns (uint256)",
  "event LocationUpdated(uint256 indexed orderId, int256 lat, int256 lng, uint256 timestamp)",
  "event DeliveryVerified(uint256 indexed orderId, uint256 distance, bool verified)"
];

let gpsOracleContract = null;

function getGPSOracleContract() {
  if (gpsOracleContract) return gpsOracleContract;

  if (!GPS_ORACLE_ADDRESS) {
    return null;
  }

  try {
    const provider = getProvider();
    if (!provider) {
      return null;
    }

    gpsOracleContract = new ethers.Contract(GPS_ORACLE_ADDRESS, GPS_ORACLE_ABI, provider);
    return gpsOracleContract;
  } catch (error) {
    return null;
  }
}

let totalGPSUpdates = 0;
let onChainUpdates = 0;
let failedUpdates = 0;
let averageUpdateTime = 0;
let totalVerifications = 0;
let successfulVerifications = 0;

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;

  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance;
}

function isNearDestination(lat, lng, destination) {
  if (!destination || !destination.lat || !destination.lng) {
    return false;
  }
  const distance = calculateDistance(lat, lng, destination.lat, destination.lng);
  return distance <= DELIVERY_RADIUS;
}

async function updateLocation(orderId, lat, lng, delivererAddress) {
  const startTime = Date.now();
  totalGPSUpdates++;

  try {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Invalid GPS coordinates');
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.deliverer || order.deliverer.toString() !== delivererAddress) {
      throw new Error('Deliverer not assigned to this order');
    }

    const latScaled = Math.round(lat * 1e6);
    const lngScaled = Math.round(lng * 1e6);

    order.gpsTracking = order.gpsTracking || [];
    order.gpsTracking.push({
      lat,
      lng,
      timestamp: new Date()
    });
    await order.save();

    const shouldUpdateOnChain =
      order.gpsTracking.length % 5 === 0 ||
      isNearDestination(lat, lng, order.deliveryLocation);

    let onChainUpdate = false;
    let txHash = null;

    if (shouldUpdateOnChain && GPS_ORACLE_ADDRESS) {
      try {
        const gpsOracle = getGPSOracleContract();
        if (!gpsOracle) {
          throw new Error("GPS Oracle contract not initialized");
        }

        const provider = getProvider();
        if (!provider) {
          throw new Error("Provider not initialized");
        }

        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const oracleWithSigner = gpsOracle.connect(wallet);

        const tx = await oracleWithSigner.updateLocation(orderId, latScaled, lngScaled);
        const receipt = await tx.wait();

        txHash = tx.hash;
        onChainUpdates++;
        onChainUpdate = true;
      } catch (onChainError) {
      }
    }

    const updateTime = Date.now() - startTime;
    averageUpdateTime = (averageUpdateTime + updateTime) / 2;

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
      txHash: txHash,
      updateTime: `${updateTime}ms`
    };
  } catch (error) {
    failedUpdates++;
    throw error;
  }
}

async function verifyDelivery(orderId, clientLat, clientLng) {
  totalVerifications++;

  try {
    const order = await Order.findOne({ orderId });
    if (!order) {
      throw new Error('Order not found');
    }

    const lastPosition = order.gpsTracking && order.gpsTracking.length > 0
      ? order.gpsTracking[order.gpsTracking.length - 1]
      : null;

    if (!lastPosition) {
      throw new Error('No GPS data available');
    }

    const distance = calculateDistance(
      lastPosition.lat,
      lastPosition.lng,
      clientLat,
      clientLng
    );

    const isNearby = distance <= DELIVERY_RADIUS;

    if (isNearby) {
      successfulVerifications++;

      let onChainVerified = null;
      if (GPS_ORACLE_ADDRESS) {
        try {
          const gpsOracle = getGPSOracleContract();
          if (gpsOracle) {
            const latScaled = Math.round(clientLat * 1e6);
            const lngScaled = Math.round(clientLng * 1e6);
            onChainVerified = await gpsOracle.verifyDelivery(orderId, latScaled, lngScaled);
          }
        } catch (onChainError) {
        }
      }

      return {
        verified: true,
        distance: distance,
        withinRadius: isNearby,
        onChainVerified: onChainVerified,
        lastUpdate: lastPosition.timestamp
      };
    } else {
      return {
        verified: false,
        distance: distance,
        withinRadius: false,
        message: `Deliverer is ${distance.toFixed(2)}m away (max: ${DELIVERY_RADIUS}m)`
      };
    }
  } catch (error) {
    throw error;
  }
}

async function trackDelivery(orderId) {
  try {
    const order = await Order.findOne({ orderId }).lean();
    if (!order) {
      throw new Error('Order not found');
    }

    const gpsHistory = order.gpsTracking || [];

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
      (new Date(lastUpdate) - new Date(startTime)) / 1000 / 60 : 0;

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
    throw error;
  }
}

async function getDeliveryPath(orderId) {
  try {
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
    throw error;
  }
}

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
