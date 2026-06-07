const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Configure Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const token = req.query.state;
        if (token) {
          try {
            const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
            let user = await User.findByPk(decoded.id);
            if (user) {
              user.googleId = profile.id;
              await user.save();
              user.isConnecting = true;
              return done(null, user);
            }
          } catch (e) {
            console.error("Token decode error during Google connect", e);
          }
        }

        let user = await User.findOne({ where: { googleId: profile.id } });
        
        if (!user) {
          // Check if email already exists
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          if (email) {
            user = await User.findOne({ where: { email } });
          }

          if (user) {
            // Link google to existing account
            user.googleId = profile.id;
            await user.save();
          } else {
            // Create new user
            const salt = await bcrypt.genSalt(10);
            const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), salt);
            
            // Generate a unique username
            let baseUsername = email ? email.split('@')[0] : profile.displayName.replace(/\s+/g, '').toLowerCase();
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ where: { username } })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }

            user = await User.create({
              name: profile.displayName || 'Google User',
              username,
              email: email || `${profile.id}@google.oauth`,
              passwordHash: randomPassword,
              googleId: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
            });
          }
        }
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  ));
}

// Configure GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your_github_client_id') {
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const token = req.query.state;
        if (token) {
          try {
            const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
            let user = await User.findByPk(decoded.id);
            if (user) {
              user.githubId = profile.id;
              await user.save();
              user.isConnecting = true;
              return done(null, user);
            }
          } catch (e) {
            console.error("Token decode error during GitHub connect", e);
          }
        }

        let user = await User.findOne({ where: { githubId: profile.id } });

        if (!user) {
          // Check if email already exists
          let email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          if (email) {
            user = await User.findOne({ where: { email } });
          }

          if (user) {
            // Link github to existing account
            user.githubId = profile.id;
            await user.save();
          } else {
            // Create new user
            const salt = await bcrypt.genSalt(10);
            const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), salt);

            // Generate a unique username
            let baseUsername = profile.username || (email ? email.split('@')[0] : `github${profile.id}`);
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ where: { username } })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }

            user = await User.create({
              name: profile.displayName || profile.username || 'GitHub User',
              username,
              email: email || `${profile.id}@github.oauth`,
              passwordHash: randomPassword,
              githubId: profile.id,
              avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
            });
          }
        }
        return done(null, user);
      } catch (error) {
        console.error('GitHub OAuth Error:', error);
        return done(error, null);
      }
    }
  ));
}

module.exports = passport;
