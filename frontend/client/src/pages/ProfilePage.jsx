import React, { useState, useEffect } from 'react';
import OrderHistory from '../components/OrderHistory';
import TokenBalance from '../components/TokenBalance';
import { formatAddress } from '../utils/web3';

// Placeholder data - in a real app, this would come from an API and/or a wallet connection
const initialUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  walletAddress: '0x1234567890123456789012345678901234567890', // Example address
  savedAddresses: [
    { id: 1, name: 'Home', address: '123 Main St, Anytown, USA' },
    { id: 2, name: 'Work', address: '456 Business Rd, Workville, USA' },
  ],
};

const ProfilePage = () => {
  const [user, setUser] = useState(initialUserData);
  const [loading, setLoading] = useState(false); // In a real app, you'd fetch user data
  const [error, setError] = useState('');

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     // Fetch user data from your API here and set it
  //     // e.g., const userData = await getProfile(); setUser(userData);
  //   };
  //   fetchUserData();
  // }, []);

  if (loading) return <p className="text-center mt-8">Loading profile...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;
  if (!user) return <p className="text-center mt-8">Could not load user profile.</p>;

  return (
    <div className="container mx-auto p-4 sm:p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info & Balances */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Profile Details */}
          <div className="p-6 bg-white border rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Account Information</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Wallet:</strong> {formatAddress(user.walletAddress)}</p>
            </div>
          </div>
          
          {/* Saved Addresses */}
          <div className="p-6 bg-white border rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Saved Addresses</h2>
            <div className="space-y-3">
              {user.savedAddresses.map(addr => (
                <div key={addr.id} className="p-3 border-b">
                  <p className="font-semibold">{addr.name}</p>
                  <p className="text-sm text-gray-600">{addr.address}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Token Balance */}
          <TokenBalance clientAddress={user.walletAddress} />

          {/* Account Settings Placeholder */}
          <div className="p-6 bg-white border rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
            <button className="w-full text-left p-2 text-blue-600 hover:bg-gray-100 rounded">Change Password</button>
            <button className="w-full text-left p-2 text-blue-600 hover:bg-gray-100 rounded">Notification Preferences</button>
            <button className="w-full text-left p-2 text-red-600 hover:bg-gray-100 rounded">Delete Account</button>
          </div>
          
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2">
          <OrderHistory clientAddress={user.walletAddress} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;