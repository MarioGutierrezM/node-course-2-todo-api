const { ObjectID } = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

// return the quantity of elements removed

Todo.remove({}).then(res => {
    console.log(res);
});


// return the element deleted
Todo.findByIdAndRemove('5bb3c634c0610113fe45d02d').then(res => {
    console.log(res);
});