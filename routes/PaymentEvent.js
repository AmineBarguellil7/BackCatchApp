const express = require('express');
const axios = require('axios');
const Event = require('../model/event');
const User = require('../model/user');

// Define router
const router = express.Router();

// Define route handlers
const createPayment = async (req, res) => {
  const { eventId, userId } = req.params;
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).send({ error: 'Event not found' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }

  const url = 'https://developers.flouci.com/api/generate_payment';
  const payload = {
    app_token: '38c0e96d-6639-49b8-aee2-db06427290ab',
    app_secret: '2e53661b-14dc-4c90-8586-f52c2bd30ad9',
    accept_card: true,
    amount: 10000,
    success_link: `http://localhost:3000/ValidateEvtPayment`,
    fail_link: `http://localhost:3001/fail/${eventId}/${userId}`,
    session_timeout_secs: 1200, 
    developer_tracking_id: '4422763e-4df5-4f25-aa17-0ee7541ccc76'
  };

  try {
    const result = await axios.post(url, payload);
    res.send(result.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating payment');
  }
};

const verifyPayment = async (req, res) => {
  const paymentId = req.params.id;

  try {
    const result = await axios.get(`https://developers.flouci.com/api/verify_payment/${paymentId}`, {
      headers: {
        'Content-Type': 'application/json',
        apppublic: '38c0e96d-6639-49b8-aee2-db06427290ab',
        appsecret: '2e53661b-14dc-4c90-8586-f52c2bd30ad9'
      }
    });

    const { eventId, userId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send({ error: 'Event not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (result.data.success) {
      try {
        const savedUser = await user.save();
        const savedEvent = await event.save();
        savedUser.events.addToSet(savedEvent._id);
        await savedUser.save();
        savedEvent.attendees.addToSet(savedUser._id);
        await savedEvent.save();
        res.send({ message: 'Payment verified and user registered for the event.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving documents');
      }
     }} catch (err) {
console.error(err);
res.status(500).send('Error verifying payment');
}
};
  router.post('/:eventId/:userId/payment', createPayment);
  router.post('/:eventId/:userId/payment/:id', verifyPayment);
  
  // Export router
  module.exports = router;

