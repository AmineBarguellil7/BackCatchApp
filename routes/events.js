var express = require('express');
var router = express.Router();
const Event=require('../model/event');
const User = require('../model/user');
const Club = require('../model/club');

router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur serveur');
  }
});



// Create a new event
router.post('/add', async (req, res) => {
  try {
    const event = new Event(req.body);
      await event.save();
      res.status(201).send(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
  // Update an existing event
router.put('/:id', async (req, res) => {
    try {
      const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json(updatedEvent);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
// Delete an existing event
router.delete('/:id', async (req, res) => {
    try {
      const deletedEvent = await Event.findByIdAndDelete(req.params.id);
      if (!deletedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  // Get all upcoming events ordered by date
router.get('/coming', async (req, res) => {
    try {
      const comingEvents = await Event.find({ date: { $gte: new Date() } }).sort({ date: 'asc' });
      res.status(200).json(comingEvents);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  //////////number of attendees
  router.get('/:id/attendees/count', async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json({ count: event.attendees.length });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
//join an event
  router.post('/:clubId/:eventId/join/:userId', async (req, res) => {
    try {
      const club = await Club.findById(req.params.clubId);
      if (!club) {
        return res.status(404).json({ message: 'Club not found' });
      }
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      if (!club.members.includes(user._id)) {
        return res.status(400).json({ message: 'User is not a member of this club' });
      }
      const event = await Event.findById(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      if (event.attendees.includes(req.params.userId)) {
        return res.status(400).json({ message: 'User is already attending this event' });
      }
      if (event.numPlaces <= event.attendees.length) {
        return res.status(400).json({ message: 'This event is full' });
      }
      event.attendees.push(req.params.userId);
      await event.save();
      user.events.push(req.params.eventId);
      await user.save();
      res.status(200).json(event);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  



  


















module.exports = router;