const toPublicUser = (user) => ({
  id: user.id,
  firstName: user.first_name,
  lastName: user.last_name,
  email: user.email,
  mainCity: user.main_city,
  credits: user.credits
});

module.exports = {
  toPublicUser
};
