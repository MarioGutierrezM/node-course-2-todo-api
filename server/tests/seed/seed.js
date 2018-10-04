const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { TodoModel } = require('../../models/todo');
const { UserModel } = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
        _id: userOneId,
        email: 'mario@exp.com',
        password: 'pass123*',
        tokens: [{
            access: 'auth',
            token: jwt.sign({ _id: userOneId, access: 'auth' }, 'abc123').toString()
        }]
    }, {
        _id: userTwoId,
        email: 'mario2@exp.com',
        password: 'pass123*'
    }
];

const todos = [
    { _id: new ObjectID(), text: '1st tes' },
    { _id: new ObjectID(), text: '2nd test', completedAt: 333, completed: true }
];

//clean and fill database
const populateTodos = (done) => {
    // remove -> deleteMany
    TodoModel.deleteMany({}).then(() => {
        return TodoModel.insertMany(todos);
    }).then(() => done());
};

const populateUsers = (done) => {
    UserModel.deleteMany({}).then(() => {
        const userOne = new UserModel(users[0]).save();
        const userTwo = new UserModel(users[1]).save();
        return Promise.all([ userOne, userTwo ]);
    }).then(() => done());
};

module.exports = {
    populateTodos,
    todos,
    users,
    populateUsers
};