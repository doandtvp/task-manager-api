const mongoose = require('mongoose')

//=> connect to database
mongoose.connect(process.env.MONGODB_URL), {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}
