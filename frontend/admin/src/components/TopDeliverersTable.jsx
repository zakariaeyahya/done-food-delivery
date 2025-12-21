import React, { useEffect, useState } from "react";
import { getTopDeliverers } from "../services/api";
import { formatCrypto, formatNumber, weiToPol } from "../services/formatters";

export default function TopDeliverersTable() {
  const [deliverers, setDeliverers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const res = await getTopDeliverers();
      setDeliverers(res?.data || []);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-semibold mb-4">Top Livreurs</h2>

      {loading ? (
        <p className="text-gray-500 text-center py-6">Chargement...</p>
      ) : deliverers.length === 0 ? (
        <p className="text-gray-500 text-center py-6">Aucun livreur trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 text-left font-semibold">Livreur</th>
                <th className="p-3 text-left font-semibold">Livraisons</th>
                <th className="p-3 text-left font-semibold">Revenus</th>
                <th className="p-3 text-left font-semibold">Rating</th>
              </tr>
            </thead>

            <tbody>
              {deliverers.map((d, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{d.name || d.address}</td>
                  <td className="p-3">{formatNumber(d.totalDeliveries)}</td>
                  <td className="p-3">{formatCrypto(weiToPol(d.earnings), "POL")}</td>
                  <td className="p-3">{d.rating?.toFixed(2)} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
