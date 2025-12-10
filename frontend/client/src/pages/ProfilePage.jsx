// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import OrderHistory from '../components/OrderHistory';
import TokenBalance from '../components/TokenBalance';
import { formatAddress } from '../utils/web3';
import { useWallet } from '../contexts/WalletContext';

import { getUserProfile, registerUser } from '../services/api';

const ProfilePage = () => {
  const { address, isConnected } = useWallet();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setUser(null);
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // 1. Essayer de récupérer le profil
        const profileResponse = await getUserProfile(address);
        setUser(profileResponse.data.user);
      } catch (error) {
        // Si backend renvoie 404 => user inexistant => on tente un register
        if (error.response?.status === 404) {
          try {
            await registerUser({
              address,
              name: '',
              email: '',
              phone: '',
            });

            const retry = await getUserProfile(address);
            setUser(retry.data.user);
          } catch (regError) {
            console.error('Failed to register user or refetch profile:', regError);
            // on ne rethrow pas, pour éviter l’Uncaught (in promise)
          }
        } else {
          console.error('Failed to fetch user:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [address]);

  if (!isConnected) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2>Please connect your wallet to view profile</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {/* Header Profil */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600">
          Address: {address ? formatAddress(address) : 'Unknown'}
        </p>

        {user && (
          <div className="mt-4">
            <p>Name: {user.name || 'Not set'}</p>
            <p>Email: {user.email || 'Not set'}</p>
          </div>
        )}
      </div>

      {/* Historique & Tokens */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order History</h2>
          <OrderHistory clientAddress={address} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Token Balance</h2>
          <TokenBalance clientAddress={address} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
