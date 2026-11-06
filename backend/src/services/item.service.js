const itemRepository = require('../repositories/item.repository');
const conversationRepository = require('../repositories/conversation.repository');
const db = require('../config/db');
const AppError = require('../utils/AppError');
const { toPublicUser } = require('../utils/mapUser');

const createItem = (payload) => itemRepository.createItem(payload);

const listItems = (filters) => itemRepository.listItems(filters);

const listCompletedExchanges = (userId) => itemRepository.listCompletedExchanges(userId);

const getItemDetails = async (itemId) => {
  const item = await itemRepository.findById(itemId);
  if (!item) {
    throw new AppError('Annonce introuvable.', 404);
  }
  return item;
};

const updateItem = async (itemId, userId, payload) => {
  const item = await itemRepository.findById(itemId);
  if (!item) {
    throw new AppError('Annonce introuvable.', 404);
  }
  if (item.user_id !== userId) {
    throw new AppError('Action non autorisùe.', 403);
  }
  if (!payload.imageUrl) {
    payload.imageUrl = item.image_url;
  }
  return itemRepository.updateItem(itemId, payload);
};

const acquireItem = async (itemId, buyerId) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const itemResult = await client.query('SELECT * FROM items WHERE id = $1 FOR UPDATE', [itemId]);
    const item = itemResult.rows[0];

    if (!item) {
      throw new AppError('Annonce introuvable.', 404);
    }
    if (item.status !== 'available') {
      throw new AppError('Cet objet nùest plus disponible.', 400);
    }
    if (item.user_id === buyerId) {
      throw new AppError('Tu ne peux pas prendre ton propre objet.', 400);
    }

    const buyerResult = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [buyerId]);
    const buyer = buyerResult.rows[0];
    if (!buyer) {
      throw new AppError('Utilisateur introuvable.', 404);
    }
    if (buyer.credits < item.credit_price) {
      throw new AppError('Crùdits insuffisants.', 400);
    }

    await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [item.user_id]);
    await client.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [item.credit_price, buyerId]);
    await client.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [item.credit_price, item.user_id]);
    await client.query(
      "UPDATE items SET status = 'traded', acquired_by = $2, acquired_at = NOW() WHERE id = $1",
      [itemId, buyerId]
    );

    const conversation = await conversationRepository.createWithClient(client, {
      itemId,
      buyerUserId: buyerId,
      sellerUserId: item.user_id
    });

    const updatedBuyer = await client.query(
      'SELECT id, first_name, last_name, email, main_city, credits, created_at FROM users WHERE id = $1',
      [buyerId]
    );

    await client.query('COMMIT');

    return {
      itemId,
      creditPrice: item.credit_price,
      conversationId: conversation.id,
      user: toPublicUser(updatedBuyer.rows[0])
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteItem = async (itemId, userId) => {
  const item = await itemRepository.findById(itemId);
  if (!item) {
    throw new AppError('Annonce introuvable.', 404);
  }
  if (item.user_id !== userId) {
    throw new AppError('Action non autorisùe.', 403);
  }
  await itemRepository.deleteItem(itemId);
};

module.exports = {
  createItem,
  listItems,
  listCompletedExchanges,
  getItemDetails,
  updateItem,
  deleteItem,
  acquireItem
};
