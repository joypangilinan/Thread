var mongoose = require('mongoose')
var Schema = mongoose.Schema

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
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Thread'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Comment', CommentSchema)