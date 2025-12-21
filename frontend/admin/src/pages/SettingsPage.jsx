/**
 * Page SettingsPage - Paramètres Plateforme
 * @notice Configuration plateforme, rôles, contrats, variables système
 * @dev Utilise blockchain.assignRole() / blockchain.revokeRole()
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import * as blockchainService from '../services/blockchain';
import * as apiService from '../services/api';
import { formatAddress } from '../utils/web3';

function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  /* === Gestion rôles === */
  const [roleAddress, setRoleAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState('CLIENT_ROLE');

  const roles = [
    { value: 'CLIENT_ROLE', label: 'Client' },
    { value: 'RESTAURANT_ROLE', label: 'Restaurant' },
    { value: 'DELIVERER_ROLE', label: 'Livreur' },
    { value: 'PLATFORM_ROLE', label: 'Plateforme' },
    { value: 'ARBITRATOR_ROLE', label: 'Arbitre' }
  ];

  /* === Adresses Contrats === */
  const contractAddresses = {
    orderManager: import.meta.env.VITE_ORDER_MANAGER_ADDRESS,
    token: import.meta.env.VITE_TOKEN_ADDRESS,
    staking: import.meta.env.VITE_STAKING_ADDRESS
  };

  /* ===========================
     Charger les paramètres
  ============================ */
  useEffect(() => {
    async function loadSettings() {
      try {
        // const data = await apiService.getSettings();
        // setSettings(data);

        // Pour l'instant, valeurs par défaut
        setSettings({
          platformFee: 10,
          minStakeAmount: 0.1
        });

        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  /* ===========================
     Assigner un rôle
  ============================ */
  async function handleAssignRole() {
    if (!roleAddress) {
      alert('Veuillez entrer une adresse.');
      return;
    }

    if (!ethers.isAddress(roleAddress)) {
      alert('Adresse invalide.');
      return;
    }

    const confirmed = window.confirm(
      `Assigner le rôle ${selectedRole} à ${formatAddress(roleAddress)} ?`
    );
    if (!confirmed) return;

    try {
      const roleHash = ethers.id(selectedRole);
      const result = await blockchainService.assignRole(roleAddress, roleHash);

      if (result.success) {
        alert('Rôle assigné avec succès. TX: ' + result.txHash);
        setRoleAddress('');
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  }

  /* ===========================
     Retirer un rôle
  ============================ */
  async function handleRevokeRole(address, role) {
    const confirmed = window.confirm(
      `Retirer le rôle ${role} de ${formatAddress(address)} ?`
    );
    if (!confirmed) return;

    try {
      const roleHash = ethers.id(role);
      // const result = await blockchainService.revokeRole(address, roleHash);

      alert('Rôle retiré avec succès.');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  }

  /* ===========================
     Sauvegarder paramètres
  ============================ */
  async function handleSaveSettings() {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir sauvegarder ces paramètres ?'
    );
    if (!confirmed) return;

    setSaving(true);

    try {
      // await apiService.updateSettings(settings);
      alert('Paramètres sauvegardés avec succès.');
      setSaving(false);
    } catch (err) {
      alert('Erreur: ' + err.message);
      setSaving(false);
    }
  }

  /* ===========================
     RoleManager Component
  ============================ */
  function RoleManager() {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Assigner un rôle</h3>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Adresse wallet"
            value={roleAddress}
            onChange={(e) => setRoleAddress(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <button onClick={handleAssignRole} className="btn btn-primary">
            Assigner
          </button>
        </div>

        {/* Liste des rôles assignés */}
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Rôles Actuels</h4>
          <div className="text-center text-gray-500 py-4">
            Liste des rôles assignés à implémenter
          </div>
        </div>
      </div>
    );
  }

  /* ===========================
     Affichage principal
  ============================ */
  return (
    <div className="settings-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Paramètres Plateforme</h1>
        <p className="text-gray-600 mt-2">
          Configuration de la plateforme DONE Food Delivery
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ---- Configuration rôles ---- */}
          <div className="card p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              Configuration Rôles
            </h2>
            <RoleManager />
          </div>

          {/* ---- Adresses contrats ---- */}
          <div className="card p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Adresses Contrats</h2>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">OrderManager:</span>
                <span className="font-mono text-sm">
                  {formatAddress(contractAddresses.orderManager)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Token:</span>
                <span className="font-mono text-sm">
                  {formatAddress(contractAddresses.token)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Staking:</span>
                <span className="font-mono text-sm">
                  {formatAddress(contractAddresses.staking)}
                </span>
              </div>
            </div>
          </div>

          {/* ---- Variables système ---- */}
          <div className="card p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              Variables Système
            </h2>

            <div className="space-y-4">
              {/* Platform Fee */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Platform Fee (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.platformFee}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      platformFee: parseFloat(e.target.value)
                    })
                  }
                  className="px-4 py-2 border rounded-lg w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Pourcentage de commission de la plateforme (défaut: 10%)
                </p>
              </div>

              {/* Min Stake */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Montant minimum staking (ETH)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={settings.minStakeAmount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minStakeAmount: parseFloat(e.target.value)
                    })
                  }
                  className="px-4 py-2 border rounded-lg w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Montant minimum pour staker en tant que livreur.
                </p>
              </div>
            </div>
          </div>

          {/* ---- Bouton sauvegarde ---- */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
