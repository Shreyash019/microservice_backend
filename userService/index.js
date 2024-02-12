const express = require('express')

const PORT = 5001;
const app = express();
const morgan = require('morgan');
const amqp = require('amqplib');
const url = 'amqp://localhost';
const queueName = 'hello';
const exchangeName = 'post_events';

app.use(morgan('combined'));

// Event Quese
async function sendMessage() {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });
    await channel.sendToQueue(queueName, Buffer.from('User Service...'));

    console.log('Message sent to queue');
    setTimeout(() => connection.close(), 500);
}

async function receiveMessage() {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });
    console.log('Waiting for messages...');

    channel.consume(queueName, (msg) => {
        console.log('Received message:', msg.content.toString());
    }, { noAck: true });
}

// Send message
sendMessage();

// Receive message
receiveMessage();

async function consumeMessage() {
    try {
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();

        await channel.assertExchange(exchangeName, 'fanout', { durable: false });
        const { queue } = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(queue, exchangeName, '');

        console.log('Waiting for post events...');

        channel.consume(queue, (msg) => {
            console.log('Received post event in User Service:', msg.content.toString());
            // Process the received event here (e.g., update user data)
        }, { noAck: true });
    } catch (error) {
        console.error('Error consuming post events in User Service:', error);
    }
}

consumeMessage();

app.get('/user', async (req, res) => {
    try {
        // Process the request to create a post
        // For example, save the post to a database
        const post = req.body; // Assuming post data is sent in the request body

        // After creating the post, send a message to the RabbitMQ queue
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName, { durable: false });
        await channel.sendToQueue(queueName, Buffer.from(JSON.stringify('yes')));

        console.log('Message sent to queue');
        res.status(201).json({ message: 'Post created successfully' });

        setTimeout(() => connection.close(), 500);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log(`Server up and running at http://localhost/${PORT}...`)
})