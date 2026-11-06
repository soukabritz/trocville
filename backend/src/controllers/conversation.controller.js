const conversationService = require('../services/conversation.service');

const start = async (req, res, next) => {
  try {
    const conversation = await conversationService.startForItem(
      Number(req.body.itemId),
      req.user.id
    );
    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

const listMine = async (req, res, next) => {
  try {
    const data = await conversationService.listMine(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const unreadCount = async (req, res, next) => {
  try {
    const count = await conversationService.unreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

const listMessages = async (req, res, next) => {
  try {
    const data = await conversationService.listMessages(Number(req.params.id), req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const created = await conversationService.sendMessage({
      conversationId: Number(req.params.id),
      senderUserId: req.user.id,
      content: req.body.content
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  start,
  listMine,
  unreadCount,
  listMessages,
  sendMessage
};
