const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');


const UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
    unique: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
  },
  activities: {
    todo: [String],
    completed: [String],
  },
});

UserSchema.plugin(uniqueValidator);

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      newUser.password = hash;
      newUser.save(callback);
    });
  });
};

module.exports.getUserByUsername = function (username, callback) {
  const query = { username };
  User.findOne(query, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;

    callback(null, isMatch);
  });
};

module.exports.getUserById = function (id, callback) {
  const query = { _id: id };
  User.findOne(query, callback);
};

module.exports.addActivity = function (username, activity, callback) {
  User.updateOne({ username }, { $push: { 'activities.todo': activity } }, callback);
};

module.exports.changeActivityStatus = function (username, activity, isComplete, callback) {
  const query = isComplete ? { $pull: { 'activities.todo': activity }, $push: { 'activities.completed': activity } } :
    { $pull: { 'activities.completed': activity }, $push: { 'activities.todo': activity } };

  User.updateOne({ username }, query, callback);
};
