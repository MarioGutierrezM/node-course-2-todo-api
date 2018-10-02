const { ObjectID } = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

const TODO_ID = '5bb293196129fa195ac248ed';
const USER_ID = '5bb27529a22722120953460a';

if (!ObjectID.isValid(TODO_ID)) {
    console.log('Id not valid');
}

// return an array
Todo.find({ _id: TODO_ID }).then(docs => {
    console.log('');
    console.log('Todos', docs)
});

//return the object
Todo.findOne({ _id: TODO_ID }).then(doc => {
    console.log('');
    console.log('Todo', doc)
});

// search a specific id
Todo.findById(TODO_ID).then(doc => {
    console.log('');
    if(!doc) {
        return  console.log('id not found')
    }
    console.log('Todo', doc)
}).catch(err => console.log(err));

User.findById(USER_ID).then(user => {
    console.log('');
    if (!user) {
        return console.log('User not found');
    }
    console.log('User', user);
}).catch(err => console.log(err));

