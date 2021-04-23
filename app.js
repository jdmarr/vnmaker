require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('./model/appModel.js');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.userId);
});

passport.deserializeUser(function(id, done) {
  User.getUserById({userId: id}, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/edit"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreateByGoogleId({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/edit", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("edit");
  } else {
    res.redirect("/");
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile']
  })
);

app.get('/auth/google/edit',
  passport.authenticate('google', {
    failureRedirect: '/'
  }),
  function(req, res) {
    // Successful authentication, redirect to edit page.
    res.redirect('/edit');
  }
);

port = process.env.PORT || 3000;
app.listen(port);

console.log('VNMaker server started on: ' + port);
