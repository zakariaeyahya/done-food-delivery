import React, { useState } from "react";
import {
  formatAddress,
  formatCrypto,
  formatDate,
  weiToPol,
} from "../services/formatters";

import * as api from "../services/api";
import * as blockchain from "../services/blockchain";

import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

/* =====================================================================
   COMPONENT : DisputeViewer
   ===================================================================== */

export default function DisputeViewer({ dispute, onClose, onResolved }) {
  if (!dispute) return null;

  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);
  const [onchain, setOnchain] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const participants = [
    { key: "client", label: "Client", address: dispute.client },
    { key: "restaurant", label: "Restaurant", address: dispute.restaurant },
    dispute.deliverer
      ? { key: "deliverer", label: "Livreur", address: dispute.deliverer }
      : null,
  ].filter(Boolean);

  /* =====================================================================
     HANDLE RESOLUTION
     ===================================================================== */
  async function handleResolve() {
    if (!winner) {
      setError("Veuillez sélectionner un gagnant.");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setLoading(true);

      // 1) Résolution backend
      const backendResult = await api.resolveDispute(dispute.disputeId, {
        winner,
        reason: "Résolution manuelle par admin",
      });

      // 2) Résolution on-chain (facultatif)
      if (onchain) {
        await blockchain.resolveDisputeOnChain(dispute.disputeId, winner);
      }

      setSuccess("Litige résolu avec succès.");
      
      // Appeler le callback si fourni
      if (onResolved) {
        onResolved();
      }
      
      // Fermer le modal après 1.5 secondes pour laisser le temps de voir le message de succès
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Erreur lors de la résolution.");
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================================
     RENDER
     ===================================================================== */

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Litige #{dispute.disputeId}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* === DETAILS COMMANDE === */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Détails de la commande</h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Commande :</span> #{dispute.orderId}
              </div>

              <div>
                <span className="font-medium">Montant :</span>{" "}
                {formatCrypto(weiToPol(dispute.total), "POL", 3)}
              </div>

              <div>
                <span className="font-medium">Créée le :</span>{" "}
                {formatDate(dispute.createdAt)}
              </div>

              <div>
                <span className="font-medium">Statut :</span>{" "}
                {dispute.status}
              </div>
            </div>
          </div>

          {/* === PARTICIPANTS === */}
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2">Participants</h3>

            {participants.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b last:border-none py-2"
              >
                <span className="font-medium">{p.label}</span>
                <span className="text-sm text-gray-600">
                  {formatAddress(p.address)}
                </span>
              </div>
            ))}
          </div>

          {/* === PREUVES === */}
          {dispute.evidence && dispute.evidence.length > 0 && (
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold mb-3">Preuves (IPFS)</h3>

              <div className="grid grid-cols-2 gap-4">
                {dispute.evidence.map((hash, i) => (
                  <img
                    key={i}
                    src={`https://ipfs.io/ipfs/${hash}`}
                    alt="Preuve"
                    className="rounded-lg shadow border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* === HISTORIQUE DU LITIGE === */}
          {dispute.history && dispute.history.length > 0 && (
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="text-lg font-semibold mb-3">Historique</h3>

              <ul className="space-y-2 text-sm">
                {dispute.history.map((h, i) => (
                  <li key={i} className="border-b pb-1">
                    <span className="font-medium">{formatDate(h.date)} :</span>{" "}
                    {h.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* === SELECT WINNER === */}
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2">Résolution</h3>

            <label className="block mb-2 text-sm font-medium">
              Sélectionnez le gagnant :
            </label>

            <select
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">— Choisir —</option>
              {participants.map((p) => (
                <option key={p.key} value={p.key.toUpperCase()}>
                  {p.label}
                </option>
              ))}
            </select>

            {/* Résolution On-Chain */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={onchain}
                onChange={(e) => setOnchain(e.target.checked)}
              />
              <span className="text-sm">Exécuter la résolution on-chain</span>
            </div>

            {/* Errors */}
            {error && (
              <div className="flex items-center text-red-600 mt-3 text-sm">
                <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center text-green-600 mt-3 text-sm">
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleResolve}
              disabled={loading}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Résolution..." : "Résoudre le litige"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
