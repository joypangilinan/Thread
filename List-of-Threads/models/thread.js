var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')
const User = require('./user')

var CommentSchema = new Schema({
    comment: {
        type: String,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

var ThreadSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    img: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comments: [CommentSchema]
})


module.exports = mongoose.model('Thread', ThreadSchema)