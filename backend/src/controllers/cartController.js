const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const { ethers } = require("ethers");

/**
 * Controller pour la gestion du panier
 * @notice Gere toutes les operations liees au panier utilisateur
 */

/**
 * Recupere le panier d'un utilisateur
 * @route GET /api/cart/:address
 */
async function getCart(req, res) {
  try {
    const { address } = req.params;

    console.log(`[Cart] Getting cart for user: ${address}`);

    if (!address || !ethers.isAddress(address)) {
      console.log(`[Cart] Invalid address: ${address}`);
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }

    const user = await User.findByAddress(address.toLowerCase());

    if (!user) {
      console.log(`[Cart] User not found: ${address}`);
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }

    console.log(`[Cart] Cart retrieved for ${address}:`, user.cart);

    return res.status(200).json({
      success: true,
      cart: user.cart || { items: [], restaurantId: null, restaurantAddress: null }
    });
  } catch (error) {
    console.error("[Cart] Error getting cart:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to get cart",
      details: error.message
    });
  }
}

/**
 * Ajoute un item au panier
 * @route POST /api/cart/:address/add
 */
async function addToCart(req, res) {
  try {
    const { address } = req.params;
    const { menuItemId, name, price, quantity, image, restaurantId, restaurantAddress } = req.body;

    console.log(`[Cart] Adding item to cart for user: ${address}`);
    console.log(`[Cart] Item details:`, { menuItemId, name, price, quantity, image, restaurantId, restaurantAddress });

    if (!address || !ethers.isAddress(address)) {
      console.log(`[Cart] Invalid address: ${address}`);
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }

    if (!menuItemId || !name || price === undefined) {
      console.log(`[Cart] Missing required fields`);
      return res.status(400).json({
        error: "Bad Request",
        message: "menuItemId, name, and price are required"
      });
    }

    let user = await User.findByAddress(address.toLowerCase());

    if (!user) {
      console.log(`[Cart] User not found: ${address}`);
      return res.status(404).json({
        error: "Not Found",
        message: "User not found. Please register first."
      });
    }

    // Initialiser le cart si necessaire
    if (!user.cart) {
      user.cart = {
        items: [],
        restaurantId: null,
        restaurantAddress: null,
        updatedAt: new Date()
      };
    }

    // Verifier si le panier contient des items d'un autre restaurant
    if (user.cart.restaurantAddress && user.cart.restaurantAddress !== restaurantAddress && user.cart.items.length > 0) {
      console.log(`[Cart] Cart contains items from another restaurant`);
      return res.status(409).json({
        error: "Conflict",
        message: "Cart contains items from another restaurant. Clear cart first.",
        currentRestaurant: user.cart.restaurantAddress
      });
    }

    // Mettre a jour le restaurant du panier
    user.cart.restaurantId = restaurantId;
    user.cart.restaurantAddress = restaurantAddress;

    // Chercher si l'item existe deja dans le panier
    const existingItemIndex = user.cart.items.findIndex(item => item.menuItemId === menuItemId);

    if (existingItemIndex > -1) {
      // Incrementer la quantite
      user.cart.items[existingItemIndex].quantity += (quantity || 1);
      console.log(`[Cart] Updated quantity for existing item: ${name}, new quantity: ${user.cart.items[existingItemIndex].quantity}`);
    } else {
      // Ajouter le nouvel item
      user.cart.items.push({
        menuItemId,
        name,
        price,
        quantity: quantity || 1,
        image
      });
      console.log(`[Cart] Added new item: ${name}`);
    }

    user.cart.updatedAt = new Date();
    await user.save();

    console.log(`[Cart] Cart saved successfully for ${address}. Total items: ${user.cart.items.length}`);

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: user.cart
    });
  } catch (error) {
    console.error("[Cart] Error adding to cart:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to add item to cart",
      details: error.message
    });
  }
}

/**
 * Met a jour la quantite d'un item dans le panier
 * @route PUT /api/cart/:address/update
 */
async function updateCartItem(req, res) {
  try {
    const { address } = req.params;
    const { menuItemId, quantity } = req.body;

    console.log(`[Cart] Updating item quantity for user: ${address}`);
    console.log(`[Cart] Update details:`, { menuItemId, quantity });

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }

    if (!menuItemId || quantity === undefined) {
      return res.status(400).json({
        error: "Bad Request",
        message: "menuItemId and quantity are required"
      });
    }

    const user = await User.findByAddress(address.toLowerCase());

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }

    if (!user.cart || !user.cart.items) {
      return res.status(404).json({
        error: "Not Found",
        message: "Cart is empty"
      });
    }

    const itemIndex = user.cart.items.findIndex(item => item.menuItemId === menuItemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        error: "Not Found",
        message: "Item not found in cart"
      });
    }

    if (quantity <= 0) {
      // Supprimer l'item si quantite <= 0
      user.cart.items.splice(itemIndex, 1);
      console.log(`[Cart] Removed item from cart`);
    } else {
      user.cart.items[itemIndex].quantity = quantity;
      console.log(`[Cart] Updated quantity to ${quantity}`);
    }

    user.cart.updatedAt = new Date();
    await user.save();

    console.log(`[Cart] Cart updated successfully for ${address}`);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: user.cart
    });
  } catch (error) {
    console.error("[Cart] Error updating cart:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update cart",
      details: error.message
    });
  }
}

/**
 * Supprime un item du panier
 * @route DELETE /api/cart/:address/remove/:itemId
 */
async function removeFromCart(req, res) {
  try {
    const { address, itemId } = req.params;

    console.log(`[Cart] Removing item ${itemId} from cart for user: ${address}`);

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }

    const user = await User.findByAddress(address.toLowerCase());

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }

    if (!user.cart || !user.cart.items) {
      return res.status(404).json({
        error: "Not Found",
        message: "Cart is empty"
      });
    }

    const initialLength = user.cart.items.length;
    user.cart.items = user.cart.items.filter(item => item.menuItemId !== itemId);

    if (user.cart.items.length === initialLength) {
      return res.status(404).json({
        error: "Not Found",
        message: "Item not found in cart"
      });
    }

    // Si le panier est vide, reinitialiser le restaurant
    if (user.cart.items.length === 0) {
      user.cart.restaurantId = null;
      user.cart.restaurantAddress = null;
    }

    user.cart.updatedAt = new Date();
    await user.save();

    console.log(`[Cart] Item removed successfully. Remaining items: ${user.cart.items.length}`);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: user.cart
    });
  } catch (error) {
    console.error("[Cart] Error removing from cart:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to remove item from cart",
      details: error.message
    });
  }
}

/**
 * Vide le panier
 * @route DELETE /api/cart/:address/clear
 */
async function clearCart(req, res) {
  try {
    const { address } = req.params;

    console.log(`[Cart] Clearing cart for user: ${address}`);

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }

    const user = await User.findByAddress(address.toLowerCase());

    if (!user) {
      return res.status(404).json({
        error: "Not Found",
        message: "User not found"
      });
    }

    user.cart = {
      items: [],
      restaurantId: null,
      restaurantAddress: null,
      updatedAt: new Date()
    };

    await user.save();

    console.log(`[Cart] Cart cleared successfully for ${address}`);

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: user.cart
    });
  } catch (error) {
    console.error("[Cart] Error clearing cart:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to clear cart",
      details: error.message
    });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
