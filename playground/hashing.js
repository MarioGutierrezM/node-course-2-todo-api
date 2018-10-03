const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// *** CRYPTO *** desc: always returns the same hash
console.log(' ');
const message = 'Im user number 3';
const hash = SHA256(message).toString();
console.log('Message', message);
console.log('Hash', hash);

// *** JWT ***
console.log(' ');
const data = { id: 10 };
const token = jwt.sign(data, '123abc');
const decoded = jwt.verify(token, '123abc');
console.log('token', token);
console.log('decoded', decoded);

// *** BCRYPT *** desc: returns different hash
console.log(' ');
const password = '123abc!';
bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log('hash', hash);
    });
});
const hashedPass = '$2a$10$9mg3XjR/Xo6rSI2UiIOS2.Dx5bPsOfq26mD7xRLze1e4BJpqvaZ9m';

bcrypt.compare(password, hashedPass, (err, res) => {
    console.log('compare', res);
});
