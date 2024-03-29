const request = require('supertest')
const User = require('../src/models/user')
const app = require('../src/app') 

const { userOne, taskOne, setupDatabase } = require('./fixtures/db')

beforeEach( setupDatabase )

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'andrew@example.com',
        password: '123456'
    }).expect(201)

    //Assert that the database has changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'andrew@example.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('123456')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOne._id)
    
    //Assertions about the response
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'fulano@example.com',
        password: 'senha123'
    }).expect(400)
})

test('Should get profile for user', async () => {
    const response = await request(app).get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //Assertions about the response
    expect(response.body).toMatchObject({
            name: 'Mike',
            email: 'mike@email.com'
    })
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app).get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
    await request(app).delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //Assert that the database has changed correctly
    const user = await User.findById(userOne._id)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app).delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-picture.jpg')
        .expect(200)

    const user = await User.findById(userOne._id)
    //expect({}).toBe({}) --> FAIL
    //expect({}).toEqual({}) --> PASS
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    const response = await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Michael'
    })
    .expect(200)

    const user = await User.findById(userOne._id)
    expect(user.name).toBe('Michael')
})

test('Should not update for invalid user fields', async () => {
    const response = await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'New York'
    })
    .expect(400)
})