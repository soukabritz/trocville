CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  main_city VARCHAR(120) NOT NULL,
  credits INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  condition_state VARCHAR(20) NOT NULL CHECK (condition_state IN ('new', 'good', 'fair')),
  city VARCHAR(120) NOT NULL,
  credit_price INTEGER NOT NULL DEFAULT 50,
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'trading', 'traded')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trade_offers (
  id SERIAL PRIMARY KEY,
  requested_item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  proposed_item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'refused', 'completed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (requested_item_id <> proposed_item_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  trade_offer_id INTEGER NOT NULL REFERENCES trade_offers(id) ON DELETE CASCADE,
  sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_city ON items(city);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_receiver_user_id ON trade_offers(receiver_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_trade_offer_id ON messages(trade_offer_id);

INSERT INTO categories (name)
VALUES
  ('Electronique'),
  ('Maison'),
  ('Vetements'),
  ('Sports'),
  ('Livres'),
  ('Loisirs')
ON CONFLICT (name) DO NOTHING;
