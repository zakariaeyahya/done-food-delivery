import { useState, useEffect } from 'react';
import {
  getOraclePrice,
  convertCurrency,
  getWeather,
  getGPSMetrics,
  getPriceMetrics
} from '../services/api';

/**
 * OracleTest Component - Visual test for Oracle API integration
 * Displays real-time data from all oracle services
 */
function OracleTest() {
  const [priceData, setPriceData] = useState(null);
  const [convertData, setConvertData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [gpsMetrics, setGpsMetrics] = useState(null);
  const [priceMetrics, setPriceMetrics] = useState(null);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  // Test Price Oracle
  const testPrice = async () => {
    setLoading(prev => ({ ...prev, price: true }));
    setErrors(prev => ({ ...prev, price: null }));
    try {
      const response = await getOraclePrice();
      setPriceData(response.data);
    } catch (err) {
      setErrors(prev => ({ ...prev, price: err.message }));
    }
    setLoading(prev => ({ ...prev, price: false }));
  };

  // Test Currency Conversion
  const testConvert = async () => {
    setLoading(prev => ({ ...prev, convert: true }));
    setErrors(prev => ({ ...prev, convert: null }));
    try {
      const response = await convertCurrency({ amount: 100, from: 'USD', to: 'MATIC' });
      setConvertData(response.data);
    } catch (err) {
      setErrors(prev => ({ ...prev, convert: err.message }));
    }
    setLoading(prev => ({ ...prev, convert: false }));
  };

  // Test Weather Oracle
  const testWeather = async () => {
    setLoading(prev => ({ ...prev, weather: true }));
    setErrors(prev => ({ ...prev, weather: null }));
    try {
      // Paris coordinates
      const response = await getWeather(48.8566, 2.3522);
      setWeatherData(response.data);
    } catch (err) {
      setErrors(prev => ({ ...prev, weather: err.message }));
    }
    setLoading(prev => ({ ...prev, weather: false }));
  };

  // Test GPS Metrics
  const testGPSMetrics = async () => {
    setLoading(prev => ({ ...prev, gps: true }));
    setErrors(prev => ({ ...prev, gps: null }));
    try {
      const response = await getGPSMetrics();
      setGpsMetrics(response.data);
    } catch (err) {
      setErrors(prev => ({ ...prev, gps: err.message }));
    }
    setLoading(prev => ({ ...prev, gps: false }));
  };

  // Test Price Metrics
  const testPriceMetrics = async () => {
    setLoading(prev => ({ ...prev, priceMetrics: true }));
    setErrors(prev => ({ ...prev, priceMetrics: null }));
    try {
      const response = await getPriceMetrics();
      setPriceMetrics(response.data);
    } catch (err) {
      setErrors(prev => ({ ...prev, priceMetrics: err.message }));
    }
    setLoading(prev => ({ ...prev, priceMetrics: false }));
  };

  // Run all tests on mount
  useEffect(() => {
    testPrice();
    testConvert();
    testWeather();
    testGPSMetrics();
    testPriceMetrics();
  }, []);

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: '#f9f9f9'
  };

  const successStyle = {
    color: '#28a745',
    fontWeight: 'bold'
  };

  const errorStyle = {
    color: '#dc3545',
    fontWeight: 'bold'
  };

  const renderStatus = (key) => {
    if (loading[key]) return <span style={{ color: '#ffc107' }}>Loading...</span>;
    if (errors[key]) return <span style={errorStyle}>Error: {errors[key]}</span>;
    return <span style={successStyle}>Connected</span>;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Oracle API Integration Test</h1>
      <p style={{ color: '#666' }}>
        This component tests the connection between the frontend and backend Oracle APIs.
      </p>

      {/* Price Oracle */}
      <div style={cardStyle}>
        <h2>Price Oracle (Chainlink)</h2>
        <p>Status: {renderStatus('price')}</p>
        <button onClick={testPrice} disabled={loading.price}>
          Refresh
        </button>
        {priceData && (
          <pre style={{ marginTop: '10px', backgroundColor: '#eee', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(priceData, null, 2)}
          </pre>
        )}
      </div>

      {/* Currency Conversion */}
      <div style={cardStyle}>
        <h2>Currency Conversion (100 USD to MATIC)</h2>
        <p>Status: {renderStatus('convert')}</p>
        <button onClick={testConvert} disabled={loading.convert}>
          Refresh
        </button>
        {convertData && (
          <pre style={{ marginTop: '10px', backgroundColor: '#eee', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(convertData, null, 2)}
          </pre>
        )}
      </div>

      {/* Weather Oracle */}
      <div style={cardStyle}>
        <h2>Weather Oracle (Paris: 48.8566, 2.3522)</h2>
        <p>Status: {renderStatus('weather')}</p>
        <button onClick={testWeather} disabled={loading.weather}>
          Refresh
        </button>
        {weatherData && (
          <pre style={{ marginTop: '10px', backgroundColor: '#eee', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(weatherData, null, 2)}
          </pre>
        )}
      </div>

      {/* GPS Metrics */}
      <div style={cardStyle}>
        <h2>GPS Oracle Metrics</h2>
        <p>Status: {renderStatus('gps')}</p>
        <button onClick={testGPSMetrics} disabled={loading.gps}>
          Refresh
        </button>
        {gpsMetrics && (
          <pre style={{ marginTop: '10px', backgroundColor: '#eee', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(gpsMetrics, null, 2)}
          </pre>
        )}
      </div>

      {/* Price Metrics */}
      <div style={cardStyle}>
        <h2>Price Oracle Metrics</h2>
        <p>Status: {renderStatus('priceMetrics')}</p>
        <button onClick={testPriceMetrics} disabled={loading.priceMetrics}>
          Refresh
        </button>
        {priceMetrics && (
          <pre style={{ marginTop: '10px', backgroundColor: '#eee', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(priceMetrics, null, 2)}
          </pre>
        )}
      </div>

      {/* Summary */}
      <div style={{ ...cardStyle, backgroundColor: '#e8f4e8' }}>
        <h2>Integration Summary</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Oracle</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Source</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px' }}>Price Oracle</td>
              <td style={{ padding: '8px' }}>{renderStatus('price')}</td>
              <td style={{ padding: '8px' }}>{priceData?.data?.source || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>Currency Convert</td>
              <td style={{ padding: '8px' }}>{renderStatus('convert')}</td>
              <td style={{ padding: '8px' }}>{convertData?.data?.source || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>Weather Oracle</td>
              <td style={{ padding: '8px' }}>{renderStatus('weather')}</td>
              <td style={{ padding: '8px' }}>{weatherData?.data?.source || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>GPS Oracle</td>
              <td style={{ padding: '8px' }}>{renderStatus('gps')}</td>
              <td style={{ padding: '8px' }}>MongoDB + On-chain</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <strong>Instructions:</strong>
        <ul>
          <li>Ensure backend is running on <code>http://localhost:3000</code></li>
          <li>Check browser console for detailed API responses</li>
          <li>Source shows: <code>chainlink</code> (on-chain), <code>on-chain</code>, or <code>simulated</code> (fallback)</li>
        </ul>
      </div>
    </div>
  );
}

export default OracleTest;
