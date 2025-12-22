import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

export default function Topbar({ title }) {
  const navigate = useNavigate();
  const { address } = useWallet();
  const [lastSync, setLastSync] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking"); // 'up' | 'down' | 'checking'

  // Formater l'adresse wallet
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  /* ============================================================
     CHECK STATUS BACKEND
     ============================================================ */
  async function pingBackend() {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/ping");

      if (res.ok) {
        setBackendStatus("up");
      } else {
        setBackendStatus("down");
      }
    } catch (err) {
      setBackendStatus("down");
    }

    setLastSync(new Date());
  }

  useEffect(() => {
    pingBackend();

    // Auto refresh toutes les 20 secondes
    const interval = setInterval(() => {
      pingBackend();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  /* ============================================================
     DÉCONNEXION ADMIN
     ============================================================ */
  function handleLogout() {
    localStorage.removeItem("adminWalletAddress");
    window.location.reload();
  }

  /* ============================================================
     FORMATAGE SYNCHRONISATION
     ============================================================ */
  function formatSyncTime(date) {
    if (!date) return "—";
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div className="w-full flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
      {/* TITRE PAGE */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">{title}</h1>

        <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
          {/* ÉTAT BACKEND */}
          {backendStatus === "checking" && (
            <span className="flex items-center gap-1 text-gray-400">
              Checking backend…
            </span>
          )}

          {backendStatus === "up" && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircleIcon className="h-4 w-4" />
              Backend OK
            </span>
          )}

          {backendStatus === "down" && (
            <span className="flex items-center gap-1 text-red-600">
              <XCircleIcon className="h-4 w-4" />
              Backend Down
            </span>
          )}

          {/* DERNIÈRE SYNC */}
          <span className="ml-4">
            Dernière sync : <b>{formatSyncTime(lastSync)}</b>
          </span>
        </div>
      </div>

      {/* ACTIONS À DROITE */}
      <div className="flex items-center gap-4">

        {/* BOUTON PARAMÈTRES */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
        >
          <Cog6ToothIcon className="h-5 w-5 text-gray-700" />
          <span className="hidden md:inline">Paramètres</span>
        </button>

        {/* WALLET ADDRESS */}
        {address && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-700">
            <WalletIcon className="h-5 w-5" />
            <span className="font-mono text-sm">{shortAddress}</span>
          </div>
        )}

        {/* BOUTON DÉCONNEXION */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
