/**
 * TopRestaurantsTable.jsx
 * Liste les meilleurs restaurants (revenus, commandes, rating)
 */

import React, { useEffect, useState } from "react";
import { getTopRestaurants } from "../services/api";
import { formatCrypto, formatNumber } from "../services/formatters";

export default function TopRestaurantsTable() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const res = await getTopRestaurants();
      setRestaurants(res?.data || []);
    } catch (err) {
      console.error("Erreur chargement top restaurants:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-semibold mb-4">🏆 Top Restaurants</h2>

      {loading ? (
        <p className="text-gray-500 text-center py-6">Chargement...</p>
      ) : restaurants.length === 0 ? (
        <p className="text-gray-500 text-center py-6">Aucun restaurant trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 text-left font-semibold">Restaurant</th>
                <th className="p-3 text-left font-semibold">Commandes</th>
                <th className="p-3 text-left font-semibold">Revenu</th>
                <th className="p-3 text-left font-semibold">Rating</th>
              </tr>
            </thead>

            <tbody>
              {restaurants.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3">{formatNumber(r.totalOrders)}</td>
                  <td className="p-3">{formatCrypto(r.revenue, "MATIC")}</td>
                  <td className="p-3">{r.rating?.toFixed(2)} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
