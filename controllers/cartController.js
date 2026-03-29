const db = require('../config/db');

// ── Get user's cart ───────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ci.id, ci.quantity, p.id as product_id,
              p.name, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get cart error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Add item to cart ──────────────────────────────────────────
const addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    // Check product exists and has stock
    const product = await db.query(
      'SELECT * FROM products WHERE id = $1', [product_id]
    );
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (product.rows[0].stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock' });
    }

    // Check if already in cart
    const existing = await db.query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existing.rows.length > 0) {
      // Update quantity
      const updated = await db.query(
        `UPDATE cart_items SET quantity = quantity + $1
         WHERE user_id = $2 AND product_id = $3
         RETURNING *`,
        [quantity, req.user.id, product_id]
      );
      return res.json(updated.rows[0]);
    }

    // Insert new cart item
    const result = await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, product_id, quantity]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Add to cart error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Update cart item quantity ─────────────────────────────────
const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  try {
    const result = await db.query(
      `UPDATE cart_items SET quantity = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [quantity, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Update cart error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Remove item from cart ─────────────────────────────────────
const removeFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });

  } catch (err) {
    console.error('Remove from cart error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Clear entire cart ─────────────────────────────────────────
const clearCart = async (userId) => {
  await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };