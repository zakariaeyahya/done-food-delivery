import React, { useState } from 'react';
import { uploadImage } from '../services/ipfs';
import { openDispute } from '../services/api';

const PROBLEM_TYPES = [
  { value: 'Non-delivery', label: 'Non-livraison' },
  { value: 'Significant Delay', label: 'Retard important' },
  { value: 'Food Quality Issues', label: 'Problème de qualité' },
  { value: 'Incorrect Order', label: 'Commande incorrecte' }
];

/**
 * A modal component for opening a dispute.
 * @param {object} props - The props object.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Function to close the modal.
 * @param {string} props.orderId - The ID of the order being disputed.
 * @param {Function} props.onSuccess - Optional callback when dispute is successfully opened.
 */
const DisputeModal = ({ isOpen, onClose, orderId, onSuccess }) => {
  const [problemType, setProblemType] = useState(PROBLEM_TYPES[0].value);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('Veuillez décrire le problème');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      let evidenceData = null;
      
      if (imageFile) {
        // Upload image sur IPFS
        try {
          const uploadResult = await uploadImage(imageFile);
          // Le service IPFS retourne directement le hash (CID)
          const imageHash = uploadResult.ipfsHash || uploadResult.hash || uploadResult || null;
          
          if (imageHash) {
            // Créer un objet JSON avec les preuves pour upload sur IPFS
            // Le backend va uploader cet objet sur IPFS
            evidenceData = {
              type: 'dispute_evidence',
              orderId: orderId,
              problemType: problemType,
              imageHash: imageHash,
              description: description,
              createdAt: new Date().toISOString()
            };
          }
        } catch (uploadError) {
          console.warn('Erreur lors de l\'upload de l\'image:', uploadError);
          // Continuer sans l'image si l'upload échoue
        }
      } else {
        // Même sans image, créer un objet JSON avec les informations du litige
        evidenceData = {
          type: 'dispute_evidence',
          orderId: orderId,
          problemType: problemType,
          description: description,
          createdAt: new Date().toISOString()
        };
      }
      
      // Construire la raison complète avec le type de problème
      const fullReason = `${problemType}: ${description}`;
      
      // Ouvrir litige via API
      // Le backend va uploader evidenceData sur IPFS si fourni
      console.log('[DisputeModal] Envoi du litige:', {
        orderId,
        reason: fullReason,
        hasEvidence: !!evidenceData
      });
      
      const response = await openDispute(orderId, {
        reason: fullReason,
        evidence: evidenceData
      });
      
      console.log('[DisputeModal] Réponse du serveur:', response.data);
      
      setSuccess(true);
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Fermer la modal après 2 secondes
      setTimeout(() => {
        onClose();
        // Réinitialiser le formulaire
        setProblemType(PROBLEM_TYPES[0].value);
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        setError('');
        setSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('[DisputeModal] Erreur lors de l\'ouverture du litige:', error);
      console.error('[DisputeModal] Détails de l\'erreur:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Message d'erreur plus détaillé
      let errorMessage = 'Erreur lors de l\'ouverture du litige. Veuillez réessayer.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Vous n\'êtes pas authentifié. Veuillez reconnecter votre wallet.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Vous n\'êtes pas autorisé à ouvrir un litige pour cette commande.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Commande introuvable.';
      } else if (error.response?.status === 500) {
        errorMessage = error.response?.data?.message || 
                      error.response?.data?.details || 
                      'Erreur serveur. Veuillez réessayer plus tard.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Ouvrir un litige</h2>
              <p className="text-white/80 text-sm">Commande #{String(orderId).slice(-8)}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-700 font-medium">Litige ouvert avec succès !</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Problem Type */}
          <div>
            <label htmlFor="problemType" className="block text-sm font-semibold text-gray-700 mb-2">
              Type de problème <span className="text-red-500">*</span>
            </label>
            <select
              id="problemType"
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {PROBLEM_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description détaillée <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez en détail le problème rencontré avec votre commande..."
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all disabled:opacity-50"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Plus de détails aideront les arbitres à résoudre votre litige rapidement.</p>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="imageProof" className="block text-sm font-semibold text-gray-700 mb-2">
              Preuve (Image) <span className="text-gray-400 text-xs">(optionnel)</span>
            </label>
            <div className="space-y-3">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 transition-colors bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    id="imageProof"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Vous pouvez ajouter une photo pour appuyer votre demande (ex: commande incorrecte, problème de qualité).</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ouverture en cours...
                </>
              ) : success ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Litige ouvert !
                </>
              ) : (
                'Ouvrir le litige'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeModal;