var express = require('express');
var router = express.Router();
const event=require('../model/event');

// Create a new event
router.post('/', async (req, res) => {
    try {
      const event = new Event({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        location: req.body.location,
        fee: req.body.fee,
        numPlaces: req.body.numPlaces,
        organizer: req.body.organizer,
        attendees: []
      });
      const newEvent = await event.save();
      res.status(201).json(newEvent);
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

  


















module.exports = router;