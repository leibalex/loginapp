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

const User = mongoose.model('User', UserSchema);
module.exports = User;

module.exports.createUser = async function (newUser) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newUser.password, salt);

    User.password = hash;
    const user = newUser.save();

    return user;
  } catch (error) {
    throw new Error('Error with adding new User');
  }
};

User.getUserByUsername = async function (username) {
  const query = { username };

  try {
    const user = await User.findOne(query);

    return user;
  } catch (error) {
    throw new Error('Ошибка получения пользователя');
  }
};

module.exports.comparePassword = async function (candidatePassword, hash) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, hash);

    return isMatch;
  } catch (error) {
    throw new Error('Ошибка сравнения пароля');
  }
};

module.exports.getUserById = function (id, callback) {
  const query = { _id: id };
  User.findOne(query, callback);
};

module.exports.addActivity = async function (username, activity) {
  try {
    const result = await User.updateOne({ username }, { $push: { 'activities.todo': activity } });

    return result;
  } catch (error) {
    throw new Error('Ошибка добавления задачи');
  }
};

module.exports.changeActivityStatus = function (username, activity, isTodoTask, callback) {
  const query = isTodoTask ? { $pull: { 'activities.todo': activity }, $push: { 'activities.completed': activity } } :
    { $pull: { 'activities.completed': activity }, $push: { 'activities.todo': activity } };
  console.log(isTodoTask);
  console.log(activity);
  console.log(query);

  User.updateOne({ username }, query, callback);
};
