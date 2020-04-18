require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

//=> Using express
const app = express()
app.use(express.json())

//=> Router
app.use(userRouter)
app.use(taskRouter)

//=> Setup Port 
const port = process.env.PORT
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
