"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/providers/AppProvider";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import StakingPanel  from "@/components/StakingPanel";
import { RatingDisplay } from "@/components/rating/RatingDisplay";
import api from "@/services/api";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { address, setAddress } = useApp();
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) loadProfile();
  }, [address]);

  async function loadProfile() {
    try {
      const data = await api.getDeliverer(address!);
      setProfile({
        name: data.deliverer.name || "",
        phone: data.deliverer.phone || "",
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function saveProfile() {
    setLoading(true);
    try {
      // await api.updateDelivererProfile(address, profile);
      alert("Profil sauvegardé !");
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    if (confirm("Déconnexion ?")) {
      setAddress(null);
      localStorage.removeItem("walletAddress");
      router.push("/");
    }
  }

  if (!address) {
    return (
      <PageTransition>
        <Card className="text-center py-12">
          <p className="text-slate-400">Connectez votre wallet</p>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
          <Button variant="danger" onClick={disconnect}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Informations</h2>
              <p className="text-sm text-slate-400">Gérez votre profil livreur</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                placeholder="Nom"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                placeholder="Téléphone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Wallet
              </label>
              <p className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm">
                {address}
              </p>
            </div>

            <Button onClick={saveProfile} disabled={loading} className="w-full" size="lg">
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </Card>

        <StakingPanel address={address} />
        <RatingDisplay address={address} />
      </div>
    </PageTransition>
  );
}

