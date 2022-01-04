const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app') 
const Task = require('../src/models/task')
const User = require('../src/models/user')

const userId = new mongoose.Types.ObjectId()
const user = {
    _id: userId,
    name: 'Boo',
    email: 'boo@email.com',
    password: '123456',
    tokens: [{
        token: jwt.sign({_id: userId}, process.env.JWT_SECRET)
    }]
}

const taskOneId = new mongoose.Types.ObjectId()
const taskOne = new Task({
    _id: taskOneId,
    description: "My first task",
    owner: userId.toString()
})

beforeAll(async () => {
    await User.deleteMany()
    await new User(user).save()
})

beforeEach(async () => {
    await Task.deleteMany()
    await new Task(taskOne).save()
})

test('Should signup a new task', async () => {
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send({
            description: 'That is my second task',
            completed: true
        }).expect(201)

    //Assert that the database has changed correctly
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        description: 'That is my second task',
        completed: true
    })
})

test('Should get all tasks for an user', async () => {
    const response = await request(app).get('/tasks')
    .set('Authorization', `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200)

    //Assertions about the response
    expect(response.body).toMatchObject([{
        description: "My first task"
    }])
})

test('Should get one task for an user', async () => {
    const response = await request(app).get('/tasks/' + taskOneId)
    .set('Authorization', `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200)

    //Assertions about the response
    expect(response.body).toMatchObject({
        description: "My first task"
    })
})

test('Should delete task for user', async () => {
    await request(app).delete('/tasks/' + taskOneId)
    .set('Authorization', `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200)

    //Assert that the database has changed correctly
    const task = await Task.findById(taskOneId)
    expect(task).toBeNull()
})

test('Should not delete task for unauthorized user', async () => {
    await request(app).delete('/tasks/' + taskOneId)
    .send()
    .expect(401)
})

test('Should update valid task fields', async () => {
    const response = await request(app).patch('/tasks/' + taskOneId)
    .set('Authorization', `Bearer ${user.tokens[0].token}`)
    .send({
        completed: true
    })
    .expect(200)

    const task = await Task.findById(taskOneId)
    expect(task.completed).toBe(true)
})

test('Should not update for invalid task fields', async () => {
    const response = await request(app).patch('/tasks/' + taskOneId)
    .set('Authorization', `Bearer ${user.tokens[0].token}`)
    .send({
        deadline: 'tomorrow'
    })
    .expect(400)
})