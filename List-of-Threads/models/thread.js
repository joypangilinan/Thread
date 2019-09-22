var mongoose = require('mongoose')
var Schema = mongoose.Schema
const User = require('./user')

var ThreadSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Thread', ThreadSchema)