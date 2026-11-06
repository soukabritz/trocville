const env = require('../config/env');
const AppError = require('../utils/AppError');

const assertMailConfigured = () => {
  if (!env.brevoApiKey || !env.brevoSenderEmail) {
    throw new AppError("L'envoi des emails n'est pas configuré.", 503);
  }
};

const sendCodeEmail = async ({ to, subject, textContent, failureMessage }) => {
  assertMailConfigured();
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.brevoApiKey,
      accept: 'application/json',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: env.brevoSenderName, email: env.brevoSenderEmail },
      to: [{ email: to }],
      subject,
      textContent
    })
  });

  if (!response.ok) {
    throw new AppError(failureMessage, 502);
  }
};

const sendVerificationCode = ({ to, code }) =>
  sendCodeEmail({
    to,
    subject: 'Ton code TrocVille',
    textContent: `Voici ton code pour confirmer ton adresse : ${code}. Il est valable 15 minutes.`,
    failureMessage: "L'email de confirmation n'a pas pu être envoyé."
  });

const sendPasswordResetCode = ({ to, code }) =>
  sendCodeEmail({
    to,
    subject: 'Ton code pour changer ton mot de passe',
    textContent: `Voici ton code pour choisir un nouveau mot de passe : ${code}. Il est valable 15 minutes.`,
    failureMessage: "L'email de réinitialisation n'a pas pu être envoyé."
  });

module.exports = {
  assertMailConfigured,
  sendVerificationCode,
  sendPasswordResetCode
};
