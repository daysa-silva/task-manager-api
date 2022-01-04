const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')
const jwt = require('jsonwebtoken')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'mike@email.com',
    password: '123456',
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Boo',
    email: 'boo@email.com',
    password: '123456',
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}

const taskOne = new Task({
    _id: new mongoose.Types.ObjectId(),
    description: "My first task",
    owner: userOneId.toString()
})

const taskTwo = new Task({
    _id: new mongoose.Types.ObjectId(),
    description: "My second task",
    completed: true,
    owner: userOneId.toString()
})

const taskThree = new Task({
    _id: new mongoose.Types.ObjectId(),
    description: "My third task",
    owner: userTwoId.toString()
})

async function setupDatabase() {
    await User.deleteMany()
    await Task.deleteMany()

    await new User(userOne).save()
    await new User(userTwo).save()

    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}