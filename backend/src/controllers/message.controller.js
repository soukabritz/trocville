const messageService = require('../services/message.service');

const createMessage = async (req, res, next) => {
  try {
    const created = await messageService.sendMessage({
      tradeOfferId: req.body.tradeOfferId,
      senderUserId: req.user.id,
      content: req.body.content
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

const listConversation = async (req, res, next) => {
  try {
    const messages = await messageService.listConversation(
      Number(req.params.tradeOfferId),
      req.user.id
    );
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  listConversation
};
