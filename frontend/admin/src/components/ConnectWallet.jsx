/**
 * Composant ConnectWallet - Connexion MetaMask Admin
 * @notice Permet de connecter MetaMask et vérifier le rôle PLATFORM/ADMIN
 * @dev Vérifie le rôle via blockchain.hasRole() avant d'autoriser l'accès
 */

// TODO: Importer React et hooks
// import React, { useState, useEffect } from 'react';

// TODO: Importer les services
// import * as blockchainService from '../services/blockchain';

// TODO: Importer les utilitaires
// import { formatAddress } from '../utils/web3';

/**
 * Composant ConnectWallet
 * @param {Function} onConnect - Callback appelé quand la connexion réussit
 * @param {Function} onDisconnect - Callback appelé quand la déconnexion
 */
// TODO: Implémenter le composant ConnectWallet
// function ConnectWallet({ onConnect, onDisconnect }) {
//   // ÉTAT: address = null
//   // ÉTAT: isConnecting = false
//   // ÉTAT: balance = null
//   // ÉTAT: hasAdminRole = false
//   // ÉTAT: error = null
//   
//   // TODO: Utiliser useState pour gérer les états
//   // const [address, setAddress] = useState(null);
//   // const [isConnecting, setIsConnecting] = useState(false);
//   // const [balance, setBalance] = useState(null);
//   // const [hasAdminRole, setHasAdminRole] = useState(false);
//   // const [error, setError] = useState(null);
//   
//   // TODO: Vérifier si MetaMask est installé au montage
//   // useEffect(() => {
//   //   SI !window.ethereum:
//   //     setError('MetaMask n\'est pas installé. Veuillez installer l\'extension MetaMask.');
//   // }, []);
//   
//   // TODO: Fonction pour connecter le wallet
//   // async function handleConnect() {
//   //   ESSAYER:
//   //     setIsConnecting(true);
//   //     setError(null);
//   //     
//   //     // Vérifier que MetaMask est installé
//   //     SI !window.ethereum:
//   //       throw new Error('MetaMask n\'est pas installé');
//   //     
//   //     // Connecter le wallet via blockchainService
//   //     const { address: connectedAddress } = await blockchainService.connectWallet();
//   //     setAddress(connectedAddress);
//   //     
//   //     // Sauvegarder l'adresse dans localStorage
//   //     localStorage.setItem('adminWalletAddress', connectedAddress);
//   //     
//   //     // Récupérer le solde MATIC
//   //     const provider = blockchainService.getProvider();
//   //     const balanceWei = await provider.getBalance(connectedAddress);
//   //     const balanceEther = ethers.formatEther(balanceWei);
//   //     setBalance(balanceEther);
//   //     
//   //     // Vérifier le rôle PLATFORM/ADMIN
//   //     const PLATFORM_ROLE = ethers.id("PLATFORM_ROLE");
//   //     const hasRole = await blockchainService.hasRole(connectedAddress, PLATFORM_ROLE);
//   //     
//   //     SI !hasRole:
//   //       setError('Vous n\'avez pas les droits administrateur. Seuls les comptes avec le rôle PLATFORM peuvent accéder au dashboard admin.');
//   //       setAddress(null);
//   //       localStorage.removeItem('adminWalletAddress');
//   //       setIsConnecting(false);
//   //       RETOURNER;
//   //     
//   //     setHasAdminRole(true);
//   //     setIsConnecting(false);
//   //     
//   //     // Appeler le callback onConnect
//   //     SI onConnect:
//   //       onConnect(connectedAddress);
//   //   CATCH error:
//   //     console.error('Error connecting wallet:', error);
//   //     setError(error.message || 'Erreur lors de la connexion du wallet');
//   //     setIsConnecting(false);
//   // }
//   
//   // TODO: Fonction pour déconnecter le wallet
//   // function handleDisconnect() {
//   //   setAddress(null);
//   //   setBalance(null);
//   //   setHasAdminRole(false);
//   //   setError(null);
//   //   localStorage.removeItem('adminWalletAddress');
//   //   
//   //   SI onDisconnect:
//   //     onDisconnect();
//   // }
//   
//   // TODO: Vérifier si wallet déjà connecté au montage
//   // useEffect(() => {
//   //   const savedAddress = localStorage.getItem('adminWalletAddress');
//   //   SI savedAddress:
//   //     handleConnect(); // Reconnexion automatique
//   // }, []);
//   
//   // TODO: Si MetaMask n'est pas installé
//   // SI !window.ethereum:
//   //   RETOURNER (
//   //     <div className="connect-wallet-error">
//   //       <p>MetaMask n'est pas installé.</p>
//   //       <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
//   //         Installer MetaMask
//   //       </a>
//   //     </div>
//   //   );
//   
//   // TODO: Si wallet connecté et rôle valide
//   // SI address ET hasAdminRole:
//   //   RETOURNER (
//   //     <div className="connect-wallet-connected">
//   //       <div className="wallet-info">
//   //         <span className="address">{formatAddress(address)}</span>
//   //         <span className="balance">{parseFloat(balance).toFixed(4)} MATIC</span>
//   //       </div>
//   //       <button onClick={handleDisconnect} className="btn btn-outline">
//   //         Déconnecter
//   //       </button>
//   //     </div>
//   //   );
//   
//   // TODO: Formulaire de connexion
//   // RETOURNER (
//   //   <div className="connect-wallet">
//   //     <h2>Connexion Admin</h2>
//   //     <p>Connectez votre wallet MetaMask avec le rôle PLATFORM pour accéder au dashboard admin.</p>
//   //     
//   //     SI error:
//   //       <div className="error-message">
//   //         {error}
//   //       </div>
//   //     
//   //     <button 
//   //       onClick={handleConnect} 
//   //       disabled={isConnecting}
//   //       className="btn btn-primary"
//   //     >
//   //       {isConnecting ? 'Connexion...' : 'Connecter MetaMask'}
//   //     </button>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default ConnectWallet;

