var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')
const Thread = require('./thread')

var User = new Schema({
})

User.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', User)