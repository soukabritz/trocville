const conversationRepository = require('../repositories/conversation.repository');
const messageRepository = require('../repositories/message.repository');
const itemRepository = require('../repositories/item.repository');
const AppError = require('../utils/AppError');

const assertParticipant = (conversation, userId) => {
  const isParticipant =
    conversation.buyer_user_id === userId || conversation.seller_user_id === userId;
  if (!isParticipant) {
    throw new AppError('Accès réservé aux participants de l’échange.', 403);
  }
};

const startForItem = async (itemId, userId) => {
  const item = await itemRepository.findById(itemId);
  if (!item) {
    throw new AppError('Annonce introuvable.', 404);
  }
  if (item.user_id === userId) {
    throw new AppError('Tu ne peux pas t’écrire à toi-même.', 400);
  }
  return conversationRepository.findOrCreate({
    itemId,
    buyerUserId: userId,
    sellerUserId: item.user_id
  });
};

const listMine = (userId) => conversationRepository.listForUser(userId);

const listMessages = async (conversationId, userId) => {
  const conversation = await conversationRepository.findById(conversationId);
  if (!conversation) {
    throw new AppError('Conversation introuvable.', 404);
  }
  assertParticipant(conversation, userId);
  const viewerId = Number(userId);
  const otherLastRead =
    Number(conversation.buyer_user_id) === viewerId
      ? conversation.seller_last_read_at
      : conversation.buyer_last_read_at;
  const seenUntil = otherLastRead ? new Date(otherLastRead).getTime() : 0;
  await conversationRepository.markRead(conversationId, userId);
  const messages = await messageRepository.listByConversation(conversationId);
  return messages.map((message) => ({
    ...message,
    seen:
      Number(message.sender_user_id) === viewerId &&
      seenUntil > 0 &&
      new Date(message.created_at).getTime() <= seenUntil
  }));
};

const unreadCount = (userId) => conversationRepository.countUnreadForUser(userId);

const sendMessage = async ({ conversationId, senderUserId, content }) => {
  const conversation = await conversationRepository.findById(conversationId);
  if (!conversation) {
    throw new AppError('Conversation introuvable.', 404);
  }
  assertParticipant(conversation, senderUserId);
  return messageRepository.createMessage({ conversationId, senderUserId, content });
};

module.exports = {
  startForItem,
  listMine,
  listMessages,
  sendMessage,
  unreadCount
};
