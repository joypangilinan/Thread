var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var passport = require('passport')
var authenticate = require('../authenticate')


const User = require('../models/user')
const Thread = require('../models/thread')
router.use(bodyParser.json())
var token
var id
/* GET users listing. */


router.get('/register', function (req, res, next) {
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

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  id = req.user._id
  token = authenticate.getToken({ _id: req.user._id })
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Authorization', 'Bearer ' + token)
  // // res.json({ success: true, token: token, status: 'You are successfully login' })
  // console.log(token)
  res.redirect("/users/listthreads")
})

router.get('/listthreads', function (req, res, next) {
  Thread.find({})
    .then((thread) => {
      console.log(thread)
      //res.json(student)
      res.render('threads', { threads: thread })
    }, (err) => next(err))
    .catch((err) => next(err))
});


router.get('/listthreads/create', function (req, res, next) {

  res.header('Authorization', 'Bearer ' + token)
  User.find({})
    .then((user) => {
      console.log(user)
      //res.json(student)
      res.render('createthread', { users: user })
    }, (err) => next(err))
    .catch((err) => next(err))
  // res.render('createthread');
});

router.post('/listthreads/create', (req, res, next) => {
  console.log(id)
  const post = new Thread({
    ...req.body,
    author: id
  })
  Thread.create(post)
    .then((thread) => {
      console.log('New thread added successfully ', thread)
      res.redirect("/users/listthreads")
    }, (err) => next(err))
    .catch((err) =>
      next(err)
    )
})


router.get('/listthreads/view', function (req, res, next) {
  res.render('viewthreads', { threads: thread });
});

router.get('/listthreads/view/:threadId', function (req, res, next) {
  Thread.findOne({ _id: req.params.threadId })
    .then(thread => {
      if (thread == null) {
        err = new Error('Thread ' + req.params.threadId + ' not found')
        err.status = 404
        return next(err)
      } else {
        res.render('viewthreads', { threads: thread })
      }
    }, (err) => next(err))
    .catch((err) => next(err))
});

router.post('/listthreads/view/:threadId', function (req, res, next) {
  Thread.findById(req.params.threadId)
    .then(thread => {
      if (thread != null) {
        req.body.author = id
        thread.comments.push(req.body)
        thread.save()
          .then(dish => {
            Thread.findById(thread._id)
              .populate('comments.author')
              .then((thread) => {
                res.render('viewthreads', { threads: thread })
              })
          }, err => next(err))
      }
      else {
        err = new Error('Dish ' + req.params.threadId + ' not found')
        err.status = 404
        return next(err)
      }
    }, (err) => next(err))
    .catch((err) => next(err))
});

router.get('/logout', (req, res, next) => {
  // req.logout()
  // req.flash('success_message', 'You are logged out')
  req.logOut()
  res.redirect("/users/login")
})

module.exports = router;
