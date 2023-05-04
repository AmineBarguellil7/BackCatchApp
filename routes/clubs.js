var express = require('express');
var router = express.Router();
const Club=require('../model/club');
const User = require('../model/user');
const Event=require("../model/event");

const Chat = require("../model/chatModel");


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
  const upload = multer({ dest: 'C:/Users/Amine Barguellil/Desktop/projet pi/Ahmed/CatchApp_The_Innovators/public/img' }); // define upload directory

  
  router.post('/add', upload.single('logo'), async (req, res) => {
    const { name, description, address, domain } = req.body;
     // assuming you have implemented user authentication
  
    try {
      const existingClub = await Club.findOne({ name });
      if (existingClub) {
        return res.status(400).json({ message: 'A club with the same name already exists' });
      }
  
      const club = new Club({
        name,
        description,
        address,
        domain,
        logo: req.file ? req.file.filename : undefined,
      });
      await club.save();
  
      const chatName = `${req.body.name} Chat`;

      const organizer=club._id;
    
      const users = [];
  
      const existingChat = await Chat.findOne({ chatName });
      if (existingChat) {
        await Club.findByIdAndDelete(club._id); // delete the club if the chat already exists
        return res.status(400).json({ message: 'A group chat with the same name already exists' });
      }
  
      const groupChat = await Chat.create({
        chatName,
        users,
        isGroupChat: true,
        organizer
      });
  
      club.chat = groupChat._id;
      await club.save();
  
      res.status(201).json({
        club,
        groupChat,
      });
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
      
      // Find chat with the same name as club
      const chat = await Chat.findOne({chatName: `${club.name} Chat`});
  console.log(chat)
      // Delete chat if it exists
      if (chat) {
        await chat.deleteOne();
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
    
   
  
  router.put('/:userId/:clubId/like', async (req, res) => {
    try {
      const clubId = req.params.clubId;
      const userId = req.params.userId; 
      
      let club = await Club.findById(clubId);
        club = await Club.findByIdAndUpdate(
          clubId,
          { $inc: { likeCount: 1 }, $push: { likes: userId } },
          { new: true }
        );
      res.json(club);
    } catch (err) {
      console.error(err);
      res.status(500).send('Erreur Serveur');
    }
  });




router.put('/:userId/:clubId/dislike', async (req, res) => {
    try {
        const clubId = req.params.clubId;
        const userId = req.params.userId; 
        
        let club = await Club.findById(clubId);
        
          club = await Club.findByIdAndUpdate(
            clubId,
            { $inc: { dislikeCount: +1 }, $push: { dislikes: userId } },
            { new: true }
        );
        res.json(club);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur Serveur');
    }
});








module.exports = router;