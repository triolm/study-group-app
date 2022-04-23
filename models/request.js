const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    className: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    createDate: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    isVirtual: {
        type: Boolean,
        required: true
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]

});

module.exports = mongoose.model('StudyGroup', noteSchema)

