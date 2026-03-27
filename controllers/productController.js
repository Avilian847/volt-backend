const db = require('../config/db');

// ── Get all products ──────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category, q, sort } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Filter by category
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    // Search by name
    if (q) {
      params.push(`%${q}%`);
      query += ` AND name ILIKE $${params.length}`;
    }

    // Sort
    if (sort === 'price_asc')  query += ' ORDER BY price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY price DESC';
    else if (sort === 'rating') query += ' ORDER BY rating DESC';
    else query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error('Get products error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Get single product ────────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM products WHERE id = $1', [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Get product error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Create product (admin) ────────────────────────────────────
const createProduct = async (req, res) => {
  const { name, description, price, old_price, stock, category, image_url, badge, rating } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO products 
        (name, description, price, old_price, stock, category, image_url, badge, rating)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [name, description, price, old_price, stock, category, image_url, badge, rating || 0]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Create product error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Update product (admin) ────────────────────────────────────
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, old_price, stock, category, image_url, badge, rating } = req.body;

  try {
    const result = await db.query(
      `UPDATE products SET
        name=$1, description=$2, price=$3, old_price=$4,
        stock=$5, category=$6, image_url=$7, badge=$8, rating=$9
       WHERE id=$10
       RETURNING *`,
      [name, description, price, old_price, stock, category, image_url, badge, rating, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('Update product error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// ── Delete product (admin) ────────────────────────────────────
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM products WHERE id = $1 RETURNING id', [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error('Delete product error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };