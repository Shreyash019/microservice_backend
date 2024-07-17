import mongoose from "mongoose";
export default class Database {
    constructor() {}

    async mongodbConnection() {
        try {
            let databaseURL: string | undefined = process.env.DATABASE_URL;
            if (!databaseURL) {
                throw new Error('Database URL not found in environment variables');
            }
            await mongoose.connect(databaseURL, {
                socketTimeoutMS: 20000,
            });

            console.log("MongoDB connected successfully!...");
            return true;
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }

        mongoose.connection.on('error', (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on('disconnected', () => {
            console.error("MongoDB disconnected");
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log("MongoDB connection closed due to app termination");
            return false;
        });
    }
}