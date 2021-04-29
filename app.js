require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const multer = require('multer');
const upload = multer({dest: __dirname + '/public/uploads/images'});

const {User, Image, Panel} = require('./model/appModel.js');

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
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/edit"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreateByGitHubId({ githubId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/edit", function(req, res) {
  if (req.isAuthenticated()) {
    const userId = req.session.passport.user;
    Panel.getPanelsAndImagesByUserId(userId, function(err, panelsAndImages){
      if(err){
        console.log(err);
      }
      else{
        res.render("edit", {userId: userId, panelsAndImages: panelsAndImages});
      }
    });
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

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/edit',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect to edit page.
    res.redirect('/edit');
});

app.post('/upload', upload.single('photo'), function(req, res) {
    if(req.file) {
      // TODO: Check image is valid
      // TODO: Check title isn't a duplicate
        Image.createImage({userId: req.body.userId, imagePath: req.file.filename, title: req.body.imageTitle}, function(err, insertId){
          if(err){
            console.log(err);
          }
          else{
            res.redirect('/edit');
          }
        });
    }
    else throw 'error';
});

app.get("/new-panel", function(req, res){
  if (req.isAuthenticated()) {
    Image.getImagesByUserId(req.session.passport.user, function(err, images){
      res.render("new-panel", {images: images, userId: req.session.passport.user});
    });
  } else {
    res.redirect("/");
  }
});

app.post("/new-panel", function(req, res){
  console.log(req.body);
  Panel.createPanel({userId:req.body.userId, imageId: req.body.imageId, text: req.body.panelText}, function(err, insertId){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/edit");
    }
  });
});

port = process.env.PORT || 3000;
app.listen(port);

console.log('VNMaker server started on: ' + port);
