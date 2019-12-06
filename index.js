const express = require('express')
const bodyParser = require('body-parser')

const app = express()

// parse application/json
app.use(bodyParser.json())

app.post('/message', function (req, res) {
    console.log('body: ' , req.body)
    res.send('Hello World!')
})

const DEFAULT_PORT = 4000

console.log(`Starting server on port ${process.env.PORT || DEFAULT_PORT}`)
app.listen(process.env.PORT || DEFAULT_PORT)