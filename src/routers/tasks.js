const auth = require('../middleware/auth')
const Task = require('../models/tasks')
const express = require('express')
const router = new express.Router()

//=> Create task
router.post('/tasks', auth, async (req, res) => {
    const task = Task({
        //copy all of the properties from body over this object
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// GET /tasks?completed=true
//Get /tasks?limit=10&skip=0
//Get /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === "true"
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')

        // if parts[1] true => sort: -1 else sort: 1
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }

    try {
        // const taks = await Task.find({ owner: req.user._id }) 
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(201).send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

//=> Read task data by ID
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        
        if(!task) {
            res.status(400).send()
        }

        res.status(201).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

//=> Update task data by ID
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]
    const isValidOp = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOp) {
        res.status(400).send({error: "Invalid updates!"})
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        if (!task) {
            res.status(400).send()
        }

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()
        res.send(task)
    } catch (error) {
       res.status(400).send(error)
    }
})


//=> Delete task by ID
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            res.status(400).send()
        }

        res.send(task)

    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router
