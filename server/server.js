const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
const morgan = require('morgan');

const { mongoose } = require('./db/mongoose');
const { TodoModel } = require('./models/todo');
const { UserModel } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
// app.use(morgan('tiny')); // comment it when tests are going to be runned

// *** todos routes ***
app.post('/todos', authenticate, (req, res) => {
    const todo = new TodoModel({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save()
        .then((doc) => res.status(200).send(doc))
        .catch(err => res.status(404).send(err));
});

app.get('/todos', authenticate, (req, res) => {
    TodoModel.find({ _creator: req.user._id }).then(todos => {
        res.status(200).send({ todos });
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    const ID = req.params.id;
    if (!ObjectID.isValid(ID)) {
        return res.status(404).send({ error: 'Invalid ID' });
    }

    TodoModel.findOne({ _id: ID, _creator: req.user._id }).then(todo => {
        (todo) ? res.status(200).send({ todo }) : res.status(404).send({});
    }).catch(e => res.status(400).send({ error: e }));
});

app.delete('/todos/:id', authenticate, (req, res) => {
    const ID = req.params.id;
    if (!ObjectID.isValid(ID)) {
        return res.status(404).send({ error: 'Invalid ID' });
    }

    TodoModel.findOneAndRemove({ _id: ID, _creator: req.user._id }).then(todo => {
        (todo) ? res.status(200).send({ todo }) : res.status(404).send({}) ;
    }).catch(err => res.status(400).send({ err }));
});

app.patch('/todos/:id', authenticate, (req, res) => {
    const ID = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(ID)) {
        return res.status(404).send({ error: 'Invalid ID' });
    }

    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    TodoModel.findOneAndUpdate({ _id: ID, _creator: req.user._id }, { $set: body }, { new: true })
    .then(todo => {
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({ todo });
    }).catch(err => res.status(400).send({ err }));

});

// *** user routes ***
app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new UserModel(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then(token => {
        res.header('x-auth', token).send(user);
    }).catch(err => res.status(404).send(err));
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    UserModel.findByCredentials(body.email, body.password).then(user => {
        return user.generateAuthToken().then(token =>{
            res.header('x-auth', token).send(user);
        });
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token)
        .then(() => res.status(200).send({ message: 'Token deleted' }))
        .catch(() => res.status(400).send());
});

app.listen(port, () => {
    console.log('Started on port', port);
});

module.exports = {
    app
};