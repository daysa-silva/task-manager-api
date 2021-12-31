const express = require('express')
const Task = require('../models/task')
const auth = require('../middlewares/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)

    } catch(error) {
        res.status(400).send(error)
    }

})

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=30
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
       await req.user.populate({
           path: 'tasks', 
           match,
           options: {
               limit: +req.query.limit,
               skip: +req.query.skip,
               sort
           }
       })

        res.send(req.user.tasks)

    } catch(error) {
        res.status(500).send(error)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        
        if (!task)
            return res.status(404).send()
        else
            res.send(task)
    } catch(error) {
        res.status(500).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id
    try {
        const result = await Task.findOneAndDelete({_id: id, owner: req.user._id})
        if (!result)
            return res.status(404).send()

        res.status(200).send(result)

    } catch(error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const changes = req.body
    
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = Object.keys(changes).every((key) => allowedUpdates.includes(key))

    if (!isValidOperation) return res.status(400).send({error: 'Invalid updates!'})

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        } 
        
        Object.keys(changes).forEach((key) => task[key] = req.body[key])
        await task.save()

        res.status(200).send(task)
    } catch(error) {
        res.status(400).send(error)
    }
})

module.exports = router