const express = require('express')

const PORT = 5002;
const app = express();
const morgan = require('morgan');
const amqp = require('amqplib');
// Connection URL and credentials
const url = 'amqp://localhost';
app.use(morgan('combined'));

const QUEUENAME = 'post_event';
const EXCHANGE_NAME = 'post_exchange';


async function publishEvent(event) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });
    await channel.publish(EXCHANGE_NAME, '', Buffer.from(JSON.stringify(event)));
    console.log('Event published:', event);
    await channel.close();
    await connection.close();
  }

app.get('/post', async (req, res) => {
    try {
        await publishEvent({ type: 'post_created', data: 'New post created!...' });
        res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log(`Server up and running at http://localhost/${PORT}...`)
})