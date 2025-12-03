/**
 * Page ProfilePage
 * @notice Page de profil utilisateur avec historique, tokens, paramètres
 * @dev Informations personnelles, historique commandes, tokens DONE, paramètres compte
 */

// TODO: Importer React et hooks nécessaires
// import { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';

// TODO: Importer les composants
// import OrderHistory from '../components/OrderHistory';
// import TokenBalance from '../components/TokenBalance';
// import ConnectWallet from '../components/ConnectWallet';

// TODO: Importer les services
// import * as api from '../services/api';
// import { formatAddress } from '../utils/web3';

// TODO: Importer les Contexts
// import { WalletContext } from '../contexts/WalletContext';
// import { CartContext } from '../contexts/CartContext';

/**
 * Page ProfilePage
 * @returns {JSX.Element} Page de profil
 */
// TODO: Créer le composant ProfilePage
// function ProfilePage() {
//   const navigate = useNavigate();
//   
//   // TODO: Récupérer wallet depuis Context
//   // const { address: walletAddress, disconnect: disconnectWallet } = useContext(WalletContext);
//   // const { addItem: addToCart } = useContext(CartContext);
//   
//   // State pour les informations utilisateur
//   const [user, setUser] = useState(null);
//   
//   // State pour le mode édition
//   const [isEditing, setIsEditing] = useState(false);
//   
//   // State pour le formulaire d'édition
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     deliveryAddresses: []
//   });
//   
//   // State pour l'onglet actif
//   const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'orders', 'tokens', 'settings'
//   
//   // State pour le chargement
//   const [loading, setLoading] = useState(false);
//   
//   // State pour la sauvegarde
//   const [saving, setSaving] = useState(false);
//   
//   // TODO: Fonction pour récupérer le profil utilisateur
//   // useEffect(() => {
//   //   async function fetchUserProfile() {
//   //     ESSAYER:
//   //       SI !walletAddress:
//   //         RETOURNER;
//   //       
//   //       setLoading(true);
//   //       const userData = await api.getUserProfile(walletAddress);
//   //       setUser(userData);
//   //       setFormData({
//   //         name: userData.name || '',
//   //         email: userData.email || '',
//   //         phone: userData.phone || '',
//   //         deliveryAddresses: userData.deliveryAddresses || []
//   //       });
//   //     CATCH error:
//   //       console.error('Error fetching user profile:', error);
//   //     FINALLY:
//   //       setLoading(false);
//   //   }
//   //   
//   //   fetchUserProfile();
//   // }, [walletAddress]);
//   
//   // TODO: Fonction pour activer le mode édition
//   // function handleEdit() {
//   //   setIsEditing(true);
//   // }
//   
//   // TODO: Fonction pour annuler l'édition
//   // function handleCancelEdit() {
//   //   setIsEditing(false);
//   //   // Restaurer les valeurs originales
//   //   SI user:
//   //     setFormData({
//   //       name: user.name || '',
//   //       email: user.email || '',
//   //       phone: user.phone || '',
//   //       deliveryAddresses: user.deliveryAddresses || []
//   //     });
//   //   }
//   // }
//   
//   // TODO: Fonction pour sauvegarder les modifications
//   // async function handleSave() {
//   //   ESSAYER:
//   //     setSaving(true);
//   //     
//   //     await api.updateUserProfile(walletAddress, formData);
//   //     
//   //     // Rafraîchir les données utilisateur
//   //     const updatedUser = await api.getUserProfile(walletAddress);
//   //     setUser(updatedUser);
//   //     
//   //     setIsEditing(false);
//   //     alert('Profil mis à jour avec succès!');
//   //     
//   //   CATCH error:
//   //     console.error('Error updating profile:', error);
//   //     alert('Erreur lors de la mise à jour du profil');
//   //   FINALLY:
//   //     setSaving(false);
//   //   }
//   // }
//   
//   // TODO: Fonction pour gérer le changement de formulaire
//   // function handleFormChange(field, value) {
//   //   setFormData(prev => ({
//   //     ...prev,
//   //     [field]: value
//   //   }));
//   // }
//   
//   // TODO: Fonction pour déconnecter le wallet
//   // function handleDisconnect() {
//   //   SI disconnectWallet:
//   //     disconnectWallet();
//   //   navigate('/');
//   // }
//   
//   // TODO: Fonction pour ajouter au panier (callback pour OrderHistory)
//   // function handleAddToCart(items) {
//   //   SI addToCart:
//   //     items.forEach(item => addToCart(item));
//   //     navigate('/checkout');
//   //   }
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="profile-page">
//   //     <div className="container-custom">
//   //       <h1>Mon Profil</h1>
//   //       
//   //       {/* Vérifier que wallet est connecté */}
//   //       SI !walletAddress:
//   //         <div className="wallet-required">
//   //           <p>Veuillez connecter votre wallet</p>
//   //           <ConnectWallet />
//   //         </div>
//   //       
//   //       SINON:
//   //         <>
//   //           {/* Tabs de navigation */}
//   //           <div className="profile-tabs">
//   //             <button
//   //               onClick={() => setActiveTab('profile')}
//   //               className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
//   //             >
//   //               Profil
//   //             </button>
//   //             <button
//   //               onClick={() => setActiveTab('orders')}
//   //               className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
//   //             >
//   //               Commandes
//   //             </button>
//   //             <button
//   //               onClick={() => setActiveTab('tokens')}
//   //               className={`tab ${activeTab === 'tokens' ? 'active' : ''}`}
//   //             >
//   //               Tokens
//   //             </button>
//   //             <button
//   //               onClick={() => setActiveTab('settings')}
//   //               className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
//   //             >
//   //               Paramètres
//   //             </button>
//   //           </div>
//   //           
//   //           {/* Contenu selon l'onglet actif */}
//   //           
//   //           {/* Onglet Profil */}
//   //           SI activeTab === 'profile':
//   //             <div className="profile-content">
//   //               SI loading:
//   //                 <div className="loading">Chargement...</div>
//   //               
//   //               SINON:
//   //                 <div className="profile-info">
//   //                   {/* Informations wallet */}
//   //                   <div className="wallet-info card">
//   //                     <h3>Wallet</h3>
//   //                     <p className="wallet-address">{formatAddress(walletAddress)}</p>
//   //                   </div>
//   //                   
//   //                   {/* Informations personnelles */}
//   //                   <div className="personal-info card">
//   //                     <div className="section-header">
//   //                       <h3>Informations personnelles</h3>
//   //                       SI !isEditing:
//   //                         <button onClick={handleEdit} className="btn btn-secondary">
//   //                           Modifier
//   //                         </button>
//   //                     </div>
//   //                     
//   //                     SI isEditing:
//   //                       <div className="edit-form">
//   //                         <div className="form-group">
//   //                           <label>Nom</label>
//   //                           <input
//   //                             type="text"
//   //                             value={formData.name}
//   //                             onChange={(e) => handleFormChange('name', e.target.value)}
//   //                             className="input"
//   //                           />
//   //                         </div>
//   //                         
//   //                         <div className="form-group">
//   //                           <label>Email</label>
//   //                           <input
//   //                             type="email"
//   //                             value={formData.email}
//   //                             onChange={(e) => handleFormChange('email', e.target.value)}
//   //                             className="input"
//   //                           />
//   //                         </div>
//   //                         
//   //                         <div className="form-group">
//   //                           <label>Téléphone</label>
//   //                           <input
//   //                             type="tel"
//   //                             value={formData.phone}
//   //                             onChange={(e) => handleFormChange('phone', e.target.value)}
//   //                             className="input"
//   //                           />
//   //                         </div>
//   //                         
//   //                         <div className="form-actions">
//   //                           <button onClick={handleCancelEdit} className="btn btn-secondary">
//   //                             Annuler
//   //                           </button>
//   //                           <button 
//   //                             onClick={handleSave} 
//   //                             disabled={saving}
//   //                             className="btn btn-primary"
//   //                           >
//   //                             {saving ? 'Sauvegarde...' : 'Enregistrer'}
//   //                           </button>
//   //                         </div>
//   //                       </div>
//   //                     
//   //                     SINON:
//   //                       <div className="info-display">
//   //                         <p><strong>Nom:</strong> {user?.name || 'Non renseigné'}</p>
//   //                         <p><strong>Email:</strong> {user?.email || 'Non renseigné'}</p>
//   //                         <p><strong>Téléphone:</strong> {user?.phone || 'Non renseigné'}</p>
//   //                       </div>
//   //                   </div>
//   //                   
//   //                   {/* Stats fidélité */}
//   //                   <div className="loyalty-stats card">
//   //                     <h3>Statistiques de fidélité</h3>
//   //                     <div className="stats-grid">
//   //                       <div className="stat-item">
//   //                         <span className="stat-value">{user?.totalOrders || 0}</span>
//   //                         <span className="stat-label">Commandes</span>
//   //                       </div>
//   //                       <div className="stat-item">
//   //                         <span className="stat-value">{user?.totalSpent || 0} MATIC</span>
//   //                         <span className="stat-label">Total dépensé</span>
//   //                       </div>
//   //                       <div className="stat-item">
//   //                         <span className="stat-value">{user?.lifetimeTokens || 0}</span>
//   //                         <span className="stat-label">Tokens gagnés</span>
//   //                       </div>
//   //                     </div>
//   //                   </div>
//   //                 </div>
//   //             </div>
//   //           
//   //           {/* Onglet Commandes */}
//   //           SINON SI activeTab === 'orders':
//   //             <div className="orders-content">
//   //               <OrderHistory
//   //                 clientAddress={walletAddress}
//   //                 onAddToCart={handleAddToCart}
//   //               />
//   //             </div>
//   //           
//   //           {/* Onglet Tokens */}
//   //           SINON SI activeTab === 'tokens':
//   //             <div className="tokens-content">
//   //               <TokenBalance clientAddress={walletAddress} />
//   //             </div>
//   //           
//   //           {/* Onglet Paramètres */}
//   //           SINON SI activeTab === 'settings':
//   //             <div className="settings-content">
//   //               <div className="settings-section card">
//   //                 <h3>Langue</h3>
//   //                 <select className="input">
//   //                   <option value="fr">Français</option>
//   //                   <option value="en">English</option>
//   //                 </select>
//   //               </div>
//   //               
//   //               <div className="settings-section card">
//   //                 <h3>Notifications</h3>
//   //                 <label>
//   //                   <input type="checkbox" />
//   //                   Notifications par email
//   //                 </label>
//   //                 <label>
//   //                   <input type="checkbox" />
//   //                   Notifications push
//   //                 </label>
//   //               </div>
//   //               
//   //               <div className="settings-section card">
//   //                 <h3>Thème</h3>
//   //                 <select className="input">
//   //                   <option value="light">Clair</option>
//   //                   <option value="dark">Sombre</option>
//   //                   <option value="auto">Automatique</option>
//   //                 </select>
//   //               </div>
//   //               
//   //               <div className="settings-section card">
//   //                 <h3>Déconnexion</h3>
//   //                 <button onClick={handleDisconnect} className="btn btn-danger">
//   //                   Déconnecter le wallet
//   //                 </button>
//   //               </div>
//   //             </div>
//   //         </>
//   //     </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default ProfilePage;

