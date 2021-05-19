require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const multer = require('multer');
const upload = multer({
  dest: __dirname + '/public/uploads/images'
});

const {
  User,
  Image,
  Panel
} = require('./model/appModel.js');

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
  User.getUserById({
    userId: id
  }, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://jdmarr-vnmaker.herokuapp.com/auth/google/edit"
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
    callbackURL: "https://jdmarr-vnmaker.herokuapp.com/auth/github/edit"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreateByGitHubId({
      githubId: profile.id
    }, function(err, user) {
      return done(err, user);
    });
  }
));

app.get("/", function(req, res) {
  res.render("login");
});

function sortPanelsAndImages(panelsAndImages){
  if (panelsAndImages.length > 0) {
    var panelMap = new Map();
    var firstPanel = panelsAndImages[0];
    panelsAndImages.forEach(function(panelAndImage) {
      panelMap.set(panelAndImage.panelId, panelAndImage);
      if (panelAndImage.prevId === null) {
        firstPanel = panelAndImage;
      }
    });

    var panelsAndImagesSorted = [firstPanel];
    var nextPanelId = firstPanel.nextId;
    while (!(nextPanelId === null)) {
      const nextPanel = panelMap.get(nextPanelId);
      panelsAndImagesSorted.push(nextPanel);
      nextPanelId = nextPanel.nextId;
    }
  } else {
    panelsAndImagesSorted = [];
  }

  return panelsAndImagesSorted;
};

app.get("/edit", function(req, res) {
  if (req.isAuthenticated()) {
    const userId = req.session.passport.user;
    Panel.getPanelsAndImagesByUserId(userId, function(err, panelsAndImages) {
      if (err) {
        console.log(err);
      } else {
        const panelsAndImagesSorted = sortPanelsAndImages(panelsAndImages);
        res.render("edit", {
          panelsAndImages: panelsAndImagesSorted
        });
      }
    });
  } else {
    res.redirect("/");
  }
});

app.get("/panels", function(req, res) {
  if (req.isAuthenticated()) {
    const userId = req.session.passport.user;
    Panel.getPanelsAndImagesByUserId(userId, function(err, panelsAndImages) {
      if (err) {
        console.log(err);
      } else {
        const panelsAndImagesSorted = sortPanelsAndImages(panelsAndImages);
        res.render("panels", {
          panelsAndImages: panelsAndImagesSorted
        });
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
  passport.authenticate('github', {
    scope: ['user:email']
  }));

app.get('/auth/github/edit',
  passport.authenticate('github', {
    failureRedirect: '/'
  }),
  function(req, res) {
    // Successful authentication, redirect to edit page.
    res.redirect('/edit');
  });

app.get('/panels/:panelId', function(req, res) {
  if (req.isAuthenticated()) {
    const panelId = req.params.panelId;
    Panel.getPanelById(panelId, function(err, panel) {
      if (err) {
        console.log(err);
      } else {
        if (panel) {
          Image.getImageById(panel.imageId, function(err, image) {
            if (err) {
              console.log(err);
            } else {
              if (image) {
                res.render('panel', {
                  panelText: panel.text,
                  imagePath: image.imagePath,
                  panelId: panel.panelId
                });
              } else {
                console.log('Error: found panel but no associated image.');
                res.redirect('/edit');
              }
            }
          });
        } else {
          res.redirect('/edit');
        }
      }
    });
  } else {
    res.redirect("/");
  }
});

app.post('/panels/:panelId', function(req, res) {
  if (req.isAuthenticated()) {
    console.log(req.body._method + " panel " + req.params.panelId + ":");
    if (req.body._method == 'patch') {
      Panel.updatePanelText(req.params.panelId, req.body.newPanelText, function(err, success) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/panels/" + req.params.panelId);
        }
      });
    } else {
      Panel.deletePanelAndUpdateLinks(req.params.panelId, function(err, success) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/edit");
        }
      });
    }
  } else {
    res.redirect("/");
  }
});

app.post('/images', upload.single('photo'), function(req, res) {
  if (req.isAuthenticated()) {
    if (req.file) {
      Image.createImage({
        userId: req.body.userId,
        imagePath: req.file.filename,
        title: req.body.imageTitle
      }, function(err, insertId) {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/edit');
        }
      });
    } else {
      console.log("Failed to upload image.");
      console.log("Request body:");
      console.log(req.body);
      console.log("File:");
      console.log(req.file);
      res.redirect("/upload-failure");
    };
  } else {
    res.redirect("/");
  }
});

app.get('/upload-failure', function(req, res){
  if (req.isAuthenticated()) {
    res.render("upload-failure");
  } else {
    res.redirect("/");
  }
});

app.get("/new-image", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("new-image", {
      userId: req.session.passport.user
    });
  } else {
    res.redirect("/");
  }
});

app.get("/new-panel", function(req, res) {
  if (req.isAuthenticated()) {
    Image.getImagesByUserId(req.session.passport.user, function(err, images) {
      res.render("new-panel", {
        images: images,
        userId: req.session.passport.user,
        prevPanelId: req.query.prevPanelId
      });
    });
  } else {
    res.redirect("/");
  }
});

app.post("/panels", function(req, res) {
  if (req.isAuthenticated()) {
    if (req.body.prevPanelId >= 0) {
      Panel.createPanelAndUpdateLinks({
        userId: req.body.userId,
        imageId: req.body.imageId,
        text: req.body.panelText,
        prevId: req.body.prevPanelId
      }, function(err, insertId) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/edit");
        }
      });
    } else {
      Panel.createStartPanelAndUpdateLinks({
        userId: req.body.userId,
        imageId: req.body.imageId,
        text: req.body.panelText,
      }, function(err, insertId) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/edit");
        }
      });
    }
  } else {
    res.redirect("/");
  }
});

port = process.env.PORT || 3000;
app.listen(port);

console.log('VNMaker server started on: ' + port);
