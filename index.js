const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const amqp = require('amqplib')

const DEFAULT_PORT = 4000

const hostname = '192.168.0.8'
const port = 5672
let rabbitAddress = { hostname, port }

if (process.env.RABBIT_PORT) {
    rabbitAddress = {...rabbitAddress, port: process.env.RABBIT_PORT }
}

if (process.env.RABBIT_HOST) {
    rabbitAddress = {...rabbitAddress, hostname: process.env.RABBIT_HOST }
}

app.use(bodyParser.json())

app.get('/health', function (_, res) {
    res.send('ok')
})

app.post('/:queue/', function (req, res) {
    const { body } = req
    const { queue } = req.params
    console.log('called' , { queue, body })
    
    const open = amqp.connect(rabbitAddress)
    open.then(conn => {
        return conn.createChannel()
    })
    .then(ch => {
        return ch.assertQueue(queue)
            .then(() => {
                return ch.sendToQueue(queue, Buffer.from(JSON.stringify(body)))
            })
            .then(() => {
                return ch.close()
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
