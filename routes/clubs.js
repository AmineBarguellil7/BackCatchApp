var express = require('express');
var router = express.Router();
const Club=require('../model/club');
const User = require('../model/user');
const Event=require("../model/event");
const ChatRoom=require('../model/chatroom');



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
  const upload = multer({ dest: '' }); // define upload directory
router.post('/add',upload.single('logo'), async (req, res) => {
  const { name, description,address,domain } = req.body;
    try {
      const club = new Club({
        name,
        description,
        address,
        domain,
        logo: req.file ? req.file.filename : undefined,
      });
      await club.save();


      // Create a chat room for the club
    const chatRoom = new ChatRoom({
      name: `${club.name} Chat Room`,
      members: club.members,
      club: club._id
    });
    await chatRoom.save();


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
  const { name,description,address,domain } = req.body;
  const ClubId = req.params.id;
    try {
      const club = await Club.findOne({ _id: ClubId });
      if (!club) {
        return res.status(404).send();
      }
      club.name = name || club.name;
      club.description = description || club.description;
      club.address = address || club.address;
      club.domain = domain || club.domain;
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
      const club = await Club.findOne({_id:req.params.id});
      if (!club) {
        return res.status(404).send();
      }
      await User.updateMany(
        { _id: { $in: club.members } }, 
        { $pull: { clubs: club._id } } 
      );
      await User.updateMany(
        { events: { $in: club.events } }, 
        { $pull: { events: { $in: club.events } } } 
      );      
      club.events.forEach(async (eventId) => {
        await Club.updateMany(
          { events: eventId },
          { $pull: { events: eventId } }
        );
        await Event.findOneAndDelete({ _id: eventId });
      });
      club.deleteOne();
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