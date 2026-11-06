const tradeOfferService = require('../src/services/tradeOffer.service');
const tradeOfferRepository = require('../src/repositories/tradeOffer.repository');
const itemRepository = require('../src/repositories/item.repository');

jest.mock('../src/repositories/tradeOffer.repository');
jest.mock('../src/repositories/item.repository');

describe('tradeOffer.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects a trade on your own item', async () => {
    itemRepository.findById.mockImplementation(async (id) => {
      if (id === 1) return { id: 1, user_id: 10, status: 'available' };
      return { id: 2, user_id: 10, status: 'available' };
    });

    await expect(
      tradeOfferService.createOffer({
        requestedItemId: 1,
        proposedItemId: 2,
        senderUserId: 10
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('only the receiver can accept a pending offer', async () => {
    tradeOfferRepository.findById.mockResolvedValue({
      id: 5,
      status: 'pending',
      sender_user_id: 10,
      receiver_user_id: 20,
      requested_item_id: 1,
      proposed_item_id: 2
    });

    await expect(
      tradeOfferService.updateOfferStatus({
        offerId: 5,
        userId: 10,
        status: 'accepted'
      })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('cannot jump from pending to completed', async () => {
    tradeOfferRepository.findById.mockResolvedValue({
      id: 5,
      status: 'pending',
      sender_user_id: 10,
      receiver_user_id: 20
    });

    await expect(
      tradeOfferService.updateOfferStatus({
        offerId: 5,
        userId: 20,
        status: 'completed'
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
