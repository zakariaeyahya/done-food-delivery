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
    }    const cartResponse = user.cart ? {
      ...user.cart.toObject ? user.cart.toObject() : user.cart,
      restaurantId: user.cart.restaurantId ? user.cart.restaurantId.toString() : null
    } : { items: [], restaurantId: null, restaurantAddress: null };

    return res.status(200).json({
      success: true,
      cart: cartResponse
    });
  } catch (error) {
    
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

    
    

    if (!address || !ethers.isAddress(address)) {
      
      return res.status(400).json({
        error: "Bad Request",
        message: "Invalid Ethereum address"
      });
    }

    if (!menuItemId || !name || price === undefined) {
      
      return res.status(400).json({
        error: "Bad Request",
        message: "menuItemId, name, and price are required"
      });
    }

    let user = await User.findByAddress(address.toLowerCase());

    if (!user) {
      
      return res.status(404).json({
        error: "Not Found",
        message: "User not found. Please register first."
      });
    }    if (!user.cart) {
      user.cart = {
        items: [],
        restaurantId: null,
        restaurantAddress: null,
        updatedAt: new Date()
      };
    }    if (user.cart.restaurantAddress && user.cart.restaurantAddress !== restaurantAddress && user.cart.items.length > 0) {
      
      return res.status(409).json({
        error: "Conflict",
        message: "Cart contains items from another restaurant. Clear cart first.",
        currentRestaurant: user.cart.restaurantAddress
      });
    }    const mongoose = require("mongoose");    const findRestaurantByAddress = async (address) => {
      if (!address) return null;
      try {
        return await Restaurant.findByAddress(address);
      } catch (error) {
        
        return null;
      }
    };
    
    if (restaurantId) {
      try {        if (mongoose.Types.ObjectId.isValid(restaurantId)) {
          user.cart.restaurantId = typeof restaurantId === 'string' 
            ? new mongoose.Types.ObjectId(restaurantId) 
            : restaurantId;
        } else {          
          const restaurant = await findRestaurantByAddress(restaurantAddress);
          user.cart.restaurantId = restaurant ? restaurant._id : null;
        }
      } catch (error) {        const restaurant = await findRestaurantByAddress(restaurantAddress);
        user.cart.restaurantId = restaurant ? restaurant._id : null;
      }
    } else {      const restaurant = await findRestaurantByAddress(restaurantAddress);
      user.cart.restaurantId = restaurant ? restaurant._id : null;
    }
    
    user.cart.restaurantAddress = restaurantAddress;    const existingItemIndex = user.cart.items.findIndex(item => item.menuItemId === menuItemId);

    if (existingItemIndex > -1) {      user.cart.items[existingItemIndex].quantity += (quantity || 1);
      
    } else {      user.cart.items.push({
        menuItemId,
        name,
        price,
        quantity: quantity || 1,
        image
      });
      
    }

    user.cart.updatedAt = new Date();
    await user.save();

    

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: user.cart
    });
  } catch (error) {
    
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

    if (quantity <= 0) {      user.cart.items.splice(itemIndex, 1);
      
    } else {
      user.cart.items[itemIndex].quantity = quantity;
      
    }

    user.cart.updatedAt = new Date();
    await user.save();

    

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: user.cart
    });
  } catch (error) {
    
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
    }    if (user.cart.items.length === 0) {
      user.cart.restaurantId = null;
      user.cart.restaurantAddress = null;
    }

    user.cart.updatedAt = new Date();
    await user.save();

    

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: user.cart
    });
  } catch (error) {
    
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

    

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: user.cart
    });
  } catch (error) {
    
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
