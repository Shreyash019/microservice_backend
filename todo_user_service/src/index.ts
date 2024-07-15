import express, {Application, Request, Response} from "express";

const app:Application = express()
app.use(express.json())

app.get("/user", (req:Request, res:Response)=>{
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