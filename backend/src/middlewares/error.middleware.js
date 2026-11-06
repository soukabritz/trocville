const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: 'Route introuvable.' });
};

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur.';

  res.status(statusCode).json({
    message,
    ...(err.code ? { code: err.code } : {}),
    ...(err.fields && Object.keys(err.fields).length ? { fields: err.fields } : {})
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
