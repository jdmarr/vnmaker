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

User.getUser = function(user, column, result) {
  var columnString;
  var queryId;
  if (column == 'id') {
    columnString = 'userId';
    queryId = user.userId;
  } else if (column == 'google') {
    columnString = 'googleId';
    queryId = user.googleId;
  } else {
    columnString = 'githubId';
    queryId = user.githubId;
  }
  const queryString = "Select * from Users where " + columnString + " = ? ";
  sql.query(queryString, queryId, function(err, res) {
    if (err) {
      console.log("getUser error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      if (resJSON.length <= 1) {
        result(null, resJSON[0]);
      } else {
        multUserErr = "Found multiple users with same " + columnString;
        console.log("getUser error: ", multUserErr);
        result(multUserErr, null);
      }
    }
  });
};

User.getUserById = function(user, result) {
  User.getUser(user, 'id', function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

User.findOrCreateByThirdPartyId = function(user, thirdparty, result) {
  User.getUser(user, thirdparty, function(err, existingUser) {
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
  User.getUser(user, 'google', function(err, res) {
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
  User.getUser(user, 'github', function(err, res) {
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
  Panel.updatePanel(panelId, 'text', newPanelText, function(err, res) {
    if (err) {
      result(err, null);
    } else {
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
  const prevPanelId = newPanel.prevId;
  Panel.getPanelById(prevPanelId, function(err, prevPanel) {
    if (err) {
      result(err, null);
    } else {
      const nextPanelId = prevPanel.nextId;
      newPanel.nextId = nextPanelId;
      Panel.createPanel(newPanel, function(err, newPanelId) {
        if (err) {
          result(err, null);
        } else {
          Panel.updatePanel(prevPanelId, "nextId", newPanelId, function(err, success) {
            if (err) {
              result(err, null);
            } else {
              // nextPanelId may be null, if we are adding a panel after the current final panel
              if (nextPanelId) {
                Panel.updatePanel(nextPanelId, "prevId", newPanelId, function(err, success) {
                  if (err) {
                    result(err, null);
                  } else {
                    result(null, newPanelId);
                  }
                });
              } else {
                result(null, newPanelId);
              }
            }
          });
        }
      });
    }
  });
};

Panel.createStartPanelAndUpdateLinks = function(startPanel, result) {
  sql.query("Select * from Panels where prevId is NULL AND userId = ? ", startPanel.userId, function(err, res) {
    if (err) {
      console.log("createStartPanelAndUpdateLinks error: ", err);
      result(err, null);
    } else {
      const resJSON = JSON.parse(JSON.stringify(res));
      if (resJSON.length <= 1) {
        if (resJSON.length > 0) {
          startPanel.nextId = resJSON[0].panelId;
        }
        Panel.createPanel(startPanel, function(err, startPanelId) {
          if (resJSON.length > 0) {
            Panel.updatePanel(resJSON[0].panelId, "prevId", startPanelId, function(err, success) {
              result(null, startPanelId);
            });
          } else {
            result(null, startPanelId);
          }
        });
      } else {
        multPanelErr = "Found multiple panels with userId = " + startPanel.userId + " AND prevId == NULL";
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
    if (err) {
      result(err, null);
    } else {
      if (!(panel.prevId === null)) {
        Panel.updatePanel(panel.prevId, "nextId", panel.nextId, function(err, success) {
          if (err) {
            result(err, null);
          } else {
            if (!(panel.nextId === null)) {
              Panel.updatePanel(panel.nextId, "prevId", panel.prevId, function(err, success) {
                if (err) {
                  result(err, null);
                } else {
                  Panel.deletePanel(panelId, function(err, success) {
                    if (err) {
                      result(err, null);
                    } else {
                      result(null, success);
                    }
                  });
                }
              });
            } else {
              Panel.deletePanel(panelId, function(err, success) {
                if (err) {
                  result(err, null);
                } else {
                  result(null, success);
                }
              });
            }
          }
        });
      } else if (!(panel.nextId === null)) {
        Panel.updatePanel(panel.nextId, "prevId", panel.prevId, function(err, success) {
          if (err) {
            result(err, null);
          } else {
            Panel.deletePanel(panelId, function(err, success) {
              if (err) {
                result(err, null);
              } else {
                result(null, success);
              }
            });
          }
        });
      } else {
        Panel.deletePanel(panelId, function(err, success) {
          if (err) {
            result(err, null);
          } else {
            result(null, success);
          }
        });
      }
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
