var sql = require('./db.js');

//User object constructor
var User = function(user){
    this.userId = user.userId;
    this.username = user.username;
    this.googleId = user.googleId;
    this.githubId = user.githubId;
};
User.createUser = function (newUser, result) {
        sql.query("INSERT INTO Users set ?", newUser, function (err, res) {

                if(err) {
                    console.log("createUser error: ", err);
                    result(err, null);
                }
                else{
                  console.log("createUser result: ", res);
                    result(null, res.insertId);
                }
            });
};
User.getUserById = function (user, result) {
        sql.query("Select * from Users where userId = ? ", user.userId, function (err, res) {
                if(err) {
                    console.log("getUserById error: ", err);
                    result(err, null);
                }
                else{
                  const resJSON = JSON.parse(JSON.stringify(res));
                  console.log("getUserById result: ", resJSON[0]);
                    result(null, resJSON[0]);

                }
            });
};
User.getUserByGoogleId = function (user, result) {
        sql.query("Select * from Users where googleId = ? ", user.googleId, function (err, res) {
                if(err) {
                    console.log("getUserByGoogleId error: ", err);
                    result(err, null);
                }
                else{
                  const resJSON = JSON.parse(JSON.stringify(res));
                  if(resJSON.length <= 1){
                    console.log("getUserByGoogleId result: ", resJSON[0]);
                    result(null, resJSON[0]);
                  }
                  else{
                    multUserErr = "Found multiple users with same googleId."
                    console.log("getUserByGoogleId error: ", multUserErr);
                    result(multUserErr, null);
                  }
                }
            });
};
User.findOrCreateByGoogleId = function (user, result) {
        User.getUserByGoogleId(user, function(err, existingUser){
          if(err){
            result(err, null);
          }
          else{
            if(existingUser){
              // found the user in our db -> return the entry
              result(null, existingUser);
            }
            else{
              var newUser = user;
              User.createUser(newUser, function(err, insertId){
                if(err) {
                    result(err, null);
                }
                else{
                    newUser.userId = insertId;
                    result(null, newUser);
                }
              });
            }
          }
        });
};
User.getUserByGitHubId = function (user, result) {
        sql.query("Select * from Users where githubId = ? ", user.githubId, function (err, res) {
                if(err) {
                    console.log("getUserByGitHubId error: ", err);
                    result(err, null);
                }
                else{
                  const resJSON = JSON.parse(JSON.stringify(res));
                  if(resJSON.length <= 1){
                    console.log("getUserByGitHubId result: ", resJSON[0]);
                    result(null, resJSON[0]);
                  }
                  else{
                    multUserErr = "Found multiple users with same githubId."
                    console.log("getUserByGitHubId error: ", multUserErr);
                    result(multUserErr, null);
                  }
                }
            });
};
User.findOrCreateByGitHubId = function (user, result) {
        User.getUserByGitHubId(user, function(err, existingUser){
          if(err){
            result(err, null);
          }
          else{
            if(existingUser){
              // found the user in our db -> return the entry
              result(null, existingUser);
            }
            else{
              var newUser = user;
              User.createUser(newUser, function(err, insertId){
                if(err) {
                    console.log("findOrCreateByGitHubId: createUser error: ", err);
                    result(err, null);
                }
                else{
                  newUser.userId = insertId;
                  result(null, newUser);
                }
              });
            }
          }
        });
};
// Task.getAllTask = function (result) {
//         sql.query("Select * from tasks", function (err, res) {
//
//                 if(err) {
//                     console.log("error: ", err);
//                     result(null, err);
//                 }
//                 else{
//                   console.log('tasks : ', res);
//
//                  result(null, res);
//                 }
//             });
// };
// Task.updateById = function(id, task, result){
//   sql.query("UPDATE tasks SET task = ? WHERE id = ?", [task.task, id], function (err, res) {
//           if(err) {
//               console.log("error: ", err);
//                 result(null, err);
//              }
//            else{
//              result(null, res);
//                 }
//             });
// };
// Task.remove = function(id, result){
//      sql.query("DELETE FROM tasks WHERE id = ?", [id], function (err, res) {
//
//                 if(err) {
//                     console.log("error: ", err);
//                     result(null, err);
//                 }
//                 else{
//
//                  result(null, res);
//                 }
//             });
// };

module.exports= User;
