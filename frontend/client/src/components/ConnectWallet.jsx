/**
 * Composant ConnectWallet
 * @notice Gère la connexion au wallet MetaMask pour le client
 * @dev Détecte MetaMask, connecte le wallet, vérifie le réseau, affiche le solde
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect } from 'react';

// TODO: Importer les services
// import * as blockchain from '../services/blockchain';
// import { formatAddress, formatBalance } from '../utils/web3';

/**
 * Composant ConnectWallet
 * @returns {JSX.Element} Composant de connexion wallet
 */
// TODO: Créer le composant ConnectWallet
// function ConnectWallet() {
//   // State pour l'adresse connectée
//   const [address, setAddress] = useState(null);
//   
//   // State pour l'état de connexion en cours
//   const [isConnecting, setIsConnecting] = useState(false);
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
//   //   // Vérifier si window.ethereum existe
//   //   SI window.ethereum:
//   //     setIsMetaMaskInstalled(true);
//   //     
//   //     // Vérifier si wallet déjà connecté (localStorage)
//   //     const savedAddress = localStorage.getItem('walletAddress');
//   //     SI savedAddress:
//   //       setAddress(savedAddress);
//   //       fetchBalance(savedAddress);
//   //       checkNetwork();
//   //   SINON:
//   //     setIsMetaMaskInstalled(false);
//   // }, []);
//   
//   // TODO: Fonction pour vérifier le réseau actuel
//   // async function checkNetwork() {
//   //   ESSAYER:
//   //     SI !window.ethereum:
//   //       RETOURNER;
//   //     
//   //     const provider = new ethers.BrowserProvider(window.ethereum);
//   //     const network = await provider.getNetwork();
//   //     
//   //     // Vérifier si c'est Polygon Mumbai (chainId: 80001)
//   //     SI network.chainId === BigInt(80001):
//   //       setNetwork('Polygon Mumbai');
//   //     SINON:
//   //       setNetwork('Réseau incorrect');
//   //       // Proposer de switcher
//   //   CATCH error:
//   //     console.error('Error checking network:', error);
//   // }
//   
//   // TODO: Fonction pour switcher vers Polygon Mumbai
//   // async function switchToMumbai() {
//   //   ESSAYER:
//   //     setIsConnecting(true);
//   //     setError(null);
//   //     
//   //     // Demander à MetaMask de switcher
//   //     await window.ethereum.request({
//   //       method: 'wallet_switchEthereumChain',
//   //       params: [{ chainId: '0x13881' }], // 80001 en hex
//   //     });
//   //     
//   //     // Re-vérifier le réseau
//   //     await checkNetwork();
//   //   CATCH error:
//   //     SI error.code === 4902: // Chain not added
//   //       // Ajouter le réseau Mumbai
//   //       await window.ethereum.request({
//   //         method: 'wallet_addEthereumChain',
//   //         params: [{
//   //           chainId: '0x13881',
//   //           chainName: 'Polygon Mumbai',
//   //           nativeCurrency: {
//   //             name: 'MATIC',
//   //             symbol: 'MATIC',
//   //             decimals: 18
//   //           },
//   //           rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
//   //           blockExplorerUrls: ['https://mumbai.polygonscan.com']
//   //         }]
//   //       });
//   //     SINON:
//   //       setError('Erreur lors du changement de réseau');
//   //   FINALLY:
//   //     setIsConnecting(false);
//   // }
//   
//   // TODO: Fonction pour récupérer le solde MATIC
//   // async function fetchBalance(address) {
//   //   ESSAYER:
//   //     SI !address:
//   //       RETOURNER;
//   //     
//   //     const balanceWei = await blockchain.getBalance(address);
//   //     const balanceFormatted = formatBalance(balanceWei);
//   //     setBalance(balanceFormatted);
//   //   CATCH error:
//   //     console.error('Error fetching balance:', error);
//   //     setBalance('0');
//   // }
//   
//   // TODO: Fonction pour connecter le wallet
//   // async function connectWallet() {
//   //   ESSAYER:
//   //     setIsConnecting(true);
//   //     setError(null);
//   //     
//   //     // Vérifier que MetaMask est installé
//   //     SI !window.ethereum:
//   //       setError('MetaMask n\'est pas installé');
//   //       setIsMetaMaskInstalled(false);
//   //       RETOURNER;
//   //     
//   //     // Demander connexion des comptes
//   //     const accounts = await window.ethereum.request({
//   //       method: 'eth_requestAccounts'
//   //     });
//   //     
//   //     SI accounts.length === 0:
//   //       setError('Aucun compte trouvé');
//   //       RETOURNER;
//   //     
//   //     const connectedAddress = accounts[0];
//   //     setAddress(connectedAddress);
//   //     
//   //     // Sauvegarder dans localStorage
//   //     localStorage.setItem('walletAddress', connectedAddress);
//   //     
//   //     // Vérifier le réseau
//   //     await checkNetwork();
//   //     
//   //     // Récupérer le solde
//   //     await fetchBalance(connectedAddress);
//   //     
//   //   CATCH error:
//   //     SI error.code === 4001: // User rejected
//   //       setError('Connexion refusée par l\'utilisateur');
//   //     SINON SI error.code === -32002: // Already processing
//   //       setError('Une demande de connexion est déjà en cours');
//   //     SINON:
//   //       setError('Erreur lors de la connexion: ' + error.message);
//   //   FINALLY:
//   //     setIsConnecting(false);
//   // }
//   
//   // TODO: Fonction pour déconnecter le wallet
//   // function disconnect() {
//   //   setAddress(null);
//   //   setBalance('0');
//   //   setNetwork(null);
//   //   localStorage.removeItem('walletAddress');
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="connect-wallet">
//   //     SI !isMetaMaskInstalled:
//   //       <div className="metamask-not-installed">
//   //         <p>MetaMask n'est pas installé</p>
//   //         <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
//   //           Installer MetaMask
//   //         </a>
//   //       </div>
//   //     
//   //     SINON SI !address:
//   //       <button 
//   //         onClick={connectWallet} 
//   //         disabled={isConnecting}
//   //         className="btn btn-primary"
//   //       >
//   //         {isConnecting ? 'Connexion...' : 'Connecter le wallet'}
//   //       </button>
//   //     
//   //     SINON:
//   //       <div className="wallet-connected">
//   //         <div className="wallet-info">
//   //           <span className="address">{formatAddress(address)}</span>
//   //           <span className="network">{network}</span>
//   //           <span className="balance">{balance} MATIC</span>
//   //         </div>
//   //         <button onClick={disconnect} className="btn btn-secondary">
//   //           Déconnecter
//   //         </button>
//   //       </div>
//   //     
//   //     SI error:
//   //       <div className="error-message">
//   //         {error}
//   //       </div>
//   //     
//   //     SI network !== 'Polygon Mumbai' && address:
//   //       <button onClick={switchToMumbai} className="btn btn-warning">
//   //         Switcher vers Polygon Mumbai
//   //       </button>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default ConnectWallet;

