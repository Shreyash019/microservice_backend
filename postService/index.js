const express = require('express')

const PORT = 5002;
const app = express();
const morgan = require('morgan');
const amqp = require('amqplib');
// Connection URL and credentials
const url = 'amqp://localhost';
const exchangeName = 'post_events';
const queueName = 'hello'
app.use(morgan('combined'));

// Event Quese
async function sendMessage() {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });
    await channel.sendToQueue(queueName, Buffer.from('Post service...'));

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

app.get('/post', async (req, res) => {
    try {
        // Process the request to create a post

    // After creating the post, publish a message to the fanout exchange
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, 'fanout', { durable: false });
    await channel.publish(exchangeName, '', Buffer.from(JSON.stringify('New Post')));

    console.log('Message published to fanout exchange');
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