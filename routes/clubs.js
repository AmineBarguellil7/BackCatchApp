var express = require('express');
var router = express.Router();
const Club=require('../model/club');
const User = require('../model/user');



router.get('/', async (req, res) => {
    try {
      const clubs = await Club.find().populate('members');
      res.json(clubs);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Erreur serveur');
    }
  });

  const multer = require('multer');
  const upload = multer({ dest: 'C:/Users/Amine Barguellil/Desktop/projet pi/Amine/CatchApp_The_Innovators/public/img' }); // define upload directory
router.post('/add',upload.single('logo'), async (req, res) => {
  const { name, description,address } = req.body;
    try {
      const club = new Club({
        name,
        description,
        address,
        logo: req.file ? req.file.filename : undefined,
      });
      await club.save();
      res.status(201).send(club);
    } catch (error) {
      res.status(400).send(error);
    }
  }); 
  
  

router.get('/:id', async (req, res) => {
    try {
      const club = await Club.findById(req.params.id);
      if (!club) {
        return res.status(404).send();
      }
      res.json(club);
    } catch (error) {
      res.status(500).send();
    }
  });  
  


router.put('/update/:id',upload.single('logo'), async (req, res) => {
  const { name,description,address } = req.body;
  const ClubId = req.params.id;
    try {
      const club = await Club.findOne({ _id: ClubId });
      if (!club) {
        return res.status(404).send();
      }
      club.name = name || club.name;
      club.description = description || club.description;
      club.address = address || club.address;
      if (req.file) {
        club.logo =req.file.filename;
      }
      else {
        club.logo=undefined;
      }
      await club.save()
      res.send(club);
    } catch (error) {
      console.log(error.message)
      res.status(400).send(error);
    }
  });  



router.delete('/delete/:id', async (req, res) => {
    try {
      const club = await Club.findByIdAndDelete(req.params.id);
      if (!club) {
        return res.status(404).send();
      }
      res.send(club);
    } catch (error) {
      res.status(500).send();
    }
  });


// router.put('/:clubId/:userId/join', async (req, res) => {
//     try {
//       const club = await Club.findByIdAndUpdate(req.params.clubId, {
//         $addToSet: { members: req.params.userId }
//       }, { new: true });
//       if (!club) {
//         return res.status(404).send({ error: 'Club not found' });
//       }
//       res.send(club);
//     } catch (error) {
//       res.status(500).send({ error: 'Internal server error' });
//     }
//   });  

  router.get('/:clubId/members', async (req, res) => {
    const ClubId = req.params.clubId;
    try {
      const club = await Club.findById(ClubId).populate('members');
      if (!club) {
        res.status(404).send({ "message": "Club not found" });
        return;
      }
      res.json(club.members);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send({ "message": "Erreur serveur" });
    }
  });


  ///////////////delete a user from a club///////////////
  router.delete('/:clubId/:userId/leave', async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { $pull: { clubs: req.params.clubId } },
        { new: true }
      );
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      const club = await Club.findByIdAndUpdate(
        req.params.clubId,
        { $pull: { members: req.params.userId } },
        { new: true }
      );
      if (!club) {
        return res.status(404).send({ error: 'Club not found' });
      }
  
      res.send({club, user});
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal server error' });
    }
  });
    
   
  









module.exports = router;