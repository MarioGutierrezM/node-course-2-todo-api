const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// comment them when tests are going to be runned
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });

    todo.save()
        .then((doc) => res.status(200).send(doc))
        .catch(err => res.status(404).send(err));
});

app.get('/todos', (req, res) => {
    Todo.find().then(todos => {
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

    Todo.findById(ID).then(todo => {
        (todo) ? res.status(200).send({ todo }) : res.status(404).send({});
    }).catch(e => res.status(400).send({ error: e }));
});

app.delete('/todos/:id', (req, res) => {
    const ID = req.params.id;
    if (!ObjectID.isValid(ID)) {
        return res.status(404).send({ error: 'Invalid ID' });
    }

    Todo.findByIdAndRemove(ID).then(todo => {
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

    Todo.findByIdAndUpdate(ID, { $set: body }, { new: true }).then(todo => {
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({ todo });
    }).catch(err => res.status(400).send({ err }));

});

app.listen(port, () => {
    console.log('Started on port', port);
});

module.exports = {
    app
};