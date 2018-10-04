const expect = require('expect');
const supertest = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { TodoModel } = require('./../models/todo');
const { UserModel } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('../tests/seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

// **** /todos tests ****

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        let text = 'test todo text';
        supertest(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                TodoModel.find({ text }).then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e => done(e));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        supertest(app)
            .post('/todos')
            .send({})
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                TodoModel.find().then(todos => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch(e => done(e));
            });
    });

});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        supertest(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    })
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        supertest(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('Should return 404 if todo not found', (done) => {
        supertest(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });

    it('Should return 404 if non-object ids', (done) => {
        supertest(app)
            .get('/todos/123')
            .expect(404)
            .expect(res => {
                expect(res.body).toEqual({ error: 'Invalid ID' });
            })
            .end(done);
    });
});

describe('DELETE /todos/id', () => {
    it('should remove a todo', (done) => {
        const hexId = todos[1]._id.toHexString();
        supertest(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                TodoModel.findById(hexId).then(todo => {
                    expect(todo).toBeNull();
                    done();
                }).catch(err => done(err));
            });
    });

    it('should return 404 if todo not found', (done) => {
        supertest(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object is id invalid', (done) => {
        supertest(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/id', () => {
    it('should update the todo', (done) => {
        const id = todos[0]._id.toHexString();
        const newBody = { completed: true, text: 'changeText' };
        supertest(app)
            .patch(`/todos/${id}`)
            .send(newBody)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.completed).toEqual(true);
                expect(typeof res.body.todo.completedAt).toBe('number');
                expect(res.body.todo.text).toEqual(newBody.text);
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        const id = todos[1]._id.toHexString();
        const newBody = { completed: false, text: 'changeText2' };
        supertest(app)
            .patch(`/todos/${id}`)
            .send(newBody)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.completed).toEqual(false);
                expect(res.body.todo.completedAt).toBeNull();
                expect(res.body.todo.text).toEqual(newBody.text);
            })
            .end(done);
    });
});

// **** /users tests ****

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        supertest(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done)
    });

    it('should return 401 if not authenticated', (done) => {
        supertest(app)
            .get('/users/me')
            .expect(401)
            .expect(res => {
                expect(res.text).toBe('Unauthorized');
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        const user = { email: 'mag@itx.con', password: 'pass153*' };
        supertest(app)
            .post('/users')
            .send(user)
            .expect(200)
            .expect(res => {
                expect(res.body.email).toEqual(user.email);
                expect(typeof res.body._id).toBe('string');
                expect(res.headers['x-auth']).toBeDefined();
            })
            .end(err => {
                if(err) {
                    return done(err);
                }
                UserModel.find({ email: user.email }).then(user => {
                    expect(user).toBeDefined();
                    expect(user.password).toBeUndefined();
                    done();
                }).catch(err => done(err));
            })
    });
    
    it('should return validation errors if request inavalid', (done) => {
        const badUser = { email: 'magitx.com', password: 'pass153*' };
        supertest(app)
            .post('/users')
            .send(badUser)
            .expect(404)
            .expect(res => {
                expect(res.body.errors.email.name).toBe('ValidatorError');
            })
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        const duplicateEmail = { email: 'mario@exp.com', password: 'pass153*' };
        supertest(app)
            .post('/users')
            .send(duplicateEmail)
            .expect(404)
            .expect(res => {
                expect(res.body.name).toBe('MongoError');
            })
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        const user = { email: users[1].email, password: users[1].password };
        supertest(app)
            .post('/users/login')
            .send(user)
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toBeDefined();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                UserModel.findById(users[1]._id).then(user => {
                    expect(user.tokens[0]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch(err => done(err));
            });
    });

    it('should reject invalid login', (done) => {
        const badUser = { email: 'mag@itxe.net', password: '123*asd' };
        supertest(app)
            .post('/users/login')
            .send(badUser)
            .expect(400)
            .expect(res => {
                expect(res.headers['x-auth']).toBeUndefined();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                UserModel.findById(users[1]._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(err => done(err));
            });
    });
});

