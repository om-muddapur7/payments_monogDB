const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI);

const userSchema = new mongoose.Schema({
    username: String,   // email, unique
    password: String,
    firstName: String,
    lastName: String
});

const paymentSchema = new mongoose.Schema({
    userId:[mongoose.Types.ObjectId],   // reference to User
    balance: Number
});

const User = mongoose.model('User', userSchema);
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { User, Payment };