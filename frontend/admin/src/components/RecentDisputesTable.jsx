import React, { useEffect, useState } from "react";
import { getDisputes } from "../services/api";
import { formatDate } from "../services/formatters";

export default function RecentDisputesTable() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRecent() {
    try {
      setLoading(true);

      const res = await getDisputes({
        page: 1,
        limit: 10,
        sortField: "date",
        sortOrder: "desc",
      });

      setDisputes(res.disputes || []);
    } catch (err) {
      console.error("Erreur litiges:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecent();
  }, []);

  return (
    <div className="bg-white border rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Derniers litiges</h3>

      {loading ? (
        <p className="text-gray-500 text-center py-6">Chargement…</p>
      ) : disputes.length === 0 ? (
        <p className="text-gray-500 text-center py-6">Aucun litige.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <Th label="ID" />
                <Th label="Client" />
                <Th label="Livreur" />
                <Th label="Gravité" />
                <Th label="Statut" />
                <Th label="Date" />
              </tr>
            </thead>

            <tbody>
              {disputes.map((d, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2">#{d.disputeId}</td>
                  <td className="p-2">{d.customerName}</td>
                  <td className="p-2">{d.delivererName}</td>
                  <td className="p-2">{d.severity}</td>
                  <td className="p-2">{d.status}</td>
                  <td className="p-2">{formatDate(d.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ label }) {
  return (
    <th className="p-2 text-left font-medium text-gray-700">{label}</th>
  );
}
