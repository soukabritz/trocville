const tradeOfferService = require('../services/tradeOffer.service');

const listMyTradeOffers = async (req, res, next) => {
  try {
    const offers = await tradeOfferService.listMyOffers(req.user.id);
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

const createTradeOffer = async (req, res, next) => {
  try {
    const created = await tradeOfferService.createOffer({
      requestedItemId: req.body.requestedItemId,
      proposedItemId: req.body.proposedItemId,
      senderUserId: req.user.id
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);

    
  }
};

const updateTradeOfferStatus = async (req, res, next) => {
  try {
    const updated = await tradeOfferService.updateOfferStatus({
      offerId: Number(req.params.id),
      userId: req.user.id,
      status: req.body.status
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMyTradeOffers,
  createTradeOffer,
  updateTradeOfferStatus
};
