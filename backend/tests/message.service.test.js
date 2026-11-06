const messageService = require('../src/services/message.service');
const messageRepository = require('../src/repositories/message.repository');
const tradeOfferRepository = require('../src/repositories/tradeOffer.repository');

jest.mock('../src/repositories/message.repository');
jest.mock('../src/repositories/tradeOffer.repository');

describe('message.service', () => {
  beforeEach(() => {
    messageRepository.listByTradeOffer = jest.fn();
  });

  test('blocks a user who is not part of the trade', async () => {
    tradeOfferRepository.findById.mockResolvedValue({
      id: 3,
      sender_user_id: 1,
      receiver_user_id: 2
    });

    await expect(
      messageService.listConversation(3, 99)
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(messageRepository.listByTradeOffer).not.toHaveBeenCalled();
  });
});
