const db = require('../config/db');

// ── Get all orders (admin) ────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.total, o.status, o.name, o.email, o.created_at,
              json_agg(json_build_object(
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price,
                'name', p.name
              )) as items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Admin get orders error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Update order status (admin) ───────────────────────────────
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await db.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update order status error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Get all users (admin) ─────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Admin get users error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getAllOrders, updateOrderStatus, getAllUsers };