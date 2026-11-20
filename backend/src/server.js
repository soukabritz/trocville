const app = require('./app');
const env = require('./config/env');
const migrate = require('./database/migrate');

async function start() {
  if (process.env.MIGRATE_ON_START === 'true') {
    await migrate();
  }

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`API TrocVille lancée sur le port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Démarrage impossible.', error);
  process.exit(1);
});
