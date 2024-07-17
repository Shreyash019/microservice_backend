import express from 'express';
import { Request, Response } from 'express';
import TaskController from "./taskController";
import UserAuthentication from "../authUtils";

const taskController = new TaskController();
const authentication = new UserAuthentication();
const router = express.Router();

router.get("/hello", (req: Request, res: Response) => {
  console.log(req.cookies)
  res.status(200).json({
    message: "Welcome to task service"
  })
})

router.route("/user/task")
  .get(authentication.userAuthorization, taskController.allTasksOfUser)
  .post(authentication.userAuthorization, taskController.createTaskForUser)
  .put(authentication.userAuthorization, taskController.updateTaskForUser)
  .delete(authentication.userAuthorization, taskController.deleteTaskForUser);


export default router;