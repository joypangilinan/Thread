var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')
const Thread = require('./thread')

var User = new Schema({
    admin: {
        type: Boolean,
        default: false
    }

})

User.virtual('listthreads', {
    ref: 'Thread',
    localField: '_id',
    foreignField: 'author'
})
User.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', User)