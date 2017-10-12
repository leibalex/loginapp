const express = require('express');

const router = express.Router();

function ensureAuthenticate(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'You are not logged in');
  res.redirect('/users/login');
}

router.get('/', ensureAuthenticate, (req, res) => {
  res.render('index', { activities: req.user.activities, username: req.user.username });
});


module.exports = router;
