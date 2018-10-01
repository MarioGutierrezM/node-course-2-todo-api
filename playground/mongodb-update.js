const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    const filter = { _id: new ObjectID('5bae96db0fe2170b061af5f5')};
    const update = {
        $set: {
            name: 'MarioGtzMdza:)'
        },
        $inc: {
            age: 1
        }
    };
    const options = { returnOriginal: false };

    db.collection('Users').findOneAndUpdate(filter, update, options)
        .then(res => console.log(res))
        .catch(err => console.log(err));

    client.close();
});