/**
 * Context WalletContext
 * @notice Fournit wallet, address, balance à toute l'application
 * @dev Gère connexion/déconnexion wallet, récupération solde
 */

// TODO: Importer React
// import { createContext, useState, useEffect } from 'react';

// TODO: Importer les services
// import * as blockchain from '../services/blockchain';

/**
 * Créer le Context
 */
// TODO: Créer WalletContext
// export const WalletContext = createContext(null);

/**
 * Provider pour WalletContext
 * @param {Object} props - Props avec children
 * @returns {JSX.Element} Provider avec valeur du context
 */
// TODO: Créer WalletProvider
// export function WalletProvider({ children }) {
//   const [address, setAddress] = useState(null);
//   const [balance, setBalance] = useState('0');
//   const [isConnected, setIsConnected] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   
//   // TODO: Fonction pour connecter le wallet
//   // async function connect() {
//   //   ESSAYER:
//   //     setIsConnecting(true);
//   //     const { address: connectedAddress } = await blockchain.connectWallet();
//   //     setAddress(connectedAddress);
//   //     setIsConnected(true);
//   //     
//   //     // Récupérer le solde MATIC
//   //     const maticBalance = await blockchain.getBalance(connectedAddress);
//   //     setBalance(maticBalance);
//   //     
//   //     // Sauvegarder dans localStorage
//   //     localStorage.setItem('walletAddress', connectedAddress);
//   //   CATCH error:
//   //     console.error('Error connecting wallet:', error);
//   //     throw error;
//   //   FINALLY:
//   //     setIsConnecting(false);
//   // }
//   
//   // TODO: Fonction pour déconnecter le wallet
//   // function disconnect() {
//   //   setAddress(null);
//   //   setBalance('0');
//   //   setIsConnected(false);
//   //   localStorage.removeItem('walletAddress');
//   // }
//   
//   // TODO: Fonction pour rafraîchir le solde
//   // async function refreshBalance() {
//   //   SI address:
//   //     const maticBalance = await blockchain.getBalance(address);
//   //     setBalance(maticBalance);
//   //   }
//   // }
//   
//   // TODO: useEffect pour vérifier wallet connecté au montage
//   // useEffect(() => {
//   //   const savedAddress = localStorage.getItem('walletAddress');
//   //   SI savedAddress:
//   //     setAddress(savedAddress);
//   //     setIsConnected(true);
//   //     // Récupérer balance
//   //     blockchain.getBalance(savedAddress).then(setBalance);
//   // }, []);
//   
//   // TODO: Rafraîchir balance toutes les 30 secondes si connecté
//   // useEffect(() => {
//   //   SI !address:
//   //     RETOURNER;
//   //   
//   //   const interval = setInterval(() => {
//   //     refreshBalance();
//   //   }, 30000);
//   //   
//   //   RETOURNER () => clearInterval(interval);
//   // }, [address]);
//   
//   // TODO: Valeur du context
//   // const value = {
//   //   address,
//   //   balance,
//   //   isConnected,
//   //   isConnecting,
//   //   connect,
//   //   disconnect,
//   //   refreshBalance
//   // };
//   
//   // TODO: Retourner le Provider
//   // RETOURNER (
//   //   <WalletContext.Provider value={value}>
//   //     {children}
//   //   </WalletContext.Provider>
//   // );
// }

