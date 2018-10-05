const mongoose = require('mongoose');

const TodoModel = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minlegth: 1,
        trim: true // trim remove unnecessary spaces
    },
    completed: {
        type: Boolean,
        default: false // default value
    },
    completedAt: {
        type: Number, 
        default: null
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

module.exports = {
    TodoModel
};