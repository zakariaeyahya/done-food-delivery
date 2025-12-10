/**
 * Composant RatingDisplay - Notes et avis livreur
 */

import { useState, useEffect } from "react";
import api from "../services/api";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

/**
 * Composant RatingDisplay
 * @param {string} address - Adresse wallet du livreur
 */
function RatingDisplay({ address }) {
  const [rating, setRating] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  /** Charger données */
  useEffect(() => {
    if (address) {
      fetchRating();
    }
  }, [address]);

  /** Récupérer rating + reviews */
  async function fetchRating() {
    setLoading(true);

    try {
      const data = await api.getRating(address);

      setRating(data.rating || 0);
      setTotalDeliveries(data.totalDeliveries || 0);
      setReviews(data.reviews || []);

      // Placeholder : historique vide (à remplir avec une vraie API si besoin)
      setRatingHistory(buildRatingHistoryPlaceholder(data.rating));

      calculateAchievements(data.rating, data.totalDeliveries);
    } catch (err) {
      console.error("Erreur récupération rating :", err);
    } finally {
      setLoading(false);
    }
  }

  /** Création historique de rating (fake temp jusqu'à API dédiée) */
  function buildRatingHistoryPlaceholder(currentRating) {
    const days = 7; // 1 semaine d’historique factice
    const labels = Array.from({ length: days }).map(
      (_, i) => `J-${days - i}`
    );

    const values = Array.from({ length: days }).map(() =>
      (currentRating + (Math.random() * 0.4 - 0.2)).toFixed(1)
    );

    return {
      labels,
      datasets: [
        {
          label: "Évolution du rating",
          data: values,
          borderColor: "rgb(255, 165, 0)",
          backgroundColor: "rgba(255, 165, 0, 0.3)",
          pointRadius: 4,
          tension: 0.3,
        },
      ],
    };
  }

  /** Calculer objectifs */
  function calculateAchievements(ratingValue = rating, deliveries = totalDeliveries) {
    const items = [];

    // Objectif livraisons
    if (deliveries >= 100) {
      items.push({ name: "100 livraisons", unlocked: true });
    } else {
      items.push({
        name: "100 livraisons",
        unlocked: false,
        progress: deliveries / 100,
      });
    }

    // Objectif rating
    if (ratingValue >= 4.5) {
      items.push({ name: "Rating > 4.5", unlocked: true });
    } else {
      items.push({
        name: "Rating > 4.5",
        unlocked: false,
        progress: ratingValue / 4.5,
      });
    }

    setAchievements(items);
  }

  return (
    <div className="rating-display card">
      <h2>Notes et Avis</h2>

      {/* Note moyenne */}
      <div className="rating-average">
        <div className="stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < Math.round(rating) ? "star-filled" : "star-empty"}
            >
              ⭐
            </span>
          ))}
        </div>

        <p className="rating-value">{rating.toFixed(1)}/5</p>
        <p>{totalDeliveries} livraisons</p>
      </div>

      {/* Avis récents */}
      <div className="recent-reviews">
        <h3>Avis récents</h3>

        {reviews.length === 0 && <p>Aucun avis pour le moment.</p>}

        {reviews.slice(0, 5).map((review, index) => (
          <div key={index} className="review-item">
            <p>
              <strong>{review.clientName}</strong> — {review.rating}/5
            </p>
            <p>{review.comment}</p>
            <p className="review-date">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Graphique évolution */}
      {ratingHistory?.labels?.length > 0 && (
        <div className="rating-chart">
          <Line data={ratingHistory} />
        </div>
      )}

      {/* Objectifs */}
      <div className="achievements">
        <h3>Objectifs</h3>

        {achievements.map((item, i) => (
          <div key={i} className="achievement-item">
            <span className={item.unlocked ? "unlocked" : "locked"}>
              {item.unlocked ? "✅" : "🔒"} {item.name}
            </span>

            {!item.unlocked && item.progress !== undefined && (
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${item.progress * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RatingDisplay;
