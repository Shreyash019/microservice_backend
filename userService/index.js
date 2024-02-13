const express = require('express')

const PORT = 5001;
const app = express();
const morgan = require('morgan');
const amqp = require('amqplib');
const url = 'amqp://localhost';

const QUEUENAME = 'post_event';
// const EXCHANGE_NAME = 'all_events_exchange';
const EXCHANGE_NAME = 'post_exchange';

app.use(morgan('combined'));


async function consumeEvents() {
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });
  // Make the queue durable and give it a name to persist messages
  const { queue } = await channel.assertQueue('consumer_queue', { durable: true });
    await channel.bindQueue(queue, EXCHANGE_NAME, '');

    console.log('Waiting for events...');

    // Set up a prefetch count to limit the number of unacknowledged messages
    // channel.prefetch(1);

    channel.consume(queue, (msg) => {
        const event = JSON.parse(msg.content.toString());
        console.log('Received event:', event);
        // Process the event (e.g., update UI, trigger action)
        channel.ack(msg);
    });
}

consumeEvents();

// app.get('/user', async (req, res) => {
//     try {
//         // Process the request to create a post
//         // For example, save the post to a database
//         const post = req.body; // Assuming post data is sent in the request body

//         // After creating the post, send a message to the RabbitMQ queue
//         const connection = await amqp.connect(url);
//         const channel = await connection.createChannel();

//         await channel.assertQueue(queueName, { durable: false });
//         await channel.sendToQueue(queueName, Buffer.from(JSON.stringify('yes')));

//         console.log('Message sent to queue');
//         res.status(201).json({ message: 'Post created successfully' });

//         setTimeout(() => connection.close(), 500);
//     } catch (error) {
//         console.error('Error creating post:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

app.listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log(`Server up and running at http://localhost/${PORT}...`)
})