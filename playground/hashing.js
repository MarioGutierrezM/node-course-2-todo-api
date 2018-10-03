const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

const data = { id: 10 };

const token = jwt.sign(data, '123abc');
console.log('token', token);

const decoded = jwt.verify(token, '123abc');
console.log('decoded', decoded);



// const message = 'Im user number 3';
// const hash = SHA256(message).toString();

// console.log('Message', message);
// console.log('Hash', hash);

