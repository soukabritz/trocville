const { nameFromGoogle } = require('../src/services/googleIdentity');

describe('Google profile name', () => {
  test('uses the name when Google sends one', () => {
    expect(nameFromGoogle({ given_name: 'Ada', family_name: 'Lovelace' })).toEqual({
      hasName: true,
      firstName: 'Ada',
      lastName: 'Lovelace'
    });
  });

  test('splits a full name', () => {
    expect(nameFromGoogle({ name: 'Ada Lovelace' })).toEqual({
      hasName: true,
      firstName: 'Ada',
      lastName: 'Lovelace'
    });
  });

  test('says when Google sends no name', () => {
    expect(nameFromGoogle({ email: 'ada@gmail.com' }).hasName).toBe(false);
  });
});
