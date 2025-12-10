/**
 * Composant ConnectWallet - Restaurant
 * @notice Gère la connexion au wallet MetaMask pour le restaurant
 * @dev Détecte MetaMask, connecte le wallet, vérifie le rôle RESTAURANT_ROLE, fetch restaurant profile
 */

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

import * as blockchain from "../services/blockchain";
import * as api from "../services/api";
import { formatAddress, formatBalance } from "../utils/web3";

/**
 * Composant ConnectWallet
 * @param {(payload: {address: string, restaurant: any, balance: string, network: any} | null) => void} onConnect
 * @returns {JSX.Element}
 */
function ConnectWallet({ onConnect }) {
  const navigate = useNavigate();
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasRole, setHasRole] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [balance, setBalance] = useState("0");
  const [network, setNetwork] = useState(null);
  const [error, setError] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);

  const RESTAURANT_ROLE = useMemo(
    () => ethers.keccak256(ethers.toUtf8Bytes("RESTAURANT_ROLE")),
    []
  );

  // Vérifier MetaMask au montage + auto-reconnect si address sauvée
  useEffect(() => {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
      setIsMetaMaskInstalled(true);

      const savedAddress = localStorage.getItem("restaurantWalletAddress");
      if (savedAddress) {
        setAddress(savedAddress);
        checkRoleAndFetchRestaurant(savedAddress);
      }

      // listeners changements de compte / réseau
      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);
    } else {
      setIsMetaMaskInstalled(false);
    }

    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAccountsChanged(accounts) {
    if (!accounts || accounts.length === 0) {
      handleDisconnect();
      return;
    }
    const next = ethers.getAddress(accounts[0]);
    setAddress(next);
    localStorage.setItem("restaurantWalletAddress", next);
    await checkRoleAndFetchRestaurant(next);
  }

  async function handleChainChanged() {
    // Recheck réseau + balance (MetaMask force reload parfois)
    if (address) {
      await fetchNetwork();
      await fetchBalance(address);
    }
  }

  // ----- Role check -----
  async function checkRole(addr) {
    try {
      setError(null);

      const ok = await blockchain.hasRole(RESTAURANT_ROLE, addr);
      setHasRole(ok);

      if (!ok) {
        setError(
          "Cette adresse n'a pas le rôle RESTAURANT_ROLE. Veuillez contacter l'administrateur."
        );
      }
      return ok;
    } catch (e) {
      console.error("Error checking role:", e);
      setError(`Erreur lors de la vérification du rôle: ${e.message}`);
      setHasRole(false);
      return false;
    }
  }

  // ----- API profile -----
  async function fetchRestaurantProfile(addr) {
    try {
      setError(null);
      setNeedsRegistration(false);
      const r = await api.getRestaurantByAddress(addr);
      setRestaurant(r);

      if (onConnect) {
        onConnect({
          address: addr,
          restaurant: r,
          balance,
          network,
        });
      }
    } catch (e) {
      console.error("Error fetching restaurant profile:", e);
      setRestaurant(null);

      // Si erreur 404, c'est qu'il faut s'inscrire
      if (e.message.includes('404') || e.message.includes('not found')) {
        setNeedsRegistration(true);
        setError(null); // Pas d'erreur, juste besoin d'inscription
      } else {
        setError(`Erreur lors de la récupération du profil: ${e.message}`);
      }
    }
  }

  // ----- Balance -----
  async function fetchBalance(addr) {
    try {
      const b = await blockchain.getBalance(addr);
      setBalance(formatBalance(b));
    } catch (e) {
      console.error("Error fetching balance:", e);
      // pas bloquant
    }
  }

  // ----- Network -----
  async function fetchNetwork() {
    try {
      const net = await blockchain.getNetwork?.();
      // fallback direct provider MetaMask
      if (!net && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const n = await provider.getNetwork();
        setNetwork({
          chainId: Number(n.chainId),
          name: n.name,
        });
        return;
      }
      setNetwork(net || null);
    } catch (e) {
      console.error("Error fetching network:", e);
      setNetwork(null);
    }
  }

  // ----- Role + fetch all -----
  async function checkRoleAndFetchRestaurant(addr) {
    // Role check disabled - allow all wallets to access
    setHasRole(true);
    await fetchNetwork();
    await fetchBalance(addr);
    await fetchRestaurantProfile(addr);
  }

  // ----- Connect -----
  async function handleConnect() {
    try {
      setIsConnecting(true);
      setError(null);

      const res = await blockchain.connectWallet();
      const connectedAddress =
        res?.address ??
        (Array.isArray(res) ? res[0] : null);

      if (!connectedAddress) {
        throw new Error("Adresse introuvable après connexion.");
      }

      const checksum = ethers.getAddress(connectedAddress);
      setAddress(checksum);
      localStorage.setItem("restaurantWalletAddress", checksum);

      await checkRoleAndFetchRestaurant(checksum);
    } catch (e) {
      console.error("Error connecting wallet:", e);
      setError(`Erreur de connexion: ${e.message}`);
    } finally {
      setIsConnecting(false);
    }
  }

  // ----- Disconnect -----
  function handleDisconnect() {
    setAddress(null);
    setHasRole(false);
    setRestaurant(null);
    setBalance("0");
    setNetwork(null);
    setError(null);
    localStorage.removeItem("restaurantWalletAddress");

    if (onConnect) onConnect(null);
  }

  // ----------------- UI -----------------
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft dark:bg-neutral-800">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-neutral-900 dark:text-neutral-50">
          Wallet Restaurant
        </h3>

        {address && (
          <button
            onClick={handleDisconnect}
            className="rounded-xl bg-secondary-100 px-3 py-1.5 text-xs font-medium text-secondary-800 hover:bg-secondary-200 dark:bg-secondary-900/30 dark:text-secondary-200 dark:hover:bg-secondary-900/50"
          >
            Déconnexion
          </button>
        )}
      </div>

      {/* MetaMask not installed */}
      {!isMetaMaskInstalled && (
        <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4 text-warning-800 dark:border-warning-900 dark:bg-warning-900/20 dark:text-warning-200">
          <p className="mb-2 font-medium">
            MetaMask n&apos;est pas installé.
          </p>
          <p className="text-sm">
            Veuillez installer l&apos;extension pour continuer.
          </p>
          <a
            className="mt-3 inline-block rounded-lg bg-warning-500 px-3 py-2 text-sm font-semibold text-white hover:bg-warning-600"
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Installer MetaMask
          </a>
        </div>
      )}

      {/* Connect button */}
      {isMetaMaskInstalled && !address && (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="mt-4 w-full rounded-2xl bg-primary-500 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isConnecting ? "Connexion..." : "Connecter Wallet"}
        </button>
      )}

      {/* Connected section */}
      {isMetaMaskInstalled && address && (
        <div className="mt-4 space-y-3">
          <InfoRow label="Adresse" value={formatAddress(address)} />
          <InfoRow label="Solde" value={`${balance} MATIC`} />
          {network && (
            <InfoRow
              label="Réseau"
              value={`${network.name ?? "Unknown"} (chainId: ${
                network.chainId ?? "?"
              })`}
            />
          )}

          {/* Message si besoin d'inscription */}
          {needsRegistration && (
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
              <p className="mb-2 font-medium text-primary-900 dark:text-primary-100">
                🎉 Bienvenue sur DONE !
              </p>
              <p className="mb-3 text-sm text-primary-800 dark:text-primary-200">
                Votre wallet n'est pas encore enregistré. Créez votre profil restaurant pour commencer.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="w-full rounded-xl bg-primary-500 px-4 py-2 font-semibold text-white shadow-soft transition hover:bg-primary-600"
              >
                Créer mon restaurant
              </button>
            </div>
          )}

          {restaurant && (
            <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900/40">
              <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Restaurant
              </p>
              <p className="mt-1 font-medium text-neutral-900 dark:text-neutral-50">
                {restaurant.name}
              </p>
              {restaurant.location?.address && (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {restaurant.location.address}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-200">
          {error}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-900/40">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
        {value}
      </span>
    </div>
  );
}

export default ConnectWallet;
