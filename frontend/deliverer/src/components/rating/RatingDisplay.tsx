"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Star, Trophy, Target } from "lucide-react";
import { RatingChart } from "@/components/charts/RatingChart";
import api from "@/services/api";
import { motion } from "framer-motion";

interface RatingDisplayProps {
  address: string;
}

export function RatingDisplay({ address }: RatingDisplayProps) {
  const [rating, setRating] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingHistory, setRatingHistory] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      fetchRating();
    }
  }, [address]);

  async function fetchRating() {
    setLoading(true);

    try {
      const data = await api.getRating(address);

      setRating(data.rating || 0);
      setTotalDeliveries(data.totalDeliveries || 0);
      setReviews(data.reviews || []);

      setRatingHistory(buildRatingHistoryPlaceholder(data.rating || 0));
      calculateAchievements(data.rating || 0, data.totalDeliveries || 0);
    } catch (err) {
      console.error("Erreur récupération rating :", err);
    } finally {
      setLoading(false);
    }
  }

  function buildRatingHistoryPlaceholder(currentRating: number) {
    const days = 7;
    const labels = Array.from({ length: days }).map((_, i) => `J-${days - i}`);

    const values = Array.from({ length: days }).map(() =>
      parseFloat((currentRating + (Math.random() * 0.4 - 0.2)).toFixed(1))
    );

    return {
      labels,
      datasets: [
        {
          label: "Évolution du rating",
          data: values,
          borderColor: "rgb(245, 158, 11)",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          pointRadius: 4,
          pointBackgroundColor: "rgb(245, 158, 11)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }

  function calculateAchievements(ratingValue: number, deliveries: number) {
    const items = [];

    if (deliveries >= 100) {
      items.push({ name: "100 livraisons", unlocked: true, icon: Trophy });
    } else {
      items.push({
        name: "100 livraisons",
        unlocked: false,
        progress: deliveries / 100,
        icon: Target,
      });
    }

    if (ratingValue >= 4.5) {
      items.push({ name: "Rating > 4.5", unlocked: true, icon: Trophy });
    } else {
      items.push({
        name: "Rating > 4.5",
        unlocked: false,
        progress: ratingValue / 4.5,
        icon: Target,
      });
    }

    setAchievements(items);
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-white mb-6">Notes et Avis</h2>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-8 h-8 ${
                i < Math.round(rating)
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-600"
              }`}
            />
          ))}
        </div>
        <p className="text-4xl font-bold text-white mb-2">
          {rating.toFixed(1)}<span className="text-2xl text-slate-400">/5</span>
        </p>
        <p className="text-slate-400">{totalDeliveries} livraisons</p>
      </div>

      {reviews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Avis récents</h3>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-white/5 border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white">{review.clientName}</p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-2">{review.comment}</p>
                <p className="text-xs text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {ratingHistory && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Évolution</h3>
          <RatingChart data={ratingHistory} />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Objectifs</h3>
        <div className="space-y-3">
          {achievements.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <item.icon
                    className={`w-5 h-5 ${
                      item.unlocked ? "text-amber-400" : "text-slate-500"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      item.unlocked ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
                <Badge variant={item.unlocked ? "success" : "default"}>
                  {item.unlocked ? "✅ Débloqué" : "🔒 Verrouillé"}
                </Badge>
              </div>
              {!item.unlocked && item.progress !== undefined && (
                <div className="mt-2">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {Math.round(item.progress * 100)}%
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}

