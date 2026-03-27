const db = require('../config/db');
const { clearCart } = require('./cartController');

// ── Place order ───────────────────────────────────────────────
const placeOrder = async (req, res) => {
  const { name, email, items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  try {
    // Create order
    const orderResult = await db.query(
      `INSERT INTO orders (user_id, total, status, email, name)
       VALUES ($1, $2, 'Processing', $3, $4)
       RETURNING *`,
      [req.user.id, total, email, name]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      );

      // Reduce stock
      await db.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Clear the user's cart
    await clearCart(req.user.id);

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });

  } catch (err) {
    console.error('Place order error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Get order history ─────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.total, o.status, o.name, o.email, o.created_at,
              json_agg(json_build_object(
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price,
                'name', p.name,
                'image_url', p.image_url
              )) as items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('Get orders error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { placeOrder, getOrders };