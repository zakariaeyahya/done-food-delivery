import React, { createContext, useContext, useState, useEffect } from "react";

// ====================================================================
// ⚙️ CONFIG RÉSEAU — Polygon Amoy Testnet (Chain ID = 80002)
// ====================================================================

const REQUIRED_CHAIN_ID = "0x13882"; // 80002 en hexadécimal

const AMOY_PARAMS = {
  chainId: REQUIRED_CHAIN_ID,
  chainName: "Polygon Amoy Testnet",
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
};

// ====================================================================
// CONTEXTE WALLET
// ====================================================================

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [hasAdminRole] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------------------------------------------------
  // 🔌 Connexion MetaMask + Vérification / Switch réseau Amoy
  // --------------------------------------------------------------------

  async function ensureCorrectNetwork() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId === REQUIRED_CHAIN_ID) return true;

    try {
      // Tentative de switch
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: REQUIRED_CHAIN_ID }],
      });
      return true;

    } catch (err) {
      // Si le réseau n'est pas ajouté à MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AMOY_PARAMS],
        });
        return true;
      }

      console.error("Impossible de basculer sur Amoy:", err);
      return false;
    }
  }

  async function connect() {
    if (!window.ethereum) {
      alert("MetaMask non détecté.");
      return;
    }

    try {
      // 1️⃣ Vérification / Switch réseau
      const ok = await ensureCorrectNetwork();
      if (!ok) {
        alert("Erreur : impossible de se connecter au réseau Polygon Amoy.");
        return;
      }

      // 2️⃣ Demande de connexion
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        alert("Aucun compte MetaMask détecté.");
        return;
      }

      const selected = accounts[0];

      setAddress(selected);
      localStorage.setItem("adminWalletAddress", selected);

      console.log("Wallet connecté ✔ :", selected);

    } catch (err) {
      console.error("Erreur connexion wallet:", err);
      alert("Erreur lors de la connexion au wallet.");
    }
  }

  // --------------------------------------------------------------------
  // 🚀 Auto-connexion au démarrage
  // --------------------------------------------------------------------

  useEffect(() => {
    async function autoConnect() {
      if (!window.ethereum) {
        setIsLoading(false);
        return;
      }

      try {
        // Vérifier si déjà connecté
        const accounts = await window.ethereum.request({ method: "eth_accounts" });

        if (accounts && accounts.length > 0) {
          // Vérifier le réseau
          const ok = await ensureCorrectNetwork();
          if (ok) {
            setAddress(accounts[0]);
            localStorage.setItem("adminWalletAddress", accounts[0]);
            console.log("Auto-connexion réussie :", accounts[0]);
          }
        }
      } catch (err) {
        console.error("Erreur auto-connexion:", err);
      } finally {
        setIsLoading(false);
      }
    }

    autoConnect();
  }, []);

  // --------------------------------------------------------------------
  // 📡 Listeners : changement réseau + changement compte
  // --------------------------------------------------------------------

  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = (chainId) => {
      console.warn("Changement de réseau détecté :", chainId);

      if (chainId !== REQUIRED_CHAIN_ID) {
        alert("Erreur : vous devez rester sur Polygon Amoy (80002).");
        setAddress(null);
        localStorage.removeItem("adminWalletAddress");
      }
    };

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        console.log("MetaMask déconnecté");
        setAddress(null);
        localStorage.removeItem("adminWalletAddress");
      } else {
        console.log("Compte changé →", accounts[0]);
        setAddress(accounts[0]);
        localStorage.setItem("adminWalletAddress", accounts[0]);
      }
    };

    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  // --------------------------------------------------------------------
  // 🚀 Exposition du provider
  // --------------------------------------------------------------------

  return (
    <WalletContext.Provider value={{ address, hasAdminRole, connect, isLoading }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
