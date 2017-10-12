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

router.post('/register', (req, res) => {
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

    User.createUser(newUser, (err, user) => {
      if (err) {
        req.flash('error_msg', 'User with such data is registered');
        return res.redirect('/users/register');
      }
      req.flash('success_msg', 'You are registered and can login now!');

      res.redirect('/users/login');
    });
  }
});

passport.use(new LocalStrategy(((username, password, done) => {
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;

    if (!user) {
      return done(null, false, { message: 'Unknown User' });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { message: 'Invalid password' });
    });
  });
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

router.post('/addActivity', (req, res) => {
  User.addActivity(req.user.username, req.body.activity, (err) => {
    if (err) {
      req.flash('error_msg', 'Something wrong(');
      return res.redirect('/');
    }
    req.flash('success_msg', 'Success add!');
    res.redirect('/');
  });
});

module.exports = router;
