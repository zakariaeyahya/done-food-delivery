/**
 * Page SettingsPage - Paramètres Plateforme
 * @notice Configuration plateforme, rôles, contrats, variables système
 * @dev Utilise blockchain.assignRole() / blockchain.revokeRole()
 */

// TODO: Importer React et hooks
// import React, { useState, useEffect } from 'react';

// TODO: Importer les services
// import * as blockchainService from '../services/blockchain';
// import * as apiService from '../services/api';

// TODO: Importer les utilitaires
// import { formatAddress } from '../utils/web3';

/**
 * Page SettingsPage
 */
// TODO: Implémenter le composant SettingsPage
// function SettingsPage() {
//   // ÉTAT: settings = null
//   // ÉTAT: saving = false
//   // ÉTAT: loading = true
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [settings, setSettings] = useState(null);
//   // const [saving, setSaving] = useState(false);
//   // const [loading, setLoading] = useState(true);
//   
//   // TODO: États pour la configuration des rôles
//   // const [roleAddress, setRoleAddress] = useState('');
//   // const [selectedRole, setSelectedRole] = useState('CLIENT_ROLE');
//   
//   // TODO: Liste des rôles disponibles
//   // const roles = [
//   //   { value: 'CLIENT_ROLE', label: 'Client' },
//   //   { value: 'RESTAURANT_ROLE', label: 'Restaurant' },
//   //   { value: 'DELIVERER_ROLE', label: 'Livreur' },
//   //   { value: 'PLATFORM_ROLE', label: 'Plateforme' },
//   //   { value: 'ARBITRATOR_ROLE', label: 'Arbitre' }
//   // ];
//   
//   // TODO: Adresses des contrats depuis .env
//   // const contractAddresses = {
//   //   orderManager: import.meta.env.VITE_ORDER_MANAGER_ADDRESS,
//   //   token: import.meta.env.VITE_TOKEN_ADDRESS,
//   //   staking: import.meta.env.VITE_STAKING_ADDRESS
//   // };
//   
//   // TODO: Charger les paramètres au montage
//   // useEffect(() => {
//   //   async function loadSettings() {
//   //     ESSAYER:
//   //       // Charger depuis l'API (si endpoint existe)
//   //       // const data = await apiService.getSettings();
//   //       // setSettings(data);
//   //       
//   //       // Pour l'instant, utiliser des valeurs par défaut
//   //       setSettings({
//   //         platformFee: 10, // 10%
//   //         minStakeAmount: 0.1 // 0.1 ETH
//   //       });
//   //       setLoading(false);
//   //     CATCH error:
//   //       console.error('Error loading settings:', error);
//   //       setLoading(false);
//   //   }
//   //   
//   //   loadSettings();
//   // }, []);
//   
//   // TODO: Fonction pour assigner un rôle
//   // async function handleAssignRole() {
//   //   SI !roleAddress:
//   //     alert('Veuillez entrer une adresse');
//   //     RETOURNER;
//   //   
//   //   SI !ethers.isAddress(roleAddress):
//   //     alert('Adresse invalide');
//   //     RETOURNER;
//   //   
//   //   const confirmed = window.confirm(`Assigner le rôle ${selectedRole} à ${formatAddress(roleAddress)}?`);
//   //   SI !confirmed:
//   //     RETOURNER;
//   //   
//   //   ESSAYER:
//   //     const roleHash = ethers.id(selectedRole);
//   //     const result = await blockchainService.assignRole(roleAddress, roleHash);
//   //     
//   //     SI result.success:
//   //       alert('Rôle assigné avec succès. Transaction: ' + result.txHash);
//   //       setRoleAddress(''); // Reset
//   //     SINON:
//   //       alert('Erreur: ' + result.error);
//   //   CATCH error:
//   //     console.error('Error assigning role:', error);
//   //     alert('Erreur lors de l\'assignation: ' + error.message);
//   // }
//   
//   // TODO: Fonction pour retirer un rôle
//   // async function handleRevokeRole(address, role) {
//   //   const confirmed = window.confirm(`Retirer le rôle ${role} de ${formatAddress(address)}?`);
//   //   SI !confirmed:
//   //     RETOURNER;
//   //   
//   //   ESSAYER:
//   //     const roleHash = ethers.id(role);
//   //     // Note: blockchainService.revokeRole() doit être implémenté
//   //     // const result = await blockchainService.revokeRole(address, roleHash);
//   //     
//   //     alert('Rôle retiré avec succès');
//   //   CATCH error:
//   //     console.error('Error revoking role:', error);
//   //     alert('Erreur lors du retrait: ' + error.message);
//   // }
//   
//   // TODO: Fonction pour sauvegarder les paramètres
//   // async function handleSaveSettings() {
//   //   const confirmed = window.confirm('Êtes-vous sûr de vouloir sauvegarder ces paramètres?');
//   //   SI !confirmed:
//   //     RETOURNER;
//   //   
//   //   setSaving(true);
//   //   ESSAYER:
//   //     // Sauvegarder via API (si endpoint existe)
//   //     // await apiService.updateSettings(settings);
//   //     
//   //     alert('Paramètres sauvegardés avec succès');
//   //     setSaving(false);
//   //   CATCH error:
//   //     console.error('Error saving settings:', error);
//   //     alert('Erreur lors de la sauvegarde: ' + error.message);
//   //     setSaving(false);
//   // }
//   
//   // TODO: Composant RoleManager
//   // function RoleManager() {
//   //   RETOURNER (
//   //     <div className="space-y-4">
//   //       <h3 className="font-semibold">Assigner un Rôle</h3>
//   //       <div className="flex gap-2">
//   //         <input
//   //           type="text"
//   //           placeholder="Adresse wallet"
//   //           value={roleAddress}
//   //           onChange={(e) => setRoleAddress(e.target.value)}
//   //           className="flex-1 px-4 py-2 border rounded-lg"
//   //         />
//   //         <select
//   //           value={selectedRole}
//   //           onChange={(e) => setSelectedRole(e.target.value)}
//   //           className="px-4 py-2 border rounded-lg"
//   //         >
//   //           {roles.map(role => (
//   //             <option key={role.value} value={role.value}>{role.label}</option>
//   //           ))}
//   //         </select>
//   //         <button
//   //           onClick={handleAssignRole}
//   //           className="btn btn-primary"
//   //         >
//   //           Assigner
//   //         </button>
//   //       </div>
//   //       
//   //       {/* Liste des rôles assignés (à implémenter) */}
//   //       <div className="mt-4">
//   //         <h4 className="font-semibold mb-2">Rôles Actuels</h4>
//   //         <div className="text-center text-gray-500 py-4">
//   //           Liste des rôles assignés à implémenter
//   //         </div>
//   //       </div>
//   //     </div>
//   //   );
//   // }
//   
//   // TODO: Rendu principal
//   // RETOURNER (
//   //   <div className="settings-page">
//   //     <div className="mb-6">
//   //       <h1 className="text-3xl font-bold">Paramètres Plateforme</h1>
//   //       <p className="text-gray-600 mt-2">Configuration de la plateforme DONE Food Delivery</p>
//   //     </div>
//   //     
//   //     SI loading:
//   //       <div className="flex items-center justify-center h-64">
//   //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//   //       </div>
//   //     SINON:
//   //       <div className="space-y-6">
//   //         {/* Section Configuration Rôles */}
//   //         <div className="card">
//   //           <h2 className="text-xl font-semibold mb-4">Configuration Rôles</h2>
//   //           <RoleManager />
//   //         </div>
//   //         
//   //         {/* Section Adresses Contrats */}
//   //         <div className="card">
//   //           <h2 className="text-xl font-semibold mb-4">Adresses Contrats</h2>
//   //           <div className="space-y-2">
//   //             <div className="flex items-center justify-between">
//   //               <span className="font-medium">OrderManager:</span>
//   //               <span className="font-mono text-sm">{formatAddress(contractAddresses.orderManager)}</span>
//   //             </div>
//   //             <div className="flex items-center justify-between">
//   //               <span className="font-medium">Token:</span>
//   //               <span className="font-mono text-sm">{formatAddress(contractAddresses.token)}</span>
//   //             </div>
//   //             <div className="flex items-center justify-between">
//   //               <span className="font-medium">Staking:</span>
//   //               <span className="font-mono text-sm">{formatAddress(contractAddresses.staking)}</span>
//   //             </div>
//   //           </div>
//   //         </div>
//   //         
//   //         {/* Section Variables Système */}
//   //         <div className="card">
//   //           <h2 className="text-xl font-semibold mb-4">Variables Système</h2>
//   //           <div className="space-y-4">
//   //             <div>
//   //               <label className="block text-sm font-medium mb-2">
//   //                 Platform Fee (%)
//   //               </label>
//   //               <input
//   //                 type="number"
//   //                 min="0"
//   //                 max="100"
//   //                 value={settings?.platformFee || 10}
//   //                 onChange={(e) => setSettings({ ...settings, platformFee: parseFloat(e.target.value) })}
//   //                 className="px-4 py-2 border rounded-lg w-full"
//   //               />
//   //               <p className="text-sm text-gray-500 mt-1">Pourcentage de commission de la plateforme (défaut: 10%)</p>
//   //             </div>
//   //             <div>
//   //               <label className="block text-sm font-medium mb-2">
//   //                 Min Stake Amount (ETH)
//   //               </label>
//   //               <input
//   //                 type="number"
//   //                 min="0"
//   //                 step="0.1"
//   //                 value={settings?.minStakeAmount || 0.1}
//   //                 onChange={(e) => setSettings({ ...settings, minStakeAmount: parseFloat(e.target.value) })}
//   //                 className="px-4 py-2 border rounded-lg w-full"
//   //               />
//   //               <p className="text-sm text-gray-500 mt-1">Montant minimum de staking pour les livreurs (défaut: 0.1 ETH)</p>
//   //             </div>
//   //           </div>
//   //         </div>
//   //         
//   //         {/* Bouton Sauvegarder */}
//   //         <div className="flex justify-end">
//   //           <button
//   //             onClick={handleSaveSettings}
//   //             disabled={saving}
//   //             className="btn btn-primary"
//   //           >
//   //             {saving ? 'Sauvegarde...' : 'Sauvegarder'}
//   //           </button>
//   //         </div>
//   //       </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default SettingsPage;

