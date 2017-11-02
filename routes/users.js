const express = require('express');

const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');


router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/register', async (req, res) => {
  const {
    name, email, username, password,
  } = req.body;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    res.render('register', { errors });
  } else {
    const newUser = new User({
      name,
      email,
      username,
      password,
      activities: [],
    });

    try {
      await User.createUser(newUser);
      req.flash('success_msg', 'You are registered and can login now!');

      res.redirect('/users/login');
    } catch (error) {
      req.flash('error_msg', 'User with such data is registered');
      res.redirect('/users/register');
    }
  }
});

passport.use(new LocalStrategy((async (username, password, done) => {
  try {
    const user = await User.getUserByUsername(username);

    if (!user) {
      return done(null, false, { message: 'Unknown User' });
    }

    const isMatch = await User.comparePassword(password, user.password);

    if (isMatch) {
      return done(null, user);
    }
    return done(null, false, { message: 'Invalid password' });
  } catch (error) {
    console.error(error.message);
  }
})));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(err, user);
  });
});

router.post(
  '/login',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
  (req, res) => {
    res.render('index');
  },
);

router.get('/logout', (req, res) => {
  req.logout();

  req.flash('success_msg', 'You are logout');

  res.redirect('/users/login');
});

router.post('/addActivity', async (req, res) => {
  try {
    await User.addActivity(req.user.username, req.body.activity);
    req.flash('success_msg', `Success add ${req.body.activity}!`);
    res.redirect('/');
  } catch (error) {
    console.err(`${error.code} : ${error.message}`);
    req.flash('error_msg', 'Error adding activity');
  }
});

router.get('/changeActivityStatus', (req, res) => {
  // User.changeActivityStatus(req.user.username, req.body.activity, req.body.isTodoTask, (err) => {
  //   if (err) {
  //     req.flash('error_msg', 'Something wrong(');
  //     return res.redirect('/');
  //   }
  //
  // });
  console.log('success');
  res.redirect('https://www.google.com.ua');
});

module.exports = router;
