const express = require('express')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const User = require('../models/users')
const router = new express.Router()


// => Create user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }

})

//=> Login function
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCridentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

//=> Logout function
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})  

//=> logout all sessions tokens
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

//=> view user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//=> Update user profile
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "age", "email", "password"]
    const isValidOp = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOp) {
        res.status(400).send({error: "Invalid updates!"})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

//=> Delete user profile
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

//=> litmit and set type for user avatar
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('You must upload an image!'))
        }

        cb(undefined, true)
    }
})

//=> upload avatar and resize 
router.post('/users/me/avatar', auth, upload.single('avatar') , async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()

    res.send('uploaded file!')
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//=> delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//=> upload avatar on browser
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        
        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router
