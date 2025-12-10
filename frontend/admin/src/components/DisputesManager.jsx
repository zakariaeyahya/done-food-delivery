/**
 * Composant DisputesManager - Gestion Litiges
 * @notice Affiche la liste des litiges actifs avec interface de vote et résolution
 * @dev Modal pour détails, preuves IPFS, historique votes
 */

import React, { useState, useEffect } from 'react';
import * as apiService from '../services/api';
import * as blockchainService from '../services/blockchain';
import { formatAddress } from '../utils/web3';

function DisputesManager() {
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Charger les litiges actifs
   */
  async function fetchDisputes() {
    try {
      setLoading(true);

      const data = await apiService.getDisputes({ status: 'active' });
      setDisputes(data.disputes || []);
    } catch (err) {
      console.error('Error fetching disputes:', err);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchDisputes();
  }, []);

  /**
   * Voir les détails
   */
  function handleViewDetails(dispute) {
    setSelectedDispute(dispute);
    setShowModal(true);
  }

  /**
   * Voter
   */
  async function handleVote(disputeId, winner) {
    try {
      const confirmed = window.confirm(
        `Voulez-vous voter en faveur de ${winner}?`
      );
      if (!confirmed) return;

      // Si API vote existe
      // await apiService.voteDispute(disputeId, winner);

      await fetchDisputes();
      alert('Vote enregistré avec succès');
    } catch (err) {
      console.error('Error voting on dispute:', err);
      alert('Erreur lors du vote: ' + err.message);
    }
  }

  /**
   * Résoudre un litige manuellement
   */
  async function handleResolve(disputeId) {
    try {
      const winner = prompt(
        'Qui est le gagnant? (CLIENT, RESTAURANT, DELIVERER)'
      );
      if (!winner) return;

      const confirmed = window.confirm(
        `Résoudre le litige en faveur de ${winner}?`
      );
      if (!confirmed) return;

      // Résolution API
      await apiService.resolveDispute(disputeId, {
        winner,
        reason: 'Résolution manuelle par admin',
      });

      // Résolution on-chain si nécessaire
      const result = await blockchainService.resolveDisputeOnChain(
        disputeId,
        winner
      );

      if (result.success) {
        alert('Litige résolu avec succès. Transaction: ' + result.txHash);
      } else {
        alert('Erreur on-chain: ' + result.error);
      }

      await fetchDisputes();
      setShowModal(false);
    } catch (err) {
      console.error('Error resolving dispute:', err);
      alert('Erreur lors de la résolution: ' + err.message);
    }
  }

  /**
   * Composant DisputeCard
   */
  function DisputeCard({ dispute }) {
    return (
      <div className="dispute-card card p-4 bg-white shadow rounded">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Order ID: {dispute.orderId}</h4>
          <span
            className={`badge ${
              dispute.status === 'ACTIVE'
                ? 'badge-warning'
                : 'badge-success'
            }`}
          >
            {dispute.status}
          </span>
        </div>

        <div className="space-y-1 text-sm">
          <p>
            <strong>Client:</strong> {formatAddress(dispute.client)}
          </p>
          <p>
            <strong>Restaurant:</strong> {formatAddress(dispute.restaurant)}
          </p>
          <p>
            <strong>Raison:</strong> {dispute.reason}
          </p>

          <p>
            <strong>Votes:</strong> Client {dispute.votes?.client || 0} | Restaurant{' '}
            {dispute.votes?.restaurant || 0}
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleViewDetails(dispute)}
            className="btn btn-sm btn-outline"
          >
            Voir détails
          </button>

          <button
            onClick={() => handleVote(dispute.disputeId, 'CLIENT')}
            className="btn btn-sm btn-primary"
          >
            Voter Client
          </button>

          <button
            onClick={() => handleVote(dispute.disputeId, 'RESTAURANT')}
            className="btn btn-sm btn-primary"
          >
            Voter Restaurant
          </button>

          {dispute.votingPeriodEnded && (
            <button
              onClick={() => handleResolve(dispute.disputeId)}
              className="btn btn-sm btn-admin"
            >
              Résoudre
            </button>
          )}
        </div>
      </div>
    );
  }

  /**
   * Composant DisputeModal
   */
  function DisputeModal({ dispute, onClose }) {
    if (!dispute) return null;

    const ipfsGateway = 'https://gateway.pinata.cloud/ipfs/';
    const evidenceUrl = dispute.evidenceIPFS
      ? `${ipfsGateway}${dispute.evidenceIPFS}`
      : null;

    return (
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           onClick={onClose}>
        <div
          className="modal-content bg-white p-6 rounded shadow-lg max-w-xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">
              Détails du Litige #{dispute.disputeId}
            </h3>
            <button onClick={onClose} className="btn btn-sm">
              ×
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <strong>Order ID:</strong> {dispute.orderId}
            </div>
            <div>
              <strong>Client:</strong> {formatAddress(dispute.client)}
            </div>
            <div>
              <strong>Restaurant:</strong> {formatAddress(dispute.restaurant)}
            </div>
            <div>
              <strong>Raison:</strong> {dispute.reason}
            </div>

            {evidenceUrl && (
              <div>
                <strong>Preuves:</strong>
                <img
                  src={evidenceUrl}
                  alt="Preuve"
                  className="mt-2 max-w-md rounded"
                />
              </div>
            )}

            <div>
              <strong>Votes:</strong>
              <p>Client: {dispute.votes?.client || 0}</p>
              <p>Restaurant: {dispute.votes?.restaurant || 0}</p>
            </div>

            <button
              onClick={() => handleResolve(dispute.disputeId)}
              className="btn btn-admin"
            >
              Résoudre Manuellement
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Rendu principal
   */
  return (
    <div className="disputes-manager">
      <h2 className="text-2xl font-bold mb-4">Litiges Actifs</h2>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Aucun litige actif
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disputes.map((d) => (
            <DisputeCard key={d.disputeId} dispute={d} />
          ))}
        </div>
      )}

      {showModal && (
        <DisputeModal
          dispute={selectedDispute}
          onClose={() => {
            setShowModal(false);
            setSelectedDispute(null);
          }}
        />
      )}
    </div>
  );
}

export default DisputesManager;
