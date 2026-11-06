const db = require('../../config/db');

const runSeed = async () => {
  await db.query(`
    INSERT INTO categories (name)
    VALUES ('Electronique'), ('Maison'), ('Vetements'), ('Sports'), ('Livres'), ('Loisirs')
    ON CONFLICT (name) DO NOTHING
  `);

  console.log('Seed categories terminé.');
  process.exit(0);
};

runSeed().catch((error) => {
  console.error('Erreur seed:', error.message);
  process.exit(1);
});
