var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var passport = require('passport')
var authenticate = require('../authenticate')

const User = require('../models/user')
const Thread = require('../models/thread')
router.use(bodyParser.json())

/* GET users listing. */


router.get('/register', function(req, res, next) {
  res.render('register');
});
router.post('/register', function (req, res, next) {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({ err: err })
      }
      else {
        passport.authenticate('local')(req, res, () => {
          console.log('Registration Successful')
          res.redirect("/users/login")
          // res.statusCode = 200
          // res.setHeader('Content-Type', 'application/json')
          // res.json({ success: true, status: 'Registration Successful' })
        })
      }
    })
})

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({ _id: req.user_id })
  res.statusCode = 200
  // res.setHeader('Content-Type', 'application/json')
  // res.json({ success: true, token: token, status: 'You are successfully login' })
  console.log(token)
  res.redirect("/users/listthreads")
  
})

router.get('/listthreads', function(req, res, next) {
    Thread.find({})
    .then((thread) => {
        console.log(thread)
        //res.json(student)
        res.render('threads', { threads: thread })
    }, (err) => next(err))
    .catch((err) => next(err))
});


router.get('/listthreads/create', function(req, res, next) {
  res.render('createthread');
});

router.post('/listthreads/create', (req, res, next) => {
  // Thread.create(req.body)
  //     .then((thread) => {
  //         console.log('New thread added successfully ', thread)
  //         res.redirect("/listthreads")
  //     }, (err) => next(err))
  //     .catch((err) => next(err))
      Thread.create(req.body)
      .then(thread => {
          console.log('Thread Created ', thread)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(thread)
      }, (err) => next(err))
      .catch((err) => next(err))
})


router.get('/listthreads/view', function(req, res, next) {
  res.render('viewthreads');
});

router.get('/logout', (req, res, next) => {
  // req.logout()
  // req.flash('success_message', 'You are logged out')
  res.redirect("/users/login")
})

module.exports = router;
