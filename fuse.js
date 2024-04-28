const Fuse = require('fuse.js');
const UserModel = require('./models/user.model')

// Fonction pour rechercher des utilisateurs par pseudo ou email
async function searchUsers(query) {
  try {
    // Récupérer tous les utilisateurs de la base de données
    const users = await UserModel.find({}, 'pseudo email');

    // Créer une instance de Fuse pour la recherche en texte intégral
    const fuse = new Fuse(users, {
      keys: ['pseudo', 'email'], // Champs à rechercher
      includeScore: true, // Inclure la précision des correspondances
    });

    // Exécuter la recherche
    const result = fuse.search(query);

    // Formater et renvoyer les résultats de la recherche
    return result.map(({ item }) => ({
      pseudo: item.pseudo,
      email: item.email,
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche des utilisateurs :', error);
    throw new Error('Une erreur est survenue lors de la recherche des utilisateurs');
  }
};

module.exports = { searchUsers };
