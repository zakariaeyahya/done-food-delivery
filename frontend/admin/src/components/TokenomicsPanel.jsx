/**
 * Composant TokenomicsPanel - Panel Tokenomics DONE
 * @notice Affiche les statistiques tokenomics avec graphiques et top holders
 * @dev Combine données blockchain (supply, burned) et API (top holders)
 */

import React, { useState, useEffect } from 'react';

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { Doughnut, Line } from 'react-chartjs-2';

import * as blockchainService from '../services/blockchain';
import * as apiService from '../services/api';
import { formatAddress } from '../utils/web3';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function TokenomicsPanel() {
  const [tokenomics, setTokenomics] = useState(null);
  const [topHolders, setTopHolders] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Charger les données tokenomics
   */
  async function fetchTokenomics() {
    try {
      setLoading(true);

      // -- Blockchain data --
      const totalSupply = await blockchainService.getTotalSupply();
      const circulating = await blockchainService.getCirculatingSupply();
      const burned = await blockchainService.getBurnedSupply();

      // -- API Top Holders (si activé) --
      // const topHoldersData = await apiService.getTopTokenHolders(10);

      setTokenomics({
        totalSupply,
        circulating,
        burned,
        price: null // pourra être ajouté plus tard
      });

      // setTopHolders(topHoldersData || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tokenomics:', err);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTokenomics();
  }, []);

  /**
   * Doughnut Graph
   */
  function getDistributionData() {
    if (!tokenomics) return null;

    const total = parseFloat(tokenomics.totalSupply);
    const circ = parseFloat(tokenomics.circulating);
    const burn = parseFloat(tokenomics.burned);
    const locked = total - circ - burn;

    return {
      labels: ['En circulation', 'Brûlés', 'Locked'],
      datasets: [
        {
          data: [circ, burn, locked],
          backgroundColor: [
            'rgb(34, 197, 94)',   // Vert circulation
            'rgb(239, 68, 68)',   // Rouge burned
            'rgb(156, 163, 175)'  // Gris locked
          ]
        }
      ]
    };
  }

  /**
   * Helpers
   */
  function formatTokens(value) {
    if (typeof value === 'string') return value;
    const num = parseFloat(value);

    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M DONE`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K DONE`;

    return `${num.toFixed(2)} DONE`;
  }

  function formatPercentage(value, total) {
    const percent = (value / total) * 100;
    return `${percent.toFixed(2)}%`;
  }

  /**
   * Rendu principal
   */
  return (
    <div className="tokenomics-panel">
      <h2 className="text-2xl font-bold mb-4">Tokenomics DONE</h2>

      {/* Loader */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : tokenomics ? (
        <>
          {/* ===================== *
           *     STAT CARDS       *
           * ===================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <div className="stat-card p-4 bg-white shadow rounded">
              <div className="stat-label text-sm text-gray-500">Total Minté</div>
              <div className="stat-value text-xl font-semibold">
                {formatTokens(tokenomics.totalSupply)}
              </div>
            </div>

            <div className="stat-card p-4 bg-white shadow rounded">
              <div className="stat-label text-sm text-gray-500">En Circulation</div>
              <div className="stat-value text-xl font-semibold">
                {formatTokens(tokenomics.circulating)}
              </div>
            </div>

            <div className="stat-card p-4 bg-white shadow rounded">
              <div className="stat-label text-sm text-gray-500">Brûlés</div>
              <div className="stat-value text-xl font-semibold">
                {formatTokens(tokenomics.burned)}
              </div>
            </div>

            {tokenomics.price && (
              <div className="stat-card p-4 bg-white shadow rounded">
                <div className="stat-label text-sm text-gray-500">Prix</div>
                <div className="stat-value text-xl font-semibold">
                  ${tokenomics.price}
                </div>
              </div>
            )}

          </div>

          {/* ===================== *
           *      GRAPHIQUES      *
           * ===================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

            {/* Doughnut */}
            <div className="chart-container p-4 bg-white rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Distribution</h3>

              {getDistributionData() && (
                <div className="h-64">
                  <Doughnut
                    data={getDistributionData()}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              )}
            </div>

            {/* Line chart placeholder */}
            <div className="chart-container p-4 bg-white rounded shadow">
              <h3 className="text-lg font-semibold mb-2">
                Émission / Burn dans le temps
              </h3>
              <div className="text-center text-gray-500 py-8">
                Données historiques à implémenter
              </div>
            </div>

          </div>

          {/* ===================== *
           *     TOP HOLDERS      *
           * ===================== */}
          <div className="card p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold mb-4">Top 10 Holders</h3>

            {topHolders.length > 0 ? (
              <div className="table-container">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Rang</th>
                      <th>Address</th>
                      <th>Balance</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topHolders.map((holder, idx) => (
                      <tr key={holder.address}>
                        <td>#{idx + 1}</td>
                        <td>{formatAddress(holder.address)}</td>
                        <td>{formatTokens(holder.balance)}</td>
                        <td>
                          {formatPercentage(
                            parseFloat(holder.balance),
                            parseFloat(tokenomics.totalSupply)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Données top holders à implémenter
              </div>
            )}
          </div>

        </>
      ) : (
        <div className="text-center text-gray-500 py-8">
          Aucune donnée disponible
        </div>
      )}
    </div>
  );
}

export default TokenomicsPanel;
