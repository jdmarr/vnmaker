var sql = require('./db.js');

//User object constructor
var User = function(user) {
  this.userId = user.userId;
  this.username = user.username;
  this.googleId = user.googleId;
  this.githubId = user.githubId;
};
User.createUser = function(newUser, result) {
  sql.query("INSERT INTO Users set ?", newUser, function(err, res) {

    if (err) {
      console.log("createUser error: ", err);
      result(err, null);
    } else {
      console.log("created new user with userId = ", res.insertId);
      result(null, res.insertId);
    }
  });
};
User.getUserById = function(user, result) {
  sql.query("Select * from Users where userId = ? ", user.userId, function(err, res) {
    if (err) {
      console.log("getUserById error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      result(null, resJSON[0]);

    }
  });
};
User.getUserByThirdPartyId = function(user, thirdparty, result) {
  var thirdPartyString;
  var queryId;
  if (thirdparty == 'google') {
    thirdPartyString = 'googleId';
    queryId = user.googleId;
  } else {
    thirdPartyString = 'githubId';
    queryId = user.githubId;
  }
  const queryString = "Select * from Users where " + thirdPartyString + " = ? ";
  sql.query(queryString, queryId, function(err, res) {
    if (err) {
      console.log("getUserByThirdPartyId error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      if (resJSON.length <= 1) {
        result(null, resJSON[0]);
      } else {
        multUserErr = "Found multiple users with same " + thirdPartyString;
        console.log("getUserByThirdPartyId error: ", multUserErr);
        result(multUserErr, null);
      }
    }
  });
};
User.findOrCreateByThirdPartyId = function(user, thirdparty, result) {
  User.getUserByThirdPartyId(user, thirdparty, function(err, existingUser) {
    if (err) {
      result(err, null);
    } else {
      if (existingUser) {
        // found the user in our db -> return the entry
        result(null, existingUser);
      } else {
        var newUser = user;
        User.createUser(newUser, function(err, insertId) {
          if (err) {
            result(err, null);
          } else {
            newUser.userId = insertId;
            result(null, newUser);
          }
        });
      }
    }
  });
};
User.getUserByGoogleId = function(user, result) {
  User.getUserByThirdPartyId(user, 'google', function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
User.findOrCreateByGoogleId = function(user, result) {
  User.findOrCreateByThirdPartyId(user, 'google', function(err, newOrExistingUser) {
    if (err) {
      result(err, null);
    } else {
      result(null, newOrExistingUser);
    }
  });
};
User.getUserByGitHubId = function(user, result) {
  User.getUserByThirdPartyId(user, 'github', function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};
User.findOrCreateByGitHubId = function(user, result) {
  User.findOrCreateByThirdPartyId(user, 'github', function(err, newOrExistingUser) {
    if (err) {
      result(err, null);
    } else {
      result(null, newOrExistingUser);
    }
  });
};

//Image object constructor
var Image = function(image) {
  this.imageId = image.imageId;
  this.userId = image.userId;
  this.imagePath = image.imagePath;
  this.title = image.title;
};

Image.createImage = function(newImage, result) {
  sql.query("INSERT INTO Images set ?", newImage, function(err, res) {

    if (err) {
      console.log("createImage error: ", err);
      result(err, null);
    } else {
      console.log("created new image with imageId = ", res.insertId);
      result(null, res.insertId);
    }
  });
};

Image.getImageById = function(imageId, result) {
  sql.query("Select * from Images where imageId = ? ", imageId, function(err, res) {
    if (err) {
      console.log("getImageById error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      if (resJSON.length <= 1) {
        result(null, resJSON[0]);
      } else {
        multImageErr = "Found multiple images with same imageId";
        console.log("getImageById error: ", multImageErr);
        result(multImageErr, null);
      }
    }
  });
};

Image.getImagesByUserId = function(userId, result) {
  sql.query("Select * from Images where userId = ? ", userId, function(err, res) {
    if (err) {
      console.log("getImagesByUserId error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      result(null, resJSON);
    }
  });
};

//Panel object constructor
var Panel = function(panel) {
  this.panelId = panel.panelId;
  this.userId = panel.userId;
  this.imageId = panel.imageId;
  this.text = panel.text;
  this.prevId = panel.prevId;
  this.nextId = panel.nextId;
};

Panel.getPanelById = function(panelId, result) {
  sql.query("Select * from Panels where panelId = ? ", panelId, function(err, res) {
    if (err) {
      console.log("getPanelById error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      if (resJSON.length <= 1) {
        result(null, resJSON[0]);
      } else {
        multPanelErr = "Found multiple panels with same panelId";
        console.log("getPanelById error: ", multPanelErr);
        result(multPanelErr, null);
      }
    }
  });
};

Panel.updatePanel = function(panelId, field, newFieldData, result) {
  var updateQuery = "UPDATE Panels";
  updateQuery += " SET " + field + " = " + newFieldData;
  updateQuery += " WHERE panelId = " + panelId;
  sql.query(updateQuery, function(err, res) {
    if (err) {
      console.log("updatePanel error: ", err);
      result(err, null);
    } else {
      console.log("updated panel with panelId = ", panelId);
      result(null, true);
    }
  });
};

Panel.updatePanelText = function(panelId, newPanelText, result) {
  var updateTextQuery = "UPDATE Panels";
  updateTextQuery += " SET text = '" + newPanelText + "'";
  updateTextQuery += " WHERE panelId = " + panelId;
  sql.query(updateTextQuery, function(err, res) {
    if (err) {
      console.log("updatePanelText error: ", err);
      result(err, null);
    } else {
      console.log("updated panel with panelId = ", panelId);
      result(null, true);
    }
  });
};

Panel.createPanel = function(newPanel, result) {
  sql.query("INSERT INTO Panels set ?", newPanel, function(err, res) {
    if (err) {
      console.log("createPanel error: ", err);
      result(err, null);
    } else {
      console.log("created new panel with panelId = ", res.insertId);
      result(null, res.insertId);
    }
  });
};

Panel.createPanelAndUpdateLinks = function(newPanel, result) {
  // TODO: Error handling
  const prevPanelId = newPanel.prevId;
  Panel.getPanelById(prevPanelId, function(err, prevPanel) {
    const nextPanelId = prevPanel.nextId;
    newPanel.nextId = nextPanelId;
    Panel.createPanel(newPanel, function(err, newPanelId) {
      Panel.updatePanel(prevPanelId, "nextId", newPanelId, function(err, success) {
        // nextPanelId may be null, if we are adding a panel after the current final panel
        if (nextPanelId) {
          Panel.updatePanel(nextPanelId, "prevId", newPanelId, function(err, success) {
            result(null, newPanelId);
          });
        } else {
          result(null, newPanelId);
        }
      });
    });
  });
};

Panel.createStartPanelAndUpdateLinks = function(startPanel, result) {
  // TODO: Error handling
  sql.query("Select * from Panels where prevId is NULL", function(err, res) {
    if (err) {
      console.log("getStartPanel error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      if (resJSON.length <= 1) {
        if (resJSON.length > 0){
          const nextPanelId = resJSON[0].panelId;
          startPanel.nextId = nextPanelId;
        }
        Panel.createPanel(startPanel, function(err, startPanelId) {
          if(resJSON.length > 0){
          Panel.updatePanel(nextPanelId, "prevId", startPanelId, function(err, success) {
            result(null, startPanelId);
          });}
          result(null, startPanelId);
        });
      } else {
        multPanelErr = "Found multiple panels with prevId == NULL";
        console.log("createStartPanelAndUpdateLinks error: ", multPanelErr);
        result(multPanelErr, null);
      }
    }
  });
};

Panel.deletePanel = function(panelId, result) {
  sql.query("Delete from Panels where panelId = ? ", panelId, function(err, res) {
    if (err) {
      console.log("deletePanel error: ", err);
      result(err, null);
    } else {
      console.log("deleted panel with panelId = ", panelId);
      result(null, true);
    }
  });
};

Panel.deletePanelAndUpdateLinks = function(panelId, result) {
  Panel.getPanelById(panelId, function(err, panel) {
    if (!(panel.prevId === null)) {
      Panel.updatePanel(panel.prevId, "nextId", panel.nextId, function(err, success) {
        if (!(panel.nextId === null)) {
          Panel.updatePanel(panel.nextId, "prevId", panel.prevId, function(err, success) {
            Panel.deletePanel(panelId, function(err, success) {
              result(null, success);
            });
          });
        } else {
          Panel.deletePanel(panelId, function(err, success) {
            result(null, success);
          });
        }
      });
    } else if (!(panel.nextId === null)) {
      Panel.updatePanel(panel.nextId, "prevId", panel.prevId, function(err, success) {
        Panel.deletePanel(panelId, function(err, success) {
          result(null, success);
        });
      });
    } else {
      Panel.deletePanel(panelId, function(err, success) {
        result(null, success);
      });
    }
  });
};

Panel.getPanelsByUserId = function(userId, result) {
  sql.query("Select * from Panels where userId = ? ", userId, function(err, res) {
    if (err) {
      console.log("getPanelsByUserId error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      result(null, resJSON);
    }
  });
};

Panel.getPanelsAndImagesByUserId = function(userId, result) {
  var innerJoinQuery = "SELECT Panels.panelId, Panels.text, Panels.prevId, Panels.nextId, Images.imagePath";
  innerJoinQuery += " FROM Panels";
  innerJoinQuery += " INNER JOIN Images ON Panels.imageId = Images.imageId";
  innerJoinQuery += " WHERE Panels.userId = " + userId + " AND Images.userId = " + userId;
  sql.query(innerJoinQuery, function(err, res) {
    if (err) {
      console.log("getPanelsAndImagesByUserId error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      result(null, resJSON);
    }
  });
};

module.exports = {
  User,
  Image,
  Panel
};
