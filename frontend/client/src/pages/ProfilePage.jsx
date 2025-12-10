import React, { useState, useEffect } from 'react';
import OrderHistory from '../components/OrderHistory';
import TokenBalance from '../components/TokenBalance';
import { formatAddress } from '../utils/web3';

import { getUserProfile, getUserTokens } from '../services/api';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { address } = useWallet(); // Depuis ConnectWallet

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // 1. Récupérer profil
        const profileResponse = await getUserProfile(address);
        setUser(profileResponse.data.user);
        
      } catch (error) {
        if (error.response?.status === 404) {
          // Utilisateur n'existe pas, créer profil
          await registerUser({ 
            address,
            name: '',
            email: ''
          });
          // Réessayer
          const retry = await getUserProfile(address);
          setUser(retry.data.user);
        } else {
          console.error('Failed to fetch user:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchUserData();
    }
  }, [address]);

  return (
    <div>
      {/* Profil, OrderHistory, TokenBalance */}
      <OrderHistory clientAddress={address} />
      <TokenBalance clientAddress={address} />
    </div>
  );
};

export default ProfilePage;