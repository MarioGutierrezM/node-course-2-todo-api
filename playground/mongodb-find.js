// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    // const query = {
    //     // name: 'MarioGtz',
    //     _id: new ObjectID('5bae96db0fe2170b061af5f5')
    // };

    // TO ARRAY
    // db.collection('Users').find(query).toArray().then((docs) => {
    //     console.log('Users');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('ERROR: ', err);
    // });

    // COUNT
    db.collection('Users').find().count().then((count) => {
        console.log(`Users count: ${count}`);
    }, (err) => {
        console.log('Unable to fetch users: ', err);
    });

    // db.close();
});