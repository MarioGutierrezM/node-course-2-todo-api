const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { TodoModel } = require('./models/todo');
const { UserModel } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// comment them when tests are going to be runned
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// *** todos routes ***
app.post('/todos', (req, res) => {
    const todo = new TodoModel({
        text: req.body.text
    });

    todo.save()
        .then((doc) => res.status(200).send(doc))
        .catch(err => res.status(404).send(err));
});

app.get('/todos', (req, res) => {
    TodoModel.find().then(todos => {
        res.status(200).send({ todos });
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
    const ID = req.params.id;
    if (!ObjectID.isValid(ID)) {
        return res.status(404).send({ error: 'Invalid ID' });
    }

    TodoModel.findById(ID).then(todo => {
        (todo) ? res.status(200).send({ todo }) : res.status(404).send({});
    }).catch(e => res.status(400).send({ error: e }));
});

app.delete('/todos/:id', (req, res) => {
    const ID = req.params.id;
    if (!ObjectID.isValid(ID)) {
        return res.status(404).send({ error: 'Invalid ID' });
    }

    TodoModel.findByIdAndRemove(ID).then(todo => {
        (todo) ? res.status(200).send({ todo }) : res.status(404).send({}) ;
    }).catch(err => res.status(400).send({ err }));
});

app.patch('/todos/:id', (req, res) => {
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

    TodoModel.findByIdAndUpdate(ID, { $set: body }, { new: true }).then(todo => {
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

app.listen(port, () => {
    console.log('Started on port', port);
});

module.exports = {
    app
};