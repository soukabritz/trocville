const tradeOfferRepository = require('../repositories/tradeOffer.repository');
const itemRepository = require('../repositories/item.repository');
const AppError = require('../utils/AppError');

const NEXT_STATUS = {
  pending: ['accepted', 'refused'],
  accepted: ['completed']
};

const createOffer = async ({ requestedItemId, proposedItemId, senderUserId }) => {
  const requestedItem = await itemRepository.findById(requestedItemId);
  const proposedItem = await itemRepository.findById(proposedItemId);

  if (!requestedItem || !proposedItem) {
    throw new AppError('Objet demandé ou proposé introuvable.', 404);
  }

  if (requestedItem.status !== 'available' || proposedItem.status !== 'available') {
    throw new AppError('Les deux objets doivent être disponibles.', 400);
  }

  if (requestedItem.user_id === senderUserId) {
    throw new AppError('Vous ne pouvez pas proposer un troc sur votre propre objet.', 400);
  }

  if (proposedItem.user_id !== senderUserId) {
    throw new AppError('Vous devez proposer un objet dont vous êtes propriétaire.', 403);
  }

  return tradeOfferRepository.createTradeOffer({
    requestedItemId,
    proposedItemId,
    senderUserId,
    receiverUserId: requestedItem.user_id
  });
};

const listMyOffers = (userId) => tradeOfferRepository.listForUser(userId);

const updateOfferStatus = async ({ offerId, userId, status }) => {
  const offer = await tradeOfferRepository.findById(offerId);
  if (!offer) {
    throw new AppError('Proposition introuvable.', 404);
  }

  const allowed = NEXT_STATUS[offer.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError('Ce changement de statut n’est pas autorisé.', 400);
  }

  if (status === 'accepted' || status === 'refused') {
    if (offer.receiver_user_id !== userId) {
      throw new AppError('Seul le destinataire peut accepter ou refuser.', 403);
    }
  }

  if (status === 'completed') {
    const isParticipant = offer.sender_user_id === userId || offer.receiver_user_id === userId;
    if (!isParticipant) {
      throw new AppError('Seuls les participants peuvent clôturer le troc.', 403);
    }
  }

  const updated = await tradeOfferRepository.updateStatus(offerId, status);

  if (status === 'accepted') {
    await itemRepository.setStatus(offer.requested_item_id, 'trading');
    await itemRepository.setStatus(offer.proposed_item_id, 'trading');
  }

  if (status === 'completed') {
    await itemRepository.setStatus(offer.requested_item_id, 'traded');
    await itemRepository.setStatus(offer.proposed_item_id, 'traded');
  }

  if (status === 'refused') {
    await itemRepository.setStatus(offer.requested_item_id, 'available');
    await itemRepository.setStatus(offer.proposed_item_id, 'available');
  }

  return updated;
};

module.exports = {
  createOffer,
  listMyOffers,
  updateOfferStatus
};
