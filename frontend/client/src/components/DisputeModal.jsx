/**
 * Composant DisputeModal
 * @notice Modal pour ouvrir un litige sur une commande
 * @dev Formulaire litige, upload preuves IPFS, soumission on-chain
 */

// TODO: Importer React et hooks nécessaires
// import { useState } from 'react';

// TODO: Importer les services
// import * as api from '../services/api';
// import * as blockchain from '../services/blockchain';
// import * as ipfs from '../services/ipfs';

/**
 * Composant DisputeModal
 * @param {Object} props - Props du composant
 * @param {number} props.orderId - ID de la commande
 * @param {string} props.clientAddress - Adresse wallet du client
 * @param {Function} props.onClose - Callback pour fermer le modal
 * @param {Function} props.onSubmit - Callback après soumission (optionnel)
 * @returns {JSX.Element} Modal de litige
 */
// TODO: Créer le composant DisputeModal
// function DisputeModal({ orderId, clientAddress, onClose, onSubmit }) {
//   // State pour la raison du litige
//   const [reason, setReason] = useState('');
//   
//   // State pour le type de problème
//   const [problemType, setProblemType] = useState('');
//   
//   // State pour les images de preuve (avant upload)
//   const [proofImages, setProofImages] = useState([]);
//   
//   // State pour les hashes IPFS des images uploadées
//   const [proofHashes, setProofHashes] = useState([]);
//   
//   // State pour l'upload en cours
//   const [uploading, setUploading] = useState(false);
//   
//   // State pour la soumission en cours
//   const [submitting, setSubmitting] = useState(false);
//   
//   // State pour les erreurs
//   const [error, setError] = useState(null);
//   
//   // TODO: Liste des types de problèmes
//   // const problemTypes = [
//   //   { value: 'not_received', label: 'Commande non reçue' },
//   //   { value: 'quality', label: 'Qualité insatisfaisante' },
//   //   { value: 'missing_items', label: 'Items manquants' },
//   //   { value: 'delivery_issue', label: 'Mauvaise livraison' },
//   //   { value: 'other', label: 'Autre' }
//   // ];
//   
//   // TODO: Fonction pour gérer l'upload d'images
//   // function handleImageSelect(event) {
//   //   const files = Array.from(event.target.files);
//   //   
//   //   // Valider que ce sont des images
//   //   const imageFiles = files.filter(file => file.type.startsWith('image/'));
//   //   
//   //   // Valider taille (max 10MB par image)
//   //   const validFiles = imageFiles.filter(file => file.size <= 10 * 1024 * 1024);
//   //   
//   //   SI validFiles.length !== imageFiles.length:
//   //     alert('Certaines images sont trop volumineuses (max 10MB)');
//   //   
//   //   // Ajouter aux preuves
//   //   setProofImages(prev => [...prev, ...validFiles]);
//   // }
//   
//   // TODO: Fonction pour supprimer une image de preuve
//   // function handleRemoveImage(index) {
//   //   setProofImages(prev => prev.filter((_, i) => i !== index));
//   // }
//   
//   // TODO: Fonction pour uploader les images vers IPFS
//   // async function uploadProofImages() {
//   //   ESSAYER:
//   //     setUploading(true);
//   //     const hashes = [];
//   //     
//   //     POUR CHAQUE image DANS proofImages:
//   //       const result = await ipfs.uploadImage(image);
//   //       hashes.push(result.ipfsHash);
//   //     
//   //     setProofHashes(hashes);
//   //     RETOURNER hashes;
//   //   CATCH error:
//   //     console.error('Error uploading images:', error);
//   //     throw new Error('Erreur lors de l\'upload des images');
//   //   FINALLY:
//   //     setUploading(false);
//   // }
//   
//   // TODO: Fonction pour valider le formulaire
//   // function validateForm() {
//   //   SI !reason || reason.trim() === '':
//   //     setError('Veuillez décrire le problème');
//   //     RETOURNER false;
//   //   
//   //   SI !problemType:
//   //     setError('Veuillez sélectionner un type de problème');
//   //     RETOURNER false;
//   //   
//   //   RETOURNER true;
//   // }
//   
//   // TODO: Fonction principale pour soumettre le litige
//   // async function handleSubmit() {
//   //   ESSAYER:
//   //     // Valider le formulaire
//   //     SI !validateForm():
//   //       RETOURNER;
//   //     
//   //     setSubmitting(true);
//   //     setError(null);
//   //     
//   //     // Uploader les images vers IPFS
//   //     let evidenceHashes = [];
//   //     SI proofImages.length > 0:
//   //       evidenceHashes = await uploadProofImages();
//   //     
//   //     // Soumettre via API backend
//   //     const apiResult = await api.openDispute(orderId, {
//   //       reason: reason,
//   //       evidence: evidenceHashes,
//   //       clientAddress: clientAddress
//   //     });
//   //     
//   //     // Soumettre on-chain
//   //     const blockchainResult = await blockchain.openDisputeOnChain(orderId);
//   //     
//   //     // Afficher message succès
//   //     alert('Litige ouvert avec succès!');
//   //     
//   //     // Callback onSubmit si fourni
//   //     SI onSubmit:
//   //       onSubmit({
//   //         disputeId: apiResult.disputeId,
//   //         txHash: blockchainResult.txHash
//   //       });
//   //     
//   //     // Fermer le modal
//   //     onClose();
//   //     
//   //   CATCH error:
//   //     console.error('Error submitting dispute:', error);
//   //     setError(error.message || 'Erreur lors de l\'ouverture du litige');
//   //   FINALLY:
//   //     setSubmitting(false);
//   // }
//   
//   // TODO: Rendu du composant
//   // RETOURNER (
//   //   <div className="modal-overlay" onClick={onClose}>
//   //     <div className="modal-content dispute-modal" onClick={(e) => e.stopPropagation()}>
//   //       <div className="modal-header">
//   //         <h2>Ouvrir un litige</h2>
//   //         <button onClick={onClose} className="btn-close">✕</button>
//   //       </div>
//   //       
//   //       <div className="modal-body">
//   //         {/* Type de problème */}
//   //         <div className="form-group">
//   //           <label>Type de problème *</label>
//   //           <select
//   //             value={problemType}
//   //             onChange={(e) => setProblemType(e.target.value)}
//   //             className="input"
//   //           >
//   //             <option value="">Sélectionnez un type</option>
//   //             {problemTypes.map(type => (
//   //               <option key={type.value} value={type.value}>
//   //                 {type.label}
//   //               </option>
//   //             ))}
//   //           </select>
//   //         </div>
//   //         
//   //         {/* Raison du litige */}
//   //         <div className="form-group">
//   //           <label>Décrivez le problème *</label>
//   //           <textarea
//   //             value={reason}
//   //             onChange={(e) => setReason(e.target.value)}
//   //             placeholder="Décrivez en détail le problème rencontré..."
//   //             rows={6}
//   //             className="input"
//   //           />
//   //         </div>
//   //         
//   //         {/* Upload d'images de preuve */}
//   //         <div className="form-group">
//   //           <label>Preuves (images) - Optionnel</label>
//   //           <input
//   //             type="file"
//   //             multiple
//   //             accept="image/*"
//   //             onChange={handleImageSelect}
//   //             className="input"
//   //           />
//   //           <p className="help-text">Maximum 10MB par image</p>
//   //           
//   //           {/* Preview des images */}
//   //           SI proofImages.length > 0:
//   //             <div className="proof-previews">
//   //               {proofImages.map((image, i) => (
//   //                 <div key={i} className="proof-preview">
//   //                   <img 
//   //                     src={URL.createObjectURL(image)} 
//   //                     alt={`Preuve ${i + 1}`}
//   //                   />
//   //                   <button
//   //                     onClick={() => handleRemoveImage(i)}
//   //                     className="btn-remove"
//   //                   >
//   //                     ✕
//   //                   </button>
//   //                 </div>
//   //               ))}
//   //             </div>
//   //         </div>
//   //         
//   //         {/* Message d'erreur */}
//   //         SI error:
//   //           <div className="error-message">{error}</div>
//   //         
//   //         {/* Indicateur d'upload */}
//   //         SI uploading:
//   //           <div className="uploading-indicator">
//   //             Upload des images en cours... ({proofImages.length} images)
//   //           </div>
//   //       </div>
//   //       
//   //       <div className="modal-footer">
//   //         <button onClick={onClose} className="btn btn-secondary" disabled={submitting}>
//   //           Annuler
//   //         </button>
//   //         <button
//   //           onClick={handleSubmit}
//   //           disabled={submitting || uploading || !reason || !problemType}
//   //           className="btn btn-danger"
//   //         >
//   //           {submitting ? 'Envoi...' : uploading ? 'Upload...' : 'Soumettre le litige'}
//   //         </button>
//   //       </div>
//   //     </div>
//   //   </div>
//   // );
// }

// TODO: Exporter le composant
// export default DisputeModal;

