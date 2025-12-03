/**
 * Composant ConnectWallet - Restaurant
 * @notice Gère la connexion au wallet MetaMask pour le restaurant
 * @dev Détecte MetaMask, connecte le wallet, vérifie le rôle RESTAURANT_ROLE, fetch restaurant profile
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect } from 'react';

// TODO: Importer les services
// import * as blockchain from '../services/blockchain';
// import * as api from '../services/api';
// import { formatAddress, formatBalance } from '../utils/web3';

/**
 * Composant ConnectWallet
 * @returns {JSX.Element} Composant de connexion wallet restaurant
 */
// TODO: Créer le composant ConnectWallet
// function ConnectWallet({ onConnect }) {
//   // State pour l'adresse connectée
//   const [address, setAddress] = useState(null);
//   
//   // State pour l'état de connexion en cours
//   const [isConnecting, setIsConnecting] = useState(false);
//   
//   // State pour vérifier le rôle RESTAURANT_ROLE
//   const [hasRole, setHasRole] = useState(false);
//   
//   // State pour les données du restaurant
//   const [restaurant, setRestaurant] = useState(null);
//   
//   // State pour le solde MATIC
//   const [balance, setBalance] = useState('0');
//   
//   // State pour le réseau actuel
//   const [network, setNetwork] = useState(null);
//   
//   // State pour les erreurs
//   const [error, setError] = useState(null);
//   
//   // State pour vérifier si MetaMask est installé
//   const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
//   
//   // TODO: useEffect pour vérifier MetaMask au montage
//   // useEffect(() => {
//   //   SI window.ethereum:
//   //     setIsMetaMaskInstalled(true);
//   //     
//   //     // Vérifier si wallet déjà connecté (localStorage)
//   //     const savedAddress = localStorage.getItem('restaurantWalletAddress');
//   //     SI savedAddress:
//   //       setAddress(savedAddress);
//   //       checkRoleAndFetchRestaurant(savedAddress);
//   //   SINON:
//   //     setIsMetaMaskInstalled(false);
//   // }, []);
//   
//   // TODO: Fonction pour vérifier le rôle RESTAURANT_ROLE
//   // async function checkRole(address) {
//   //   ESSAYER:
//   //     const RESTAURANT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE"));
//   //     const hasRestaurantRole = await blockchain.hasRole(RESTAURANT_ROLE, address);
//   //     setHasRole(hasRestaurantRole);
//   //     
//   //     SI !hasRestaurantRole:
//   //       setError('Cette adresse n\'a pas le rôle RESTAURANT_ROLE. Veuillez contacter l\'administrateur.');
//   //     
//   //     RETOURNER hasRestaurantRole;
//   //   CATCH error:
//   //     console.error('Error checking role:', error);
//   //     setError(`Erreur lors de la vérification du rôle: ${error.message}`);
//   //     RETOURNER false;
//   // }
//   
//   // TODO: Fonction pour récupérer le profil restaurant depuis l'API
//   // async function fetchRestaurantProfile(address) {
//   //   ESSAYER:
//   //     // Chercher restaurant par address dans la base de données
//   //     // Note: L'API devrait avoir une route GET /api/restaurants/by-address/:address
//   //     // OU on peut utiliser getRestaurant avec l'ID si on le connaît
//   //     const restaurant = await api.getRestaurantByAddress(address);
//   //     setRestaurant(restaurant);
//   //     
//   //     // Appeler callback onConnect si fourni
//   //     SI onConnect:
//   //       onConnect({ address, restaurant });
//   //   CATCH error:
//   //     console.error('Error fetching restaurant profile:', error);
//   //     setError(`Erreur lors de la récupération du profil: ${error.message}`);
//   // }
//   
//   // TODO: Fonction pour vérifier rôle et fetch restaurant
//   // async function checkRoleAndFetchRestaurant(address) {
//   //   const hasRestaurantRole = await checkRole(address);
//   //   SI hasRestaurantRole:
//   //     await fetchRestaurantProfile(address);
//   //     await fetchBalance(address);
//   // }
//   
//   // TODO: Fonction pour récupérer le solde MATIC
//   // async function fetchBalance(address) {
//   //   ESSAYER:
//   //     const balance = await blockchain.getBalance(address);
//   //     setBalance(formatBalance(balance));
//   //   CATCH error:
//   //     console.error('Error fetching balance:', error);
//   // }
//   
//   // TODO: Fonction pour connecter le wallet
//   // async function handleConnect() {
//   //   ESSAYER:
//   //     setIsConnecting(true);
//   //     setError(null);
//   //     
//   //     // Connecter wallet via blockchain service
//   //     const { address: connectedAddress } = await blockchain.connectWallet();
//   //     setAddress(connectedAddress);
//   //     localStorage.setItem('restaurantWalletAddress', connectedAddress);
//   //     
//   //     // Vérifier le rôle RESTAURANT_ROLE
//   //     await checkRoleAndFetchRestaurant(connectedAddress);
//   //     
//   //     setIsConnecting(false);
//   //   CATCH error:
//   //     console.error('Error connecting wallet:', error);
//   //     setError(`Erreur de connexion: ${error.message}`);
//   //     setIsConnecting(false);
//   // }
//   
//   // TODO: Fonction pour déconnecter le wallet
//   // function handleDisconnect() {
//   //   setAddress(null);
//   //   setHasRole(false);
//   //   setRestaurant(null);
//   //   setBalance('0');
//   //   localStorage.removeItem('restaurantWalletAddress');
//   //   
//   //   SI onConnect:
//   //     onConnect(null);
//   // }
//   
//   // TODO: Render du composant
//   // RETOURNER (
//   //   <div className="connect-wallet">
//   //     SI !isMetaMaskInstalled:
//   //       <div className="error-message">
//   //         <p>MetaMask n'est pas installé. Veuillez installer l'extension MetaMask.</p>
//   //         <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">
//   //           Installer MetaMask
//   //         </a>
//   //       </div>
//   //     
//   //     SINON SI !address:
//   //       <button 
//   //         onClick={handleConnect} 
//   //         disabled={isConnecting}
//   //         className="btn btn-primary"
//   //       >
//   //         {isConnecting ? 'Connexion...' : 'Connecter Wallet'}
//   //       </button>
//   //     
//   //     SINON:
//   //       <div className="wallet-info">
//   //         SI !hasRole:
//   //           <div className="error-message">
//   //             <p>⚠️ Cette adresse n'a pas le rôle RESTAURANT_ROLE.</p>
//   //             <p>Veuillez contacter l'administrateur pour obtenir ce rôle.</p>
//   //           </div>
//   //         
//   //         SINON:
//   //           <div className="wallet-details">
//   //             <p>Adresse: {formatAddress(address)}</p>
//   //             <p>Solde: {balance} MATIC</p>
//   //             SI restaurant:
//   //               <p>Restaurant: {restaurant.name}</p>
//   //             <button onClick={handleDisconnect} className="btn btn-secondary">
//   //               Déconnexion
//   //             </button>
//   //           </div>
//   //       </div>
//   //     
//   //     SI error:
//   //       <div className="error-message">
//   //         <p>{error}</p>
//   //       </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default ConnectWallet;

