const request = require('supertest')
const app = require('../src/app') 
const Task = require('../src/models/task')

const { userOne, userTwo, taskOne, setupDatabase } = require('./fixtures/db')

beforeEach( setupDatabase )

test('Should signup a new task', async () => {
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'That is my new task',
            completed: true
        }).expect(201)

    //Assert that the database has changed correctly
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        description: 'That is my new task',
        completed: true
    })
})

test('Should get all tasks for an user', async () => {
    const response = await request(app).get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //Assertions about the response
    expect(response.body.length).toBe(2)
})

test('Should get all completed tasks for an user', async () => {
    const response = await request(app).get('/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //Assertions about the response
    expect(response.body.length).toBe(1)
    expect(response.body[0].completed).toBe(true)
})

test('Should get all incompleted tasks for an user', async () => {
    const response = await request(app).get('/tasks?completed=false')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //Assertions about the response
    expect(response.body.length).toBe(1)
    expect(response.body[0].completed).toBe(false)
})

test('Should get one task for an user', async () => {
    const response = await request(app).get('/tasks/' + taskOne._id)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //Assertions about the response
    expect(response.body).toMatchObject({
        description: "My first task"
    })
})

test('Should delete task for user', async () => {
    await request(app).delete('/tasks/' + taskOne._id)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //Assert that the database has changed correctly
    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})

test('Should not delete task for unauthorized user', async () => {
    await request(app).delete('/tasks/' + taskOne._id)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    //Assert that the database doesn't have changed
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should update valid task fields', async () => {
    const response = await request(app).patch('/tasks/' + taskOne._id)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        completed: true
    })
    .expect(200)

    const task = await Task.findById(taskOne._id)
    expect(task.completed).toBe(true)
})

test('Should not update for invalid task fields', async () => {
    const response = await request(app).patch('/tasks/' + taskOne._id)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        deadline: 'tomorrow'
    })
    .expect(400)
})