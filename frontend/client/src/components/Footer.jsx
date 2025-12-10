import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-6 py-4 text-center">
        <p>&copy; {new Date().getFullYear()} DoneFood. All Rights Reserved.</p>
        <p className="text-sm text-gray-400">A Decentralized Food Delivery Platform</p>
      </div>
    </footer>
  );
};

export default Footer;
