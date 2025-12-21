
import { useEffect, useMemo, useState } from "react";
import * as api from "../services/api";

const CATEGORIES = ["Entrées", "Plats", "Desserts", "Boissons"];
const IPFS_GATEWAY =
  import.meta.env.VITE_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

// Helpers simples (remplace si tu as déjà dans utils)
function formatPrice(v) {
  if (v == null || Number.isNaN(Number(v))) return "0";
  return Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

function MenuManager({ restaurantId, restaurantAddress, showSuccess, showError }) {
  const [menu, setMenu] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Plats",
    image: null, // ipfs hash
    available: true,
  });

  useEffect(() => {
    if (restaurantId) fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  async function fetchMenu() {
    try {
      setLoadingMenu(true);
      const restaurant = await api.getRestaurant(restaurantId);
      setMenu(restaurant?.menu || []);
    } catch (e) {
      showError?.("Erreur lors du chargement du menu");
    } finally {
      setLoadingMenu(false);
    }
  }

  function handleOpenAddModal() {
    setSelectedItem(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "Plats",
      image: null,
      available: true,
    });
    setIsModalOpen(true);
  }

  function handleOpenEditModal(item) {
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: Number(item.price || 0),
      category: item.category || "Plats",
      image: item.image || null,
      available: Boolean(item.available),
    });
    setIsModalOpen(true);
  }

  async function handleImageUpload(file) {
    if (!file) return;
    try {
      setUploading(true);
      const result = await api.uploadImage(file);
      setFormData((prev) => ({ ...prev, image: result.ipfsHash }));
      showSuccess?.("Image uploadée sur IPFS");
    } catch (e) {
      showError?.("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  }

  async function handleAddItem() {
    try {
      if (!formData.name?.trim() || !formData.price) {
        showError?.("Nom et prix sont requis");
        return;
      }

      await api.addMenuItem(restaurantId, formData, restaurantAddress);
      await fetchMenu();
      setIsModalOpen(false);
      showSuccess?.("Item ajouté avec succès");
    } catch (e) {
      showError?.(`Erreur: ${e.message}`);
    }
  }

  async function handleUpdateItem() {
    try {
      if (!selectedItem) return;

      await api.updateMenuItem(
        restaurantId,
        selectedItem._id,
        formData,
        restaurantAddress
      );

      await fetchMenu();
      setIsModalOpen(false);
      showSuccess?.("Item modifié avec succès");
    } catch (e) {
      showError?.(`Erreur: ${e.message}`);
    }
  }

  async function handleDeleteItem(itemId) {
    const ok = window.confirm("Êtes-vous sûr de vouloir supprimer cet item ?");
    if (!ok) return;

    try {
      await api.deleteMenuItem(restaurantId, itemId, restaurantAddress);
      await fetchMenu();
      showSuccess?.("Item supprimé avec succès");
    } catch (e) {
      showError?.(`Erreur: ${e.message}`);
    }
  }

  async function handleToggleAvailability(item) {
    try {
      await api.updateMenuItem(
        restaurantId,
        item._id,
        { available: !item.available },
        restaurantAddress
      );
      await fetchMenu();
    } catch (e) {
      showError?.(`Erreur: ${e.message}`);
    }
  }

  const filteredMenu = useMemo(() => {
    if (selectedCategory === "all") return menu;
    return menu.filter((i) => i.category === selectedCategory);
  }, [menu, selectedCategory]);

  const categoriesCount = useMemo(() => {
    const counts = { all: menu.length };
    CATEGORIES.forEach((c) => {
      counts[c] = menu.filter((m) => m.category === c).length;
    });
    return counts;
  }, [menu]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-neutral-900 dark:text-neutral-50">
            Gestion du Menu
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Ajoute, modifie et gère la disponibilité de tes plats
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="rounded-2xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-soft transition hover:bg-orange-600"
        >
          + Ajouter un item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <CategoryButton
          active={selectedCategory === "all"}
          onClick={() => setSelectedCategory("all")}
          label={`Toutes (${categoriesCount.all})`}
        />
        {CATEGORIES.map((c) => (
          <CategoryButton
            key={c}
            active={selectedCategory === c}
            onClick={() => setSelectedCategory(c)}
            label={`${c} (${categoriesCount[c] ?? 0})`}
          />
        ))}
      </div>

      {/* Menu grid */}
      {loadingMenu ? (
        <div className="grid place-items-center rounded-2xl bg-white p-10 shadow-soft dark:bg-neutral-800">
          <div className="animate-pulse text-neutral-500 dark:text-neutral-300">
            Chargement du menu...
          </div>
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="grid place-items-center rounded-2xl bg-white p-10 text-sm text-neutral-500 shadow-soft dark:bg-neutral-800 dark:text-neutral-300">
          Aucun item dans cette catégorie.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMenu.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              onEdit={() => handleOpenEditModal(item)}
              onDelete={() => handleDeleteItem(item._id)}
              onToggle={() => handleToggleAvailability(item)}
            />
          ))}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <h3 className="font-display text-xl text-neutral-900 dark:text-neutral-50">
            {selectedItem ? "Modifier un item" : "Ajouter un item"}
          </h3>

          <div className="mt-4 space-y-3">
            <Input
              label="Nom"
              placeholder="Ex: Burger maison"
              value={formData.name}
              onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
            />

            <Textarea
              label="Description"
              placeholder="Décris le plat..."
              value={formData.description}
              onChange={(v) => setFormData((p) => ({ ...p, description: v }))}
            />

            <Input
              label="Prix (POL)"
              type="number"
              min="0"
              step="0.0001"
              value={formData.price}
              onChange={(v) =>
                setFormData((p) => ({ ...p, price: parseFloat(v || "0") }))
              }
            />

            <Select
              label="Catégorie"
              value={formData.category}
              onChange={(v) => setFormData((p) => ({ ...p, category: v }))}
              options={CATEGORIES}
            />

            {/* Image upload */}
            <div className="space-y-2">
              <label className="block text-sm text-neutral-600 dark:text-neutral-300">
                Image
              </label>

              {formData.image && (
                <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-2 dark:bg-neutral-900/40">
                  <img
                    src={`${IPFS_GATEWAY}${formData.image}`}
                    alt="preview"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 break-all">
                    {formData.image}
                  </div>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
                className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-red-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-red-800 hover:file:bg-red-200 dark:file:bg-red-900/30 dark:file:text-red-200"
              />

              {uploading && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Upload en cours...
                </p>
              )}
            </div>

            {/* Available */}
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    available: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300 text-orange-600 focus:ring-orange-200 dark:border-neutral-600 dark:bg-neutral-800"
              />
              Disponible à la commande
            </label>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600"
              >
                Annuler
              </button>

              <button
                onClick={selectedItem ? handleUpdateItem : handleAddItem}
                disabled={uploading}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {selectedItem ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

