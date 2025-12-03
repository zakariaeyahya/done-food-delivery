/**
 * Composant Checkout
 * @notice Page de paiement et validation de commande
 * @dev Gère adresse livraison, upload IPFS, transaction blockchain, progression visuelle
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';

// TODO: Importer Google Places Autocomplete
// import { useLoadScript } from '@react-google-maps/api';
// import { Autocomplete } from '@react-google-maps/api';

// TODO: Importer les services
// import * as api from '../services/api';
// import * as blockchain from '../services/blockchain';
// import * as ipfs from '../services/ipfs';
// import { parseUnits, formatPrice } from '../utils/formatters';

/**
 * Composant Checkout
 * @param {Object} props - Props du composant
 * @param {Array} props.cart - Panier d'items
 * @param {string} props.restaurantId - ID du restaurant
 * @param {string} props.clientAddress - Adresse wallet du client
 * @param {Function} props.onClearCart - Callback pour vider le panier après commande
 * @returns {JSX.Element} Page de checkout
 */
// TODO: Créer le composant Checkout
// function Checkout({ cart, restaurantId, clientAddress, onClearCart }) {
//   const navigate = useNavigate();
//   
//   // State pour l'adresse de livraison
//   const [deliveryAddress, setDeliveryAddress] = useState('');
//   
//   // State pour les adresses favorites (localStorage)
//   const [favoriteAddresses, setFavoriteAddresses] = useState([]);
//   
//   // State pour l'étape actuelle
//   const [step, setStep] = useState('address'); // 'address', 'payment', 'processing', 'success'
//   
//   // State pour la progression
//   const [progressStep, setProgressStep] = useState(0); // 0-4 (5 étapes)
//   
//   // State pour la transaction hash
//   const [txHash, setTxHash] = useState(null);
//   
//   // State pour l'order ID
//   const [orderId, setOrderId] = useState(null);
//   
//   // State pour les erreurs
//   const [error, setError] = useState(null);
//   
//   // State pour le chargement
//   const [isProcessing, setIsProcessing] = useState(false);
//   
//   // State pour l'autocomplete Google Places
//   const [autocomplete, setAutocomplete] = useState(null);
//   
//   // TODO: Charger Google Maps API
//   // const { isLoaded } = useLoadScript({
//   //   googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
//   // });
//   
//   // TODO: Charger adresses favorites depuis localStorage au montage
//   // useEffect(() => {
//   //   const saved = localStorage.getItem('favoriteAddresses');
//   //   SI saved:
//   //     setFavoriteAddresses(JSON.parse(saved));
//   // }, []);
//   
//   // TODO: Calculer les totaux depuis le panier
//   // const totals = useMemo(() => {
//   //   const foodPrice = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
//   //   const deliveryFee = 3; // 3 MATIC fixe
//   //   const platformFee = foodPrice * 0.1; // 10%
//   //   const totalAmount = foodPrice + deliveryFee + platformFee;
//   //   
//   //   RETOURNER { foodPrice, deliveryFee, platformFee, totalAmount };
//   // }, [cart]);
//   
//   // TODO: Fonction pour gérer la sélection d'adresse depuis Google Places
//   // function handlePlaceSelect() {
//   //   SI autocomplete:
//   //     const place = autocomplete.getPlace();
//   //     SI place.formatted_address:
//   //       setDeliveryAddress(place.formatted_address);
//   //   }
//   // }
//   
//   // TODO: Fonction pour sauvegarder adresse en favori
//   // function handleSaveFavorite() {
//   //   SI deliveryAddress && !favoriteAddresses.includes(deliveryAddress):
//   //     const updated = [...favoriteAddresses, deliveryAddress];
//   //     setFavoriteAddresses(updated);
//   //     localStorage.setItem('favoriteAddresses', JSON.stringify(updated));
//   //   }
//   // }
//   
//   // TODO: Fonction pour valider l'adresse
//   // function validateAddress() {
//   //   SI !deliveryAddress || deliveryAddress.trim() === '':
//   //     setError('Veuillez saisir une adresse de livraison');
//   //     RETOURNER false;
//   //   RETOURNER true;
//   // }
//   
//   // TODO: Fonction pour passer à l'étape de paiement
//   // function handleAddressSubmit() {
//   //   SI validateAddress():
//   //     setStep('payment');
//   //     setError(null);
//   //   }
//   // }
//   
//   // TODO: Fonction pour uploader les items vers IPFS
//   // async function uploadToIPFS() {
//   //   ESSAYER:
//   //     setProgressStep(1); // Upload IPFS
//   //     
//   //     // Préparer les données à uploader
//   //     const orderData = {
//   //       items: cart,
//   //       deliveryAddress: deliveryAddress,
//   //       createdAt: new Date().toISOString(),
//   //       restaurantId: restaurantId
//   //     };
//   //     
//   //     // Upload vers IPFS
//   //     const { ipfsHash } = await ipfs.uploadJSON(orderData);
//   //     
//   //     RETOURNER ipfsHash;
//   //   CATCH error:
//   //     console.error('Error uploading to IPFS:', error);
//   //     throw new Error('Erreur lors de l\'upload vers IPFS');
//   // }
//   
//   // TODO: Fonction principale pour créer la commande
//   // async function handlePayment() {
//   //   ESSAYER:
//   //     setIsProcessing(true);
//   //     setError(null);
//   //     setStep('processing');
//   //     setProgressStep(0); // Préparation commande
//   //     
//   //     // Étape 1: Préparation
//   //     await new Promise(resolve => setTimeout(resolve, 500));
//   //     setProgressStep(1);
//   //     
//   //     // Étape 2: Upload IPFS
//   //     const ipfsHash = await uploadToIPFS();
//   //     setProgressStep(2);
//   //     
//   //     // Étape 3: Confirmation MetaMask et transaction blockchain
//   //     // Calculer totalAmount en wei
//   //     const totalAmountWei = parseUnits(totals.totalAmount.toString());
//   //     
//   //     // Récupérer l'adresse du restaurant (depuis cart ou API)
//   //     // TODO: Récupérer restaurantAddress depuis API
//   //     const restaurant = await api.getRestaurant(restaurantId);
//   //     const restaurantAddress = restaurant.address;
//   //     
//   //     // Créer commande on-chain
//   //     const blockchainResult = await blockchain.createOrderOnChain({
//   //       restaurantAddress: restaurantAddress,
//   //       foodPrice: parseUnits(totals.foodPrice.toString()),
//   //       deliveryFee: parseUnits(totals.deliveryFee.toString()),
//   //       ipfsHash: ipfsHash,
//   //       platformFee: parseUnits(totals.platformFee.toString())
//   //     });
//   //     
//   //     setTxHash(blockchainResult.txHash);
//   //     setProgressStep(3);
//   //     
//   //     // Étape 4: Créer commande via backend
//   //     const orderResult = await api.createOrder({
//   //       restaurantId: restaurantId,
//   //       items: cart,
//   //       deliveryAddress: deliveryAddress,
//   //       clientAddress: clientAddress,
//   //       foodPrice: totals.foodPrice,
//   //       deliveryFee: totals.deliveryFee,
//   //       ipfsHash: ipfsHash
//   //     });
//   //     
//   //     setOrderId(orderResult.orderId);
//   //     setProgressStep(4); // Commande créée
//   //     
//   //     // Étape 5: Succès
//   //     setStep('success');
//   //     
//   //     // Vider le panier
//   //     SI onClearCart:
//   //       onClearCart();
//   //     
//   //     // Redirect vers tracking après 2 secondes
//   //     setTimeout(() => {
//   //       navigate(`/tracking/${orderResult.orderId}`);
//   //     }, 2000);
//   //     
//   //   CATCH error:
//   //     console.error('Error creating order:', error);
//   //     setError(error.message || 'Erreur lors de la création de la commande');
//   //     setStep('payment'); // Revenir à l'étape paiement
//   //   FINALLY:
//   //     setIsProcessing(false);
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="checkout-page">
//   //     <h1>Finaliser la commande</h1>
//   //     
//   //     {/* Étape 1: Adresse de livraison */}
//   //     SI step === 'address':
//   //       <div className="checkout-step">
//   //         <h2>Adresse de livraison</h2>
//   //         
//   //         {/* Autocomplete Google Places */}
//   //         SI isLoaded:
//   //           <Autocomplete
//   //             onLoad={(autocomplete) => setAutocomplete(autocomplete)}
//   //             onPlaceChanged={handlePlaceSelect}
//   //           >
//   //             <input
//   //               type="text"
//   //               placeholder="Saisissez votre adresse"
//   //               value={deliveryAddress}
//   //               onChange={(e) => setDeliveryAddress(e.target.value)}
//   //               className="input"
//   //             />
//   //           </Autocomplete>
//   //         
//   //         {/* Adresses favorites */}
//   //         SI favoriteAddresses.length > 0:
//   //           <div className="favorite-addresses">
//   //             <label>Adresses favorites:</label>
//   //             {favoriteAddresses.map((addr, i) => (
//   //               <button
//   //                 key={i}
//   //                 onClick={() => setDeliveryAddress(addr)}
//   //                 className="btn btn-ghost"
//   //               >
//   //                 {addr}
//   //               </button>
//   //             ))}
//   //           </div>
//   //         
//   //         <button onClick={handleAddressSubmit} className="btn btn-primary">
//   //           Continuer
//   //         </button>
//   //       </div>
//   //     
//   //     {/* Étape 2: Paiement */}
//   //     SINON SI step === 'payment':
//   //       <div className="checkout-step">
//   //         <h2>Récapitulatif et paiement</h2>
//   //         
//   //         <div className="order-summary">
//   //           <p>Adresse: {deliveryAddress}</p>
//   //           <div className="totals">
//   //             <div>Nourriture: {formatPrice(totals.foodPrice, 'MATIC')}</div>
//   //             <div>Livraison: {formatPrice(totals.deliveryFee, 'MATIC')}</div>
//   //             <div>Frais plateforme: {formatPrice(totals.platformFee, 'MATIC')}</div>
//   //             <div className="total">Total: {formatPrice(totals.totalAmount, 'MATIC')}</div>
//   //           </div>
//   //         </div>
//   //         
//   //         <button 
//   //           onClick={handlePayment} 
//   //           disabled={isProcessing}
//   //           className="btn btn-primary btn-lg"
//   //         >
//   //           {isProcessing ? 'Traitement...' : 'Confirmer et payer'}
//   //         </button>
//   //       </div>
//   //     
//   //     {/* Étape 3: Traitement */}
//   //     SINON SI step === 'processing':
//   //       <div className="checkout-step processing">
//   //         <h2>Création de la commande...</h2>
//   //         
//   //         {/* Timeline de progression */}
//   //         <div className="progress-timeline">
//   //           <div className={`step ${progressStep >= 0 ? 'completed' : ''}`}>
//   //             1. Préparation commande
//   //           </div>
//   //           <div className={`step ${progressStep >= 1 ? 'completed' : ''}`}>
//   //             2. Upload IPFS
//   //           </div>
//   //           <div className={`step ${progressStep >= 2 ? 'completed' : ''}`}>
//   //             3. Confirmation MetaMask
//   //           </div>
//   //           <div className={`step ${progressStep >= 3 ? 'completed' : ''}`}>
//   //             4. Transaction blockchain
//   //           </div>
//   //           <div className={`step ${progressStep >= 4 ? 'completed' : ''}`}>
//   //             5. Commande créée
//   //           </div>
//   //         </div>
//   //         
//   //         SI txHash:
//   //           <p>Transaction: {txHash}</p>
//   //       </div>
//   //     
//   //     {/* Étape 4: Succès */}
//   //     SINON SI step === 'success':
//   //       <div className="checkout-step success">
//   //         <h2>✅ Commande créée avec succès!</h2>
//   //         <p>Order ID: {orderId}</p>
//   //         <p>Redirection vers le suivi...</p>
//   //       </div>
//   //     
//   //     {/* Affichage erreur */}
//   //     SI error:
//   //       <div className="error-message">
//   //         {error}
//   //       </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default Checkout;

