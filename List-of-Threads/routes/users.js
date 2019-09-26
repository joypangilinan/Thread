var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var passport = require('passport')
var authenticate = require('../authenticate')
const multer = require('multer')
var fs = require('fs');

const User = require('../models/user')
const Thread = require('../models/thread')
router.use(bodyParser.json())
var token
var id

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('You can only upload image files!'), false)
  }
  cb(null, true)
}

//image path
var imgPath = 'public/images'

const upload = multer({ storage: storage, fileFilter: imageFileFilter })
var uploads = upload.single('imageFile')


router.get('/register', function (req, res, next) {
  res.render('register');
});
router.post('/register', function (req, res, next) {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        err = new Error('A user with the given username is already registered')
        return next(err)
      }
      else {
        passport.authenticate('local')(req, res, () => {
          console.log('Registration Successful')
          res.redirect("/users/login")
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
  res.cookie('token', token)
  res.redirect("/users/listthreads")
})

router.get('/listthreads', authenticate.verifyUser, function (req, res, next) {
  Thread.find({})
    .populate('author')
    .then((thread) => {
      console.log(thread)
      //res.json(student)
      res.render('threads', { threads: thread })
    }, (err) => next(err))
    .catch((err) => next(err))
});


router.get('/listthreads/create', authenticate.verifyUser, function (req, res, next) {
  User.find({})
    .then((user) => {
      console.log(user)
      res.render('createthread', { users: user })
    }, (err) => next(err))
    .catch((err) => next(err))
});

router.post('/listthreads/create', authenticate.verifyUser, (req, res, next) => {
  uploads(req, res, function (err) {
    if (err) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json('Maximum of 1 upload only')
      return
    } else {
      var imageFile = req.file.originalname
      if (req.file != undefined) {
        var imageDetails = new Thread({
          ...req.body,
          img: imageFile,
          author: req.user._id
        })
      } else {
        var imageDetails = new Thread({
          ...req.body,
          author: req.user._id
        })
      }

      Thread.create(imageDetails)
        .then((thread) => {
          console.log('New thread added successfully ', thread)
          res.redirect("/users/listthreads")
        }, (err) => next(err))
        .catch((err) =>
          next(err)
        )
      console.log('success')
    }
  })



})
router.get('/listthreads/view', authenticate.verifyUser, function (req, res, next) {
  res.render('viewthreads', { threads: thread });
});

router.get('/listthreads/view/:threadId', authenticate.verifyUser, function (req, res, next) {
  Thread.findOne({ _id: req.params.threadId })
    .populate('author')
    .populate('comments.author')
    .then(thread => {
      if (thread == null) {
        err = new Error('Thread ' + req.params.threadId + ' not found')
        err.status = 404
        return next(err)
      } else {
        res.render('viewthreads', { threads: thread, ids: id })
      }
    }, (err) => next(err))
    .catch((err) => next(err))
});

router.post('/listthreads/view/:threadId', authenticate.verifyUser, function (req, res, next) {
  Thread.findById(req.params.threadId)
    .then(thread => {
      if (thread != null) {
        req.body.author = id
        thread.comments.push(req.body)
        thread.save()
          .then(thread => {
            Thread.findById(thread._id)
              .populate('comments.author')
              .then((thread) => {
                res.render('viewthreads', { threads: thread, ids: id })
              })
          }, err => next(err))
      }
      else {
        err = new Error('Thread ' + req.params.threadId + ' not found')
        err.status = 404
        return next(err)
      }
    }, (err) => next(err))
    .catch((err) => next(err))
});

router.get('/edit/:threadId', authenticate.verifyUser, (req, res, next) => {
  Thread.findOne({ _id: req.params.threadId })
    .then(thread => {
      if (thread == null) {
        err = new Error('Thread ' + req.params.threadId + ' not found')
        err.status = 404
        return next(err)
      } else {
        res.render('editthread', { threads: thread })
      }
    }, (err) => next(err))
    .catch((err) => next(err))
})

router.post('/edit/:threadId', authenticate.verifyUser, (req, res, next) => {
  Thread.findByIdAndUpdate(req.params.threadId, {
    $set: req.body,
  }, { new: true })
    .then(thread => {
      console.log(thread)
      res.redirect("/users/listthreads/view/" + req.params.threadId)
    }, (err) => next(err))
    .catch((err) => next(err))
})

router.get('/delete/:threadId', authenticate.verifyUser, (req, res, next) => {
  Thread.findById(req.params.threadId)
    .then(resp => {
      if (resp == null) {
        err = new Error('Thread ' + req.params.threadId + ' not found')
        err.status = 404
        return next(err)
      } else {
        resp.remove()
        resp.save()
          .then(thread => {
            console.log("successfully deleted!")
            res.redirect("/users/listthreads")
          }, err => next(err))

      }
    }, (err) => next(err))
    .catch((err) => next(err))
})

router.get('/edit/:threadId/comments/:commentId', authenticate.verifyUser, (req, res, next) => {
  Thread.findById(req.params.threadId)
    .populate('comments.author')
    .then(thread => {
      var index = thread.comments.indexOf(thread.comments.id(req.params.commentId))
      console.log(thread.comments[index].comment)
      if (thread != null && thread.comments.id(req.params.commentId) != null) {
        res.render('editcomment', { threads: thread.comments[index].comment })
      }
      else if (thread == null) {
        err = new Error('Comment ' + req.params.threadId + ' not found')
        err.status = 404
        return next(err)
      }
      else {
        err = new Error('Comment ' + req.params.commentId + ' not found')
        err.status = 404
        return next(err)
      }
    }, (err) => next(err))
    .catch((err) => next(err))
})

router.post('/edit/:threadId/comments/:commentId', authenticate.verifyUser, (req, res, next) => {
  Thread.findById(req.params.threadId)
    .then(thread => {
      if (thread != null && thread.comments.id(req.params.commentId) != null) {
        if (req.body.comment) {
          thread.comments.id(req.params.commentId).comment = req.body.comment
        }
        thread.save()
          .then(thread => {
            Thread.findById(thread._id)
              .populate('comments.author')
              .then((thread) => {
                res.redirect('/users/listthreads/view/' + req.params.threadId)
              })
          }, err => next(err))
      }
      else if (thread == null) {
        err = new Error('Thread ' + req.params.threadId + ' not found')
        err.status = 404
        return next(err)
      }
      else {
        err = new Error('Comment ' + req.params.commentId + ' not found')
        err.status = 404
        return next(err)
      }
    }, (err) => next(err))
    .catch((err) => next(err))
})

router.get('/delete/:threadId/comments/:commentId', authenticate.verifyUser, (req, res, next) => {
  Thread.findById(req.params.threadId)
    .then(thread => {
      if (thread != null && thread.comments.id(req.params.commentId) != null) {
        thread.comments.id(req.params.commentId).remove();
        thread.save()
          .then(thread => {
            Thread.findById(thread._id)
              .populate('comments.author')
              .then((thread) => {
                res.redirect('/users/listthreads/view/' + req.params.threadId)
              })
          }, err => next(err))
      }
      else if (thread == null) {
        err = new Error('Thread ' + req.params.threadId + ' not found')
        err.status = 404
        return next(err)
      }
      else {
        err = new Error('Comment ' + req.params.commentId + ' not found')
        err.status = 404
        return next(err)
      }
    }, (err) => next(err))
    .catch((err) => next(err))
})

router.get('/logout', (req, res, next) => {
  res.clearCookie('token')
  req.logOut()
  res.redirect("/users/login")
})

module.exports = router;
