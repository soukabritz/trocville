const env = require('../config/env');
const AppError = require('../utils/AppError');

const allowedAudiences = () =>
  String(env.googleClientIds || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

const assertAudience = (audience) => {
  const allowed = allowedAudiences();
  if (!allowed.length) {
    throw new AppError('Connexion Google non configurée sur le serveur.', 503);
  }
  if (!allowed.includes(audience)) {
    throw new AppError('Ce jeton Google n’est pas destiné à TrocVille.', 401);
  }
};

const assertEmail = (payload) => {
  const verified = payload.email_verified === true || payload.email_verified === 'true';
  if (!payload.email || !verified) {
    throw new AppError('L’email Google n’est pas vérifié.', 401);
  }
  if (!payload.sub) {
    throw new AppError('Profil Google incomplet.', 401);
  }
};

const readJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
};

const profileFromIdToken = async (idToken) => {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  const payload = await readJson(response);
  if (!response.ok || !payload || payload.error) {
    throw new AppError('Connexion Google refusée.', 401);
  }
  assertAudience(payload.aud);
  assertEmail(payload);
  return payload;
};

const profileFromAccessToken = async (accessToken) => {
  const infoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
  );
  const info = await readJson(infoResponse);
  if (!infoResponse.ok || !info || info.error) {
    throw new AppError('Connexion Google refusée.', 401);
  }
  assertAudience(info.aud);
  assertEmail(info);

  const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const userInfo = await readJson(userResponse);
  if (!userResponse.ok || !userInfo) {
    return info;
  }

  return {
    ...info,
    email: userInfo.email || info.email,
    email_verified: userInfo.email_verified ?? info.email_verified,
    sub: userInfo.sub || info.sub,
    name: userInfo.name,
    given_name: userInfo.given_name,
    family_name: userInfo.family_name
  };
};

// Google ne renvoie jamais le mot de passe. On ne garde que le nom s'il est présent.
const nameFromGoogle = (profile) => {
  const given = String(profile.given_name || '').trim();
  const family = String(profile.family_name || '').trim();
  if (given || family) {
    return {
      hasName: true,
      firstName: given.slice(0, 80) || 'Utilisateur',
      lastName: (family || '—').slice(0, 80)
    };
  }

  const full = String(profile.name || '').trim();
  if (!full) {
    return { hasName: false, firstName: null, lastName: null };
  }

  const [first, ...rest] = full.split(/\s+/);
  return {
    hasName: true,
    firstName: first.slice(0, 80),
    lastName: (rest.join(' ') || '—').slice(0, 80)
  };
};

module.exports = {
  profileFromIdToken,
  profileFromAccessToken,
  nameFromGoogle
};
