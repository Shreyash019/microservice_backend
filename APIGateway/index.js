const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const amqp = require('amqplib');
const url = 'amqp://localhost';

const QUEUENAME = 'post_event';
const EXCHANGE_NAME = 'post_exchange';

const app = express();
app.use(morgan('combined'));


// // Event Queue
// async function sendMessage() {
//     const connection = await amqp.connect(url);
//     const channel = await connection.createChannel();

//     await channel.assertQueue(queueName, { durable: false });
//     await channel.sendToQueue(queueName, Buffer.from('API Gateway...'));

//     console.log('Message sent to queue');
//     setTimeout(() => connection.close(), 500);
// }

// async function receiveMessage() {
//     const connection = await amqp.connect(url);
//     const channel = await connection.createChannel();

//     await channel.assertQueue(queueName, { durable: false });
//     console.log('Waiting for messages...');

//     channel.consume(queueName, (msg) => {
//         console.log('Received message:', msg.content.toString());
//     }, { noAck: true });
// }
// Send message
// sendMessage();
// Receive message
// receiveMessage();

async function consumeEvents() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });
    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, EXCHANGE_NAME, '');
  
    console.log('Waiting for events...');
  
    channel.consume(queue, (msg) => {
      const event = JSON.parse(msg.content.toString());
      console.log('Received event:', event);
      // Process the event (e.g., update UI, trigger action)
      channel.ack(msg);
    });
  }
  
  consumeEvents();

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