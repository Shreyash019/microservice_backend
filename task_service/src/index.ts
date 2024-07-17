import express, {Application, Request, Response} from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import Database_Connection from './Database_Connection';
import taskRoutes from "./services/taskRoutes"
const envFilePath = `./configuration/project.env`;
dotenv.config({ path: envFilePath });
const PORT: number = parseInt(process.env.PORT || '5003');
const app:Application = express()
app.use(cors());
app.use(cookieParser());
app.use(express.json())

// Database instance creation then connecting database
const databaseConnection = new Database_Connection();
databaseConnection.mongodbConnection()

app.use("/task", taskRoutes)

app.all("*", (req:Request, res:Response)=>{
  res.status(404).json({
    error: "Resource not found"
  })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
  });