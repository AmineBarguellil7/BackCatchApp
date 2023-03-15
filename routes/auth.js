const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../model/user');

const GOOGLE_CLIENT_ID = '982763108071-o9663lpdsg3b1qjibp6pj1ib4lm0r7p3.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/auth/google/callback",
  passReqToCallback: true,
},
function(request, accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});