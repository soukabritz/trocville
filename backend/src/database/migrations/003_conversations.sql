CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  buyer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (item_id, buyer_user_id)
);

ALTER TABLE messages
  ALTER COLUMN trade_offer_id DROP NOT NULL;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_user_id ON conversations(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_user_id ON conversations(seller_user_id);
