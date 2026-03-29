-- Users
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) DEFAULT 'customer',
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  price       DECIMAL(10,2) NOT NULL,
  old_price   DECIMAL(10,2),
  stock       INTEGER DEFAULT 0,
  category    VARCHAR(100),
  image_url   VARCHAR(500),
  badge       VARCHAR(50),
  rating      DECIMAL(3,2) DEFAULT 0,
  reviews     INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER DEFAULT 1,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  total       DECIMAL(10,2) NOT NULL,
  status      VARCHAR(50) DEFAULT 'Processing',
  email       VARCHAR(100),
  name        VARCHAR(100),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL,
  price       DECIMAL(10,2) NOT NULL
);

-- Promo codes
CREATE TABLE IF NOT EXISTS promos (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(50) UNIQUE NOT NULL,
  discount    DECIMAL(4,2) NOT NULL,
  active      BOOLEAN DEFAULT TRUE
);