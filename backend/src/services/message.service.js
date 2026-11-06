const messageRepository = require('../repositories/message.repository');
const tradeOfferRepository = require('../repositories/tradeOffer.repository');
const AppError = require('../utils/AppError');

const assertParticipant = (offer, userId) => {
  const isParticipant = offer.sender_user_id === userId || offer.receiver_user_id === userId;
  if (!isParticipant) {
    throw new AppError('Accès réservé aux participants du troc.', 403);
  }
};

const sendMessage = async (payload) => {
  const offer = await tradeOfferRepository.findById(payload.tradeOfferId);
  if (!offer) {
    throw new AppError('Proposition introuvable.', 404);
  }
  assertParticipant(offer, payload.senderUserId);
  return messageRepository.createMessage(payload);
};

const listConversation = async (tradeOfferId, userId) => {
  const offer = await tradeOfferRepository.findById(tradeOfferId);
  if (!offer) {
    throw new AppError('Proposition introuvable.', 404);
  }
  assertParticipant(offer, userId);
  return messageRepository.listByTradeOffer(tradeOfferId);
};

module.exports = {
  sendMessage,
  listConversation
};
