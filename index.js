const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const amqp = require('amqplib')

const RABBIT_DEFAULT_URL = 'amqp://0.0.0.0'
const DEFAULT_PORT = 4000

app.use(bodyParser.json())

app.get('/health', function (_, res) {
    res.send('ok')
})

app.post('/:queue/', function (req, res) {
    const { body } = req
    const { queue } = req.params
    console.log('called' , { queue, body })

    const open = amqp.connect(process.env.RABBIT_URL || RABBIT_DEFAULT_URL)
    open.then(conn => {
        return conn.createChannel()
    })
    .then(ch => {
        return ch.assertQueue(queue)
            .then(() => {
                return ch.sendToQueue(queue, Buffer.from(JSON.stringify(body)))
            })
    })
    .then(() => {
        console.log(`Published to ${queue}`)
        res.status(200).send(`Published to ${queue}.`)
    })
    .catch(err => {
        res.status(500).send(`Error pushing to ${queue}. ${err}`)
    })
})

console.log(`Starting server on port ${process.env.PORT || DEFAULT_PORT}`)
app.listen(process.env.PORT || DEFAULT_PORT)
