import React from 'react';
import RestaurantList from '../components/RestaurantList';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600" />

        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-400/20 rounded-full" />

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Livraison décentralisée sur blockchain
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Une envie de
              <span className="text-yellow-300"> délicieux </span>
              ?
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              Commandez auprès de vos restaurants locaux préférés et payez en crypto
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Paiement Crypto</h3>
                <p className="text-sm text-white/70">ETH, POL & tokens DONE</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">100% Sécurisé</h3>
                <p className="text-sm text-white/70">Smart contracts vérifiés</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Livraison Rapide</h3>
                <p className="text-sm text-white/70">Suivi GPS en temps réel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      {/* How it works section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Comment ça marche ?</h2>
          <p className="text-gray-600">Commandez en 3 étapes simples</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Connectez votre wallet</h3>
            <p className="text-gray-600 text-sm">MetaMask, WalletConnect ou autre</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Choisissez vos plats</h3>
            <p className="text-gray-600 text-sm">Parcourez les menus des restaurants</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Payez & recevez</h3>
            <p className="text-gray-600 text-sm">Paiement sécurisé, livraison suivie</p>
          </div>
        </div>
      </div>

      {/* Restaurant List Section */}
      <div className="bg-white py-8">
        <RestaurantList />
      </div>

      {/* Stats section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">50+</div>
              <div className="text-gray-400 text-sm">Restaurants</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">1000+</div>
              <div className="text-gray-400 text-sm">Commandes</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">500+</div>
              <div className="text-gray-400 text-sm">Utilisateurs</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">4.8</div>
              <div className="text-gray-400 text-sm">Note moyenne</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
