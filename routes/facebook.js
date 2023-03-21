const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const User = require('../model/user');

const router = express.Router();
require('dotenv').config();

passport.use(
  new FacebookStrategy(
    {
      clientID: '596195962421966',
      clientSecret: '7c8eb3914855c283844d3f2863502c34',
      callbackURL: 'http://localhost:3001/auth/facebook/callback',
    },
    async function (accessToken, refreshToken, profile, cb) {
      const user = await User.findOne({
        accountId: profile.id,
        provider: 'facebook',
      });
      if (!user) {
        console.log('Adding new facebook user to DB..');
        const nameArray = profile.displayName.split(' ');
        const user = new User({
            fname: nameArray[0],
            lname: nameArray[nameArray.length - 1],
            provider: profile.provider,
            isActivated: true
        });
        await user.save();
        // console.log(user);
        return cb(null, profile);
      } else {
        console.log('Facebook User already exist in DB..');
        // console.log(profile);
        return cb(null, profile);
      }
    }
  )
);

router.get('/', passport.authenticate('facebook', { scope: 'email' }));

router.get(
  '/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/error',
  }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect('/auth/facebook/success');
  }
);

router.get('/success', async (req, res) => {
  const userInfo = {

    displayName: req.session.passport.user.displayName,
    provider: req.session.passport.user.provider,
  };
  res.render('fb-github-success', { user: userInfo });
});

router.get('/error', (req, res) => res.send('Error logging in via Facebook..'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('session destroyed.');
    });
    res.render('auth');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out fb user' });
  }
});

module.exports = router;