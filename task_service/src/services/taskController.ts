import mongoose from "mongoose";
import { Response, NextFunction } from "express";
import { UserRequest } from "../interface_Types";
import TasksModel from "./TasksModels";

export default class taskController {
    constructor() { }

    async allTasksOfUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userID = req?.user?.id
            if (!mongoose.isValidObjectId(userID)) {
                return res.status(500).json({
                    success: false,
                    message: `Something went wrong`
                })
            }
            const tasks: object[] = await TasksModel.find({ user: userID }).sort({createdAt: -1})
            res.status(200).json({
                success: true,
                message: "All tasks",
                tasks
            })
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message.toString()
            })
        }
    }
    async createTaskForUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userID = req?.user?.id
            if (!mongoose.isValidObjectId(userID)) {
                return res.status(500).json({
                    success: false,
                    message: `Something went wrong`
                })
            }
            const { title, description } = req.body
            const tasks = await TasksModel.create({ user: userID, taskName: title.trim(), description: description.trim() });
            if (!tasks) {
                return res.status(500).json({
                    success: false,
                    message: `Something went wrong`
                })
            }
            res.status(201).json({
                success: true,
                message: "Task Created"
            })
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message.toString()
            })
        }
    }
    async updateTaskForUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userID = req?.user?.id
            if (!mongoose.isValidObjectId(userID)) {
                return res.status(500).json({
                    success: false,
                    message: `Something went wrong`
                })
            }
            const { task, title = undefined, description = undefined, completed = false } = req.body;
            const taskId = task
            if (!mongoose.isValidObjectId(taskId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid requested task!`
                })
            }

            const tasks = await TasksModel.findOne({ user: userID, _id: taskId });
            if (!tasks) {
                return res.status(404).json({
                    success: false,
                    message: `Task not found`
                })
            }
            if (title) {
                tasks.taskName = title.trim()
            }
            if (description) {
                tasks.description = description.trim()
            }
            if (completed) {
                tasks.completed = completed
            }
            await tasks.save()
            res.status(201).json({
                success: true,
                message: "Task Updated"
            })
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message.toString()
            })
        }
    }
    async deleteTaskForUser(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userID = req?.user?.id
            if (!mongoose.isValidObjectId(userID)) {
                return res.status(500).json({
                    success: false,
                    message: `Something went wrong`
                })
            }
            const { task } = req.body;
            if (!task) {
                return res.status(400).json({
                    success: false,
                    message: "Task is required for deletion!"
                })
            }
            if (!mongoose.isValidObjectId(task)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid requested task!`
                })
            }
            const tasks = await TasksModel.findOneAndDelete({ user: userID, _id: task });
            res.status(200).json({
                success: true,
                message: tasks ? 'Task Deleted Successfully' : "Task already been deleted",
            })
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message.toString()
            })
        }
    }
}