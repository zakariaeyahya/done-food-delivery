import React, { createContext, useContext, useState, useEffect } from "react";

const REQUIRED_CHAIN_ID = "0x13882";

const AMOY_PARAMS = {
  chainId: REQUIRED_CHAIN_ID,
  chainName: "Polygon Amoy Testnet",
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
};

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [hasAdminRole] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  async function ensureCorrectNetwork() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId === REQUIRED_CHAIN_ID) return true;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: REQUIRED_CHAIN_ID }],
      });
      return true;

    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AMOY_PARAMS],
        });
        return true;
      }

      return false;
    }
  }

  async function connect() {
    if (!window.ethereum) {
      alert("MetaMask non détecté.");
      return;
    }

    try {
      const ok = await ensureCorrectNetwork();
      if (!ok) {
        alert("Erreur : impossible de se connecter au réseau Polygon Amoy.");
        return;
      }

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

    } catch (err) {
      alert("Erreur lors de la connexion au wallet.");
    }
  }

  useEffect(() => {
    async function autoConnect() {
      if (!window.ethereum) {
        setIsLoading(false);
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });

        if (accounts && accounts.length > 0) {
          const ok = await ensureCorrectNetwork();
          if (ok) {
            setAddress(accounts[0]);
            localStorage.setItem("adminWalletAddress", accounts[0]);
          }
        }
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    }

    autoConnect();
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleChainChanged = (chainId) => {
      if (chainId !== REQUIRED_CHAIN_ID) {
        alert("Erreur : vous devez rester sur Polygon Amoy (80002).");
        setAddress(null);
        localStorage.removeItem("adminWalletAddress");
      }
    };

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        localStorage.removeItem("adminWalletAddress");
      } else {
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

  return (
    <WalletContext.Provider value={{ address, hasAdminRole, connect, isLoading }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
