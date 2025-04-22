const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario existente
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (!user) {
        // Crear usuario temporal si no existe
        user = {
          email: profile.emails[0].value,
          name: profile.name.givenName,
          lastName: profile.name.familyName,
          googleId: profile.id,
          status: 'pendiente',
          requiresAdditionalInfo: true // Marcar que necesita completar datos
        };
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));