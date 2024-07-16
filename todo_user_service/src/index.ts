import express, {Application, Request, Response} from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
const envFilePath = `./configuration/project.env`;
import Database_Connection from './Database_Connection';
import userRoutes from "./service/UserRoutes"
dotenv.config({ path: envFilePath });
const PORT: number = parseInt(process.env.PORT || '5001');
const app:Application = express()
app.use(cors());
app.use(cookieParser());
app.use(express.json())

// Database instance creation then connecting database
const databaseConnection = new Database_Connection();
databaseConnection.mongodbConnection()

app.use("/user", userRoutes);

app.get("/user/hello", (req:Request, res:Response)=>{
  res.status(200).json({
    message: "Welcome to user service"
  })
})


app.all("*", (req:Request, res:Response)=>{
  res.status(404).json({
    error: "Resource not found"
  })
})

app.listen(5001, () => {
    console.log(`Server is running on port ${5001}...`);
  });