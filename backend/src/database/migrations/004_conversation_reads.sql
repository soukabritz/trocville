ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS buyer_last_read_at TIMESTAMP;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS seller_last_read_at TIMESTAMP;
