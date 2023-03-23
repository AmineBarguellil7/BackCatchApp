var express = require('express');
var router = express.Router();
const Club=require('../model/club');



router.get('/', async (req, res) => {
    try {
      const clubs = await Club.find().populate('members');
      res.json(clubs);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Erreur serveur');
    }
  });


router.post('/add', async (req, res) => {
    try {
      const club = new Club(req.body);
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
      res.send(club);
    } catch (error) {
      res.status(500).send();
    }
  });  
  


router.put('/update/:id', async (req, res) => {
    // const updates = Object.keys(req.body);
    // const allowedUpdates = ['name', 'description', 'members'];
    // const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  
    // if (!isValidOperation) {
    //   return res.status(400).send({ error: 'Invalid updates!' });
    // }
    // { new: true, runValidators: true } in the await Club.findByIdAndUpdate(req.params.id, req.body) after req.body
    try {
      const club = await Club.findByIdAndUpdate(req.params.id, req.body,{ new: true });
      if (!club) {
        return res.status(404).send();
      }
      res.send(club);
    } catch (error) {
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


router.put('/:clubId/:userId/join', async (req, res) => {
    try {
      const club = await Club.findByIdAndUpdate(req.params.clubId, {
        $addToSet: { members: req.params.userId }
      }, { new: true });
      if (!club) {
        return res.status(404).send({ error: 'Club not found' });
      }
      res.send(club);
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  });  
   
  









module.exports = router;