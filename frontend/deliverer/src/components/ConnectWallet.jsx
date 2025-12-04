/**
 * Composant ConnectWallet pour livreur
 * @fileoverview Gère la connexion MetaMask, vérification rôle DELIVERER et staking
 */

// TODO: Importer React et hooks
// import { useState, useEffect } from 'react';
// import { blockchain } from '../services/blockchain';
// import { api } from '../services/api';
// import { DELIVERER_ROLE } from '../services/blockchain';

/**
 * Composant ConnectWallet
 * @returns {JSX.Element} Composant de connexion wallet
 */
// TODO: Implémenter ConnectWallet()
// function ConnectWallet() {
//   // State
//   const [address, setAddress] = useState(null);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [hasRole, setHasRole] = useState(false);
//   const [isStaked, setIsStaked] = useState(false);
//   const [stakedAmount, setStakedAmount] = useState(0);
//   const [deliverer, setDeliverer] = useState(null);
//   const [error, setError] = useState(null);
//   
//   // Vérifier si wallet déjà connecté au chargement
//   useEffect(() => {
//     checkWalletConnection();
//   }, []);
//   
//   // Fonction pour vérifier connexion existante
//   async function checkWalletConnection() {
//     ESSAYER:
//       SI window.ethereum:
//         const accounts = await window.ethereum.request({ method: 'eth_accounts' });
//         SI accounts.length > 0:
//           await handleConnect(accounts[0]);
//     CATCH error:
//       console.error('Error checking wallet:', error);
//   }
//   
//   // Fonction de connexion
//   async function handleConnect(account = null) {
//     setIsConnecting(true);
//     setError(null);
//     
//     ESSAYER:
//       // 1. Connexion MetaMask
//       SI !account:
//         const { address: connectedAddress } = await blockchain.connectWallet();
//         setAddress(connectedAddress);
//         account = connectedAddress;
//       SINON:
//         setAddress(account);
//       
//       // 2. Vérifier rôle DELIVERER_ROLE
//       const hasDelivererRole = await blockchain.hasRole(DELIVERER_ROLE, account);
//       setHasRole(hasDelivererRole);
//       
//       SI !hasDelivererRole:
//         setError('Vous n\'avez pas le rôle DELIVERER. Veuillez vous inscrire.');
//         RETOURNER;
//       
//       // 3. Vérifier staking
//       const staked = await blockchain.isStaked(account);
//       setIsStaked(staked);
//       
//       SI staked:
//         const stakeInfo = await blockchain.getStakeInfo(account);
//         setStakedAmount(stakeInfo.amount);
//       
//       // 4. Récupérer profil livreur
//       ESSAYER:
//         const profile = await api.getDeliverer(account);
//         setDeliverer(profile.deliverer);
//       CATCH error:
//         // Si pas de profil, livreur pas encore enregistré
//         console.log('Deliverer not registered yet');
//     CATCH error:
//       setError(`Erreur de connexion: ${error.message}`);
//     FINALLY:
//       setIsConnecting(false);
//   }
//   
//   // Fonction de déconnexion
//   function handleDisconnect() {
//     setAddress(null);
//     setHasRole(false);
//     setIsStaked(false);
//     setStakedAmount(0);
//     setDeliverer(null);
//     setError(null);
//   }
//   
//   // Render
//   RETOURNER (
//     <div className="connect-wallet">
//       SI !address:
//         <button onClick={() => handleConnect()} disabled={isConnecting}>
//           {isConnecting ? 'Connexion...' : 'Connecter MetaMask'}
//         </button>
//       SINON:
//         <div className="wallet-info">
//           <div className="address">
//             <span>Adresse: {address.slice(0, 6)}...{address.slice(-4)}</span>
//           </div>
//           
//           SI !hasRole:
//             <div className="error">
//               ⚠️ Vous n'avez pas le rôle DELIVERER
//             </div>
//           SINON SI !isStaked:
//             <div className="warning">
//               ⚠️ Vous devez staker minimum 0.1 MATIC pour accepter des commandes
//               <Link to="/profile"> → Aller au StakingPanel</Link>
//             </div>
//           SINON:
//             <div className="success">
//               ✅ Staké: {stakedAmount} MATIC
//             </div>
//           
//           <button onClick={handleDisconnect}>Déconnexion</button>
//         </div>
//       
//       SI error:
//         <div className="error-message">{error}</div>
//     </div>
//   );
// }

// TODO: Exporter le composant
// export default ConnectWallet;

