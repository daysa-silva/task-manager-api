const bcrypt = require('bcryptjs')
const express = require('express')
const router = new express.Router()

const auth = require('../middlewares/auth')

const User = require('../models/user')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
        
    } catch(error)  {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()

        res.status(200).send()
    } catch(e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch(e) {
        res.status(500).send('')
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)

    } catch(error) {
        res.status(500).send(error)
    }
})

router.get('/users/me', auth, (req, res) => {
    res.send(req.user)
})

router.get('/users/:id', async (req, res) => {
    const id = req.params.id

    try {
        const user = await User.findById(id)

        if (!user)
            return res.status(404).send()
        else
            res.send(user)

    } catch(error) {
        res.status(500).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    const user = req.user
    try {
        await user.delete()
        
        res.status(200).send(user)
        
    } catch(error) {
        res.status(500).send(error)
    }
})

router.patch('/users/me', auth, async (req, res) => {
    
    const changes = req.body

    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = Object.keys(changes).every((key) => allowedUpdates.includes(key))

    if (!isValidOperation) return res.status(400).send({error: 'Invalid updates!'})

    try {
        const user = req.user

        Object.keys(changes).forEach((key) => user[key] = changes[key] )
        await user.save()

        res.status(200).send(user)
    } catch(error) {
        res.status(500).send(error)
    }
})

const upload = require('../middlewares/upload')
const sharp = require('sharp')

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, heigth: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()

    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
        req.user.avatar = undefined
        await req.user.save()

        res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

module.exports = router