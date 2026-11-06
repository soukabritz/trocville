const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`API TrocVille lancée sur le port ${env.port}`);
});
