const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRepository = require('../repositories/user.repository');
const emailVerificationRepository = require('../repositories/emailVerification.repository');
const passwordResetRepository = require('../repositories/passwordReset.repository');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { toPublicUser } = require('../utils/mapUser');
const { profileFromAccessToken, profileFromIdToken, nameFromGoogle } = require('./googleIdentity');
const { assertMailConfigured, sendVerificationCode, sendPasswordResetCode } = require('./mailer');

const CODE_TTL_MS = 15 * 60 * 1000;

const signToken = (userId) =>
  jwt.sign({}, env.jwtSecret, {
    subject: String(userId),
    expiresIn: env.jwtExpiresIn
  });

const hashCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

const createCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

const codeIsFresh = (latest) => Boolean(latest && new Date(latest.expires_at).getTime() > Date.now());

const codeMatches = (latest, code) => {
  if (!codeIsFresh(latest)) {
    return false;
  }
  const presented = hashCode(String(code || '').trim());
  return (
    latest.code_hash.length === presented.length &&
    crypto.timingSafeEqual(Buffer.from(latest.code_hash), Buffer.from(presented))
  );
};

const issueVerificationCode = async (user) => {
  const code = createCode();
  await emailVerificationRepository.replaceCode({
    userId: user.id,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS)
  });
  try {
    await sendVerificationCode({ to: user.email, code });
  } catch (error) {
    await emailVerificationRepository.deleteForUser(user.id);
    throw error;
  }
};

const register = async ({ firstName, lastName, email, password, mainCity }) => {
  assertMailConfigured();
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await userRepository.findByEmailInsensitive(normalizedEmail);
  if (existing) {
    throw new AppError('Un compte existe déjà avec cet email.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser({
    firstName,
    lastName,
    email: normalizedEmail,
    passwordHash,
    mainCity,
    emailVerified: false,
    termsAcceptedAt: new Date()
  });

  try {
    await issueVerificationCode(user);
  } catch (error) {
    await userRepository.deleteById(user.id);
    throw error;
  }

  return {
    verificationRequired: true,
    email: normalizedEmail
  };
};

const verifyEmail = async ({ email, code }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await userRepository.findByEmailInsensitive(normalizedEmail);
  const latest = user ? await emailVerificationRepository.findLatest(user.id) : null;

  if (!user || user.email_verified) {
    throw new AppError('Code incorrect ou expiré.', 401);
  }

  if (!codeIsFresh(latest)) {
    await issueVerificationCode(user);
    throw new AppError("Ce code n'est plus valable. Un nouveau code a été envoyé.", 401, 'CODE_EXPIRED');
  }

  if (!codeMatches(latest, code)) {
    throw new AppError('Code incorrect.', 401);
  }

  const verified = await userRepository.markEmailVerified(user.id);
  await emailVerificationRepository.deleteForUser(user.id);
  return {
    token: signToken(verified.id),
    user: toPublicUser(verified)
  };
};

const resendVerification = async ({ email }) => {
  assertMailConfigured();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await userRepository.findByEmailInsensitive(normalizedEmail);
  if (!user || user.email_verified) {
    throw new AppError('Aucun compte à confirmer pour cet email.', 404);
  }
  await issueVerificationCode(user);
  return { sent: true };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmailInsensitive(String(email || '').trim());
  if (!user) {
    throw new AppError('Identifiants invalides.', 401);
  }

  if (!user.password_hash) {
    throw new AppError('Ce compte se connecte avec Google.', 401);
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new AppError('Identifiants invalides.', 401);
  }

  if (user.email_verified === false) {
    throw new AppError('Confirme ton email avec le code reçu.', 403, 'EMAIL_NOT_VERIFIED');
  }

  return {
    token: signToken(user.id),
    user: toPublicUser(user)
  };
};

const loginWithGoogle = async ({ idToken, accessToken, acceptTerms }) => {
  const profile = idToken
    ? await profileFromIdToken(idToken)
    : await profileFromAccessToken(accessToken);

  const email = String(profile.email).trim().toLowerCase();
  let user = await userRepository.findByGoogleSub(profile.sub);

  if (!user) {
    user = await userRepository.findByEmailInsensitive(email);
    if (user) {
      if (user.google_sub && user.google_sub !== profile.sub) {
        throw new AppError('Cet email est déjà lié à un autre compte Google.', 409);
      }
      const needsVerification = user.email_verified === false;
      if (!user.google_sub) {
        user = await userRepository.attachGoogle(user.id, profile.sub);
      }
      if (needsVerification && user) {
        user = await userRepository.markEmailVerified(user.id);
      }
    }
  }

  if (!user) {
    if (acceptTerms !== true) {
      const error = new AppError('Tu dois accepter les conditions.', 422);
      error.fields = { acceptTerms: 'Tu dois accepter les conditions.' };
      throw error;
    }
    const parsed = nameFromGoogle(profile);
    const emailName = email.split('@')[0].slice(0, 80) || 'Utilisateur';
    user = await userRepository.createUser({
      firstName: parsed.hasName ? parsed.firstName : emailName,
      lastName: parsed.hasName ? parsed.lastName : '—',
      email,
      passwordHash: null,
      mainCity: 'Non renseignée',
      googleSub: profile.sub,
      emailVerified: true,
      termsAcceptedAt: new Date()
    });
  }

  return {
    token: signToken(user.id),
    user: toPublicUser(user)
  };
};

const forgotPassword = async ({ email }) => {
  assertMailConfigured();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await userRepository.findByEmailInsensitive(normalizedEmail);
  if (!user) {
    throw new AppError('Aucun compte avec cet email.', 404);
  }
  if (!user.password_hash) {
    throw new AppError('Ce compte se connecte avec Google.', 401);
  }

  const code = createCode();
  await passwordResetRepository.replaceCode({
    userId: user.id,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS)
  });
  try {
    await sendPasswordResetCode({ to: user.email, code });
  } catch (error) {
    await passwordResetRepository.deleteForUser(user.id);
    throw error;
  }
  return { sent: true, email: user.email };
};

const resetPassword = async ({ email, code, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await userRepository.findByEmailInsensitive(normalizedEmail);
  const latest = user ? await passwordResetRepository.findLatest(user.id) : null;
  if (!user || !user.password_hash || !codeMatches(latest, code)) {
    throw new AppError('Code incorrect ou expiré.', 401);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const updated = await userRepository.updatePassword(user.id, passwordHash);
  await passwordResetRepository.deleteForUser(user.id);
  return {
    token: signToken(updated.id),
    user: toPublicUser(updated)
  };
};

module.exports = {
  register,
  login,
  loginWithGoogle,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
};
