const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;



module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select('-password');
    res.status(200).json(users)
};

module.exports.userInfo = async (req, res) => {
    console.log(req.params);

    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send('ID unknown: ' + id);
    }

    try {
        const user = await UserModel.findById(id).select('-password');

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.send(user);
    } catch (err) {
        console.error('Error retrieving user:', err);
        res.status(500).send('Internal Server Error');
    }
};
//modifier un utilisateur
module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send('User not found');
  
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            bio: req.body.bio
          }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
  
      if (!updatedUser) {
        return res.status(404).send('User not found');
      }
  
      return res.send(updatedUser);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  //supprimer un utilisateur
  module.exports.deleteUser= async(req,res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send('User not found');
  
    try{
        await UserModel.findOneAndRemove({ _id: req.params.id}).exec();
        res.status(200).json({message: "Succesfully deleted. "});

    }
    catch (err){
        return res.status(500).json({message: err});
    }
    
  };
//suivre un utilisateur
  module.exports.follow = async (req, res) => {
    if (
      !ObjectID.isValid(req.params.id) ||
      !ObjectID.isValid(req.body.idToFollow)
    )
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      // Ajouter à la liste des personnes suivies
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: req.params.id },
        { $addToSet: { following: req.body.idToFollow } },
        { new: true, upsert: true }
      );
  
      if (!updatedUser) {
        return res.status(404).send('User not found');
      }
  
      // Ajouter à la liste des abonnés
      await UserModel.findOneAndUpdate(
        { _id: req.body.idToFollow },
        { $addToSet: { followers: req.params.id } },
        { new: true, upsert: true }
      );
  
      res.status(201).json(updatedUser);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
  // arrêter de suivre un utilisateur
  module.exports.unfollow = async (req, res) => {
    if (
      !ObjectID.isValid(req.params.id) ||
      !ObjectID.isValid(req.body.idToUnfollow)
    )
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      await UserModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { following: req.body.idToUnfollow } },
        { new: true, upsert: true },
        (err, docs) => {
          if (!err) res.status(201).json(docs);
          else return res.status(400).jsos(err);
        }
      );
      // remove to following list
      await UserModel.findByIdAndUpdate(
        req.body.idToUnfollow,
        { $pull: { followers: req.params.id } },
        { new: true, upsert: true },
        (err, docs) => {
          // if (!err) res.status(201).json(docs);
          if (err) return res.status(400).jsos(err);
        }
      );
    } catch (err) {
      return res.status(500).json({ message: err });
    }
  };

  //recherche
exports.searchUsers = async (req, res) => {
    const { page = 1, pageSize = 10, query } = req.query;
    const skip = (page - 1) * pageSize;

    try {
          const users = await UserModel.find({ pseudo: { $regex: query, $options: 'i' } })
                  .skip(skip)
                  .limit(pageSize);

        
        const totalCount = await UserModel.countDocuments({ pseudo: { $regex: query, $options: 'i' } });

        const totalPages = Math.ceil(totalCount / pageSize);

        res.json({
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            users
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la recherche des utilisateurs.' });
    }
};

  
  