// const MongoClient = require('mongodb').MongoClient;
const { MongoClient } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    const query = {
        name: 'MarI/O',
    };

    // **** deleteMany ***

    // db.collection('Users').deleteMany(query)
    //     .then(res => console.log(res))
    //     .catch(err => console.log(err));


    // *** deleteOne *** description: delete the first result

    // db.collection('Users').deleteOne(query)
    //     .then(res => console.log(res))
    //     .catch(err => console.log(err));


    // *** findOneAndDelete *** description: returns the item deleted

    db.collection('Users').findOneAndDelete(query)
        .then(res => console.log(res))
        .catch(err => console.log(err));

    client.close();
});