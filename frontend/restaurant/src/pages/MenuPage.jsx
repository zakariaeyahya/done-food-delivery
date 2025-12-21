
import MenuManager from "../components/MenuManager";
import { useWallet } from "../contexts/WalletContext"; // adapte si besoin

function MenuPage({ showSuccess, showError }) {
  const { restaurant, address } = useWallet();

  const restaurantId = restaurant?._id;
  const restaurantAddress = restaurant?.address || address;

  return (
    <div className="space-y-4">
      {/* Header page (optionnel mais utile) */}
      <div>
        <h1 className="font-display text-3xl text-neutral-900 dark:text-neutral-50">
          Menu du restaurant
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Gère tes catégories, plats, prix et disponibilités
        </p>
      </div>

      {/* Alerte si pas connecté */}
      {!restaurantId && (
        <div className="rounded-2xl border border-warning-200 bg-warning-50 p-4 text-warning-800 dark:border-warning-900 dark:bg-warning-900/20 dark:text-warning-200">
          Connecte ton wallet restaurant pour accéder à la gestion du menu.
        </div>
      )}

      {/* MenuManager */}
      {restaurantId && (
        <MenuManager
          restaurantId={restaurantId}
          restaurantAddress={restaurantAddress}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}
    </div>
  );
}

export default MenuPage;
