const bcrypt = require('bcrypt');

jest.mock('../src/repositories/user.repository');
jest.mock('../src/repositories/item.repository');
jest.mock('../src/repositories/conversation.repository');
jest.mock('../src/repositories/message.repository');
jest.mock('../src/repositories/favorite.repository');
jest.mock('../src/config/db');

const userRepository = require('../src/repositories/user.repository');
const itemRepository = require('../src/repositories/item.repository');
const conversationRepository = require('../src/repositories/conversation.repository');
const messageRepository = require('../src/repositories/message.repository');
const favoriteRepository = require('../src/repositories/favorite.repository');
const db = require('../src/config/db');

const authService = require('../src/services/auth.service');
const itemService = require('../src/services/item.service');
const conversationService = require('../src/services/conversation.service');
const favoriteService = require('../src/services/favorite.service');

const mockClient = (handler) => {
  const client = {
    query: jest.fn(async (sql, params) => {
      if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
        return { rows: [] };
      }
      return handler(sql, params);
    }),
    release: jest.fn()
  };
  db.getClient.mockResolvedValue(client);
  return client;
};

describe('Security rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login rejects a wrong password', async () => {
    userRepository.findByEmailInsensitive.mockResolvedValue({
      id: 1,
      email: 'camille@test.com',
      password_hash: await bcrypt.hash('le-bon-mot', 4),
      email_verified: true,
      first_name: 'Camille',
      last_name: 'Martin',
      main_city: 'Lyon',
      credits: 200
    });

    await expect(
      authService.login({ email: 'camille@test.com', password: 'mauvais' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test('you cannot edit someone else listing', async () => {
    itemRepository.findById.mockResolvedValue({ id: 4, user_id: 10, image_url: null });

    await expect(
      itemService.updateItem(4, 99, { title: 'Volé' })
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(itemRepository.updateItem).not.toHaveBeenCalled();
  });

  test('you cannot delete someone else listing', async () => {
    itemRepository.findById.mockResolvedValue({ id: 4, user_id: 10 });

    await expect(itemService.deleteItem(4, 99)).rejects.toMatchObject({ statusCode: 403 });

    expect(itemRepository.deleteItem).not.toHaveBeenCalled();
  });

  test('you cannot acquire your own item', async () => {
    mockClient(async (sql) => {
      if (sql.includes('FROM items')) {
        return { rows: [{ id: 1, status: 'available', user_id: 10, credit_price: 40 }] };
      }
      return { rows: [] };
    });

    await expect(itemService.acquireItem(1, 10)).rejects.toMatchObject({ statusCode: 400 });
  });

  test('you cannot acquire an item without enough credits', async () => {
    const client = mockClient(async (sql) => {
      if (sql.includes('FROM items')) {
        return { rows: [{ id: 1, status: 'available', user_id: 20, credit_price: 80 }] };
      }
      if (sql.includes('SELECT * FROM users')) {
        return { rows: [{ id: 7, credits: 10 }] };
      }
      return { rows: [] };
    });

    await expect(itemService.acquireItem(1, 7)).rejects.toMatchObject({ statusCode: 400 });

    const queries = client.query.mock.calls.map((call) => call[0]);
    expect(queries.some((sql) => String(sql).includes('credits = credits -'))).toBe(false);
  });

  test('a stranger cannot read a conversation', async () => {
    conversationRepository.findById.mockResolvedValue({
      id: 3,
      buyer_user_id: 1,
      seller_user_id: 2
    });

    await expect(conversationService.listMessages(3, 99)).rejects.toMatchObject({ statusCode: 403 });

    expect(messageRepository.listByConversation).not.toHaveBeenCalled();
  });

  test('you cannot favorite your own listing', async () => {
    itemRepository.findById.mockResolvedValue({ id: 8, user_id: 5 });

    await expect(favoriteService.toggle(5, 8)).rejects.toMatchObject({ statusCode: 400 });

    expect(favoriteRepository.add).not.toHaveBeenCalled();
  });
});
