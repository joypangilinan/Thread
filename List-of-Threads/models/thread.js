var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')
const User = require('./user')
const Comment = require('./comment')

var ThreadSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    img: {
        data: Buffer,
        contentType: String,
        required: false
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

ThreadSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'threadId'
})
ThreadSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('Thread', ThreadSchema)