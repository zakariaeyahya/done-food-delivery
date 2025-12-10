import React from 'react';
import { Link } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">DoneFood</Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-500">Home</Link>
          <Link to="/profile" className="text-gray-600 hover:text-blue-500">Profile</Link>
          <Link to="/checkout" className="text-gray-600 hover:text-blue-500">Cart</Link>
          <ConnectWallet />
        </div>
      </nav>
    </header>
  );
};

export default Header;
