const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const amqp = require('amqplib');
const url = 'amqp://localhost';
const queueName = 'hello';
const exchangeName = 'post_events';

const app = express();
app.use(morgan('combined'));


// Event Quese
async function sendMessage() {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });
    await channel.sendToQueue(queueName, Buffer.from('API Gateway...'));

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

// Proxy middleware configuration for each microservice
const userProxy = createProxyMiddleware({
    target: 'http://localhost:5001', // Example target URL for posts service
    changeOrigin: true,
});

const postsProxy = createProxyMiddleware({
    target: 'http://localhost:5002', // Example target URL for posts service
    changeOrigin: true,
});

// Route specific requests to the appropriate microservice
app.use('/user', userProxy);
app.use('/post', postsProxy);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).send({ error: err.message });
});

const port = 5000;
app.listen(port, () => {
    console.log(`API Gateway listening on port ${port}`);
});