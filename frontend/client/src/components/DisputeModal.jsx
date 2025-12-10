import React, { useState } from 'react';
import { uploadImage } from '../services/ipfs';
import { openDispute as submitApiDispute } from '../services/api';

const PROBLEM_TYPES = ['Non-delivery', 'Significant Delay', 'Food Quality Issues', 'Incorrect Order'];

/**
 * A modal component for opening a dispute.
 * @param {object} props - The props object.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Function to close the modal.
 * @param {string} props.orderId - The ID of the order being disputed.
 */
const DisputeModal = ({ isOpen, onClose, orderId }) => {
  const [problemType, setProblemType] = useState(PROBLEM_TYPES[0]);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let ipfsImageHash = null;
      
      if (imageFile) {
        // Upload image sur IPFS
        ipfsImageHash = await uploadImage(imageFile);
      }
      
      // Ouvrir litige
      const response = await openDispute(orderId, {
        reason: description,
        evidence: ipfsImageHash
      });
      
      alert('Dispute opened successfully!');
      onClose();
      
    } catch (error) {
      console.error('Failed to open dispute:', error);
    }
  };
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg p-8 bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">Open a Dispute for Order #{orderId}</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="problemType" className="block mb-1 font-medium">Type of Problem</label>
            <select
              id="problemType"
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {PROBLEM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block mb-1 font-medium">Description</label>
            <textarea
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail."
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="imageProof" className="block mb-1 font-medium">Upload Proof (Image)</label>
            <input
              type="file"
              id="imageProof"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-300">
              {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeModal;